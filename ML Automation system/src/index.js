/**
 * HingeCraft ML Automation System
 * Main entry point for the automation system
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const orchestrator = require('./orchestrator');
const googleDrive = require('./services/googleDrive');
const sequenceEngine = require('./services/sequenceEngine');
const systemWatcher = require('./services/systemWatcher');
const db = require('./utils/database');
const logger = require('./utils/logger');
const config = require('../config/api_keys');
const cron = require('cron');
const oauthManager = require('./utils/oauth');
const healthCheck = require('./monitoring/healthCheck');

const app = express();
const PORT = config.app.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
const rateLimitMiddleware = require('./middleware/rateLimiter');
app.use('/api', rateLimitMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheck.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// System statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const stats = await healthCheck.getStatistics();
    res.json(stats);
  } catch (error) {
    logger.error('Statistics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth callback
app.get('/oauth2callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      logger.error('OAuth error:', error);
      return res.status(400).json({ error: `OAuth error: ${error}` });
    }

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Exchange code for tokens
    const tokens = await oauthManager.getTokens(code);
    
    // Set tokens in Google Drive service
    googleDrive.setCredentials(tokens);
    
    // Set tokens in Gmail service
    const gmail = require('./services/gmail');
    gmail.setCredentials(tokens);

    res.send(`
      <html>
        <head><title>Authorization Successful</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #4CAF50;">✅ Authorization Successful!</h1>
          <p>You can now close this window and return to the application.</p>
          <p>The system is ready to process files from Google Drive.</p>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <head><title>Authorization Failed</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #f44336;">❌ Authorization Failed</h1>
          <p>Error: ${error.message}</p>
          <p>Please try again.</p>
        </body>
      </html>
    `);
  }
});

// Get Google OAuth URL
app.get('/auth/google', (req, res) => {
  try {
    const authUrl = oauthManager.getAuthUrl();
    res.json({ 
      authUrl,
      message: 'Visit the authUrl to authorize Google Drive and Gmail access'
    });
  } catch (error) {
    logger.error('Error generating auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check OAuth status
app.get('/auth/status', (req, res) => {
  try {
    oauthManager.loadTokens();
    const hasTokens = !!oauthManager.tokens;
    const needsRefresh = hasTokens ? oauthManager.needsRefresh() : true;
    
    res.json({
      authorized: hasTokens,
      needsRefresh: needsRefresh,
      hasRefreshToken: !!(oauthManager.tokens && oauthManager.tokens.refresh_token)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook: Google Drive file change (TRIGGER POINT)
app.post('/webhook/drive', async (req, res) => {
  try {
    // Start system watcher if not already running
    if (!systemWatcher.isWatching) {
      await systemWatcher.startWatching();
    }
    
    // Verify webhook signature if secret is configured
    const webhookSecret = config.app.webhookSecret;
    if (webhookSecret) {
      const signature = req.headers['x-drive-signature'] || req.headers['x-hub-signature'];
      if (signature) {
        const { validateWebhookSignature } = require('./utils/validators');
        const validation = validateWebhookSignature(req.body, signature, webhookSecret);
        if (!validation.valid) {
          logger.warn('Invalid webhook signature');
          return res.status(403).json({ error: 'Invalid signature' });
        }
      }
    }

    // Respond quickly to Google (they require < 5 seconds)
    res.status(200).json({ received: true });

    // Process asynchronously
    setImmediate(async () => {
      try {
        await orchestrator.handleDriveWebhook(req.body);
      } catch (error) {
        logger.error('Drive webhook processing error:', error);
      }
    });
  } catch (error) {
    logger.error('Drive webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook: Anymail events
app.post('/webhook/anymail', async (req, res) => {
  try {
    const event = req.body;
    logger.info('Anymail webhook event:', event);

    // Update email log based on event
    if (event.message_id) {
      await db.query(
        `UPDATE email_logs 
         SET status = $1, ${event.event === 'opened' ? 'opened_at' : event.event === 'clicked' ? 'clicked_at' : 'delivered_at'} = $2
         WHERE provider_message_id = $3`,
        [event.event, new Date(), event.message_id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Anymail webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Process specific file
app.post('/api/process-file', async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
    }

    const result = await orchestrator.processDriveFile(fileId);
    res.json(result);
  } catch (error) {
    logger.error('Process file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Scan folder
app.post('/api/scan-folder', async (req, res) => {
  try {
    const { folderId } = req.body;
    const result = await orchestrator.scanAndProcessFolder(folderId);
    res.json(result);
  } catch (error) {
    logger.error('Scan folder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Process sequences
app.post('/api/process-sequences', async (req, res) => {
  try {
    const result = await orchestrator.processSequences();
    res.json(result);
  } catch (error) {
    logger.error('Process sequences error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get import status
app.get('/api/imports/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM import_batches WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Import not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get system statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const stats = await healthCheck.getStatistics();
    res.json(stats);
  } catch (error) {
    logger.error('Get statistics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get supported file types
app.get('/api/supported-file-types', (req, res) => {
  try {
    const supportedTypes = googleDrive.getSupportedFileTypes();
    res.json({
      success: true,
      supported: supportedTypes
    });
  } catch (error) {
    logger.error('Get supported file types error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get pipeline status
app.get('/api/pipeline/status', (req, res) => {
  try {
    const status = systemWatcher.getStatus();
    const activePipelines = systemWatcher.getAllActivePipelines();
    
    res.json({
      success: true,
      watcherActive: status.isWatching,
      mode: status.mode,
      waitingForFile: status.waitingForFile,
      status: status.waitingForFile ? 'STANDBY - Waiting for file input' : 
              status.mode === 'active' ? 'ACTIVE - Tracking pipeline' : 'STOPPED',
      activePipelines: activePipelines.length,
      pipelines: activePipelines,
      componentStatus: status.componentStatus,
      dryRun: config.app.dryRun || false
    });
  } catch (error) {
    logger.error('Get pipeline status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get pipeline by ID
app.get('/api/pipeline/:id', (req, res) => {
  try {
    const pipelineId = req.params.id;
    const report = systemWatcher.generatePipelineReport(pipelineId);
    
    if (report.error) {
      return res.status(404).json(report);
    }
    
    res.json({
      success: true,
      ...report
    });
  } catch (error) {
    logger.error('Get pipeline report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get recent pipeline logs
app.get('/api/pipeline/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const component = req.query.component;
    
    let logs;
    if (component) {
      logs = systemWatcher.getLogsByComponent(component, limit);
    } else {
      logs = systemWatcher.getRecentLogs(limit);
    }
    
    res.json({
      success: true,
      count: logs.length,
      logs: logs
    });
  } catch (error) {
    logger.error('Get pipeline logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get logs for specific pipeline
app.get('/api/pipeline/:id/logs', (req, res) => {
  try {
    const pipelineId = req.params.id;
    const limit = parseInt(req.query.limit) || 1000;
    const logs = systemWatcher.getLogsByPipeline(pipelineId, limit);
    
    res.json({
      success: true,
      pipelineId: pipelineId,
      count: logs.length,
      logs: logs
    });
  } catch (error) {
    logger.error('Get pipeline logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get health check details
app.get('/api/health', async (req, res) => {
  try {
    const health = await healthCheck.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: List recent leads
app.get('/api/leads', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await db.query(
      `SELECT id, email, first_name, last_name, organization, status, created_at 
       FROM leads 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) as total FROM leads');
    
    res.json({
      leads: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    });
  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get lead details
app.get('/api/leads/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM leads WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get lead error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scheduled jobs
// Process sequences every hour
const sequenceJob = new cron.CronJob('0 * * * *', async () => {
  logger.info('Running scheduled sequence processing');
  try {
    await orchestrator.processSequences();
  } catch (error) {
    logger.error('Scheduled sequence processing error:', error);
  }
});

// Scan folder daily at 2 AM
const scanJob = new cron.CronJob('0 2 * * *', async () => {
  logger.info('Running scheduled folder scan');
  try {
    await orchestrator.scanAndProcessFolder();
  } catch (error) {
    logger.error('Scheduled folder scan error:', error);
  }
});

// Poll Google Drive folder every 30 seconds for new files
let lastScanTime = new Date(0);
let processedFileIds = new Set();

const pollDriveFolder = async () => {
  try {
    const folderId = config.google.driveFolderId;
    if (!folderId) {
      logger.warn('No Google Drive folder ID configured, skipping poll');
      return;
    }

    logger.debug('Polling Google Drive folder for new files...');
    const files = await googleDrive.scanFolder(folderId);
    
    if (files && files.length > 0) {
      for (const file of files) {
        // Check if file was modified after last scan
        const fileModified = new Date(file.modifiedTime || file.createdTime);
        
        // Only process if:
        // 1. File is newer than last scan
        // 2. We haven't processed this file ID yet
        if (fileModified > lastScanTime && !processedFileIds.has(file.id)) {
          logger.info(`🆕 New file detected: ${file.name} (${file.id})`);
          
          // Mark as processed
          processedFileIds.add(file.id);
          
          // Process the file
          await orchestrator.processDriveFile(file.id);
        }
      }
    }
    
    // Update last scan time
    lastScanTime = new Date();
    
    // Clean up old file IDs (keep last 100)
    if (processedFileIds.size > 100) {
      const idsArray = Array.from(processedFileIds);
      processedFileIds = new Set(idsArray.slice(-100));
    }
  } catch (error) {
    logger.error('Error polling Google Drive folder:', error);
  }
};

// Start polling every 30 seconds
let pollInterval = null;

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Initialize and start server
async function start() {
  try {
    logger.info('Starting HingeCraft ML Automation System...');

    // Check database connection
    try {
      await db.query('SELECT NOW()');
      logger.info('✓ Database connection OK');
    } catch (error) {
      logger.error('✗ Database connection failed:', error.message);
      logger.error('Please ensure PostgreSQL is running and database is created');
      process.exit(1);
    }

    // Initialize OAuth manager
    oauthManager.initialize();
    logger.info('✓ OAuth manager initialized');

    // Initialize Google Drive service
    try {
      await googleDrive.initialize();
      logger.info('✓ Google Drive service initialized');
    } catch (error) {
      logger.warn('⚠ Google Drive service initialization warning:', error.message);
      logger.warn('Complete OAuth flow at /auth/google to enable full functionality');
    }

    // Start system watcher
    try {
      await systemWatcher.startWatching();
      logger.info('✓ System watcher started - monitoring all components');
    } catch (error) {
      logger.error('✗ Failed to start system watcher:', error);
    }

    // Start scheduled jobs
    try {
      sequenceJob.start();
      scanJob.start();
      logger.info('✓ Scheduled jobs started');
    } catch (error) {
      logger.error('✗ Failed to start scheduled jobs:', error);
    }

    // Start Google Drive folder polling
    if (!pollInterval) {
      pollInterval = setInterval(pollDriveFolder, 30000); // Every 30 seconds
      logger.info('✓ Google Drive folder polling started (every 30 seconds)');
      
      // Do initial scan immediately
      setImmediate(pollDriveFolder);
    }

    // Start server
    app.listen(PORT, () => {
      logger.info('');
      logger.info('═══════════════════════════════════════════════════════');
      logger.info('🚀 HingeCraft ML Automation System');
      logger.info('═══════════════════════════════════════════════════════');
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`✓ Health check: http://localhost:${PORT}/health`);
      logger.info(`✓ OAuth setup: http://localhost:${PORT}/auth/google`);
      logger.info(`✓ Statistics: http://localhost:${PORT}/api/statistics`);
      logger.info(`✓ Pipeline status: http://localhost:${PORT}/api/pipeline/status`);
      logger.info(`✓ Pipeline logs: http://localhost:${PORT}/api/pipeline/logs`);
      logger.info('🔍 System watcher: ACTIVE - Monitoring all components');
      logger.info('═══════════════════════════════════════════════════════');
      logger.info('');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  sequenceJob.stop();
  scanJob.stop();
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  process.exit(0);
});

// Start the server
start();

module.exports = app;
