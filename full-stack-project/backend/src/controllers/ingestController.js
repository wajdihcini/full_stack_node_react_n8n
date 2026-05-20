/**
 * Ingestion Controller
 * Handles bulk file uploads for knowledge base building.
 * Forwards files to n8n for text extraction and vector storage.
 */
const fs = require('fs');
const n8nService = require('../services/n8nService');

/**
 * POST /api/ingest
 * Accept multiple files and send them to n8n for ingestion into the vector DB.
 */
async function ingestFiles(req, res) {
  try {
    const files = req.files;
    const userId = req.user.id;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required for ingestion.' });
    }

    // Forward all files to n8n ingestion webhook
    const result = await n8nService.sendFilesForIngestion(files, userId);

    // Cleanup all uploaded files after processing
    files.forEach((file) => {
      fs.unlink(file.path, () => {});
    });

    return res.json({
      message: `Successfully queued ${files.length} file(s) for ingestion.`,
      details: result,
    });
  } catch (err) {
    console.error('[ingest] Error:', err.message);

    // Cleanup files on error
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, () => {});
      });
    }

    return res.status(502).json({
      error: 'Ingestion service is temporarily unavailable. Please try again.',
    });
  }
}

module.exports = { ingestFiles };
