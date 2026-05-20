/**
 * Ingestion Routes — All protected by JWT middleware
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const ingestController = require('../controllers/ingestController');

// POST /api/ingest — Upload multiple files for knowledge base building
router.post('/', authMiddleware, (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, ingestController.ingestFiles);

module.exports = router;
