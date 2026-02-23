const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },      // GridFS stored filename
  originalName: { type: String, required: true },  // original file name from user
  mimetype: { type: String },
});

const reportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      required: true,
    },
    description: { type: String, required: true },
    attachments: [attachmentSchema],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    rating: { type: Number, min: 1, max: 5, default: null },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ratedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
