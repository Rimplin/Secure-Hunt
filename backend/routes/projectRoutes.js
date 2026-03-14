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

// SEARCH projects
/*router.get("/search", async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res.status(400).json({ message: "Search keyword required" });
    }

    const projects = await Project.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { "techStack.frontend.type": { $regex: keyword, $options: "i" } },
        { "techStack.backend.type": { $regex: keyword, $options: "i" } },
        { "techStack.database.type": { $regex: keyword, $options: "i" } },
        { "techStack.webServer.type": { $regex: keyword, $options: "i" } },
        { "techStack.os.type": { $regex: keyword, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});*/
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
