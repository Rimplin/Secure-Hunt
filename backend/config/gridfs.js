const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per file
    fileFilter: (req, file, cb) => {
        // Allow images and common doc types
        const allowed = [
            "image/png", "image/jpeg", "image/gif", "image/webp",
            "application/pdf", "text/plain", "application/zip",
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}`), false);
        }
    },
});

module.exports = upload;
