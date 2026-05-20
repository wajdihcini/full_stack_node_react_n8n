/**
 * Chat Routes — All protected by JWT middleware
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const chatController = require('../controllers/chatController');

// POST /api/chat — Send a message (with optional file)
router.post('/', authMiddleware, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, chatController.sendMessage);

// GET /api/chat/history — Retrieve chat history
router.get('/history', authMiddleware, chatController.getHistory);

// DELETE /api/chat/history — Clear chat history
router.delete('/history', authMiddleware, chatController.clearHistory);

module.exports = router;
