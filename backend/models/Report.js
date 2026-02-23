const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected"],
      default: "pending",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ratedAt: {
      type: Date,
    },
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
