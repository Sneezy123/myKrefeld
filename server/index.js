import express from 'express';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import { connectToDatabase } from './lib/db.js';
import Event from './models/Event.js';
import 'dotenv/config';
import readline from 'readline';
import { text } from 'stream/consumers';
import open from 'open';

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('Fehler: MONGODB_URI nicht gesetzt');
    process.exit(1);
}

/* In-memory cache for geocoding results (address/venue -> {lat, lon, ...}) */

const geoCache = new Map();

// Helper: concurrency-limited async map
async function asyncMapLimit(arr, limit, asyncFn) {
    const ret = [];
    let idx = 0;
    let active = 0;
    return new Promise((resolve, reject) => {
        function next() {
            if (idx === arr.length && active === 0) return resolve(ret);
            while (active < limit && idx < arr.length) {
                const curIdx = idx++;
                active++;
                asyncFn(arr[curIdx], curIdx)
                    .then((res) => (ret[curIdx] = res))
                    .catch(reject)
                    .finally(() => {
                        active--;
                        next();
                    });
            }
        }
        next();
    });
}

async function preloadGeoCacheFromDB() {
    // Preload all known coordinates from DB into geoCache
    const allEvents = await Event.find(
        {
            'venue.lat': { $exists: true, $ne: null },
            'venue.lon': { $exists: true, $ne: null },
        },
        {
            'venue.address': 1,
            'venue.city': 1,
            'venue.lat': 1,
            'venue.lon': 1,
            'venue.venue': 1,
        }
    ).lean();
    for (const ev of allEvents) {
        // Use both address+city and venue name as cache keys
        if (ev.venue) {
            if (ev.venue.address && ev.venue.city) {
                const key = `${ev.venue.address}, ${ev.venue.city}, Germany`
                    .trim()
                    .toLowerCase();
                geoCache.set(key, { lat: ev.venue.lat, lon: ev.venue.lon });
            }
            if (ev.venue.venue) {
                const key = `${ev.venue.venue}, Germany`.trim().toLowerCase();
                geoCache.set(key, { lat: ev.venue.lat, lon: ev.venue.lon });
            }
        }
    }
}

async function geocodeAddresses(addresses, concurrency = 5) {
    // Only geocode addresses not in geoCache
    const toGeocode = addresses.filter((addr) => !geoCache.has(addr));
    if (toGeocode.length === 0) return;
    await asyncMapLimit(toGeocode, concurrency, async (addr) => {
        const geoRes =
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
        geoCache.set(addr, { lat: geoRes.lat, lon: geoRes.lon });
    });
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
        let times = [];
        const startTime = Date.now();

        // 1. Collect all unique addresses
        let allAddrs = [];
        let allEvents = [];
        for (let page = 1; page <= totalPages; page++) {
            const { data } = await axios.get(
                `${urlBaseKrefeld}?per_page=100&start_date=${today}&page=${page}`
            );
            for (const event of data.events) {
                const addr = [
                    event.venue?.address || '',
                    event.venue?.city || '',
                    'Germany',
                ]
                    .filter(Boolean)
                    .join(', ')
                    .trim()
                    .toLowerCase();
                allAddrs.push(addr);
                allEvents.push(event);
            }
        }
        // Deduplicate
        allAddrs = [...new Set(allAddrs)];
        // 2. Geocode in parallel (after DB preload)
        await geocodeAddresses(allAddrs, 5);
        // 3. Build eventList
        let eventIdx = 1;
        for (const event of allEvents) {
            let t1 = Date.now();
            const addr = [
                event.venue?.address || '',
                event.venue?.city || '',
                'Germany',
            ]
                .filter(Boolean)
                .join(', ')
                .trim()
                .toLowerCase();
            let geo = geoCache.get(addr) || {};
            // Only push if event has an id
            if (event.id) {
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
            }
            let t2 = Date.now();
            times.push(t2 - t1);
            // Simple progress output
            if (eventIdx % 25 === 0 || eventIdx === allEvents.length) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(
                    `Krefeld: ${eventIdx}/${allEvents.length}`
                );
            }
            eventIdx++;
        }
        const endTime = Date.now();
        console.log(
            `\nKrefeld geocoding and event processing took: ${
                (endTime - startTime) / 1000
            } seconds`
        );
        return eventList;
    } catch (error) {
        console.error('Events konnten nicht extern geladen werden: ', error);
        return [];
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
        let times = [];
        const startTime = Date.now();

        // 1. Collect all unique venue names
        let allAddrs = [];
        let allProducts = [];
        for (let page = 1; page <= totalPages; page++) {
            const { data } = await axios.get(
                `${urlBaseEventim}?language=de&city_names=Krefeld&sort=DateAsc&top=50&page=${page}`
            );
            for (const product of data.products) {
                const addr = [
                    product.typeAttributes.liveEntertainment.location.name ||
                        '',
                    'Germany',
                ]
                    .filter(Boolean)
                    .join(', ')
                    .trim()
                    .toLowerCase();
                allAddrs.push(addr);
                allProducts.push(product);
            }
        }
        // Deduplicate
        allAddrs = [...new Set(allAddrs)];
        // 2. Geocode in parallel (after DB preload)
        await geocodeAddresses(allAddrs, 5);
        // 3. Build eventList
        let productIdx = 1;
        for (const product of allProducts) {
            let t1 = Date.now();
            const addr = [
                product.typeAttributes.liveEntertainment.location.name || '',
                'Germany',
            ]
                .filter(Boolean)
                .join(', ')
                .trim()
                .toLowerCase();
            let geo = geoCache.get(addr) || {};
            let geoDisplayNameObj = {};
            const startDateDate = new Date(
                product.typeAttributes.liveEntertainment.startDate
            );
            // Only push if product has an id
            if (product.productId) {
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
                        address: geoDisplayNameObj.address,
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
            }
            let t2 = Date.now();
            times.push(t2 - t1);
            // Simple progress output
            if (productIdx % 25 === 0 || productIdx === allProducts.length) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(
                    `Eventim: ${productIdx}/${allProducts.length}`
                );
            }
            productIdx++;
        }
        const endTime = Date.now();
        console.log(
            `\nEventim geocoding and event processing took: ${
                (endTime - startTime) / 1000
            } seconds`
        );
        return eventList;
    } catch (error) {
        console.error('Events konnten nicht extern geladen werden: ', error);
        return [];
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
    const krefeldList = await getKrefeldEventList();
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
        // Use deleteMany with an index on end_date for efficiency
        const result = await Event.deleteMany({ end_date: { $lt: cutoff } });
        console.log(`Gelöschte alte Events: ${result.deletedCount}`);
    } catch (err) {
        console.error('Fehler beim Löschen alter Events:', err);
    }
}

