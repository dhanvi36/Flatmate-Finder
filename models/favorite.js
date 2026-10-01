const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({

    seeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.model(
        "Favorite",
        favoriteSchema
    );