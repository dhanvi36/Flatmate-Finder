const express = require("express");

const router = express.Router();

const reportController =
require("../controller/reportController");

const auth =
require("../middleware/auth");

const adminOnly =
require("../middleware/adminOnly");


// USER FUNCTIONS

router.post(
    "/",
    auth,
    reportController.createReport
);

router.get(
    "/my-reports",
    auth,
    reportController.getMyReports
);


// ADMIN FUNCTIONS

router.get(
    "/",
    auth,
    adminOnly,
    reportController.getAllReports
);

router.get(
    "/:id",
    auth,
    adminOnly,
    reportController.getReportById
);

router.put(
    "/block/user/:userId",
    auth,
    adminOnly,
    reportController.blockUser
);

router.put(
    "/block/room/:roomId",
    auth,
    adminOnly,
    reportController.blockRoom
);

router.put(
    "/:id/status",
    auth,
    adminOnly,
    reportController.updateReportStatus
);

module.exports = router;