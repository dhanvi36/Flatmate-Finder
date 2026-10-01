const providerOnly = (req, res, next) => {

    if (req.user.role !== "provider") {

        return res.status(403).json({
            message: "Only providers can add rooms"
        });

    }

    next();
};

module.exports = providerOnly;