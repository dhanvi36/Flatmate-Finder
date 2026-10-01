const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

    reviewer: {
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

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.models.Review ||
    mongoose.model("Review", reviewSchema);