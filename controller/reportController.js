const Report = require("../models/Report");
const User   = require("../models/user");
const Room   = require("../models/Room");

// CREATE REPORT
exports.createReport = async (req, res) => {
    try {
        const reporter = req.user.userId;
        const { reportedUser, reportedRoom, reason, description } = req.body;

        if (!reportedUser && !reportedRoom) {
            return res.status(400).json({ message: "Select a user or room to report" });
        }
        if (reportedUser && reportedRoom) {
            return res.status(400).json({ message: "Report either a user or a room, not both" });
        }
        // Self-report check happens after we resolve the user doc below

        if (reportedUser) {
            // Accept either a MongoDB ObjectId OR an email address
            let userDoc = null;
            if (reportedUser.includes('@')) {
                userDoc = await User.findOne({ email: reportedUser.toLowerCase().trim() });
            } else {
                userDoc = await User.findById(reportedUser).catch(() => null);
            }
            if (!userDoc) return res.status(404).json({ message: "Reported user not found. Please check the email or ID." });
            // Self-report check
            if (userDoc._id.toString() === reporter) {
                return res.status(400).json({ message: "You cannot report yourself" });
            }
            // Replace the email/id with the actual ObjectId for storage
            req.body.reportedUser = userDoc._id;
        }
        if (reportedRoom) {
            const room = await Room.findById(reportedRoom).catch(() => null);
            if (!room) return res.status(404).json({ message: "Reported room not found. Please check the Room ID." });
        }

        // Use the resolved ObjectId (not the original email string)
        const resolvedUserId = reportedUser ? req.body.reportedUser : null;

        const existingReport = await Report.findOne({
            reporter,
            reportedUser: resolvedUserId || null,
            reportedRoom: reportedRoom   || null
        });
        if (existingReport) {
            return res.status(400).json({ message: "You have already reported this" });
        }

        const report = await Report.create({
            reporter,
            reportedUser: resolvedUserId,
            reportedRoom: reportedRoom || null,
            reason,
            description
        });
        res.status(201).json({ message: "Report submitted successfully", report });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL REPORTS (Admin)
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reporter",     "name email")
            .populate("reportedUser", "name email role accountStatus")
            .populate("reportedRoom", "title rent listingStatus")
            .sort({ createdAt: -1 });

        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET REPORT BY ID (Admin)
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("reporter",     "name email")
            .populate("reportedUser", "name email role accountStatus")
            .populate("reportedRoom");

        if (!report) return res.status(404).json({ message: "Report not found" });
        res.status(200).json({ report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// MY REPORTS (logged-in user)
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ reporter: req.user.userId })
            .populate("reportedUser", "name email")
            .populate("reportedRoom", "title");

        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// BLOCK USER (Admin)
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { accountStatus: "blocked" },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User blocked successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// BLOCK ROOM (Admin)
exports.blockRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.roomId,
            { listingStatus: "blocked" },
            { new: true }
        );
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.status(200).json({ message: "Room blocked successfully", room });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE REPORT STATUS (Admin)
exports.updateReportStatus = async (req, res) => {
    try {
        const { status, adminAction } = req.body;

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, adminAction },
            { new: true, runValidators: true }
        );
        if (!report) return res.status(404).json({ message: "Report not found" });
        res.status(200).json({ message: "Report updated successfully", report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
