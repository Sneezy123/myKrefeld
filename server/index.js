import express from 'express';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import { connectToDatabase } from './lib/db.js';
import Event from './models/Event.js';
import 'dotenv/config';

console.log(process.env.MONGODB_URI);

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('Fehler: MONGODB_URI nicht gesetzt');
    process.exit(1);
}

async function updateEvents() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const urlBase = `https://veranstaltung.krefeld651.de/wp-json/tribe/events/v1/events`;
        const { data: first } = await axios.get(`${urlBase}?page=1&per_page=100&start_date=${today}`);
        const totalPages = first.total_pages;

        for (let i = 1; i <= totalPages; i++) {
            const { data } = await axios.get(`${urlBase}?page=${i}&per_page=100&start_date=${today}`);
            for (const ev of data.events) {
                const addr = [ev.venue?.address || '', ev.venue?.city || '', 'Germany'].filter(Boolean).join(', ');
                const geo =
                    (
                        await axios.get(`https://nominatim.openstreetmap.org/search`, {
                            params: {
                                q: addr,
                                'accept-language': 'de',
                                countrycodes: 'de',
                                format: 'json',
                            },
                        })
                    ).data[0] || {};

                await Event.findOneAndUpdate(
                    { id: ev.id },
                    {
                        id: ev.id,
                        title: ev.title,
                        description: ev.description,
                        start_date: new Date(ev.start_date),
                        end_date: new Date(ev.end_date),
                        url: ev.url,
                        image: {
                            url: ev.image?.url || '',
                            width: ev.image?.width || 0,
                            height: ev.image?.height || 0,
                        },
                        website: ev.website || '',
                        venue: {
                            id: ev.venue?.id || 0,
                            venue: ev.venue?.venue || '',
                            address: ev.venue?.address || '',
                            city: ev.venue?.city || '',
                            zip: ev.venue?.zip || '',
                            phone: ev.venue?.phone || '',
                            website: ev.venue?.website || '',
                            lat: parseFloat(geo.lat) || 0,
                            lon: parseFloat(geo.lon) || 0,
                        },
                        cost: ev.cost || '',
                        categories: ev.categories != [] ? ev.categories.map((cat) => cat.name) : [],
                        tags: ev.tags != [] ? ev.tags.map((tag) => tag.name) : [],
                        sourceURL: ev.rest_url.match('^h(ttp)s?:/{2}[a-z0-9-.]+')[0],
                    },
                    { upsert: true, new: true }
                );
            }
        }
        console.log('Events erfolgreich aktualisiert');
    } catch (err) {
        console.error('Fehler beim Aktualisieren der Events:', err);
    }
}

async function deleteOldEvents() {
    try {
        const cutoff = new Date();
        const result = await Event.deleteMany({ end_date: { $lt: cutoff } });
        console.log(`Gelöschte alte Events: ${result.deletedCount}`);
    } catch (err) {
        console.error('Fehler beim Löschen alter Events:', err);
    }
}

(async () => {
    await connectToDatabase(uri);
    // initial run
    await updateEvents();
    await deleteOldEvents();
    // cron alle 10 Minuten
    cron.schedule('*/10 * * * *', async () => {
        console.log('Cron-Job startet');
        await updateEvents();
        await deleteOldEvents();
    });
})();

const port = process.env.PORT || 3000;
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (err) {
        console.error('Fehler beim Abruf der Events:', err);
        res.status(500).json({ error: 'Events konnten nicht geladen werden' });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
