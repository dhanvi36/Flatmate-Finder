const Booking = require("../models/Booking");
const Request = require("../models/request");
const Room    = require("../models/Room");

/** Sum numberOfPeople across active bookings for a room */
async function getCurrentOccupants(roomId) {
    const active = await Booking.find({ room: roomId, status: "active" })
        .populate("request", "numberOfPeople");
    let total = 0;
    for (const b of active) {
        const n = b.request?.numberOfPeople;
        total += (n && n > 0) ? n : 1;
    }
    return total;
}

async function syncRoomStatus(roomId) {
    const room = await Room.findById(roomId);
    if (!room) return;
    const occupied  = await getCurrentOccupants(roomId);
    const newStatus = occupied >= room.maxOccupants ? "occupied" : "available";
    if (room.status !== newStatus) { room.status = newStatus; await room.save(); }
}

// CREATE BOOKING — also marks room as occupied if active bookings reach maxOccupants
exports.createBooking = async (req, res) => {
    try {
        const { request, startDate, endDate } = req.body;

        const requestData = await Request.findById(request);
        if (!requestData) {
            return res.status(404).json({ message: "Request not found" });
        }
        if (requestData.status !== "accepted") {
            return res.status(400).json({ message: "Request must be accepted before creating a booking" });
        }

        const existingBooking = await Booking.findOne({
            request,
            status: { $ne: "cancelled" }
        });
        if (existingBooking) {
            return res.status(400).json({ message: "Booking already exists for this request" });
        }

        const booking = await Booking.create({
            seeker:    requestData.seeker,
            provider:  requestData.provider,
            room:      requestData.room,
            request,
            startDate,
            endDate,
            status:    "active"
        });

        res.status(201).json({ message: "Booking created successfully", booking });

    } catch (error) {
        res.status(500).json({ message: "Error creating booking", error: error.message });
    }
};

// GET MY BOOKINGS (Seeker)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ seeker: req.user.userId })
            .populate("room",     "title rent location status")
            .populate("provider", "name email phone");
        res.status(200).json({ bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET PROVIDER BOOKINGS
exports.getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ provider: req.user.userId })
            .populate("room",   "title rent location status")
            .populate("seeker", "name email phone");
        res.status(200).json({ bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE BOOKING STATUS — also resets room to available when booking cancelled/completed
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["active", "completed", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Status must be active, completed or cancelled" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (
            booking.provider.toString() !== req.user.userId &&
            booking.seeker.toString()   !== req.user.userId
        ) {
            return res.status(403).json({ message: "Not authorized" });
        }

        booking.status = status;
        await booking.save();

        // If cancelled → reset linked request to pending
        if (status === "cancelled") {
            const request = await Request.findById(booking.request);
            if (request) { request.status = "pending"; await request.save(); }
        }

        // After any status change, sync room occupancy
        await syncRoomStatus(booking.room);

        res.status(200).json({ message: "Booking status updated", booking });

    } catch (error) {
        res.status(500).json({ message: "Error updating booking", error: error.message });
    }
};
