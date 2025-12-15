/**
 * HingeCraft Automation System - API Server
 * Memory-optimized for Docker deployment
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const healthCheck = require('./monitoring/healthCheck');
const logger = require('./utils/logger');

// Memory optimization
if (global.gc) {
  setInterval(() => {
    global.gc();
    logger.info('Garbage collection performed');
  }, 300000); // Every 5 minutes
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const health = healthCheck.getHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Memory usage endpoint
app.get('/api/memory', (req, res) => {
  const usage = process.memoryUsage();
  res.json({
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HingeCraft Automation System API',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 HingeCraft Automation API Server running on port ${PORT}`);
  logger.info(`💾 Memory limit: ${process.env.NODE_OPTIONS || 'default'}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
