const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { getProjectSecurityReport } = require("../utils/nvdService");

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

module.exports = router;
