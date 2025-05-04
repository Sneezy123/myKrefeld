import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(uri) {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 60000,
            connectTimeoutMS: 60000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
        };
        cached.promise = mongoose.connect(uri, opts).then((m) => m.connection);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
