import express from 'express';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import { connectToDatabase } from './lib/db.js';
import Event from './models/Event.js';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('Fehler: MONGODB_URI nicht gesetzt');
    process.exit(1);
}

async function getKrefeldEventList() {
    const today = new Date().toISOString().split('T')[0];
    const urlBaseKrefeld = `https://veranstaltung.krefeld651.de/wp-json/tribe/events/v1/events`;

    try {
        let eventList = [];
        const { data: first } = await axios.get(
            `${urlBaseKrefeld}?&per_page=100&start_date=${today}&page=1`
        );

        const totalPages = first.total_pages;
        const totalResults = first.total;
        let eventIdx = 1;
        let times = [];

        for (let page = 1; page <= totalPages; page++) {
            const { data } = await axios.get(
                `${urlBaseKrefeld}?per_page=100&start_date=${today}&page=${page}`
            );
            for (const event of data.events) {
                let t1 = Date.now();
                const addr = [
                    event.venue?.address || '',
                    event.venue?.city || '',
                    'Germany',
                ]
                    .filter(Boolean)
                    .join(', ');
                const geo =
                    (
                        await axios.get(
                            `https://nominatim.openstreetmap.org/search`,
                            {
                                params: {
                                    q: addr,
                                    'accept-language': 'de',
                                    countrycodes: 'de',
                                    format: 'json',
                                },
                            }
                        )
                    ).data[0] || {};

                eventList.push({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    start_date: new Date(event.start_date),
                    end_date: new Date(event.end_date),
                    url: event.url,
                    image: {
                        url: event.image?.url,
                        width: event.image?.width,
                        height: event.image?.height,
                    },
                    website: event.website,
                    venue: {
                        id: event.venue?.id,
                        venue: event.venue?.venue,
                        address: event.venue?.address,
                        city: event.venue?.city,
                        zip: event.venue?.zip,
                        phone: event.venue?.phone,
                        website: event.venue?.website,
                        lat: geo.lat,
                        lon: geo.lon,
                    },
                    cost: event.cost,
                    categories: event.categories.map((cat) => cat.name),
                    tags: event.tags.map((tag) => tag.name),
                    rest_url: event.rest_url,
                });

                let t2 = Date.now();

                times.push(t2 - t1);

                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);

                process.stdout.write(
                    `${page}, ${eventIdx}/${totalResults}\tETA: ${
                        (times.reduce((a, b) => a + b) / times.length / 1000) *
                        (totalResults - eventIdx)
                    } s`
                );
                eventIdx++;
            }
        }
        return eventList;
    } catch (error) {
        console.error('Events konnten nicht extern geladen werden: ', error);
    }
}

