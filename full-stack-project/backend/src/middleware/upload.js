/**
 * File Upload Middleware (Multer)
 * Handles multipart/form-data with file type & size validation.
 */
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Store uploads in a temp directory with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Validate file types
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not allowed. Accepted: PDF, TXT, DOCX, PNG, JPEG, GIF, WEBP.`), false);
  }
};

// Single file upload for chat
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
}).single('file');

// Multiple file upload for ingestion (up to 10 files)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
}).array('files', 10);

module.exports = { uploadSingle, uploadMultiple };
