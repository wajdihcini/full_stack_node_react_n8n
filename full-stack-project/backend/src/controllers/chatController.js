/**
 * Chat Controller
 * Handles chat messages with optional file attachments.
 * Forwards everything to n8n for AI processing.
 */
const fs = require('fs');
const n8nService = require('../services/n8nService');

// In-memory chat history — replace with database in production
const chatHistories = new Map();

/**
 * POST /api/chat
 * Accept a text message and optional file, forward to n8n, return AI response.
 */
async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const file = req.file || null;
    const userId = req.user.id;

    if (!message && !file) {
      return res.status(400).json({ error: 'A message or file is required.' });
    }

    // Initialize chat history for user if it doesn't exist
    if (!chatHistories.has(userId)) {
      chatHistories.set(userId, []);
    }

    const history = chatHistories.get(userId);

    // Store user message in history
    history.push({
      role: 'user',
      content: message || '[File uploaded]',
      fileName: file ? file.originalname : null,
      timestamp: new Date().toISOString(),
    });

    // Forward to n8n for AI processing
    const aiResponse = await n8nService.sendChatMessage(message || '', file, userId);

    // Store AI response in history
    history.push({
      role: 'assistant',
      content: aiResponse.reply || aiResponse.output || 'No response from AI.',
      timestamp: new Date().toISOString(),
    });

    // Cleanup uploaded file after processing
    if (file) {
      fs.unlink(file.path, () => {});
    }

    return res.json({
      reply: aiResponse.reply || aiResponse.output || 'No response from AI.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[chat] Error:', err.message);

    // Cleanup file on error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(502).json({
      error: 'AI service is temporarily unavailable. Please try again.',
    });
  }
}

/**
 * GET /api/chat/history
 * Returns the chat history for the authenticated user.
 */
function getHistory(req, res) {
  const userId = req.user.id;
  const history = chatHistories.get(userId) || [];
  return res.json({ history });
}

/**
 * DELETE /api/chat/history
 * Clears chat history for the authenticated user.
 */
function clearHistory(req, res) {
  const userId = req.user.id;
  chatHistories.delete(userId);
  return res.json({ message: 'Chat history cleared.' });
}

module.exports = { sendMessage, getHistory, clearHistory };
