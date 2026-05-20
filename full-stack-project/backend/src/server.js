/**
 * Express Server — Main Entry Point
 * 
 * Sets up middleware, routes, connects to MongoDB, and starts the HTTP server.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// ─── Ensure uploads directory exists ────────────────────────────
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Security Middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// ─── Rate Limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ─── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ingest', require('./routes/ingestRoutes'));

// ─── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Connect to MongoDB & Start Server ──────────────────────────
async function start() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    // Set a timeout for MongoDB connection to avoid hanging forever
    await mongoose.connect(config.databaseUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.warn('⚠️ Starting server WITHOUT database connection (Authentication will fail)');
  }

  app.listen(config.port, () => {
    console.log(`\n🚀 Backend server running on http://localhost:${config.port}`);
    console.log(`📡 Health check: http://localhost:${config.port}/api/health`);
    console.log(`🔗 n8n Chat Webhook: ${config.n8n.chatWebhookUrl}`);
    console.log(`🔗 n8n Upload Webhook: ${config.n8n.ingestWebhookUrl}\n`);
  });
}

start();


module.exports = app;
