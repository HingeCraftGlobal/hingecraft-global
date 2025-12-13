/**
 * Pipeline Tracker Service
 * Comprehensive tracking and monitoring of the entire automation pipeline
 * Tracks database sync, file sync, and all pipeline stages
 */

const db = require('../utils/database');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class PipelineTracker {
  constructor() {
    this.trackingInterval = null;
    this.isRunning = false;
    this.lastSyncCheck = null;
    this.syncStatus = {
      database: { synced: false, lastCheck: null, errors: [] },
      files: { synced: false, lastCheck: null, errors: [] },
      services: { synced: false, lastCheck: null, errors: [] }
    };
    this.pipelineState = {
      currentStage: null,
      activePipelines: 0,
      completedToday: 0,
      failedToday: 0,
      lastActivity: null
    };
  }

  /**
   * Start pipeline tracking
   */
  async start(intervalMs = 5000) {
    if (this.isRunning) {
      logger.warn('Pipeline tracker already running');
      return;
    }

    this.isRunning = true;
    logger.info('Pipeline tracker started', { interval: intervalMs });

    // Initial sync check
    await this.performFullSyncCheck();

    // Start periodic tracking
    this.trackingInterval = setInterval(async () => {
      try {
        await this.updatePipelineState();
        await this.checkDatabaseSync();
        await this.checkFileSync();
        await this.checkServiceSync();
      } catch (error) {
        logger.error('Pipeline tracker error:', error);
      }
    }, intervalMs);

    return this;
  }

  /**
   * Stop pipeline tracking
   */
  stop() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    this.isRunning = false;
    logger.info('Pipeline tracker stopped');
  }

  /**
   * Perform full sync check
   */
  async performFullSyncCheck() {
    logger.info('Performing full sync check...');
    
    await Promise.all([
      this.checkDatabaseSync(),
      this.checkFileSync(),
      this.checkServiceSync(),
      this.updatePipelineState()
    ]);

    this.lastSyncCheck = new Date();
    logger.info('Full sync check complete', this.syncStatus);
  }

  /**
   * Check database sync status
   */
  async checkDatabaseSync() {
    try {
      const checks = {
        tables: await this.verifyDatabaseTables(),
        indexes: await this.verifyDatabaseIndexes(),
        triggers: await this.verifyDatabaseTriggers(),
        data: await this.verifyDatabaseData()
      };

      const allGood = Object.values(checks).every(check => check.valid);

      this.syncStatus.database = {
        synced: allGood,
        lastCheck: new Date(),
        errors: Object.values(checks)
          .filter(check => !check.valid)
          .map(check => check.error),
        details: checks
      };

      return this.syncStatus.database;
    } catch (error) {
      this.syncStatus.database = {
        synced: false,
        lastCheck: new Date(),
        errors: [error.message]
      };
      logger.error('Database sync check failed:', error);
      return this.syncStatus.database;
    }
  }

  /**
   * Verify all required database tables exist
   */
  async verifyDatabaseTables() {
    const requiredTables = [
      'leads', 'lead_sequences', 'email_logs',
      'drive_ingests', 'drive_rows', 'lead_classifications',
      'email_bounces', 'email_threads', 'email_replies',
      'email_tracking', 'lead_segments', 'segment_conflicts',
      'audit_trace', 'domain_suppression', 'suppression_list'
    ];
    
    const optionalTables = [
      'email_templates' // May exist in different migration
    ];

    try {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ANY($1)
      `, [requiredTables]);

      const existingTables = result.rows.map(r => r.table_name);
      const missingTables = requiredTables.filter(t => !existingTables.includes(t));

      return {
        valid: missingTables.length === 0,
        error: missingTables.length > 0 
          ? `Missing tables: ${missingTables.join(', ')}` 
          : null,
        existing: existingTables.length,
        required: requiredTables.length,
        missing: missingTables
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Verify database indexes
   */
  async verifyDatabaseIndexes() {
    const criticalIndexes = [
      'idx_leads_email',
      'idx_leads_fingerprint',
      'idx_email_logs_lead_id',
      'idx_email_logs_status',
      'idx_drive_ingests_status',
      'idx_lead_sequences_status'
    ];

    try {
      const result = await db.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = ANY($1)
      `, [criticalIndexes]);

      const existingIndexes = result.rows.map(r => r.indexname);
      const missingIndexes = criticalIndexes.filter(i => !existingIndexes.includes(i));

      return {
        valid: missingIndexes.length === 0,
        error: missingIndexes.length > 0 
          ? `Missing indexes: ${missingIndexes.join(', ')}` 
          : null,
        existing: existingIndexes.length,
        required: criticalIndexes.length
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Verify database triggers
   */
  async verifyDatabaseTriggers() {
    const requiredTriggers = [
      'trigger_pause_sequence_on_reply',
      'trigger_suppress_on_hard_bounce'
    ];

    try {
      const result = await db.query(`
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name = ANY($1)
      `, [requiredTriggers]);

      const existingTriggers = result.rows.map(r => r.trigger_name);
      const missingTriggers = requiredTriggers.filter(t => !existingTriggers.includes(t));

      return {
        valid: missingTriggers.length === 0,
        error: missingTriggers.length > 0 
          ? `Missing triggers: ${missingTriggers.join(', ')}` 
          : null,
        existing: existingTriggers.length,
        required: requiredTriggers.length
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Verify database data integrity
   */
  async verifyDatabaseData() {
    try {
      const checks = await Promise.all([
        db.query('SELECT COUNT(*) as count FROM leads'),
        db.query('SELECT COUNT(*) as count FROM email_logs'),
        db.query('SELECT COUNT(*) as count FROM drive_ingests'),
        db.query(`
          SELECT COUNT(*) as count 
          FROM leads l 
          LEFT JOIN lead_sequences ls ON l.id = ls.lead_id 
          WHERE ls.id IS NULL AND l.lead_type IS NOT NULL
        `)
      ]);

      const orphanedLeads = parseInt(checks[3].rows[0].count) || 0;

      return {
        valid: orphanedLeads === 0,
        error: orphanedLeads > 0 
          ? `${orphanedLeads} leads without sequences` 
          : null,
        stats: {
          leads: parseInt(checks[0].rows[0].count) || 0,
          emails: parseInt(checks[1].rows[0].count) || 0,
          ingests: parseInt(checks[2].rows[0].count) || 0,
          orphanedLeads
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Check file sync status
   */
  async checkFileSync() {
    try {
      const projectRoot = path.join(__dirname, '../..');
      const requiredFiles = [
        'src/services/bounceHandler.js',
        'src/services/threadHandler.js',
        'src/services/segmentReconciler.js',
        'src/services/auditTraceback.js',
        'src/services/hubspotEnhanced.js',
        'src/services/anymailEnhanced.js',
        'src/services/emailTracking.js',
        'src/services/monitoring.js',
        'database/004_bounce_thread_audit_tables.sql',
        'tests/pipeline-step-by-step-test.js',
        'tests/test-pipeline-interactive.js'
      ];

      const fileChecks = await Promise.all(
        requiredFiles.map(async (file) => {
          const filePath = path.join(projectRoot, file);
          try {
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            return {
              file,
              exists: true,
              size: stats.size,
              modified: stats.mtime,
              hash: hash.substring(0, 16)
            };
          } catch (error) {
            return {
              file,
              exists: false,
              error: error.message
            };
          }
        })
      );

      const missingFiles = fileChecks.filter(f => !f.exists);
      const allGood = missingFiles.length === 0;

      this.syncStatus.files = {
        synced: allGood,
        lastCheck: new Date(),
        errors: missingFiles.map(f => `${f.file}: ${f.error}`),
        details: {
          total: requiredFiles.length,
          existing: fileChecks.filter(f => f.exists).length,
          missing: missingFiles.length,
          files: fileChecks
        }
      };

      return this.syncStatus.files;
    } catch (error) {
      this.syncStatus.files = {
        synced: false,
        lastCheck: new Date(),
        errors: [error.message]
      };
      logger.error('File sync check failed:', error);
      return this.syncStatus.files;
    }
  }

  /**
   * Check service sync status
   */
  async checkServiceSync() {
    try {
      const services = [
        'bounceHandler',
        'threadHandler',
        'segmentReconciler',
        'auditTraceback',
        'hubspotEnhanced',
        'anymailEnhanced',
        'emailTracking',
        'monitoring'
      ];

      const serviceChecks = await Promise.all(
        services.map(async (serviceName) => {
          try {
            const service = require(`./${serviceName}`);
            return {
              name: serviceName,
              loaded: true,
              hasMethods: typeof service === 'object' && Object.keys(service).length > 0
            };
          } catch (error) {
            return {
              name: serviceName,
              loaded: false,
              error: error.message
            };
          }
        })
      );

      const failedServices = serviceChecks.filter(s => !s.loaded);
      const allGood = failedServices.length === 0;

      this.syncStatus.services = {
        synced: allGood,
        lastCheck: new Date(),
        errors: failedServices.map(s => `${s.name}: ${s.error}`),
        details: {
          total: services.length,
          loaded: serviceChecks.filter(s => s.loaded).length,
          failed: failedServices.length,
          services: serviceChecks
        }
      };

      return this.syncStatus.services;
    } catch (error) {
      this.syncStatus.services = {
        synced: false,
        lastCheck: new Date(),
        errors: [error.message]
      };
      logger.error('Service sync check failed:', error);
      return this.syncStatus.services;
    }
  }

  /**
   * Update pipeline state
   */
  async updatePipelineState() {
    try {
      // Get active pipelines
      const activeResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM drive_ingests 
        WHERE status IN ('processing', 'pending')
      `);

      // Get today's stats
      const todayResult = await db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'failed') as failed,
          MAX(updated_at) as last_activity
        FROM drive_ingests
        WHERE DATE(updated_at) = CURRENT_DATE
      `);

      // Get current stage
      const stageResult = await db.query(`
        SELECT 
          di.id,
          di.status,
          di.filename,
          COUNT(dr.id) as row_count,
          COUNT(dr.id) FILTER (WHERE dr.processed = TRUE) as processed_count
        FROM drive_ingests di
        LEFT JOIN drive_rows dr ON di.id = dr.ingest_id
        WHERE di.status IN ('processing', 'pending')
        ORDER BY di.inserted_at DESC
        LIMIT 1
      `);

      this.pipelineState = {
        currentStage: stageResult.rows[0] ? {
          ingestId: stageResult.rows[0].id,
          status: stageResult.rows[0].status,
          filename: stageResult.rows[0].filename,
          progress: stageResult.rows[0].row_count > 0
            ? (stageResult.rows[0].processed_count / stageResult.rows[0].row_count * 100).toFixed(1)
            : 0
        } : null,
        activePipelines: parseInt(activeResult.rows[0].count) || 0,
        completedToday: parseInt(todayResult.rows[0].completed) || 0,
        failedToday: parseInt(todayResult.rows[0].failed) || 0,
        lastActivity: todayResult.rows[0].last_activity
      };

      return this.pipelineState;
    } catch (error) {
      logger.error('Pipeline state update failed:', error);
      return this.pipelineState;
    }
  }

  /**
   * Get comprehensive pipeline status
   */
  async getStatus() {
    return {
      tracker: {
        running: this.isRunning,
        lastSyncCheck: this.lastSyncCheck
      },
      sync: this.syncStatus,
      pipeline: this.pipelineState,
      timestamp: new Date()
    };
  }

  /**
   * Get detailed pipeline metrics
   */
  async getMetrics(timeframe = '24 hours') {
    try {
      const metrics = await Promise.all([
        // Pipeline metrics
        db.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'failed') as failed,
            COUNT(*) FILTER (WHERE status = 'processing') as processing
          FROM drive_ingests
          WHERE inserted_at >= NOW() - INTERVAL '${timeframe}'
        `),
        // Lead metrics
        db.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE lead_type IS NOT NULL) as classified,
            COUNT(*) FILTER (WHERE hubspot_contact_id IS NOT NULL) as hubspot_synced
          FROM leads
          WHERE created_at >= NOW() - INTERVAL '${timeframe}'
        `),
        // Email metrics
        db.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'sent') as sent,
            COUNT(*) FILTER (WHERE status = 'opened') as opened,
            COUNT(*) FILTER (WHERE status = 'bounced') as bounced
          FROM email_logs
          WHERE created_at >= NOW() - INTERVAL '${timeframe}'
        `),
        // Sequence metrics
        db.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'paused') as paused,
            COUNT(*) FILTER (WHERE status = 'completed') as completed
          FROM lead_sequences
          WHERE created_at >= NOW() - INTERVAL '${timeframe}'
        `)
      ]);

      return {
        timeframe,
        pipeline: {
          total: parseInt(metrics[0].rows[0].total) || 0,
          completed: parseInt(metrics[0].rows[0].completed) || 0,
          failed: parseInt(metrics[0].rows[0].failed) || 0,
          processing: parseInt(metrics[0].rows[0].processing) || 0
        },
        leads: {
          total: parseInt(metrics[1].rows[0].total) || 0,
          classified: parseInt(metrics[1].rows[0].classified) || 0,
          hubspotSynced: parseInt(metrics[1].rows[0].hubspot_synced) || 0
        },
        emails: {
          total: parseInt(metrics[2].rows[0].total) || 0,
          sent: parseInt(metrics[2].rows[0].sent) || 0,
          opened: parseInt(metrics[2].rows[0].opened) || 0,
          bounced: parseInt(metrics[2].rows[0].bounced) || 0
        },
        sequences: {
          total: parseInt(metrics[3].rows[0].total) || 0,
          active: parseInt(metrics[3].rows[0].active) || 0,
          paused: parseInt(metrics[3].rows[0].paused) || 0,
          completed: parseInt(metrics[3].rows[0].completed) || 0
        },
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Metrics retrieval failed:', error);
      throw error;
    }
  }
}

module.exports = new PipelineTracker();
