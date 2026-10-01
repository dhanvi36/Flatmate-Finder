const express = require("express");

const router = express.Router();

const requestController =
    require("../controller/requestController");

const auth = require("../middleware/auth");
const checkProfileComplete = require("../middleware/checkProfileComplete");

// Send Request — no profile-complete gate so any logged-in seeker can send
router.post(
    "/",
    auth,
    requestController.createRequest
);

// Check Compatibility Score Before Requesting
router.get(
    "/check-compatibility/:roomId",
    auth,
    requestController.checkCompatibility
);

// My Requests (Seeker)
router.get(
    "/my-requests",
    auth,
    requestController.getMyRequests
);

// Requests Received (Provider)
router.get(
    "/received",
    auth,
    requestController.getReceivedRequests
);

// Accept / Reject Request
router.put(
    "/:id/status",
    auth,
    requestController.updateRequestStatus
);

// Unlock Contact Info (Requires Accepted Request)
router.get(
    "/:id/contact-info",
    auth,
    requestController.getUnlockedContactInfo
);

module.exports = router;