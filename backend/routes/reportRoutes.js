const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Report = require("../models/Report");
const upload = require("../config/gridfs");
const { authMiddleware, requireRole } = require("../middleware/auth");

// POST /api/reports — submit a report (hunters only)
router.post(
    "/",
    authMiddleware,
    requireRole("hunter"),
    upload.array("attachments", 5), // max 5 files
    async (req, res) => {
        try {
            const { projectId, title, severity, description } = req.body;

            if (!projectId || !title || !severity || !description) {
                return res.status(400).json({ message: "All required fields must be filled." });
            }

            const db = mongoose.connection.db;
            const bucket = new GridFSBucket(db, { bucketName: "uploads" });

            const attachments = [];
            for (const f of (req.files || [])) {
                const filename = `${Date.now()}-${f.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`; // clean filename

                await new Promise((resolve, reject) => {
                    const uploadStream = bucket.openUploadStream(filename, {
                        contentType: f.mimetype
                    });
                    uploadStream.once('finish', resolve);
                    uploadStream.once('error', reject);
                    uploadStream.end(f.buffer);
                });

                attachments.push({
                    filename: filename,
                    originalName: f.originalname,
                    mimetype: f.mimetype,
                });
            }

            const report = await Report.create({
                projectId,
                title,
                severity,
                description,
                attachments,
            });

            res.status(201).json({ message: "Report submitted successfully!", report });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error while submitting report." });
        }
    }
);

// GET /api/reports — list all reports (admin use / testing)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("projectId", "name bounty")
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/files/:filename — stream a file from GridFS
router.get("/files/:filename", async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });

        const files = await bucket.find({ filename: req.params.filename }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "File not found." });
        }

        res.set("Content-Type", files[0].contentType || "application/octet-stream");
        bucket.openDownloadStreamByName(req.params.filename).pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error retrieving file." });
    }
=======
const Report = require("../models/Report");
const { protect, authorize } = require("../middleware/authMiddleware");

// @route   POST /api/reports
// @desc    Submit a new vulnerability report
// @access  Private (hunters)
router.post("/", protect, async (req, res) => {
  try {
    const { project, title, severity, description, attachments } = req.body;

    if (!project || !title || !severity || !description) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const report = new Report({
      project,
      submittedBy: req.user._id,
      title,
      severity,
      description,
      attachments: attachments || [],
    });

    const savedReport = await report.save();
    await savedReport.populate("project submittedBy", "name email");

    res.status(201).json({
      message: "Report submitted successfully",
      report: savedReport,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/reports
// @desc    Get all reports (filtered by role)
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "hunter") {
      query.submittedBy = req.user._id;
    }

    const reports = await Report.find(query)
      .populate("project", "name bounty")
      .populate("submittedBy", "email")
      .populate("ratedBy", "email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/reports/:id
// @desc    Get a single report by ID
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("project", "name bounty description")
      .populate("submittedBy", "email role")
      .populate("ratedBy", "email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (
      req.user.role === "hunter" &&
      report.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view this report" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/reports/:id/rate
// @desc    Rate a report based on quality (1-5 stars)
// @access  Private (company/admin only)
router.put("/:id/rate", protect, authorize("company", "administrator"), async (req, res) => {
  try {
    // Check if user is company or admin
    if (req.user.role !== "company" && req.user.role !== "administrator") {
      return res.status(403).json({ message: "Only companies and administrators can rate reports" });
    }

    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Reports can be rated at any time (not just approved)
    report.rating = rating;
    report.ratedBy = req.user._id;
    report.ratedAt = new Date();

    const updatedReport = await report.save();
    await updatedReport.populate("project submittedBy ratedBy", "name email");

    res.json({
      message: `Report rated ${rating} stars successfully`,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error rating report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Private (admin only or report owner if pending)
router.delete("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const isOwner = report.submittedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "administrator";
    const isPending = report.status === "pending";

    if (!isAdmin && !(isOwner && isPending)) {
      return res.status(403).json({ 
        message: "Not authorized. Only admins or report owners (for pending reports) can delete reports" 
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
>>>>>>> main
});

module.exports = router;
