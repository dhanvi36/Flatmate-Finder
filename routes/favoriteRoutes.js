const express = require("express");

const router = express.Router();

const auth =
require("../middleware/auth");

const favoriteController =
require("../controller/favoriteController");

router.post(
    "/:roomId",
    auth,
    favoriteController.addFavorite
);

router.get(
    "/",
    auth,
    favoriteController.getMyFavorites
);

router.delete(
    "/:roomId",
    auth,
    favoriteController.removeFavorite
);

module.exports = router;