/**
 * n8n Service
 * Handles communication with n8n webhook endpoints.
 * This is the ONLY module that talks to n8n — isolating the integration.
 */
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const config = require('../config');

/**
 * Forward a chat message (and optional file) to the n8n chat webhook.
 * @param {string} message - The user's text message
 * @param {Object|null} file - Multer file object (optional)
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} - The AI response { reply: string }
 */
async function sendChatMessage(message, file, userId) {
  try {
    let payload;
    let headers = {};

    if (file) {
      // Use FormData for file uploads
      payload = new FormData();
      payload.append('message', message);
      payload.append('userId', userId);
      payload.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      headers = { ...payload.getHeaders() };
    } else {
      // Use standard JSON for text-only messages
      payload = { message, userId };
      headers = { 'Content-Type': 'application/json' };
    }

    const response = await axios.post(config.n8n.chatWebhookUrl, payload, {
      headers,
      timeout: 120000, // 2-minute timeout for AI processing
    });

    return response.data;
  } catch (error) {

    console.error('[n8n-service] Chat webhook error:', error.message);
    throw new Error('Failed to process chat message via AI pipeline.');
  }
}

/**
 * Forward files to the n8n ingestion webhook for knowledge base building.
 * @param {Array} files - Array of Multer file objects
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} - Success/failure response
 */
async function sendFilesForIngestion(files, userId) {
  try {
    const formData = new FormData();
    formData.append('userId', userId);

    files.forEach((file, index) => {
      formData.append('files', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const response = await axios.post(config.n8n.ingestWebhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 300000, // 5-minute timeout for bulk ingestion
    });

    return response.data;
  } catch (error) {
    console.error('[n8n-service] Ingestion webhook error:', error.message);
    throw new Error('Failed to ingest files via AI pipeline.');
  }
}

module.exports = { sendChatMessage, sendFilesForIngestion };
