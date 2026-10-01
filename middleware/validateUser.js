const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validGenders = ["male", "female", "other", "prefer_not_to_say"];
const validRoles = ["provider", "seeker", "admin"];

// Validate User Registration Body
const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("Name must be a valid string with at least 2 characters");
    }

    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        errors.push("Please provide a valid email address");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    if (!role || !validRoles.includes(role)) {
        errors.push(`Role must be one of: ${validRoles.join(", ")}`);
    }

    const cleanEmail = email && typeof email === "string" ? email.trim().toLowerCase() : "";

    if (role === "admin" && cleanEmail && !cleanEmail.endsWith("@admin.com")) {
        errors.push("Admin role registration requires an email ending with @admin.com (e.g. admin123@admin.com)");
    }

    if (cleanEmail && cleanEmail.endsWith("@admin.com") && role !== "admin") {
        errors.push("Emails ending with @admin.com must be registered with the 'admin' role");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    // Clean up input
    req.body.name = name.trim();
    req.body.email = cleanEmail;

    next();
};

// Validate Profile Update Body & Protect Sensitive Fields
const validateProfileUpdate = (req, res, next) => {
    const errors = [];
    const allowedFields = ["name", "age", "gender", "occupation", "preferences", "phone", "lifestyle"];

    // Check for forbidden fields user might try to update
    const forbiddenFields = ["role", "accountStatus", "verificationStatus", "password", "email", "_id"];
    const attemptedForbidden = forbiddenFields.filter(field => req.body[field] !== undefined);

    if (attemptedForbidden.length > 0) {
        return res.status(400).json({
            message: "Unauthorized field update attempted",
            error: `Cannot update the following fields via profile update: ${attemptedForbidden.join(", ")}`
        });
    }

    // Filter req.body to only allow profile update fields
    const sanitizedBody = {};
    for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
            sanitizedBody[key] = req.body[key];
        }
    }

    if (Object.keys(sanitizedBody).length === 0) {
        return res.status(400).json({
            message: "No valid profile fields provided for update. Allowed fields: name, age, gender, occupation, preferences, phone, lifestyle"
        });
    }

    // Validate fields if present
    if (sanitizedBody.name !== undefined) {
        if (typeof sanitizedBody.name !== "string" || sanitizedBody.name.trim().length < 2) {
            errors.push("Name must be at least 2 characters long");
        } else {
            sanitizedBody.name = sanitizedBody.name.trim();
        }
    }

    if (sanitizedBody.age !== undefined && sanitizedBody.age !== null && sanitizedBody.age !== '') {
        const parsedAge = Number(sanitizedBody.age);
        if (isNaN(parsedAge) || !Number.isInteger(parsedAge) || parsedAge < 18 || parsedAge > 100) {
            errors.push("Age must be an integer between 18 and 100");
        } else {
            sanitizedBody.age = parsedAge;
        }
    }

    if (sanitizedBody.gender !== undefined && sanitizedBody.gender !== null && sanitizedBody.gender !== '') {
        if (!validGenders.includes(sanitizedBody.gender)) {
            errors.push(`Gender must be one of: ${validGenders.join(", ")}`);
        }
    }

    if (sanitizedBody.occupation !== undefined && sanitizedBody.occupation !== null && sanitizedBody.occupation !== '') {
        if (typeof sanitizedBody.occupation !== "string" || sanitizedBody.occupation.length > 100) {
            errors.push("Occupation must be a string up to 100 characters");
        } else {
            sanitizedBody.occupation = sanitizedBody.occupation.trim();
        }
    }

    if (sanitizedBody.preferences !== undefined && sanitizedBody.preferences !== null && sanitizedBody.preferences !== '') {
        if (typeof sanitizedBody.preferences !== "string" || sanitizedBody.preferences.length > 500) {
            errors.push("Preferences must be a string up to 500 characters");
        } else {
            sanitizedBody.preferences = sanitizedBody.preferences.trim();
        }
    }

    if (sanitizedBody.phone !== undefined && sanitizedBody.phone !== null && sanitizedBody.phone !== '') {
        if (typeof sanitizedBody.phone !== "string" || sanitizedBody.phone.length > 20) {
            errors.push("Phone must be a valid string");
        } else {
            sanitizedBody.phone = sanitizedBody.phone.trim();
        }
    }

    if (sanitizedBody.lifestyle !== undefined && typeof sanitizedBody.lifestyle === "object") {
        const { sleepSchedule, cleanlinessLevel, dietaryPreference, guestPolicy, smokingHabit, petFriendly } = sanitizedBody.lifestyle;
        const validSleep = ["early_bird", "night_owl", "flexible"];
        const validDiet = ["vegetarian", "non_vegetarian", "vegan", "eggetarian", "any"];
        const validGuest = ["no_guests", "weekends_only", "anytime"];
        const validSmoking = ["non_smoker", "smoker", "outside_only"];

        if (sleepSchedule && sleepSchedule !== '' && !validSleep.includes(sleepSchedule)) {
            errors.push(`sleepSchedule must be one of: ${validSleep.join(", ")}`);
        }
        if (cleanlinessLevel && cleanlinessLevel !== '' && (isNaN(Number(cleanlinessLevel)) || Number(cleanlinessLevel) < 1 || Number(cleanlinessLevel) > 5)) {
            errors.push("cleanlinessLevel must be a number between 1 and 5");
        }
        if (dietaryPreference && dietaryPreference !== '' && !validDiet.includes(dietaryPreference)) {
            errors.push(`dietaryPreference must be one of: ${validDiet.join(", ")}`);
        }
        if (guestPolicy && guestPolicy !== '' && !validGuest.includes(guestPolicy)) {
            errors.push(`guestPolicy must be one of: ${validGuest.join(", ")}`);
        }
        if (smokingHabit && smokingHabit !== '' && !validSmoking.includes(smokingHabit)) {
            errors.push(`smokingHabit must be one of: ${validSmoking.join(", ")}`);
        }
        if (petFriendly !== undefined && typeof petFriendly !== "boolean") {
            errors.push("petFriendly must be a boolean (true/false)");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Profile validation failed",
            errors
        });
    }

    // Replace req.body with sanitized body
    req.body = sanitizedBody;
    next();
};

const validateChangePassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const errors = [];

    if (!currentPassword) errors.push("Current password is required");
    if (!newPassword || newPassword.length < 6) errors.push("New password must be at least 6 characters");
    if (currentPassword && newPassword && currentPassword === newPassword)
        errors.push("New password cannot be the same as the current password");

    if (errors.length > 0) return res.status(400).json({ message: "Validation failed", errors });
    next();
};

module.exports = {
    validateRegister,
    validateProfileUpdate,
    validateChangePassword
};
