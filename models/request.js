const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({

    seeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String
    },

    expectedMoveInDate: {
        type: Date
    },

    numberOfPeople: {
        type: Number
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Request", requestSchema);