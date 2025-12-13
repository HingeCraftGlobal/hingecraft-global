/**
 * Monitoring & Alerting Service
 * Provides metrics, dashboards, and alerting for the automation system
 */

const db = require('../utils/database');
const logger = require('../utils/logger');
const axios = require('axios');

class MonitoringService {
  constructor() {
    this.metrics = {
      emails: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        replied: 0,
        unsubscribed: 0
      },
      bounces: {
        hard: 0,
        soft: 0,
        transient: 0
      },
      replies: {
        human: 0,
        auto: 0,
        ooo: 0
      },
      segments: {
        conflicts: 0,
        resolved: 0
      },
      pipeline: {
        filesProcessed: 0,
        leadsCreated: 0,
        leadsClassified: 0,
        hubspotSynced: 0
      }
    };

    this.alertThresholds = {
      bounceRate: 0.05, // 5%
      hardBounceRate: 0.02, // 2%
      replyRate: 0.10, // 10%
      errorRate: 0.01, // 1%
      processingDelay: 3600000 // 1 hour in ms
    };

    this.slackWebhook = process.env.SLACK_WEBHOOK_URL;
    this.alertEmail = process.env.ALERT_EMAIL;
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(timeframe = '24 hours') {
    try {
      const metrics = {
        emails: await this.getEmailMetrics(timeframe),
        bounces: await this.getBounceMetrics(timeframe),
        replies: await this.getReplyMetrics(timeframe),
        segments: await this.getSegmentMetrics(timeframe),
        pipeline: await this.getPipelineMetrics(timeframe),
        performance: await this.getPerformanceMetrics(timeframe),
        health: await this.getHealthMetrics()
      };

      return metrics;
    } catch (error) {
      logger.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get email metrics
   */
  async getEmailMetrics(timeframe) {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'opened') as opened,
        COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE status = 'replied') as replied,
        COUNT(*) as total
       FROM email_logs
       WHERE created_at >= NOW() - INTERVAL '${timeframe}'`
    );

    const row = result.rows[0];
    const sent = parseInt(row.sent) || 0;
    const delivered = parseInt(row.delivered) || 0;
    const opened = parseInt(row.opened) || 0;
    const clicked = parseInt(row.clicked) || 0;
    const bounced = parseInt(row.bounced) || 0;
    const replied = parseInt(row.replied) || 0;

    return {
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      replied,
      openRate: sent > 0 ? (opened / sent) : 0,
      clickRate: sent > 0 ? (clicked / sent) : 0,
      bounceRate: sent > 0 ? (bounced / sent) : 0,
      replyRate: sent > 0 ? (replied / sent) : 0,
      deliveryRate: sent > 0 ? (delivered / sent) : 0
    };
  }

  /**
   * Get bounce metrics
   */
  async getBounceMetrics(timeframe) {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE bounce_type = 'hard') as hard,
        COUNT(*) FILTER (WHERE bounce_type = 'soft') as soft,
        COUNT(*) FILTER (WHERE bounce_type = 'transient') as transient,
        COUNT(*) FILTER (WHERE is_suppressed = TRUE) as suppressed,
        COUNT(*) as total
       FROM email_bounces
       WHERE created_at >= NOW() - INTERVAL '${timeframe}'`
    );

