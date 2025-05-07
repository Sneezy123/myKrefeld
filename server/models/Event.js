import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const eventSchema = new Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    url: { type: String, required: true },
    image: {
        url: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
    },
    website: { type: String },
    venue: {
        id: { type: Number, required: true },
        venue: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String },
        phone: { type: String },
        website: { type: String },
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
    },
    cost: { type: String, required: true },
    categories: { type: [String] },
    tags: { type: [String] },
    sourceURL: { type: String, match: '^h(ttp)s?:/{2}[a-z0-9-.]+' },
    addedToDB: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
