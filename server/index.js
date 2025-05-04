import axios from 'axios';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Event from './models/Event.js';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SSL certificates configuration
const options = {
    key: fs.readFileSync(
        path.join(__dirname, '..', 'certificates', 'private.key')
    ),
    cert: fs.readFileSync(
        path.join(__dirname, '..', 'certificates', 'certificate.pem')
    ),
};

const today = new Date().toISOString().split('T')[0];
const eventUrl = `https://veranstaltung.krefeld651.de/wp-json/tribe/events/v1/events?page=1&per_page=100&start_date=${today}`; // Increased per_page
const dbUri =
    'mongodb+srv://nilshendrik13:67L87QWjzjnhPNYu@mykrefeldcluster.ftrmtih.mongodb.net/?retryWrites=true&w=majority&appName=myKrefeldCluster';

mongoose.connect(dbUri, {
    socketTimeoutMS: 10000,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Get API data

const updateEvents = async () => {
    try {
        // Fetch events from the API
        const total_pages = (await axios.get(eventUrl)).data.total_pages;

        for (var i = 0; i < total_pages; i++) {
            const response = await axios.get(
                `https://veranstaltung.krefeld651.de/wp-json/tribe/events/v1/events?page=${
                    i + 1
                }&per_page=100&start_date=${today}`
            );
            const events = response.data.events;

            console.log('Fetched events.');

            // Iterate over each event and upsert into the database
            for (const event of events) {
                const geocodeResponse = await axios.get(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                        (event.venue?.address
                            ? event.venue?.address + ' '
                            : '') +
                            (event.venue?.city ? event.venue?.city : '') +
                            (event.venue?.address || event.venue?.city
                                ? ', Germany'
                                : '')
                    )}&accept-language=de&countrycodes=de&format=json`
                );
                const geocodeData = geocodeResponse.data;
                console.log(
                    (event.venue?.address ? event.venue?.address + ' ' : '') +
                        (event.venue?.city ? event.venue?.city : '') +
                        (event.venue?.address || event.venue?.city
                            ? ', Germany'
                            : '')
                );
                await Event.findOneAndUpdate(
                    { id: event.id }, // Match by unique event ID
                    {
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        start_date: new Date(event.start_date),
                        end_date: new Date(event.end_date),
                        url: event.url,
                        image: {
                            url: event.image?.url || '',
                            width: event.image?.width || 0,
                            height: event.image?.height || 0,
                        },
                        website: event.website || '',
                        venue: {
                            id: event.venue?.id || 0,
                            venue: event.venue?.venue || '',
                            address: event.venue?.address || '',
                            city: event.venue?.city || '',
                            zip: event.venue?.zip || '',
                            phone: event.venue?.phone || '',
                            website: event.venue?.website || '',
                            lat: geocodeData[0]
                                ? parseFloat(geocodeData[0].lat)
                                : 0,
                            lon: geocodeData[0]
                                ? parseFloat(geocodeData[0].lon)
                                : 0,
                        },
                        cost: event.cost || '',
                    },
                    { upsert: true, new: true } // Create if not found, return the updated document
                );
            }

            console.log('Events successfully upserted into the database.');
        }
    } catch (error) {
        console.error('Error fetching or saving events:', error);
    }
};

// Delete old events
const deleteOldEvents = async () => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate());

        const result = await Event.deleteMany({
            end_date: { $lt: cutoffDate },
        });
        console.log(`Deleted ${result.deletedCount} old events.`);
    } catch (error) {
        console.error('Error deleting old events:', error);
    }
};

// cron job to run every hour
cron.schedule('*/10 * * * *', () => {
    console.log('Running cron job to update events...');
    updateEvents();
    deleteOldEvents();
});

console.log('Running cron job to update events...');
updateEvents();
deleteOldEvents();

// Start the Express server
const app = express();

// Add middleware to redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (req.secure) {
        next();
    } else {
        const host = req.headers.host?.split(':')[0] || req.headers.host;
        res.redirect(301, `https://${host}:3000${req.url}`);
    }
});

app.use(cors());

// Create HTTP server for redirect
const httpServer = http.createServer(app);

// Create HTTPS server
const httpsServer = https.createServer(options, app);

// Listen on both ports
httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80 (redirecting to HTTPS)');
});

httpsServer.listen(3000, () => {
    console.log('HTTPS Server running on port 3000');
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});
