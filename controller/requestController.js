const Request = require("../models/request");
const Booking = require("../models/Booking");
const Room    = require("../models/Room");
const User    = require("../models/user");
const { calculateCompatibilityScore } = require("../utils/compatibility");

/**
 * Returns total occupants currently in a room by summing numberOfPeople
 * across all active bookings (via their linked requests).
 * Falls back to counting bookings if numberOfPeople is missing.
 */
async function getCurrentOccupants(roomId) {
    const activeBookings = await Booking.find({ room: roomId, status: "active" })
        .populate("request", "numberOfPeople");

    let total = 0;
    for (const b of activeBookings) {
        const n = b.request?.numberOfPeople;
        total += (n && n > 0) ? n : 1;   // default to 1 if not specified
    }
    return total;
}

/** Mark room occupied/available based on real headcount */
async function syncRoomStatus(roomId) {
    const room = await Room.findById(roomId);
    if (!room) return;

    const occupied = await getCurrentOccupants(roomId);
    const newStatus = occupied >= room.maxOccupants ? "occupied" : "available";

    if (room.status !== newStatus) {
        room.status = newStatus;
        await room.save();
    }
    return { room, occupied };
}

// ── Create Request ────────────────────────────────────────────────────────────
exports.createRequest = async (req, res) => {
    try {
        const { room, message, expectedMoveInDate, numberOfPeople } = req.body;
        const seekerId = req.user.userId;

        const roomData = await Room.findById(room);
        if (!roomData) return res.status(404).json({ message: "Room not found" });

        // Block if room is already marked occupied
        if (roomData.status === "occupied") {
            return res.status(400).json({ message: "This room is fully occupied and not accepting new requests" });
        }

        // Block provider from requesting their own room (even after role switch)
        if (roomData.provider.toString() === seekerId) {
            return res.status(400).json({ message: "You cannot send a request for your own listing" });
        }

        // Also check real headcount to catch edge cases
        const currentOccupants = await getCurrentOccupants(room);
        const requestedPeople  = numberOfPeople && numberOfPeople > 0 ? Number(numberOfPeople) : 1;

        if (currentOccupants + requestedPeople > roomData.maxOccupants) {
            await syncRoomStatus(room);
            return res.status(400).json({
                message: `Not enough space — room has ${roomData.maxOccupants - currentOccupants} spot(s) left but you requested ${requestedPeople}`
            });
        }

        const existingRequest = await Request.findOne({ seeker: seekerId, room });
        if (existingRequest) {
            return res.status(400).json({ message: "You have already sent a request for this room" });
        }

        const seekerUser = await User.findById(seekerId);
        const provider   = roomData.provider;

        const request = await Request.create({
            seeker: seekerId, room, provider,
            message, expectedMoveInDate,
            numberOfPeople: requestedPeople
        });

        const compatibility = calculateCompatibilityScore(seekerUser, roomData, {
            expectedMoveInDate, numberOfPeople: requestedPeople
        });

        res.status(201).json({ message: "Request sent successfully", request, compatibility });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Check Compatibility ───────────────────────────────────────────────────────
exports.checkCompatibility = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { numberOfPeople, expectedMoveInDate } = req.query;
        const seekerId = req.user.userId;

        const roomData = await Room.findById(roomId);
        if (!roomData) return res.status(404).json({ message: "Room not found" });

        const seekerUser = await User.findById(seekerId);
        if (!seekerUser) return res.status(404).json({ message: "Seeker user not found" });

        const compatibility = calculateCompatibilityScore(seekerUser, roomData, {
            numberOfPeople, expectedMoveInDate
        });

        // Include current occupancy info
        const currentOccupants = await getCurrentOccupants(roomId);
        const spotsLeft = Math.max(0, roomData.maxOccupants - currentOccupants);

        res.status(200).json({
            room: {
                id:                  roomData._id,
                title:               roomData.title,
                preferredGender:     roomData.preferredGender,
                preferredOccupation: roomData.preferredOccupation,
                maxOccupants:        roomData.maxOccupants,
                currentOccupants,
                spotsLeft,
                status:              roomData.status,
            },
            seeker: {
                name:       seekerUser.name,
                gender:     seekerUser.gender,
                occupation: seekerUser.occupation
            },
            compatibility
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── My Requests (Seeker) ─────────────────────────────────────────────────────
exports.getMyRequests = async (req, res) => {
    try {
        const seekerUser = await User.findById(req.user.userId);

        const requests = await Request.find({ seeker: req.user.userId })
            .populate("room")
            .populate("provider", "name email");

        const requestsWithCompatibility = requests.map(reqDoc => {
            const reqObj = reqDoc.toObject();
            if (reqObj.room) {
                reqObj.compatibilityScore = calculateCompatibilityScore(seekerUser, reqObj.room, {
                    expectedMoveInDate: reqObj.expectedMoveInDate,
                    numberOfPeople:     reqObj.numberOfPeople
                });
            } else {
                reqObj.compatibilityScore = null;
            }
            return reqObj;
        });

        res.status(200).json({ requests: requestsWithCompatibility });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Received Requests (Provider) ─────────────────────────────────────────────
exports.getReceivedRequests = async (req, res) => {
    try {
        const requests = await Request.find({ provider: req.user.userId })
            .populate("seeker", "name email age gender occupation preferences")
            .populate("room", "title rent maxOccupants preferredGender preferredOccupation availableFrom status");

        const withData = await Promise.all(requests.map(async reqDoc => {
            const reqObj = reqDoc.toObject();
            if (reqObj.seeker && reqObj.room) {
                reqObj.compatibilityScore = calculateCompatibilityScore(reqObj.seeker, reqObj.room, {
                    expectedMoveInDate: reqObj.expectedMoveInDate,
                    numberOfPeople:     reqObj.numberOfPeople
                });
                reqObj.room.currentOccupants = await getCurrentOccupants(reqObj.room._id);
                reqObj.room.spotsLeft = Math.max(0, reqObj.room.maxOccupants - reqObj.room.currentOccupants);
            } else {
                reqObj.compatibilityScore = null;
            }
            return reqObj;
        }));

        res.status(200).json({ requests: withData });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Accept / Reject Request ───────────────────────────────────────────────────
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (status !== "accepted" && status !== "rejected") {
            return res.status(400).json({ message: "Status must be accepted or rejected" });
        }

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (request.provider.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (status === "accepted") {
            const roomDoc = await Room.findById(request.room);
            if (!roomDoc) return res.status(404).json({ message: "Room not found" });

            // Check real headcount (numberOfPeople-aware)
            const currentOccupants  = await getCurrentOccupants(roomDoc._id);
            const requestedPeople   = request.numberOfPeople && request.numberOfPeople > 0
                ? request.numberOfPeople : 1;

            if (currentOccupants + requestedPeople > roomDoc.maxOccupants) {
                // Sync room status
                if (roomDoc.status !== "occupied") {
                    roomDoc.status = "occupied";
                    await roomDoc.save();
                }
                return res.status(400).json({
                    message: `Cannot accept — only ${roomDoc.maxOccupants - currentOccupants} spot(s) remaining but this request needs ${requestedPeople}. Room is now marked as fully occupied.`
                });
            }

            request.status = "accepted";
            await request.save();

            // Create booking
            let booking = null;
            const alreadyBooked = await Booking.findOne({
                request: request._id,
                status:  { $ne: "cancelled" }
            });

            if (!alreadyBooked) {
                booking = await Booking.create({
                    seeker:    request.seeker,
                    provider:  request.provider,
                    room:      roomDoc._id,
                    request:   request._id,
                    startDate: request.expectedMoveInDate || new Date(),
                    status:    "active",
                });
            }

            // Sync room status after booking
            const result = await syncRoomStatus(roomDoc._id);

            return res.status(200).json({
                message:      "Request accepted — booking created automatically",
                request,
                booking,
                roomStatus:   result?.room?.status,
                spotsLeft:    Math.max(0, roomDoc.maxOccupants - (result?.occupied ?? 0)),
            });
        }

        // Rejected
        request.status = "rejected";
        await request.save();

        res.status(200).json({ message: "Request rejected", request });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "This room is fully occupied — no more bookings allowed." });
        }
        res.status(500).json({ message: error.message });
    }
};

// ── Unlock Contact Info ───────────────────────────────────────────────────────
exports.getUnlockedContactInfo = async (req, res) => {
    try {
        const { id }   = req.params;
        const userId   = req.user.userId;

        const requestDoc = await Request.findById(id)
            .populate("seeker",   "name email phone age gender occupation lifestyle")
            .populate("provider", "name email phone")
            .populate("room",     "title rent location");

        if (!requestDoc) return res.status(404).json({ message: "Request not found" });

        const isSeeker   = requestDoc.seeker._id.toString()   === userId;
        const isProvider = requestDoc.provider._id.toString() === userId;

        if (!isSeeker && !isProvider) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (requestDoc.status !== "accepted") {
            return res.status(403).json({ message: "Contact info is locked until the request is accepted" });
        }

        res.status(200).json({
            message:  "Contact details unlocked successfully",
            status:   requestDoc.status,
            room:     requestDoc.room,
            seeker:   requestDoc.seeker,
            provider: requestDoc.provider,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
