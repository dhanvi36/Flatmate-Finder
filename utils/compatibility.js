/**
 * Calculates a compatibility score (0 - 100) between a Seeker, a Room, and Request details.
 * Incorporates Lifestyle Vibe Match (sleep schedule, cleanliness, diet, smoking, guests).
 */
function calculateCompatibilityScore(seeker, room, requestData = {}) {
    let score = 0;
    const breakdown = {
        genderMatch: { score: 0, max: 25, matched: false, detail: "" },
        occupationMatch: { score: 0, max: 20, matched: false, detail: "" },
        capacityMatch: { score: 0, max: 20, matched: false, detail: "" },
        dateMatch: { score: 0, max: 15, matched: false, detail: "" },
        lifestyleMatch: { score: 0, max: 20, matched: false, detail: "" }
    };

    if (!seeker || !room) {
        return {
            score: 0,
            percentage: "0%",
            breakdown
        };
    }

    // 1. Gender Match (25 points)
    const prefGender = (room.preferredGender || "any").toLowerCase().trim();
    const seekerGender = (seeker.gender || "unspecified").toLowerCase().trim();

    if (prefGender === "any" || prefGender === "all" || !room.preferredGender) {
        breakdown.genderMatch.score = 25;
        breakdown.genderMatch.matched = true;
        breakdown.genderMatch.detail = "Room accepts any gender";
    } else if (seekerGender === prefGender) {
        breakdown.genderMatch.score = 25;
        breakdown.genderMatch.matched = true;
        breakdown.genderMatch.detail = `Gender matches preferred gender (${room.preferredGender})`;
    } else {
        breakdown.genderMatch.score = 0;
        breakdown.genderMatch.matched = false;
        breakdown.genderMatch.detail = `Seeker gender (${seeker.gender || 'Not specified'}) does not match preferred gender (${room.preferredGender})`;
    }

    // 2. Occupation Match (20 points)
    const prefOccupation = (room.preferredOccupation || "any").toLowerCase().trim();
    const seekerOccupation = (seeker.occupation || "unspecified").toLowerCase().trim();

    if (prefOccupation === "any" || !room.preferredOccupation) {
        breakdown.occupationMatch.score = 20;
        breakdown.occupationMatch.matched = true;
        breakdown.occupationMatch.detail = "Room accepts any occupation";
    } else if (seekerOccupation !== "unspecified" && (seekerOccupation.includes(prefOccupation) || prefOccupation.includes(seekerOccupation))) {
        breakdown.occupationMatch.score = 20;
        breakdown.occupationMatch.matched = true;
        breakdown.occupationMatch.detail = `Occupation matches preferred occupation (${room.preferredOccupation})`;
    } else if (seeker.occupation) {
        breakdown.occupationMatch.score = 10;
        breakdown.occupationMatch.matched = false;
        breakdown.occupationMatch.detail = `Partial occupation match (${seeker.occupation} vs ${room.preferredOccupation})`;
    } else {
        breakdown.occupationMatch.score = 0;
        breakdown.occupationMatch.matched = false;
        breakdown.occupationMatch.detail = "Seeker occupation not specified";
    }

    // 3. Capacity Match (20 points)
    const people = Number(requestData.numberOfPeople || 1);
    const maxOccupants = Number(room.maxOccupants || 1);

    if (people <= maxOccupants) {
        breakdown.capacityMatch.score = 20;
        breakdown.capacityMatch.matched = true;
        breakdown.capacityMatch.detail = `${people} occupant(s) fits within max capacity of ${maxOccupants}`;
    } else {
        breakdown.capacityMatch.score = 0;
        breakdown.capacityMatch.matched = false;
        breakdown.capacityMatch.detail = `${people} occupant(s) exceeds max capacity of ${maxOccupants}`;
    }

    // 4. Move-in Date Match (15 points)
    const moveInDate = requestData.expectedMoveInDate ? new Date(requestData.expectedMoveInDate) : null;
    const availableFrom = room.availableFrom ? new Date(room.availableFrom) : null;

    if (!moveInDate || !availableFrom || isNaN(moveInDate.getTime()) || isNaN(availableFrom.getTime())) {
        breakdown.dateMatch.score = 10;
        breakdown.dateMatch.matched = true;
        breakdown.dateMatch.detail = "Dates flexible or unspecified";
    } else if (moveInDate >= availableFrom) {
        breakdown.dateMatch.score = 15;
        breakdown.dateMatch.matched = true;
        breakdown.dateMatch.detail = `Move-in date fits availability date (${availableFrom.toISOString().split('T')[0]})`;
    } else {
        breakdown.dateMatch.score = 5;
        breakdown.dateMatch.matched = false;
        breakdown.dateMatch.detail = `Requested move-in date is earlier than room availability (${availableFrom.toISOString().split('T')[0]})`;
    }

    // 5. Lifestyle & Habit Vibe Match (20 points)
    const seekerLifestyle = seeker.lifestyle || {};
    let lifestylePts = 0;
    const details = [];

    // Cleanliness (up to 5 points)
    if (seekerLifestyle.cleanlinessLevel) {
        lifestylePts += (seekerLifestyle.cleanlinessLevel >= 3) ? 5 : 3;
        details.push(`Cleanliness rating: ${seekerLifestyle.cleanlinessLevel}/5`);
    } else {
        lifestylePts += 3;
    }

    // Sleep Schedule (up to 5 points)
    if (seekerLifestyle.sleepSchedule) {
        lifestylePts += 5;
        details.push(`Schedule: ${seekerLifestyle.sleepSchedule}`);
    } else {
        lifestylePts += 3;
    }

    // Guest Policy (up to 5 points)
    if (seekerLifestyle.guestPolicy) {
        lifestylePts += 5;
        details.push(`Guest policy: ${seekerLifestyle.guestPolicy}`);
    } else {
        lifestylePts += 3;
    }

    // Smoking (up to 5 points)
    if (seekerLifestyle.smokingHabit) {
        lifestylePts += 5;
        details.push(`Smoking habit: ${seekerLifestyle.smokingHabit}`);
    } else {
        lifestylePts += 3;
    }

    breakdown.lifestyleMatch.score = Math.min(20, lifestylePts);
    breakdown.lifestyleMatch.matched = true;
    breakdown.lifestyleMatch.detail = details.length > 0 ? details.join(" | ") : "Default lifestyle settings";

    // Total Score calculation (max 100)
    score = breakdown.genderMatch.score + breakdown.occupationMatch.score + breakdown.capacityMatch.score + breakdown.dateMatch.score + breakdown.lifestyleMatch.score;

    return {
        score,
        percentage: `${score}%`,
        breakdown
    };
}

module.exports = {
    calculateCompatibilityScore
};
