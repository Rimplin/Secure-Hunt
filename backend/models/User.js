const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["report-status", "report-reward"],
      default: "report-status",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["administrator", "hunter", "company"],
      default: "hunter",
    },

    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    notifications: { type: [notificationSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);