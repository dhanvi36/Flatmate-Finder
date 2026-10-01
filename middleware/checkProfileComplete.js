const User = require("../models/user");

/**
 * Middleware to ensure user has completed their profile (age, gender, occupation)
 * before performing actions like creating rooms, making requests, or bookings.
 */
const checkProfileComplete = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User account not found"
            });
        }

        const missingFields = [];

        if (!user.age) missingFields.push("age");
        if (!user.gender) missingFields.push("gender");
        if (!user.occupation) missingFields.push("occupation");

        if (missingFields.length > 0) {
            return res.status(403).json({
                message: "Profile incomplete",
                error: `Please complete your profile before proceeding. Missing fields: ${missingFields.join(", ")}`,
                missingFields
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Error checking profile completion",
            error: error.message
        });
    }
};

module.exports = checkProfileComplete;
