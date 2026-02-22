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
        status: {
            type: String,
            enum: ["pending", "reviewed", "accepted", "rejected"],
            default: "pending",
        },
        // TODO: add submittedBy: { type: ObjectId, ref: "User" } when auth is ready
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
