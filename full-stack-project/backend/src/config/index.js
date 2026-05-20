/**
 * Centralized configuration module.
 * Loads all settings from environment variables with sensible defaults.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

module.exports = {
  port: process.env.PORT || 3001,
  databaseUri: process.env.DATABASE_URI || 'mongodb://localhost:27017/auth-app',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  n8n: {
    chatWebhookUrl: process.env.N8N_CHAT_WEBHOOK_URL || 'http://localhost:5678/webhook/process-document01',
    ingestWebhookUrl: process.env.N8N_INGEST_WEBHOOK_URL || 'http://localhost:5678/webhook/process-document',
  },
  upload: {
    maxFileSize: 25 * 1024 * 1024, // 25 MB
    allowedMimeTypes: [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
    ],
  },
};
