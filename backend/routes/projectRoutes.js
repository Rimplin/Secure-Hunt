const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
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
    const newProject = new Project(req.body);
    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
