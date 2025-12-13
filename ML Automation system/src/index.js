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
const driveIngest = require('./services/driveIngest');
const driveIngestWithAnymail = require('./services/driveIngestWithAnymail');
const leadClassifier = require('./services/leadClassifier');
const templateRouter = require('./services/templateRouter');
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
    const { code, error, error_description } = req.query;
    
    // Log all query parameters for debugging
    logger.info('OAuth callback received:', { 
      hasCode: !!code, 
      hasError: !!error, 
      error, 
      error_description,
      query: req.query 
    });
    
    if (error) {
      logger.error('OAuth error from Google:', { error, error_description, fullQuery: req.query });
      return res.status(400).send(`
        <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f44336;">❌ Authorization Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            ${error_description ? `<p><strong>Details:</strong> ${error_description}</p>` : ''}
            <p>Please check:</p>
            <ul style="text-align: left; display: inline-block;">
              <li>You are signed into Google with a test account</li>
              <li>The account is in the test users list</li>
              <li>The redirect URI matches exactly in Google Cloud Console</li>
            </ul>
            <p><a href="/auth/google">Try Again</a></p>
          </body>
        </html>
      `);
    }

    if (!code) {
      logger.warn('OAuth callback missing code parameter');
      return res.status(400).send(`
        <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f44336;">❌ Authorization Failed</h1>
            <p>No authorization code received from Google.</p>
            <p><a href="/auth/google">Try Again</a></p>
          </body>
        </html>
      `);
    }

    try {
      const tokens = await oauthManager.handleCallback(code);
      
      if (tokens && tokens.refresh_token) {
        logger.info('OAuth authorization successful');
        return res.send(`
          <html>
            <head><title>Authorization Successful</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
              <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                <h1 style="color: #4CAF50;">✅ Authorization Successful!</h1>
                <p>You can now close this window and return to the application.</p>
                <p>The system is ready to process files from Google Drive.</p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  <strong>Next Steps:</strong><br>
                  1. Upload a file to your Google Drive folder<br>
                  2. The system will automatically detect and process it<br>
                  3. Monitor progress via the dashboard
                </p>
              </div>
            </body>
          </html>
        `);
      } else {
        throw new Error('No refresh token received');
      }
    } catch (authError) {
      logger.error('OAuth token exchange error:', authError);
      return res.status(500).send(`
        <html>
          <head><title>Authorization Error</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f44336;">❌ Authorization Error</h1>
            <p><strong>Error:</strong> ${authError.message}</p>
            <p>Please try again or contact support.</p>
            <p><a href="/auth/google">Try Again</a></p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    logger.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #f44336;">❌ Server Error</h1>
          <p>An unexpected error occurred. Please try again later.</p>
          <p><a href="/auth/google">Try Again</a></p>
        </body>
      </html>
    `);
  }
});

