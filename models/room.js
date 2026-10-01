const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    photos: [{
        type: String
    }],

    rent: {
        type: Number,
        required: true
    },

    location: {
        city: {
            type: String,
            required: true
        },
        area: {
            type: String
        }
    },

    amenities: [{
        type: String
    }],

    availableFrom: {
        type: Date,
        required: true
    },

    maxOccupants: {
        type: Number,
        required: true
    },

    preferredGender: {
        type: String
    },

    preferredOccupation: {
        type: String
    },
listingStatus: {
    type: String,
    enum: ["active", "blocked"],
    default: "active"
},
    status: {
        type: String,
        enum: ["available", "occupied"],
        default: "available"
    }

}, { timestamps: true });

module.exports =
    mongoose.models.Room || mongoose.model("Room", roomSchema);