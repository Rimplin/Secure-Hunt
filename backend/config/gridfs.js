const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: "uploads",         // GridFS bucket name (collection prefix)
            filename: `${Date.now()}-${file.originalname}`,
        };
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per file
    fileFilter: (req, file, cb) => {
        // Allow images and common doc types
        const allowed = [
            "image/png", "image/jpeg", "image/gif", "image/webp",
            "application/pdf", "text/plain", "application/zip",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}`), false);
        }
    },
});

module.exports = upload;