(async () => {
    let t1 = Date.now();
    await connectToDatabase(uri);
    // initial run
    //await updateEvents();
    //await deleteOldEvents();
    // Use Date.now() for correct timing
    //console.log(`Total time: ${(Date.now() - t1) / 1000} s`);
    // Unnecessary bc db is updated externally through cron-job.org
})();

async function getHbfTimes() {
    const { data } = await axios.get(
        'https://openservice-test.vrr.de/openservice/XML_DM_REQUEST',
        {
            params: {
                outputFormat: 'rapidJSON',
                version: '10.4.18.18',
                place_dm: 'Krefeld',
                placeState_dm: 'empty',
                type_dm: 'stop',
                name_dm: 'Hbf',
                mode: 'direct',
            },
        }
    );
    return data;
}
const port = process.env.PORT || 3000;

app.get('/api/stopTimes', async (req, res) => {
    try {
        const stopTimes = await getHbfTimes();
        res.status(200).json(stopTimes.stopEvents);
    } catch (error) {
        console.error(
            'Ein Fehler ist beim Abrufen der Daten aufgetreten:',
            error
        );
        res.status(500).json({
            error: 'Die Daten konnten nicht abgerufen werden.',
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
});

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
        await updateEvents();
        await deleteOldEvents();
        res.status(200).json({ message: 'Events updated' });
    } catch (err) {
        console.error('Event updating failed:', err);
        res.status(500).json({ error: `Event updating failed ${err}` });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});

/* - Handle user input while server is running (catch commands like in vite cli) - */
// 2) Set up a readline interface on stdin:
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '', // this is what shows before user input
});

// Start the prompt:
rl.prompt();

// 3) Handle each line of user input:
rl.on('line', (line) => {
    const cmd = line.trim();

    switch (cmd) {
        case 'c':
            console.clear();
            console.log('Server läuft auf Port 3000');
            break;

        case 'q':
            process.exit(0);
        case 'r':
            console.log('⚠️ NOT IMPLEMENTED');
            break;
        case 'u':
            console.log('http://localhost:3000/');
            break;
        case 'o':
            open('http://localhost:3000/');
            break;
        case 'h':
            console.log('\n  Shortcuts');
            const printHelp = (text, msg) =>
                `  \x1b[90mpress \x1b[0;1m${text} + enter \x1b[0;90mto ${msg}\x1b[0m`;
            [
                { text: 'r', msg: 'restart the server' },
                { text: 'u', msg: 'show server url' },
                { text: 'o', msg: 'open in browser' },
                { text: 'c', msg: 'clear the console' },
                { text: 'q', msg: 'quit' },
            ].forEach((el) => {
                console.log(printHelp(el.text, el.msg));
            });
            break;
        default:
            /* try {
                console.log(eval(cmd));
            } catch (error) {
                console.log(`\x1b[31;1m${error}\x1b[0m`);
            } */
            console.log(`Unrecognized command: "${cmd}". Type "h" for help.`);
    }

    rl.prompt();
});

// 4) Handle Ctrl+C (SIGINT) in your readline interface:
rl.on('SIGINT', () => {
    console.log('\n> Caught SIGINT (Ctrl+C). Exiting.');
    process.exit(0);
});
