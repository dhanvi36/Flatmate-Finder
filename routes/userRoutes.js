const express = require("express");
const router = express.Router();

const {
    createUser,
    loginUser,
    getMyProfile,
    updateMyProfile,
    getMyRooms,
    getAllUsers,
    changePassword,
    blockUser,
    switchRole,
} = require("../controller/userController");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const {
    validateRegister,
    validateProfileUpdate,
    validateChangePassword
} = require("../middleware/validateUser");

// Register
router.post(
    "/register",
    validateRegister,
    createUser
);

// Login
router.post(
    "/login",
    loginUser
);

// My Profile
router.get(
    "/profile",
    auth,
    getMyProfile
);

// Update My Profile
router.put(
    "/profile",
    auth,
    validateProfileUpdate,
    updateMyProfile
);

// My Rooms
router.get(
    "/my-rooms",
    auth,
    getMyRooms
);

// Admin - View All Users
router.get(
    "/all",
    auth,
    adminOnly,
    getAllUsers
);

// Change password
router.put(
    "/change-password",
    auth,
    validateChangePassword,
    changePassword
);

// Switch role (seeker ↔ provider)
router.put(
    "/switch-role",
    auth,
    switchRole
);

// Block user
router.put(
    "/:id/block",
    auth,
    adminOnly,
    blockUser
);

module.exports = router;