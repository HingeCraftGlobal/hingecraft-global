/**
 * Health Check Service
 * Monitors system health and provides status endpoints
 */

const db = require('../utils/database');
const logger = require('../utils/logger');

class HealthCheck {
  /**
   * Perform comprehensive health check
   */
  async checkHealth() {
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {}
    };

    // Database check
    try {
      const dbResult = await db.query('SELECT NOW() as time');
      checks.checks.database = {
        status: 'healthy',
        responseTime: Date.now(),
        message: 'Database connection OK'
      };
    } catch (error) {
      checks.checks.database = {
        status: 'unhealthy',
        error: error.message
      };
      checks.status = 'degraded';
    }

    // Redis check (if configured)
    try {
      // Add Redis check if Redis is configured
      checks.checks.redis = {
        status: 'not_configured',
        message: 'Redis not configured'
      };
    } catch (error) {
      checks.checks.redis = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // API checks
    checks.checks.apis = {
      google_drive: 'unknown',
      hubspot: 'unknown',
      anymail: 'unknown',
      gmail: 'unknown'
    };

    // System metrics
    checks.metrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    };

    return checks;
  }

  /**
   * Get system statistics
   */
  async getStatistics() {
    try {
      const stats = {
        leads: {
          total: 0,
          new: 0,
          enriched: 0,
          contacted: 0
        },
        sequences: {
          active: 0,
          completed: 0,
          paused: 0
        },
        emails: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0
        },
        imports: {
          total: 0,
          completed: 0,
          processing: 0,
          errors: 0
        }
      };

      // Get lead statistics
      const leadStats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'new') as new,
          COUNT(*) FILTER (WHERE status = 'enriched') as enriched,
          COUNT(*) FILTER (WHERE status = 'contacted') as contacted
        FROM leads
      `);
      if (leadStats.rows.length > 0) {
        stats.leads = leadStats.rows[0];
      }

      // Get sequence statistics
      const seqStats = await db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'paused') as paused
        FROM lead_sequences
      `);
      if (seqStats.rows.length > 0) {
        stats.sequences = seqStats.rows[0];
      }

      // Get email statistics
      const emailStats = await db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'sent') as sent,
          COUNT(*) FILTER (WHERE delivered_at IS NOT NULL) as delivered,
          COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
          COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
          COUNT(*) FILTER (WHERE bounced_at IS NOT NULL) as bounced
        FROM email_logs
      `);
      if (emailStats.rows.length > 0) {
        stats.emails = emailStats.rows[0];
      }

      // Get import statistics
      const importStats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'processing') as processing,
          COUNT(*) FILTER (WHERE status = 'error') as errors
        FROM import_batches
      `);
      if (importStats.rows.length > 0) {
        stats.imports = importStats.rows[0];
      }

      return stats;
    } catch (error) {
      logger.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Check if system is ready
   */
  async isReady() {
    try {
      // Check database
      await db.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('System not ready:', error);
      return false;
    }
  }
}

module.exports = new HealthCheck();
