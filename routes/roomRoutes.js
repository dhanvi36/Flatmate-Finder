const express = require("express");
const router = express.Router();

const {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    searchRoomsByCity,
    filterByRent,
    filterByGender
} = require("../controller/roomController");

const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const providerOnly = require("../middleware/providerOnly");
const checkProfileComplete = require("../middleware/checkProfileComplete");

// Create Room — providerOnly, no profile-complete gate
router.post(
    "/",
    auth,
    providerOnly,
    upload.array("photos", 5),
    createRoom
);

// View all rooms
router.get(
    "/",
    auth,
    getAllRooms
);

// Search rooms by city
router.get(
    "/search",
    searchRoomsByCity
);

// Filter rooms by rent
router.get(
    "/filter/rent",
    filterByRent
);

// Filter rooms by gender
router.get(
    "/filter/gender",
    filterByGender
);

// View single room
router.get(
    "/:id",
    auth,
    getRoomById
);

// Update room
router.put(
    "/:id",
    auth,
    providerOnly,
    upload.array("photos", 5),
    updateRoom
);

// Delete room
router.delete(
    "/:id",
    auth,
    providerOnly,
    deleteRoom
);
module.exports = router;