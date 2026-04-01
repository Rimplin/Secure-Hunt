const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Report = require("../models/Report");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// SEARCH projects
router.get("/search", async (req, res) => {
  try {

    const {
      q,
      frontend,
      backend,
      database,
      webServer,
      os,
      minBounty,
      maxBounty
    } = req.query;

    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    if (frontend)
      query["techStack.frontend.type"] = { $regex: frontend, $options: "i" };

    if (backend)
      query["techStack.backend.type"] = { $regex: backend, $options: "i" };

    if (database)
      query["techStack.database.type"] = { $regex: database, $options: "i" };

    if (webServer)
      query["techStack.webServer.type"] = { $regex: webServer, $options: "i" };

    if (os)
      query["techStack.os.type"] = { $regex: os, $options: "i" };

    if (minBounty || maxBounty) {
  query.$expr = {
    $and: [
      minBounty
        ? { $gte: [{ $toInt: { $substr: ["$bounty", 1, -1] } }, parseInt(minBounty)] }
        : { $gte: [0, 0] },

      maxBounty
        ? { $lte: [{ $toInt: { $substr: ["$bounty", 1, -1] } }, parseInt(maxBounty)] }
        : { $lte: [0, 999999999] }
    ]
  };
}

    const projects = await Project.find(query).sort({ createdAt: -1 });

    res.json(projects);

  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

// Company profile analytics
router.get("/company/:id/analytics", protect, authorize("company", "administrator"), async (req, res) => {
  try {
    const requestedCompanyId = String(req.params.id);
    const currentUserId = String(req.user._id);
    const isAdmin = req.user.role === "administrator";

    if (!isAdmin && requestedCompanyId !== currentUserId) {
      return res.status(403).json({ message: "Not authorized to view this company profile" });
    }

    const projects = await Project.find({ owner: requestedCompanyId })
      .select("name bounty createdAt")
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
      if (!entry) {
        continue;
      }

      entry.totalReports += 1;

      if (report.status === "accepted") {
        entry.acceptedReports += 1;
      } else if (report.status === "reviewed") {
        entry.reviewedReports += 1;
      } else if (report.status === "pending") {
        entry.pendingReports += 1;
      } else if (report.status === "rejected") {
        entry.rejectedReports += 1;
      }

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

    res.json({
      companyId: requestedCompanyId,
      totalProjects: projects.length,
      ...totals,
      engagementRate,
      projects: projectAnalytics,
    });
  } catch (err) {
    console.error("Error fetching company analytics:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET project by Mongo ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Invalid project ID" });
  }
});

router.post("/", protect, authorize("company", "administrator"), async (req, res) => {
  try {
    
    const {
    name,bounty,description,
    
    techStack
    } = req.body;

  if(!name || !bounty || !description  )
    return res.status(400).json({message:"Missing required fields"});
    const newProject = new Project({ ...req.body, owner: req.user._id });
    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
