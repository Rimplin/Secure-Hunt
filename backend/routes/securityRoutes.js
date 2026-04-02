const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { getProjectSecurityReport } = require("../utils/nvdService");
const { generateTestingGuidance } = require("../utils/aiGuidanceService");

/**
 * @route GET /api/security/report/:projectId
 * @desc Get security report for a specific project.
 */
router.get("/report/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.techStack) {
      return res.status(400).json({ message: "Project has no tech stack defined" });
    }

    const report = await getProjectSecurityReport(project.techStack);
    res.json(report);
  } catch (error) {
    console.error("Error generating security report:", error.message);
    res.status(500).json({ message: "Error generating security report. NVD API might be rate limiting or down." });
  }
});

/**
 * @route GET /api/security/testing-guidance/:projectId
 * @desc Generate AI testing guidance based on the project's vulnerability results.
 */
router.get("/testing-guidance/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.techStack) {
      return res.json({
        recommendations: [],
        message: "No related vulnerabilities found.",
      });
    }

    // Reuse the existing vulnerability-fetching logic
    const securityReport = await getProjectSecurityReport(project.techStack);

    const guidance = await generateTestingGuidance(securityReport);
    res.json(guidance);
  } catch (error) {
    console.error("Error generating AI testing guidance:", error.message);
    res.status(500).json({
      recommendations: [
        {
          title: "Manual Review Recommended",
          priority: "medium",
          reason:
            "Related vulnerability data was found, but automated recommendation generation is currently unavailable.",
        },
      ],
    });
  }
});

module.exports = router;
