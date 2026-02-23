const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Report = require("../models/Report");
const upload = require("../config/gridfs");
const { protect, authorize } = require("../middleware/authMiddleware");

// @route   POST /api/reports
// @desc    Submit a report with optional file attachments (hunters only)
// @access  Private (hunters)
router.post(
  "/",
  protect,
  authorize("hunter"),
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
        const filename = `${Date.now()}-${f.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

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
        submittedBy: req.user._id,
      });

      res.status(201).json({ message: "Report submitted successfully!", report });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while submitting report." });
    }
  }
);

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
      .populate("projectId", "name bounty")
      .populate("submittedBy", "email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// @route   GET /api/reports/:id
// @desc    Get a single report by ID
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("projectId", "name bounty description");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/reports/:id/status
// @desc    Update report status
// @access  Private (company/admin only)
router.put("/:id/status", protect, authorize("company", "administrator"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;
    const updated = await report.save();

    res.json({ message: `Status updated to "${status}"`, report: updated });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/reports/:id/rate
// @desc    Rate a report (1-5 stars)
// @access  Private (company/admin only)
router.put("/:id/rate", protect, authorize("company", "administrator"), async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.rating = rating;
    report.ratedBy = req.user._id;
    report.ratedAt = new Date();

    const updatedReport = await report.save();

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

    const isAdmin = req.user.role === "administrator";
    const isPending = report.status === "pending";

    if (!isAdmin && !isPending) {
      return res.status(403).json({
        message: "Not authorized. Only admins or owners of pending reports can delete."
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/reports/files/:filename
// @desc    Stream a file from GridFS
// @access  Public
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
});

module.exports = router;
