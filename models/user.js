const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [emailRegex, "Please provide a valid email address"]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"]
    },

    role: {
      type: String,
      enum: {
        values: ["provider", "seeker", "admin"],
        message: "{VALUE} is not a valid role"
      },
      required: [true, "Role is required"],
      validate: {
        validator: function(v) {
          if (v === "admin") {
            return this.email && this.email.toLowerCase().endsWith("@admin.com");
          }
          return true;
        },
        message: "Admin role is only allowed for emails ending with @admin.com"
      }
    },

    accountStatus: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    },

    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [100, "Age cannot exceed 100"]
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", "prefer_not_to_say"],
        message: "{VALUE} is not a valid gender option"
      }
    },

    occupation: {
      type: String,
      trim: true,
      maxlength: [100, "Occupation cannot exceed 100 characters"]
    },

    preferences: {
      type: String,
      trim: true,
      maxlength: [500, "Preferences text cannot exceed 500 characters"]
    },

    // Favorite room listings
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
      }
    ],

    phone: {
      type: String,
      trim: true
    },

    lifestyle: {
      sleepSchedule: {
        type: String,
        enum: ["early_bird", "night_owl", "flexible"],
        default: "flexible"
      },
      cleanlinessLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      dietaryPreference: {
        type: String,
        enum: ["vegetarian", "non_vegetarian", "vegan", "eggetarian", "any"],
        default: "any"
      },
      guestPolicy: {
        type: String,
        enum: ["no_guests", "weekends_only", "anytime"],
        default: "weekends_only"
      },
      smokingHabit: {
        type: String,
        enum: ["non_smoker", "smoker", "outside_only"],
        default: "non_smoker"
      },
      petFriendly: {
        type: Boolean,
        default: false
      }
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);