const express = require('express');
const multer = require('multer');
const { uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Setup multer to store file in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

router.post('/upload', protect, upload.single('resume'), uploadResume);

module.exports = router;