// Google OAuth initiation
app.get('/auth/google', (req, res) => {
  try {
    const authUrl = oauthManager.getAuthUrl();
    logger.info('OAuth URL generated');
    res.json({ authUrl, message: 'Visit the authUrl to authorize Google Drive and Gmail access' });
  } catch (error) {
    logger.error('Error generating OAuth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// OAuth status
app.get('/auth/status', async (req, res) => {
  try {
    const status = await oauthManager.getAuthStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error getting auth status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NEW PIPELINE ENDPOINTS
// ============================================

// Google Drive webhook (for push notifications)
app.post('/api/drive/webhook', async (req, res) => {
  try {
    logger.info('Drive webhook received:', req.headers);
    
    // Respond quickly to Google
    res.status(200).send('ok');
    
    // Process asynchronously
    const resourceId = req.headers['x-goog-resource-id'];
    const resourceState = req.headers['x-goog-resource-state'];
    
    if (resourceState === 'change' || resourceState === 'add') {
      // Enqueue file processing
      logger.info(`Drive change detected: ${resourceId}`);
      // TODO: Implement queue processing
    }
  } catch (error) {
    logger.error('Drive webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process Drive file (manual trigger)
app.post('/api/drive/process', async (req, res) => {
  try {
    const { file_id } = req.body;
    if (!file_id) {
      return res.status(400).json({ error: 'file_id required' });
    }

    logger.info(`Manual Drive file processing triggered: ${file_id}`);
    const result = await driveIngest.processDriveFile(file_id);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    logger.error('Drive process error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ingest status
app.get('/api/ingests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT di.*, 
              COUNT(DISTINCT dr.id) as total_rows,
              COUNT(DISTINCT dr.lead_id) as leads_created,
              COUNT(DISTINCT CASE WHEN dr.anymail_status = 'success' THEN dr.id END) as anymail_success
       FROM drive_ingests di
       LEFT JOIN drive_rows dr ON di.id = dr.ingest_id
       WHERE di.id = $1
       GROUP BY di.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingest not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get ingest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all ingests
app.get('/api/ingests', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT di.*, 
              COUNT(DISTINCT dr.id) as total_rows,
              COUNT(DISTINCT dr.lead_id) as leads_created
       FROM drive_ingests di
       LEFT JOIN drive_rows dr ON di.id = dr.ingest_id
       GROUP BY di.id
       ORDER BY di.inserted_at DESC
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('List ingests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Classify lead manually
app.post('/api/leads/:id/classify', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get lead
    const leadResult = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];
    
    // Classify
    const classification = await leadClassifier.classifyLead(lead);
    await leadClassifier.storeClassification(id, classification);
    
    // Route to template
    const routing = await templateRouter.routeLeadToTemplate(id);

    res.json({
      success: true,
      classification,
      routing
    });
  } catch (error) {
    logger.error('Classify lead error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get lead classification
app.get('/api/leads/:id/classification', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT l.*, lc.classification_type, lc.classification_score, lc.classification_signals
       FROM leads l
       LEFT JOIN lead_classifications lc ON l.id = lc.lead_id
       WHERE l.id = $1
       ORDER BY lc.classified_at DESC
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get classification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EXISTING ENDPOINTS (kept for compatibility)
// ============================================

// Scan Google Drive folder
app.post('/api/scan-folder', async (req, res) => {
  try {
    const folderId = req.body.folder_id || config.google.driveFolderId;
    const result = await orchestrator.scanAndProcessFolder(folderId);
    res.json(result);
  } catch (error) {
    logger.error('Scan folder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger Drive polling manually
app.post('/api/trigger-poll', async (req, res) => {
  try {
    const folderId = req.body.folder_id || config.google.driveFolderId;
    const files = await googleDrive.scanFolder(folderId);
    
    const results = [];
    for (const file of files) {
      try {
        const result = await driveIngest.processDriveFile(file.id);
        results.push({ file_id: file.id, filename: file.name, result });
      } catch (error) {
        results.push({ file_id: file.id, filename: file.name, error: error.message });
      }
    }

    res.json({
      success: true,
      files_found: files.length,
      results
    });
  } catch (error) {
    logger.error('Trigger poll error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process file manually
app.post('/api/process-file', async (req, res) => {
  try {
    const { file_id } = req.body;
    if (!file_id) {
      return res.status(400).json({ error: 'file_id required' });
    }

    const result = await orchestrator.processDriveFile(file_id);
    res.json(result);
  } catch (error) {
    logger.error('Process file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process sequences
app.post('/api/process-sequences', async (req, res) => {
  try {
    const result = await orchestrator.processSequences();
    res.json(result);
  } catch (error) {
    logger.error('Process sequences error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get import status
app.get('/api/imports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM import_batches WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Import not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supported file types
app.get('/api/supported-file-types', (req, res) => {
  res.json({
    supported: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.spreadsheet'
    ],
    extensions: ['.csv', '.xls', '.xlsx', '.gsheet']
  });
});

// Pipeline status
app.get('/api/pipeline/status', (req, res) => {
  const status = systemWatcher.getStatus();
  res.json(status);
});

// Pipeline logs
app.get('/api/pipeline/logs', (req, res) => {
  const logs = systemWatcher.getPipelineLogs();
  res.json(logs);
});

// Get specific pipeline
app.get('/api/pipeline/:id', (req, res) => {
  const { id } = req.params;
  const pipeline = systemWatcher.getPipeline(id);
  
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  res.json(pipeline);
});

// Get pipeline logs
app.get('/api/pipeline/:id/logs', (req, res) => {
  const { id } = req.params;
  const logs = systemWatcher.getPipelineLogs(id);
  res.json(logs);
});

// Get leads
app.get('/api/leads', async (req, res) => {
  try {
    const { limit = 50, offset = 0, lead_type, template_set } = req.query;
    
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (lead_type) {
      paramCount++;
      query += ` AND lead_type = $${paramCount}`;
      params.push(lead_type);
    }

    if (template_set) {
      paramCount++;
      query += ` AND template_set = $${paramCount}`;
      params.push(template_set);
    }

    paramCount++;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NEW WEBHOOK & TRACKING ENDPOINTS
// ============================================

// Bounce webhook
app.post('/api/webhooks/bounce', async (req, res) => {
  try {
    const bounceHandler = require('./services/bounceHandler');
    
    // Respond quickly
    res.status(200).send('OK');
    
    // Process asynchronously
    setImmediate(async () => {
      try {
        await bounceHandler.processBounce(req.body);
        logger.info('Bounce processed successfully');
      } catch (error) {
        logger.error('Error processing bounce:', error);
      }
    });
  } catch (error) {
    logger.error('Bounce webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reply webhook
app.post('/api/webhooks/reply', async (req, res) => {
  try {
    const threadHandler = require('./services/threadHandler');
    
    // Respond quickly
    res.status(200).send('OK');
    
    // Process asynchronously
    setImmediate(async () => {
      try {
        await threadHandler.processReply(req.body);
        logger.info('Reply processed successfully');
      } catch (error) {
        logger.error('Error processing reply:', error);
      }
    });
  } catch (error) {
    logger.error('Reply webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Email open tracking pixel
app.get('/track/open', async (req, res) => {
  try {
    const emailTracking = require('./services/emailTracking');
    
    // Send 1x1 transparent pixel immediately
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.send(pixel);
    
    // Process tracking asynchronously
    setImmediate(async () => {
      try {
        await emailTracking.recordOpen(req.query.token, {
          ip: req.ip,
          headers: req.headers
        });
      } catch (error) {
        logger.error('Error recording open:', error);
      }
    });
  } catch (error) {
    logger.error('Open tracking error:', error);
    // Still return pixel even on error
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.send(pixel);
  }
});

// Email click tracking
app.get('/track/click', async (req, res) => {
  try {
    const emailTracking = require('./services/emailTracking');
    const result = await emailTracking.recordClick(req.query.token, {
      ip: req.ip,
      headers: req.headers
    });
    
    if (result.success && result.redirectUrl) {
      res.redirect(result.redirectUrl);
    } else {
      res.status(404).send('Link not found');
    }
  } catch (error) {
    logger.error('Click tracking error:', error);
    res.status(500).send('Tracking error');
  }
});

// Unsubscribe endpoint
app.get('/api/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.query;
    
    if (!email) {
      return res.status(400).send('Email required');
    }
    
    // Verify token (simplified - implement proper verification)
    // Add to suppression list
    await db.query(
      `INSERT INTO suppression_list (email, reason, suppressed_at)
       VALUES ($1, 'unsubscribe', NOW())
       ON CONFLICT (email) DO UPDATE
       SET reason = 'unsubscribe', suppressed_at = NOW()`,
      [email]
    );
    
    // Pause all active sequences
    await db.query(
      `UPDATE lead_sequences
       SET status = 'paused',
           paused_at = NOW(),
           pause_reason = 'unsubscribe',
           paused_by = 'user',
           updated_at = NOW()
       WHERE lead_id IN (SELECT id FROM leads WHERE email = $1)`,
      [email]
    );
    
    // Update lead status
    await db.query(
      `UPDATE leads SET status = 'suppressed' WHERE email = $1`,
      [email]
    );
    
    res.send(`
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>✅ Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from all future emails.</p>
          <p>If you change your mind, please contact us at support@hingecraft.com</p>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('Unsubscribe error:', error);
    res.status(500).send('Error processing unsubscribe');
  }
});

// Monitoring dashboard
app.get('/api/monitoring/dashboard', async (req, res) => {
  try {
    const monitoring = require('./services/monitoring');
    const timeframe = req.query.timeframe || '24 hours';
    const metrics = await monitoring.getDashboardMetrics(timeframe);
    res.json(metrics);
  } catch (error) {
    logger.error('Monitoring dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Real-time monitoring stats
app.get('/api/monitoring/realtime', async (req, res) => {
  try {
    const monitoring = require('./services/monitoring');
    const stats = await monitoring.getRealTimeStats();
    res.json(stats);
  } catch (error) {
    logger.error('Real-time monitoring error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check with monitoring
app.get('/api/monitoring/health', async (req, res) => {
  try {
    const monitoring = require('./services/monitoring');
    const health = await monitoring.getHealthMetrics();
    const statusCode = health.overall === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({ error: error.message });
  }
});

// Check and send alerts
app.post('/api/monitoring/check-alerts', async (req, res) => {
  try {
    const monitoring = require('./services/monitoring');
    const alerts = await monitoring.checkAlerts();
    res.json({ alerts, count: alerts.length });
  } catch (error) {
    logger.error('Check alerts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GDPR - Access request
app.get('/api/gdpr/access', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const auditTraceback = require('./services/auditTraceback');
    
    // Find lead by email
    const leadResult = await db.query('SELECT id FROM leads WHERE email = $1', [email]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for this email' });
    }
    
    const leadId = leadResult.rows[0].id;
    const data = await auditTraceback.exportAuditTrail('lead', leadId, 'json');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${email}.json"`);
    res.send(data);
  } catch (error) {
    logger.error('GDPR access error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GDPR - Erase request
app.post('/api/gdpr/erase', async (req, res) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const auditTraceback = require('./services/auditTraceback');
    
    // Find lead by email
    const leadResult = await db.query('SELECT id FROM leads WHERE email = $1', [email]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for this email' });
    }
    
    const leadId = leadResult.rows[0].id;
    const result = await auditTraceback.eraseAuditTrail('lead', leadId);
    
    res.json({
      success: true,
      message: 'Data erased successfully',
      recordsErased: result.recordsErased
    });
  } catch (error) {
    logger.error('GDPR erase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GDPR - Export request
app.get('/api/gdpr/export', async (req, res) => {
  try {
    const { email, format = 'json' } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const auditTraceback = require('./services/auditTraceback');
    
    // Find lead by email
    const leadResult = await db.query('SELECT id FROM leads WHERE email = $1', [email]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for this email' });
    }
    
    const leadId = leadResult.rows[0].id;
    const data = await auditTraceback.exportAuditTrail('lead', leadId, format);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${email}.json"`);
      res.send(data);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${email}.csv"`);
      res.send(data);
    } else {
      res.json(JSON.parse(data));
    }
  } catch (error) {
    logger.error('GDPR export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Segment reconciliation
app.post('/api/leads/:id/reconcile-segments', async (req, res) => {
  try {
    const { id } = req.params;
    const segmentReconciler = require('./services/segmentReconciler');
    const result = await segmentReconciler.reconcileLeadSegments(id);
    res.json(result);
  } catch (error) {
    logger.error('Segment reconciliation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PIPELINE TRACKER ENDPOINTS
// ============================================

const pipelineTracker = require('./services/pipelineTracker');

// Get pipeline tracker status
app.get('/api/pipeline-tracker/status', async (req, res) => {
  try {
    const status = await pipelineTracker.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Pipeline tracker status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pipeline metrics
app.get('/api/pipeline-tracker/metrics', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24 hours';
    const metrics = await pipelineTracker.getMetrics(timeframe);
    res.json(metrics);
  } catch (error) {
    logger.error('Pipeline tracker metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sync status
app.get('/api/pipeline-tracker/sync', async (req, res) => {
  try {
    const syncStatus = {
      database: await pipelineTracker.checkDatabaseSync(),
      files: await pipelineTracker.checkFileSync(),
      services: await pipelineTracker.checkServiceSync()
    };
    res.json(syncStatus);
  } catch (error) {
    logger.error('Pipeline tracker sync check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Force full sync check
app.post('/api/pipeline-tracker/sync-check', async (req, res) => {
  try {
    await pipelineTracker.performFullSyncCheck();
    const status = await pipelineTracker.getStatus();
    res.json({ 
      message: 'Full sync check completed',
      status: status.sync 
    });
  } catch (error) {
    logger.error('Pipeline tracker sync check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start pipeline tracker
app.post('/api/pipeline-tracker/start', async (req, res) => {
  try {
    const interval = parseInt(req.body.interval) || 5000;
    await pipelineTracker.start(interval);
    res.json({ 
      message: 'Pipeline tracker started',
      interval: interval 
    });
  } catch (error) {
    logger.error('Pipeline tracker start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop pipeline tracker
app.post('/api/pipeline-tracker/stop', async (req, res) => {
  try {
    pipelineTracker.stop();
    res.json({ message: 'Pipeline tracker stopped' });
  } catch (error) {
    logger.error('Pipeline tracker stop error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HUBSPOT DASHBOARD SYNC ENDPOINTS
// ============================================

const hubspotDashboardSync = require('./services/hubspotDashboardSync');

// Initialize HubSpot custom objects
app.post('/api/hubspot/init-custom-objects', async (req, res) => {
  try {
    const result = await hubspotDashboardSync.initializeCustomObjects();
    res.json({ message: 'Custom objects initialized', result });
  } catch (error) {
    logger.error('HubSpot custom objects init error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync pipeline run to HubSpot
app.post('/api/hubspot/sync-pipeline-run/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await hubspotDashboardSync.syncPipelineRun(id);
    res.json(result);
  } catch (error) {
    logger.error('HubSpot pipeline run sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync pipeline metrics to HubSpot
app.post('/api/hubspot/sync-metrics', async (req, res) => {
  try {
    const timeframe = req.body.timeframe || '24 hours';
    const result = await hubspotDashboardSync.syncPipelineMetrics(timeframe);
    res.json(result);
  } catch (error) {
    logger.error('HubSpot metrics sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update contact with pipeline properties
app.post('/api/hubspot/update-contact/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { leadId } = req.body;
    if (!leadId) {
      return res.status(400).json({ error: 'leadId is required' });
    }
    const result = await hubspotDashboardSync.updateContactPipelineProperties(contactId, leadId);
    res.json(result);
  } catch (error) {
    logger.error('HubSpot contact update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync all pipeline runs
app.post('/api/hubspot/sync-all-pipeline-runs', async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 100;
    const result = await hubspotDashboardSync.syncAllPipelineRuns(limit);
    res.json(result);
  } catch (error) {
    logger.error('HubSpot sync all pipeline runs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync all contacts with pipeline data
app.post('/api/hubspot/sync-all-contacts', async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 100;
    const result = await hubspotDashboardSync.syncAllContactsPipelineData(limit);
    res.json(result);
  } catch (error) {
    logger.error('HubSpot sync all contacts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Full sync - syncs everything to HubSpot
app.post('/api/hubspot/full-sync', async (req, res) => {
  try {
    const result = await hubspotDashboardSync.fullSync();
    res.json(result);
  } catch (error) {
    logger.error('HubSpot full sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// HubSpot CLI sync
const hubspotCLISync = require('./services/hubspotCLISync');

// Full CLI sync
app.post('/api/hubspot/cli/full-sync', async (req, res) => {
  try {
    const result = await hubspotCLISync.fullSync();
    res.json(result);
  } catch (error) {
    logger.error('HubSpot CLI full sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create custom properties
app.post('/api/hubspot/cli/create-properties', async (req, res) => {
  try {
    const result = await hubspotCLISync.createCustomProperties();
    res.json(result);
  } catch (error) {
    logger.error('HubSpot CLI create properties error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync all leads
app.post('/api/hubspot/cli/sync-leads', async (req, res) => {
  try {
    const result = await hubspotCLISync.syncAllLeads();
    res.json(result);
  } catch (error) {
    logger.error('HubSpot CLI sync leads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HUBSPOT OPTIMIZED SYNC (MINIMIZES API CALLS)
// ============================================

const hubspotOptimizedSync = require('./services/hubspotOptimizedSync');

// Full optimized sync (minimizes API calls)
app.post('/api/hubspot/optimized/full-sync', async (req, res) => {
  try {
    const result = await hubspotOptimizedSync.fullSyncOptimized();
    res.json(result);
  } catch (error) {
    logger.error('HubSpot optimized sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test connection
app.get('/api/hubspot/optimized/test', async (req, res) => {
  try {
    const result = await hubspotOptimizedSync.testConnection();
    res.json(result);
  } catch (error) {
    logger.error('HubSpot connection test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync all leads (optimized)
app.post('/api/hubspot/optimized/sync-leads', async (req, res) => {
  try {
    const result = await hubspotOptimizedSync.syncAllLeadsOptimized();
    res.json(result);
  } catch (error) {
    logger.error('HubSpot optimized sync leads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CRON JOBS
// ============================================

// Process sequences every hour
const sequenceCron = new cron.CronJob('0 * * * *', async () => {
  try {
    logger.info('Running scheduled sequence processing');
    await orchestrator.processSequences();
  } catch (error) {
    logger.error('Sequence cron error:', error);
  }
}, null, true, 'America/Los_Angeles');

// Check alerts every 5 minutes
const alertCron = new cron.CronJob('*/5 * * * *', async () => {
  try {
    const monitoring = require('./services/monitoring');
    await monitoring.checkAlerts();
  } catch (error) {
    logger.error('Alert check error:', error);
  }
}, null, true, 'America/Los_Angeles');

// Poll Google Drive folder every 30 seconds
let lastScanTime = new Date();
const drivePollInterval = setInterval(async () => {
  try {
    const folderId = config.google.driveFolderId;
    if (!folderId) return;

    const files = await googleDrive.scanFolder(folderId);
    const now = new Date();

    for (const file of files) {
      // Check if file is new or modified since last scan
      const fileModified = new Date(file.modifiedTime || file.createdTime);
      
      if (fileModified > lastScanTime) {
        // Check if already processed
        const existing = await db.query(
          'SELECT id FROM drive_ingests WHERE drive_file_id = $1 AND status = $2',
          [file.id, 'completed']
        );

        if (existing.rows.length === 0) {
          logger.info(`New file detected: ${file.name} (${file.id})`);
          try {
            await driveIngestWithAnymail.processDriveFileWithAnymail(file.id);
          } catch (error) {
            logger.error(`Error processing file ${file.id}:`, error);
          }
        }
      }
    }

    lastScanTime = now;
  } catch (error) {
    logger.error('Drive poll error:', error);
  }
}, 30000); // 30 seconds

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    // Initialize OAuth
    await oauthManager.initialize();

    // Start pipeline tracker
    await pipelineTracker.start(5000); // Check every 5 seconds
    logger.info('Pipeline tracker started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 HingeCraft ML Automation System running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔐 OAuth: http://localhost:${PORT}/auth/google`);
      logger.info(`📁 Drive folder: ${config.google.driveFolderId}`);
      logger.info(`🔄 Drive polling: Every 30 seconds`);
      logger.info(`⏰ Sequence processing: Every hour`);
    });

    // Start system watcher
    systemWatcher.startWatching();
    logger.info('✅ System watcher started');

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  clearInterval(drivePollInterval);
  sequenceCron.stop();
  if (alertCron) alertCron.stop();
  pipelineTracker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  clearInterval(drivePollInterval);
  sequenceCron.stop();
  if (alertCron) alertCron.stop();
  pipelineTracker.stop();
  process.exit(0);
});

// Start server
startServer();

module.exports = app;