async function getEventimEventList() {
    const urlBaseEventim = `https://public-api.eventim.com/websearch/search/api/exploration/v1/products`;

    try {
        let eventList = [];
        const { data: first } = await axios.get(
            `${urlBaseEventim}?language=de&city_names=Krefeld&sort=DateAsc&top=50&page=1`
        );

        const totalPages = first.totalPages;
        const totalResults = first.totalResults;
        let productIdx = 1;
        let times = [];

        for (let page = 1; page <= totalPages; page++) {
            const { data } = await axios.get(
                `${urlBaseEventim}?language=de&city_names=Krefeld&sort=DateAsc&top=50&page=${page}`
            );
            for (const product of data.products) {
                let t1 = Date.now();
                const addr = [
                    product.typeAttributes.liveEntertainment.location.name ||
                        '',
                    'Germany',
                ]
                    .filter(Boolean)
                    .join(', ');
                const geo =
                    (
                        await axios.get(
                            `https://nominatim.openstreetmap.org/search`,
                            {
                                params: {
                                    q: addr,
                                    'accept-language': 'de',
                                    countrycodes: 'de',
                                    format: 'json',
                                },
                            }
                        )
                    ).data[0] || {};

                const startDateDate = new Date(
                    product.typeAttributes.liveEntertainment.startDate
                );
                const geoDisplayName =
                    geo.display_name?.toString().split(', ') || '';
                const geoDisplayNameObj = {
                    name: geoDisplayName[0] || '',
                    houseNumber: geoDisplayName[1] || '',
                    streetName: geoDisplayName[2] || '',
                    cityDistrict: geoDisplayName[3] || '',
                    cityPart: geoDisplayName[4] || '',
                    cityName: geoDisplayName[5] || '',
                    region: geoDisplayName[6] || '',
                    state: geoDisplayName[geoDisplayName.length - 3] || '',
                    postCode: geoDisplayName[geoDisplayName.length - 2] || '',
                    country: geoDisplayName[geoDisplayName.length - 1] || '',
                };

                eventList.push({
                    id: product.productId,
                    title: product.name,
                    description: '',
                    start_date: startDateDate,
                    end_date: new Date(
                        startDateDate.getFullYear(),
                        startDateDate.getMonth(),
                        startDateDate.getDate(),
                        23,
                        59,
                        59,
                        999
                    ),
                    url: product.link,
                    image: {
                        url: product.imageUrl,
                        width: '',
                        height: '',
                    },
                    website: '',
                    venue: {
                        id: '',
                        venue: product.typeAttributes.liveEntertainment.location
                            .name,
                        address: `${geoDisplayNameObj.streetName} ${geoDisplayNameObj.houseNumber}`,
                        city: geoDisplayNameObj.cityName,
                        zip: geoDisplayNameObj.postCode,
                        phone: '',
                        website: '',
                        lat: product.typeAttributes.liveEntertainment.location
                            ?.geoLocation
                            ? product.typeAttributes.liveEntertainment.location
                                  ?.geoLocation.latitude
                            : geo.lat,
                        lon: product.typeAttributes.liveEntertainment.location
                            ?.geoLocation
                            ? product.typeAttributes.liveEntertainment.location
                                  ?.geoLocation.longitude
                            : geo.lon,
                    },
                    cost: product.price || '',
                    categories: product.categories.map((cat) => cat.name),
                    tags: product.tags,
                    rest_url: product.link,
                });
                let t2 = Date.now();
                times.push(t2 - t1);
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);

                process.stdout.write(
                    `${page}, ${productIdx}/${totalResults}\tETA: ${
                        (times.reduce((a, b) => a + b) / times.length / 1000) *
                        (totalResults - productIdx)
                    } s`
                );
                productIdx++;
            }
        }
        return eventList;
    } catch (error) {
        console.error('Events konnten nicht extern geladen werden: ', error);
    }
}
async function updateEvents() {
    let t1 = Date.now();
    console.log('Preloading geocoding cache from DB...');
    await preloadGeoCacheFromDB();
    console.log(
        '------------- Start to create Krefeld Event List -------------'
    );
    const totalStart = Date.now();
    console.log(
        '------------- Start to create Krefeld Event List -------------'
    );
    const krefeldList = await getKrefeldEventList();
    console.log(
        '------------- Start to create Eventim Event List -------------'
    );
    console.log(
        '------------- Start to create Eventim Event List -------------'
    );
    const eventimList = await getEventimEventList();
    const eventList = [krefeldList, eventimList].flat().filter(Boolean);
    const totalEnd = Date.now();
    console.log(
        `\nTotal geocoding and event processing time: ${
            (totalEnd - totalStart) / 1000
        } seconds`
    );
    console.log('------------- Event List creation done! -------------');
    try {
        if (eventList.length === 0) {
            console.log('No events to update.');
            return;
        }
        // Use bulkWrite for efficient upserts
        const bulkOps = eventList.map((eventObj) => ({
            updateOne: {
                filter: { id: eventObj.id },
                update: {
                    $set: {
                        id: eventObj.id,
                        title: eventObj.title,
                        description: eventObj.description,
                        start_date: eventObj.start_date,
                        end_date: eventObj.end_date,
                        url: eventObj.url,
                        image: {
                            url: eventObj.image?.url || '',
                            width: eventObj.image?.width || 0,
                            height: eventObj.image?.height || 0,
                        },
                        website: eventObj.website || '',
                        venue: {
                            id: eventObj.venue?.id || 0,
                            venue: eventObj.venue?.venue || '',
                            address: eventObj.venue?.address || '',
                            city: eventObj.venue?.city || '',
                            zip: eventObj.venue?.zip || '',
                            phone: eventObj.venue?.phone || '',
                            website: eventObj.venue?.website || '',
                            lat: parseFloat(eventObj.venue?.lat) || 0,
                            lon: parseFloat(eventObj.venue?.lon) || 0,
                        },
                        cost: eventObj.cost || '',
                        categories: eventObj.categories || [],
                        tags: eventObj.tags || [],
                        sourceURL:
                            eventObj.rest_url.match(
                                /^https?:\/\/(?:[^.]+\.)?([^.\/]+)\./
                            )?.[1] || '',
                    },
                },
                upsert: true,
            },
        }));
        if (bulkOps.length > 0) {
            const result = await Event.bulkWrite(bulkOps, { ordered: false });
            // Use correct properties for upserted and modified counts
            const upserts = result.upsertedCount || 0;
            const mods = result.modifiedCount || 0;
            console.log(`Events erfolgreich aktualisiert: ${upserts + mods}`);
        }
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

async function updateDB() {
    await updateEvents();
    await deleteOldEvents();
}

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

app.get('/api/cron', async (req, res) => {
    try {
        await updateDB();
        res.status(200).json({ message: 'Events updated' });
    } catch (err) {
        console.error('Event updating failed:', err);
        res.status(500).json({ error: `Event updating failed ${err}` });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});

//module.exports = app;
