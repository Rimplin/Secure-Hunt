const express = require("express");
const router = express.Router();
const ForumPost = require("../models/ForumPost");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate("author", "email role")
      .populate("comments.author", "email role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching forum posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const post = await ForumPost.create({
      title,
      content,
      author: req.user._id,
    });

    const populated = await post.populate("author", "email role");
    res.status(201).json(populated);
  } catch (err) {
    console.error("Error creating forum post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Comment content is required." });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ content, author: req.user._id });
    await post.save();

    const updated = await ForumPost.findById(req.params.id)
      .populate("author", "email role")
      .populate("comments.author", "email role");

    res.status(201).json(updated.comments[updated.comments.length - 1]);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "administrator";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this post." });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;