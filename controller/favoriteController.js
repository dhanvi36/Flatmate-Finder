const Favorite =
require("../models/Favorite");

exports.addFavorite =
async (req, res) => {

    try {

        const roomId =
            req.params.roomId;

        const existing =
            await Favorite.findOne({

                seeker:
                    req.user.userId,

                room:
                    roomId

            });

        if (existing) {

            return res.status(400).json({
                message:
                    "Already in favourites"
            });

        }

        const favorite =
            await Favorite.create({

                seeker:
                    req.user.userId,

                room:
                    roomId

            });

        res.status(201).json({

            message:
                "Added to favourites",

            favorite

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

//view my favourites
exports.getMyFavorites =
async (req, res) => {

    try {

        const favorites =
            await Favorite.find({

                seeker:
                    req.user.userId

            })
            .populate("room");

        res.status(200).json({ favorites });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
//remove from favourites
exports.removeFavorite =
async (req, res) => {

    try {

        await Favorite.findOneAndDelete({

            seeker:
                req.user.userId,

            room:
                req.params.roomId

        });

        res.status(200).json({

            message:
                "Removed from favourites"

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};