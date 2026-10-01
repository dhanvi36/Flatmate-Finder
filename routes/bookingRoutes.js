const express = require("express");
const router = express.Router();

const bookingController =
    require("../controller/bookingController");

const auth = require("../middleware/auth");

router.post(
    "/",
    auth,
    bookingController.createBooking
);



router.get(
    "/my-bookings",
    auth,
    bookingController.getMyBookings
);

router.get(
    "/provider-bookings",
    auth,
    bookingController.getProviderBookings
);

router.put(
    "/:id/status",
    auth,
    bookingController.updateBookingStatus
);

module.exports = router;