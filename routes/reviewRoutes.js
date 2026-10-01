const express = require("express");

const router = express.Router();

const reviewController =
require("../controller/reviewController");

const auth =
require("../middleware/auth");

// Create Review
router.post(
    "/",
    auth,
    reviewController.createReview
);

// Reviews of a room
router.get(
    "/room/:roomId",
    reviewController.getRoomReviews
);

// My reviews
router.get(
    "/my-reviews",
    auth,
    reviewController.getMyReviews
);

module.exports = router;