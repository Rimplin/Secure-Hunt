const express = require("express");
const router = express.Router();
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
});

module.exports = router;
