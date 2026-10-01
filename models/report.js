const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reportedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null
    },

    reason: {
      type: String,
      enum: [
        "fake_listing",
        "fake_user",
        "scam",
        "inappropriate_content",
        "spam",
        "other"
      ],
      required: true
    },

    description: {
      type: String
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending"
    },

    adminAction: {
      type: String,
      enum: [
        "none",
        "blocked_user",
        "blocked_room",
        "warning",
        "dismissed"
      ],
      default: "none"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Report", reportSchema);