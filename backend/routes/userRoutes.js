const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Project = require("../models/Project");
const Report = require("../models/Report");

// GET /api/users/:id/profile
router.get("/:id/profile", async (req, res) => {
  try {
    const viewedUser = await User.findById(req.params.id).select("email role createdAt");

    if (!viewedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (viewedUser.role === "company") {
      const projects = await Project.find({ owner: viewedUser._id })
        .select("name bounty createdAt owner")
        .sort({ createdAt: -1 })
        .lean();

      const projectIds = projects.map((project) => project._id);

      const reports = projectIds.length > 0
        ? await Report.find({ projectId: { $in: projectIds } })
            .select("projectId status createdAt")
            .lean()
        : [];

      const analyticsByProject = new Map(
        projects.map((project) => [
          String(project._id),
          {
            projectId: project._id,
            name: project.name,
            bounty: project.bounty,
            createdAt: project.createdAt,
            totalReports: 0,
            acceptedReports: 0,
            reviewedReports: 0,
            pendingReports: 0,
            rejectedReports: 0,
            lastReportAt: null,
          },
        ])
      );

      for (const report of reports) {
        const entry = analyticsByProject.get(String(report.projectId));
        if (!entry) continue;

        entry.totalReports += 1;

        if (report.status === "accepted") entry.acceptedReports += 1;
        else if (report.status === "reviewed") entry.reviewedReports += 1;
        else if (report.status === "pending") entry.pendingReports += 1;
        else if (report.status === "rejected") entry.rejectedReports += 1;

        if (!entry.lastReportAt || new Date(report.createdAt) > new Date(entry.lastReportAt)) {
          entry.lastReportAt = report.createdAt;
        }
      }

      const projectAnalytics = Array.from(analyticsByProject.values());

      const totals = projectAnalytics.reduce(
        (acc, project) => {
          acc.totalReports += project.totalReports;
          acc.acceptedReports += project.acceptedReports;
          acc.reviewedReports += project.reviewedReports;
          acc.pendingReports += project.pendingReports;
          acc.rejectedReports += project.rejectedReports;
          return acc;
        },
        {
          totalReports: 0,
          acceptedReports: 0,
          reviewedReports: 0,
          pendingReports: 0,
          rejectedReports: 0,
        }
      );

      const engagementRate =
        projects.length > 0
          ? Number((totals.totalReports / projects.length).toFixed(2))
          : 0;

      return res.json({
        mode: "company",
        email: viewedUser.email,
        role: viewedUser.role,
        createdAt: viewedUser.createdAt,
        totalProjects: projects.length,
        ...totals,
        engagementRate,
        projects: projectAnalytics,
      });
    }

    const allReports = await Report.find({ submittedBy: viewedUser._id })
      .populate("projectId", "name bounty")
      .sort({ createdAt: -1 });

    const acceptedReports = allReports.filter((r) => r.status === "accepted");

    const ratedReports = acceptedReports.filter(
      (r) => r.rating !== null && r.rating !== undefined
    );

    const totalRatingPoints = ratedReports.reduce((sum, r) => sum + r.rating, 0);

    const averageRating =
      ratedReports.length > 0
        ? parseFloat((totalRatingPoints / ratedReports.length).toFixed(1))
        : 0;

    return res.json({
      mode: "developer",
      developerId: viewedUser._id,
      email: viewedUser.email,
      role: viewedUser.role,
      createdAt: viewedUser.createdAt,
      acceptedReportsCount: acceptedReports.length,
      totalReportsCount: allReports.length,
      totalRatingPoints,
      averageRating,
      acceptedReports,
      allReports,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;