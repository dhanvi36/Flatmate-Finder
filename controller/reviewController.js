const Review  = require("../models/Review");
const Booking = require("../models/Booking");

// CREATE REVIEW
exports.createReview = async (req, res) => {
    try {
        const { room, provider, rating, comment } = req.body;
        const reviewer = req.user.userId;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const booking = await Booking.findOne({
            seeker: reviewer, room, provider, status: "completed"
        });
        if (!booking) {
            return res.status(400).json({ message: "Review allowed only after a completed booking" });
        }

        const existingReview = await Review.findOne({ reviewer, room });
        if (existingReview) {
            return res.status(400).json({ message: "You already reviewed this room" });
        }

        const review = await Review.create({ reviewer, room, provider, rating, comment });
        res.status(201).json({ message: "Review created successfully", review });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET REVIEWS FOR A ROOM
exports.getRoomReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ room: req.params.roomId })
            .populate("reviewer", "name")
            .populate("provider", "name");

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET MY REVIEWS (logged-in user)
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewer: req.user.userId })
            .populate("room",     "title rent")
            .populate("provider", "name");

        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
