const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const User = require("../models/User");

// @route   GET /api/developers/:id/profile
// @desc    Get developer profile with accepted reports and aggregated stats
// @access  Public
router.get("/:id/profile", async (req, res) => {
  try {
    // Look up the developer
    const developer = await User.findById(req.params.id).select("email role");
    if (!developer) {
      return res.status(404).json({ message: "Developer not found" });
    }

    // Find ALL reports submitted by this developer
    const allReports = await Report.find({
      submittedBy: req.params.id,
    })
      .populate("projectId", "name bounty")
      .sort({ createdAt: -1 });

    // Derive accepted subset for stats
    const acceptedReports = allReports.filter((r) => r.status === "accepted");

    // Compute statistics
    const acceptedReportsCount = acceptedReports.length;
    const totalReportsCount = allReports.length;

    const ratedReports = acceptedReports.filter(
      (r) => r.rating !== null && r.rating !== undefined
    );

    const totalRatingPoints = ratedReports.reduce(
      (sum, r) => sum + r.rating,
      0
    );

    const averageRating =
      ratedReports.length > 0
        ? parseFloat((totalRatingPoints / ratedReports.length).toFixed(1))
        : 0;

    res.json({
      developerId: developer._id,
      email: developer.email,
      role: developer.role,
      acceptedReportsCount,
      totalReportsCount,
      totalRatingPoints,
      averageRating,
      acceptedReports,
      allReports,
    });
  } catch (err) {
    console.error("Error fetching developer profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
