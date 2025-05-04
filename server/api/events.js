import axios from 'axios';
import { connectToDatabase } from '../lib/db.js';
import Event from '../models/Event.js';

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return res.status(500).json({ error: 'Missing MONGODB_URI' });
    }

    try {
        await connectToDatabase(uri);

        switch (req.method) {
            case 'GET':
                const events = await Event.find();
                return res.status(200).json(events);
            case 'POST':
                // optionally trigger update logic via POST
                return res.status(202).json({ message: 'Update triggered' });
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('DB error:', error);
        return res.status(500).json({ error: 'DB connection failed' });
    }
}