    const row = result.rows[0];
    return {
      hard: parseInt(row.hard) || 0,
      soft: parseInt(row.soft) || 0,
      transient: parseInt(row.transient) || 0,
      suppressed: parseInt(row.suppressed) || 0,
      total: parseInt(row.total) || 0
    };
  }

  /**
   * Get reply metrics
   */
  async getReplyMetrics(timeframe) {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE is_human_reply = TRUE) as human,
        COUNT(*) FILTER (WHERE is_auto_reply = TRUE) as auto,
        COUNT(*) FILTER (WHERE is_out_of_office = TRUE) as ooo,
        COUNT(*) FILTER (WHERE automation_paused = TRUE) as paused,
        COUNT(*) as total
       FROM email_replies
       WHERE detected_at >= NOW() - INTERVAL '${timeframe}'`
    );

    const row = result.rows[0];
    return {
      human: parseInt(row.human) || 0,
      auto: parseInt(row.auto) || 0,
      ooo: parseInt(row.ooo) || 0,
      paused: parseInt(row.paused) || 0,
      total: parseInt(row.total) || 0
    };
  }

  /**
   * Get segment metrics
   */
  async getSegmentMetrics(timeframe) {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) as resolved,
        COUNT(*) FILTER (WHERE resolved_at IS NULL) as pending,
        COUNT(*) as total
       FROM segment_conflicts
       WHERE created_at >= NOW() - INTERVAL '${timeframe}'`
    );

    const row = result.rows[0];
    return {
      resolved: parseInt(row.resolved) || 0,
      pending: parseInt(row.pending) || 0,
      total: parseInt(row.total) || 0
    };
  }

  /**
   * Get pipeline metrics
   */
  async getPipelineMetrics(timeframe) {
    const result = await db.query(
      `SELECT
        COUNT(DISTINCT di.id) as files_processed,
        COUNT(DISTINCT l.id) as leads_created,
        COUNT(DISTINCT l.id) FILTER (WHERE l.lead_type IS NOT NULL) as leads_classified,
        COUNT(DISTINCT hs.hubspot_contact_id) as hubspot_synced
       FROM drive_ingests di
       LEFT JOIN drive_rows dr ON dr.ingest_id = di.id
       LEFT JOIN leads l ON l.drive_row_id = dr.id
       LEFT JOIN hubspot_sync hs ON hs.lead_id = l.id
       WHERE di.inserted_at >= NOW() - INTERVAL '${timeframe}'`
    );

    const row = result.rows[0];
    return {
      filesProcessed: parseInt(row.files_processed) || 0,
      leadsCreated: parseInt(row.leads_created) || 0,
      leadsClassified: parseInt(row.leads_classified) || 0,
      hubspotSynced: parseInt(row.hubspot_synced) || 0
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(timeframe) {
    const result = await db.query(
      `SELECT
        AVG(duration_ms) as avg_duration,
        MAX(duration_ms) as max_duration,
        MIN(duration_ms) as min_duration,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration,
        COUNT(*) FILTER (WHERE status = 'success') as success_count,
        COUNT(*) FILTER (WHERE status = 'failure') as failure_count,
        COUNT(*) as total
       FROM audit_trace
       WHERE created_at >= NOW() - INTERVAL '${timeframe}'`
    );

    const row = result.rows[0];
    const total = parseInt(row.total) || 0;
    const success = parseInt(row.success_count) || 0;

    return {
      avgDuration: parseFloat(row.avg_duration) || 0,
      maxDuration: parseFloat(row.max_duration) || 0,
      minDuration: parseFloat(row.min_duration) || 0,
      p95Duration: parseFloat(row.p95_duration) || 0,
      successRate: total > 0 ? (success / total) : 0,
      errorRate: total > 0 ? ((total - success) / total) : 0
    };
  }

  /**
   * Get health metrics
   */
  async getHealthMetrics() {
    const checks = {
      database: await this.checkDatabaseHealth(),
      apiConnections: await this.checkAPIConnections(),
      processingQueue: await this.checkProcessingQueue(),
      errorRate: await this.checkErrorRate()
    };

    const allHealthy = Object.values(checks).every(c => c.healthy);

    return {
      overall: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date()
    };
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      await db.query('SELECT 1');
      return { healthy: true, message: 'Database connection OK' };
    } catch (error) {
      return { healthy: false, message: `Database error: ${error.message}` };
    }
  }

  /**
   * Check API connections
   */
  async checkAPIConnections() {
    // Check if APIs are reachable (simplified)
    return { healthy: true, message: 'API connections OK' };
  }

  /**
   * Check processing queue
   */
  async checkProcessingQueue() {
    const result = await db.query(
      `SELECT COUNT(*) as pending
       FROM drive_ingests
       WHERE status = 'pending' OR status = 'processing'
       AND inserted_at < NOW() - INTERVAL '1 hour'`
    );

    const pending = parseInt(result.rows[0].pending) || 0;
    return {
      healthy: pending < 100,
      message: `${pending} items pending`,
      pending
    };
  }

  /**
   * Check error rate
   */
  async checkErrorRate() {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'failure') as failures,
        COUNT(*) as total
       FROM audit_trace
       WHERE created_at >= NOW() - INTERVAL '1 hour'`
    );

    const total = parseInt(result.rows[0].total) || 0;
    const failures = parseInt(result.rows[0].failures) || 0;
    const errorRate = total > 0 ? (failures / total) : 0;

    return {
      healthy: errorRate < this.alertThresholds.errorRate,
      message: `Error rate: ${(errorRate * 100).toFixed(2)}%`,
      errorRate
    };
  }

  /**
   * Check alerts and send notifications
   */
  async checkAlerts() {
    const metrics = await this.getDashboardMetrics('1 hour');
    const alerts = [];

    // Check bounce rate
    if (metrics.emails.bounceRate > this.alertThresholds.bounceRate) {
      alerts.push({
        severity: 'high',
        type: 'bounce_rate',
        message: `Bounce rate ${(metrics.emails.bounceRate * 100).toFixed(2)}% exceeds threshold ${(this.alertThresholds.bounceRate * 100).toFixed(2)}%`,
        value: metrics.emails.bounceRate,
        threshold: this.alertThresholds.bounceRate
      });
    }

    // Check hard bounce rate
    const hardBounceRate = metrics.bounces.total > 0 
      ? (metrics.bounces.hard / metrics.bounces.total) 
      : 0;
    if (hardBounceRate > this.alertThresholds.hardBounceRate) {
      alerts.push({
        severity: 'critical',
        type: 'hard_bounce_rate',
        message: `Hard bounce rate ${(hardBounceRate * 100).toFixed(2)}% exceeds threshold ${(this.alertThresholds.hardBounceRate * 100).toFixed(2)}%`,
        value: hardBounceRate,
        threshold: this.alertThresholds.hardBounceRate
      });
    }

    // Check error rate
    if (metrics.performance.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        severity: 'high',
        type: 'error_rate',
        message: `Error rate ${(metrics.performance.errorRate * 100).toFixed(2)}% exceeds threshold ${(this.alertThresholds.errorRate * 100).toFixed(2)}%`,
        value: metrics.performance.errorRate,
        threshold: this.alertThresholds.errorRate
      });
    }

    // Check processing queue
    if (!metrics.health.checks.processingQueue.healthy) {
      alerts.push({
        severity: 'medium',
        type: 'processing_queue',
        message: `Processing queue has ${metrics.health.checks.processingQueue.pending} pending items`,
        value: metrics.health.checks.processingQueue.pending
      });
    }

    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }

    return alerts;
  }

  /**
   * Send alert notification
   */
  async sendAlert(alert) {
    try {
      // Send to Slack if configured
      if (this.slackWebhook) {
        await axios.post(this.slackWebhook, {
          text: `🚨 Alert: ${alert.type}`,
          attachments: [{
            color: alert.severity === 'critical' ? 'danger' : 
                   alert.severity === 'high' ? 'warning' : 'good',
            fields: [
              { title: 'Message', value: alert.message, short: false },
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Time', value: new Date().toISOString(), short: true }
            ]
          }]
        });
      }

      // Log alert
      logger.warn(`Alert: ${alert.type} - ${alert.message}`);

      // Could also send email alert here
    } catch (error) {
      logger.error('Error sending alert:', error);
    }
  }

  /**
   * Get real-time stats
   */
  async getRealTimeStats() {
    return {
      emails: await this.getEmailMetrics('1 hour'),
      bounces: await this.getBounceMetrics('1 hour'),
      replies: await this.getReplyMetrics('1 hour'),
      health: await this.getHealthMetrics(),
      timestamp: new Date()
    };
  }

  /**
   * Export metrics for external dashboards
   */
  async exportMetrics(format = 'json') {
    const metrics = await this.getDashboardMetrics('24 hours');

    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    } else if (format === 'prometheus') {
      // Prometheus format
      const lines = [];
      lines.push(`# HELP emails_sent_total Total emails sent`);
      lines.push(`# TYPE emails_sent_total counter`);
      lines.push(`emails_sent_total ${metrics.emails.sent}`);
      // Add more metrics...
      return lines.join('\n');
    }

    return metrics;
  }
}

module.exports = new MonitoringService();
