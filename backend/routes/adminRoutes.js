const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const ALLOWED_ROLES = new Set(["administrator", "hunter", "company"]);

router.get("/users", protect, authorize("administrator"), async (req, res) => {
  try {
    const users = await User.find()
      .select("email role isVerified createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/users/:id/role", protect, authorize("administrator"), async (req, res) => {
  try {
    const { role } = req.body;
    const normalizedRole = String(role || "").trim().toLowerCase();

    if (!normalizedRole || !ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = normalizedRole;
    await user.save();

    res.json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
