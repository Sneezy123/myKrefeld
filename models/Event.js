import mongoose from "mongoose";
const { Schema, model } = mongoose;

const eventSchema = new Schema({
    id: {type: Number, required: true},
    title: {type: String, required: true},
    description: {type: String},
    start_date: {type: Date, required: true},
    end_date: {type: Date, required: true},
    url: {type: String, required: true},
    image: {
        url: {type: String, required: true},
        width: {type: Number, required: true},
        height: {type: Number, required: true},

    },
    website: {type: String},
    venue: {
        id: {type: Number, required: true},
        venue: {type: String, required: true},
        address: {type: String, required: true},
        city: {type: String, required: true},
        zip: {type: String},
        phone: {type: String},
        website: {type: String},
    },
    cost: {type: String, required: true}
  });

const Event = mongoose.model('Event', eventSchema);

export default Event;