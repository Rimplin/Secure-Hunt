const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Report = require("../models/Report");
const upload = require("../config/gridfs");
const { authMiddleware, requireRole } = require("../middleware/auth");

// POST /api/reports — submit a report (hunters only)
router.post(
    "/",
    authMiddleware,
    requireRole("hunter"),
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
                const filename = `${Date.now()}-${f.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`; // clean filename

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
            });

            res.status(201).json({ message: "Report submitted successfully!", report });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error while submitting report." });
        }
    }
);

// GET /api/reports — list all reports (admin use / testing)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("projectId", "name bounty")
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/files/:filename — stream a file from GridFS
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
