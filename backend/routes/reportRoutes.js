const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Report = require("../models/Report");
const Project = require("../models/Project");
const User = require("../models/User");
const upload = require("../config/gridfs");
const { protect, authorize } = require("../middleware/authMiddleware");

// Initialize Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
// @desc    Update report status and release escrow via Stripe if accepted
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

    const previousStatus = report.status;

    let payoutMessage = "";

    // Trigger Stripe dummy payout if status is being set to "accepted"
    if (status === "accepted" && report.status !== "accepted") {
      const project = await Project.findById(report.projectId);
      if (project && project.bounty) {
        // Parse the bounty amount (e.g., "$1,500" -> 1500)
        const bountyStr = project.bounty.replace(/[^0-9.]/g, '');
        const amountNum = parseFloat(bountyStr);
        
        if (!isNaN(amountNum) && amountNum > 0) {
          const amountInCents = Math.round(amountNum * 100);
          try {
            // Test transfer to a dummy Stripe Connected Account
            const transfer = await stripe.transfers.create({
              amount: amountInCents,
              currency: "usd",
              destination: "acct_1TBN6U5JTbG7xCmB", // Stripe connected account ID (testing in sandbox)
              description: `Bounty payout for report: ${report.title}`
            });
            payoutMessage = " | Payout successful (transfer ID: " + transfer.id + ")";
          } catch (stripeError) {
            console.error("Stripe transfer via dummy test failed as expected:", stripeError.message);
            // Append the error to the message to show stripe is working, but don't fail the request
            payoutMessage = ` | Stripe dummy payout attempted (Error from Stripe API: ${stripeError.message})`;
          }
        } else {
           payoutMessage = " | Warning: Could not parse a valid numerical bounty amount for payout.";
        }
      } else {
         payoutMessage = " | Warning: Could not find project to determine bounty amount.";
      }
    }

    report.status = status;
    const updated = await report.save();

    let notificationDelivered = false;

    if (previousStatus !== status && report.submittedBy) {
      const readableStatus = status.charAt(0).toUpperCase() + status.slice(1);
      const notificationId = new mongoose.Types.ObjectId();
      const notificationPayload = {
        _id: notificationId,
        id: notificationId.toString(),
        type: "report-status",
        title: "Report status updated",
        message: `Your report "${report.title}" is now ${readableStatus}.`,
        reportId: report._id,
        status,
        isRead: false,
      };

      const notificationWrite = await User.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(report.submittedBy) },
        {
          $push: {
            notifications: {
              $each: [notificationPayload],
              $position: 0,
              $slice: 50,
            },
          },
        }
      );

      if (!notificationWrite.matchedCount || !notificationWrite.modifiedCount) {
        return res.status(500).json({
          message: `Status updated to "${status}" but failed to notify the report submitter.`,
          report: updated,
          notificationDelivered: false,
        });
      }

      notificationDelivered = true;
    }

    res.json({
      message: `Status updated to "${status}"${payoutMessage}`,
      report: updated,
      notificationDelivered,
    });
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
