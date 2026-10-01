const bcrypt = require("bcrypt");
const User   = require("../models/user");
const Room   = require("../models/Room");
const jwt    = require("jsonwebtoken");

const SALT_ROUNDS = 10;
const JWT_SECRET  = "mysecretkey";

// ── Register ────────────────────────────────────────────────────────────────
const createUser = async (req, res) => {
    try {
        const existing = await User.findOne({ email: req.body.email });
        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashed = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        const user   = await User.create({ ...req.body, password: hashed });

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(v => v.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};

// ── Login ────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Support both bcrypt-hashed and legacy plain-text passwords
        let match = false
        const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$')
        if (isHashed) {
            match = await bcrypt.compare(password, user.password)
        } else {
            // Legacy plain-text — compare directly, then upgrade to hash
            match = (password === user.password)
            if (match) {
                // Upgrade to hashed password transparently
                user.password = await bcrypt.hash(password, SALT_ROUNDS)
                await user.save()
            }
        }
        if (!match) {
            return res.status(401).json({ message: "Invalid password" })
        }

        if (user.accountStatus === "blocked") {
            return res.status(403).json({ message: "Account is blocked. Please contact admin." });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                userId:        user._id,
                name:          user.name,
                email:         user.email,
                role:          user.role,
                accountStatus: user.accountStatus,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

// ── Get My Profile ───────────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Update My Profile ────────────────────────────────────────────────────────
const updateMyProfile = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.user.userId,
            req.body,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updated) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "Profile updated successfully", user: updated });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(v => v.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        res.status(500).json({ message: error.message });
    }
};

// ── Get My Rooms ─────────────────────────────────────────────────────────────
const getMyRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ provider: req.user.userId });
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Admin: Get All Users ─────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Change Password ──────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: "Current password is incorrect" });

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Admin: Block User ────────────────────────────────────────────────────────
const blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { accountStatus: "blocked" },
            { new: true }
        ).select("-password");

        res.status(200).json({ message: "User blocked successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Switch Role (seeker ↔ provider) ──────────────────────────────────────────
const switchRole = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admin role cannot be changed" });
        }

        const newRole = user.role === 'seeker' ? 'provider' : 'seeker';

        // Use findByIdAndUpdate to bypass full document validation
        // (existing data like capitalised gender values would fail save())
        const updated = await User.findByIdAndUpdate(
            user._id,
            { role: newRole },
            { new: true, runValidators: false }
        );

        // Issue a NEW token with the updated role
        const newToken = jwt.sign(
            { userId: updated._id, role: newRole },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: `Role switched to ${newRole} successfully`,
            token: newToken,
            user: {
                userId:        updated._id,
                name:          updated.name,
                email:         updated.email,
                role:          newRole,
                accountStatus: updated.accountStatus,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUser,
    loginUser,
    getMyProfile,
    updateMyProfile,
    getMyRooms,
    getAllUsers,
    changePassword,
    blockUser,
    switchRole,
};
