const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

    seeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
          
    },

    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
        required: true

    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date
    },

    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.models.Booking ||
    mongoose.model("Booking", bookingSchema);