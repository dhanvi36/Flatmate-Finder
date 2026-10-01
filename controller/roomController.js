const Room = require("../models/Room");

// Create Room
const createRoom = async (req, res) => {
    try {
        const photoPaths = req.files
            ? req.files.map(file => "/uploads/" + file.filename)
            : [];

        // multipart/form-data sends location as "location[city]" strings — parse them
        const location = {
            city: req.body['location[city]'] || req.body.location?.city || '',
            area: req.body['location[area]'] || req.body.location?.area || '',
        };

        // amenities may come as a single string or array
        let amenities = req.body.amenities || []
        if (typeof amenities === 'string') amenities = [amenities]

        const room = await Room.create({
            title:               req.body.title,
            description:         req.body.description,
            rent:                Number(req.body.rent),
            availableFrom:       req.body.availableFrom,
            maxOccupants:        Number(req.body.maxOccupants),
            preferredGender:     req.body.preferredGender     || '',
            preferredOccupation: req.body.preferredOccupation || '',
            location,
            amenities,
            provider:            req.user.userId,
            photos:              photoPaths,
        });

        res.status(201).json({ message: "Room created successfully", room });
    } catch (error) {
        res.status(500).json({ message: "Error creating room", error: error.message });
    }
};

// View All Rooms — sync occupancy status before returning
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate("provider", "name email");

        // Sync each room's occupied status based on real active booking headcount
        const Booking = require("../models/Booking");
        const Request = require("../models/request");

        await Promise.all(rooms.map(async (room) => {
            const active = await Booking.find({ room: room._id, status: "active" })
                .populate("request", "numberOfPeople");
            let total = 0;
            for (const b of active) {
                const n = b.request?.numberOfPeople;
                total += (n && n > 0) ? n : 1;
            }
            const correct = total >= room.maxOccupants ? "occupied" : "available";
            if (room.status !== correct) {
                await Room.findByIdAndUpdate(room._id, { status: correct });
                room.status = correct;  // update in-memory too
            }
        }));

        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// View Room By Id
const getRoomById = async (req, res) => {
    try {
        // Only expose provider name — NOT email or phone (contact unlocks after request accepted)
        const room = await Room.findById(req.params.id).populate("provider", "name");
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json({ room });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Room
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Room not found" });
        if (room.provider.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You can update only your own room" });
        }

        // Parse multipart location fields
        const updateData = { ...req.body }
        if (req.body['location[city]']) {
            updateData.location = {
                city: req.body['location[city]'],
                area: req.body['location[area]'] || '',
            }
            delete updateData['location[city]']
            delete updateData['location[area]']
        }

        // Parse amenities
        if (updateData.amenities && typeof updateData.amenities === 'string') {
            updateData.amenities = [updateData.amenities]
        }

        // Handle new photo uploads
        if (req.files && req.files.length > 0) {
            updateData.photos = req.files.map(file => "/uploads/" + file.filename)
        }

        // Convert numeric fields
        if (updateData.rent)         updateData.rent         = Number(updateData.rent)
        if (updateData.maxOccupants) updateData.maxOccupants = Number(updateData.maxOccupants)

        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ message: "Room updated successfully", room: updatedRoom });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Room
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        if (room.provider.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You can delete only your own room" });
        }
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search rooms by city
const searchRoomsByCity = async (req, res) => {
    try {
        const rooms = await Room.find({
            "location.city": { $regex: new RegExp(req.query.city, "i") }
        }).populate("provider", "name email");
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filter rooms by max rent
const filterByRent = async (req, res) => {
    try {
        const rooms = await Room.find({
            rent: { $lte: Number(req.query.maxRent) }
        }).populate("provider", "name email");
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filter rooms by preferred gender (case-insensitive)
const filterByGender = async (req, res) => {
    try {
        const rooms = await Room.find({
            preferredGender: { $regex: new RegExp(`^${req.query.gender}$`, "i") }
        }).populate("provider", "name email");
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    searchRoomsByCity,
    filterByRent,
    filterByGender
};
