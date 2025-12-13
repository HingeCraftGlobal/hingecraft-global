/**
 * HubSpot Dashboard Sync Service
 * Syncs pipeline metrics, custom objects, and database data to HubSpot
 * Creates custom objects, updates properties, and builds dashboards
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');
const { retry } = require('../utils/retry');
const { hubspotRateLimiter } = require('../utils/rateLimiter');
const pipelineTracker = require('./pipelineTracker');

class HubSpotDashboardSync {
  constructor() {
    // Use Personal Access Key if available, otherwise fall back to API key
    this.apiKey = config.hubspot.personalAccessKey || config.hubspot.apiKey;
    this.portalId = config.hubspot.portalId;
    this.baseUrl = config.hubspot.baseUrl;
    
    // HubSpot API authentication - Personal Access Key uses Bearer token
    const authHeader = `Bearer ${this.apiKey}`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    this.customObjectType = 'pipeline_run';
    this.metricsObjectType = 'pipeline_metrics';
  }
  
  /**
   * Test HubSpot API connection
   */
  async testConnection() {
    try {
      await this.checkRateLimit();
      const response = await this.client.get('/crm/v3/objects/contacts?limit=1');
      return { success: true, status: response.status };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('HubSpot API authentication failed. Please verify your API key is valid and has the required scopes.');
      }
      throw error;
    }
  }

  /**
   * Check rate limit before API call
   */
  async checkRateLimit() {
    const rateLimit = hubspotRateLimiter.isAllowed('hubspot-api');
    if (!rateLimit.allowed) {
      logger.warn(`HubSpot rate limit reached, waiting ${rateLimit.waitTime}s`);
      await new Promise(resolve => setTimeout(resolve, rateLimit.waitTime * 1000));
    }
  }

  /**
   * Create custom object schema in HubSpot
   */
  async createCustomObjectSchema(objectType, properties) {
    try {
      await this.checkRateLimit();

      // Test connection first
      try {
        await this.testConnection();
      } catch (error) {
        logger.error('HubSpot API connection test failed:', error.message);
        throw new Error(`Cannot connect to HubSpot API: ${error.message}. Please verify your API key at ${config.hubspot.developerOverviewUrl}`);
      }

      // Create object type
      await this.client.post('/crm/v3/schemas', {
        name: objectType,
        labels: {
          singular: this.formatLabel(objectType),
          plural: this.formatLabel(objectType) + 's'
        },
        primaryDisplayProperty: 'name'
      });

      // Add properties
      for (const prop of properties) {
        await this.client.post(`/crm/v3/schemas/${objectType}`, {
          name: prop.name,
          label: prop.label,
          type: prop.type,
          fieldType: prop.fieldType || 'text',
          description: prop.description
        });
      }

      logger.info(`Created custom object schema: ${objectType}`);
      return { success: true };
    } catch (error) {
      if (error.response?.status === 409) {
        logger.info(`Custom object schema ${objectType} already exists`);
        return { success: true, exists: true };
      }
      logger.error(`Error creating custom object schema: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize custom objects
   */
  async initializeCustomObjects() {
    try {
      // Pipeline Run object
      await this.createCustomObjectSchema('pipeline_run', [
        { name: 'name', label: 'Pipeline Run Name', type: 'string', fieldType: 'text' },
        { name: 'status', label: 'Status', type: 'string', fieldType: 'text' },
        { name: 'file_name', label: 'File Name', type: 'string', fieldType: 'text' },
        { name: 'total_rows', label: 'Total Rows', type: 'number', fieldType: 'number' },
        { name: 'processed_rows', label: 'Processed Rows', type: 'number', fieldType: 'number' },
        { name: 'leads_created', label: 'Leads Created', type: 'number', fieldType: 'number' },
        { name: 'emails_sent', label: 'Emails Sent', type: 'number', fieldType: 'number' },
        { name: 'started_at', label: 'Started At', type: 'datetime', fieldType: 'date' },
        { name: 'completed_at', label: 'Completed At', type: 'datetime', fieldType: 'date' },
        { name: 'error_message', label: 'Error Message', type: 'string', fieldType: 'text' }
      ]);

      // Pipeline Metrics object
      await this.createCustomObjectSchema('pipeline_metrics', [
        { name: 'name', label: 'Metrics Name', type: 'string', fieldType: 'text' },
        { name: 'timeframe', label: 'Timeframe', type: 'string', fieldType: 'text' },
        { name: 'pipeline_total', label: 'Pipeline Total', type: 'number', fieldType: 'number' },
        { name: 'pipeline_completed', label: 'Pipeline Completed', type: 'number', fieldType: 'number' },
        { name: 'pipeline_failed', label: 'Pipeline Failed', type: 'number', fieldType: 'number' },
        { name: 'leads_total', label: 'Leads Total', type: 'number', fieldType: 'number' },
        { name: 'leads_classified', label: 'Leads Classified', type: 'number', fieldType: 'number' },
        { name: 'emails_total', label: 'Emails Total', type: 'number', fieldType: 'number' },
        { name: 'emails_sent', label: 'Emails Sent', type: 'number', fieldType: 'number' },
        { name: 'emails_opened', label: 'Emails Opened', type: 'number', fieldType: 'number' },
        { name: 'emails_bounced', label: 'Emails Bounced', type: 'number', fieldType: 'number' },
        { name: 'sequences_total', label: 'Sequences Total', type: 'number', fieldType: 'number' },
        { name: 'sequences_active', label: 'Sequences Active', type: 'number', fieldType: 'number' },
        { name: 'recorded_at', label: 'Recorded At', type: 'datetime', fieldType: 'date' }
      ]);

      logger.info('Custom objects initialized');
      return { success: true };
    } catch (error) {
      logger.error('Error initializing custom objects:', error);
      throw error;
    }
  }

  /**
   * Sync pipeline run to HubSpot
   */
  async syncPipelineRun(ingestId) {
    try {
      await this.checkRateLimit();

      // Get ingest data
      const ingestResult = await db.query(
        'SELECT * FROM drive_ingests WHERE id = $1',
        [ingestId]
      );

      if (ingestResult.rows.length === 0) {
        throw new Error(`Ingest ${ingestId} not found`);
      }

      const ingest = ingestResult.rows[0];

      // Get related data
      const [rowsResult, leadsResult, emailsResult] = await Promise.all([
        db.query('SELECT COUNT(*) as count FROM drive_rows WHERE ingest_id = $1', [ingestId]),
        db.query('SELECT COUNT(*) as count FROM leads WHERE source_file_id = $1', [ingestId]),
        db.query('SELECT COUNT(*) as count FROM email_logs el JOIN leads l ON el.lead_id = l.id WHERE l.source_file_id = $1', [ingestId])
      ]);

      const totalRows = parseInt(rowsResult.rows[0].count) || 0;
      const leadsCreated = parseInt(leadsResult.rows[0].count) || 0;
      const emailsSent = parseInt(emailsResult.rows[0].count) || 0;

      // Create/update custom object
      const objectData = {
        properties: {
          name: `Pipeline Run: ${ingest.filename || ingestId}`,
          status: ingest.status,
          file_name: ingest.filename || 'Unknown',
          total_rows: totalRows,
          processed_rows: ingest.processed_rows || 0,
          leads_created: leadsCreated,
          emails_sent: emailsSent,
          started_at: ingest.inserted_at ? new Date(ingest.inserted_at).getTime() : Date.now(),
          completed_at: ingest.status === 'completed' ? Date.now() : null,
          error_message: ingest.error_message || null
        }
      };

      // Check if object exists
      const searchResult = await this.client.post('/crm/v3/objects/pipeline_run/search', {
        filterGroups: [{
          filters: [{
            propertyName: 'name',
            operator: 'EQ',
            value: objectData.properties.name
          }]
        }],
        limit: 1
      });

      let result;
      if (searchResult.data.results && searchResult.data.results.length > 0) {
        // Update existing
        const objectId = searchResult.data.results[0].id;
        result = await this.client.patch(
          `/crm/v3/objects/pipeline_run/${objectId}`,
          objectData
        );
      } else {
        // Create new
        result = await this.client.post(
          '/crm/v3/objects/pipeline_run',
          objectData
        );
      }

      logger.info(`Synced pipeline run ${ingestId} to HubSpot`);
      return { success: true, objectId: result.data.id };
    } catch (error) {
      logger.error(`Error syncing pipeline run: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync pipeline metrics to HubSpot
   */
  async syncPipelineMetrics(timeframe = '24 hours') {
    try {
      await this.checkRateLimit();

      // Get metrics from pipeline tracker
      const metrics = await pipelineTracker.getMetrics(timeframe);
      const status = await pipelineTracker.getStatus();

      // Create metrics object
      const objectData = {
        properties: {
          name: `Pipeline Metrics: ${timeframe}`,
          timeframe: timeframe,
          pipeline_total: metrics.pipeline.total,
          pipeline_completed: metrics.pipeline.completed,
          pipeline_failed: metrics.pipeline.failed,
          leads_total: metrics.leads.total,
          leads_classified: metrics.leads.classified,
          emails_total: metrics.emails.total,
          emails_sent: metrics.emails.sent,
          emails_opened: metrics.emails.opened,
          emails_bounced: metrics.emails.bounced,
          sequences_total: metrics.sequences.total,
          sequences_active: metrics.sequences.active,
          recorded_at: Date.now()
        }
      };

      // Create new metrics record
      const result = await this.client.post(
        '/crm/v3/objects/pipeline_metrics',
        objectData
      );

      logger.info(`Synced pipeline metrics to HubSpot`);
      return { success: true, objectId: result.data.id };
    } catch (error) {
      logger.error(`Error syncing pipeline metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update contact properties with pipeline data
   */
  async updateContactPipelineProperties(contactId, leadId) {
    try {
      await this.checkRateLimit();

      // Get lead data
      const leadResult = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
      if (leadResult.rows.length === 0) return;

      const lead = leadResult.rows[0];

      // Get sequence data
      const sequenceResult = await db.query(
        'SELECT * FROM lead_sequences WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 1',
        [leadId]
      );

      // Get email stats
      const emailStatsResult = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'opened') as opened,
          COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
          COUNT(*) FILTER (WHERE status = 'replied') as replied
        FROM email_logs WHERE lead_id = $1`,
        [leadId]
      );

      const emailStats = emailStatsResult.rows[0];

      // Build properties
      const properties = {
        // Pipeline properties
        automation_lead_type: lead.lead_type || '',
        automation_template_set: lead.template_set || '',
        automation_lead_score: lead.lead_score || 0,
        automation_classified_at: lead.lead_type ? new Date(lead.updated_at || lead.created_at).getTime() : null,
        
        // Sequence properties
        automation_sequence_status: sequenceResult.rows[0]?.status || '',
        automation_sequence_step: sequenceResult.rows[0]?.current_step || 0,
        automation_sequence_started: sequenceResult.rows[0]?.created_at ? new Date(sequenceResult.rows[0].created_at).getTime() : null,
        
        // Email engagement properties
        automation_emails_sent: parseInt(emailStats.total) || 0,
        automation_emails_opened: parseInt(emailStats.opened) || 0,
        automation_emails_clicked: parseInt(emailStats.clicked) || 0,
        automation_emails_replied: parseInt(emailStats.replied) || 0,
        automation_last_email_sent: null, // Will be updated when email is sent
        automation_last_email_opened: null, // Will be updated when email is opened
        automation_last_email_clicked: null, // Will be updated when email is clicked
        automation_last_email_replied: null, // Will be updated when email is replied
        
        // Source properties
        automation_source: lead.source || '',
        automation_source_file: lead.source_file_id || '',
        automation_ingested_at: lead.created_at ? new Date(lead.created_at).getTime() : null
      };

      // Update contact
      await this.client.patch(
        `/crm/v3/objects/contacts/${contactId}`,
        { properties }
      );

      logger.info(`Updated contact ${contactId} with pipeline properties`);
      return { success: true };
    } catch (error) {
      logger.error(`Error updating contact properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync all pipeline runs to HubSpot
   */
  async syncAllPipelineRuns(limit = 100) {
    try {
      const result = await db.query(
        'SELECT id FROM drive_ingests ORDER BY inserted_at DESC LIMIT $1',
        [limit]
      );

      const synced = [];
      const failed = [];

      for (const row of result.rows) {
        try {
          await this.syncPipelineRun(row.id);
          synced.push(row.id);
        } catch (error) {
          failed.push({ id: row.id, error: error.message });
        }
      }

      return { success: true, synced: synced.length, failed: failed.length, errors: failed };
    } catch (error) {
      logger.error(`Error syncing all pipeline runs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync all contacts with pipeline data
   */
  async syncAllContactsPipelineData(limit = 100) {
    try {
      // Get leads with HubSpot contact IDs (check multiple possible locations)
      const result = await db.query(`
        SELECT DISTINCT
          l.id as lead_id,
          COALESCE(
            dr.hubspot_contact_id,
            (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
          ) as hubspot_contact_id
        FROM leads l
        LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
        WHERE COALESCE(
          dr.hubspot_contact_id,
          (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
        ) IS NOT NULL
        ORDER BY l.created_at DESC
        LIMIT $1
      `, [limit]);

      const synced = [];
      const failed = [];

      for (const row of result.rows) {
        try {
          await this.updateContactPipelineProperties(row.hubspot_contact_id, row.lead_id);
          synced.push(row.hubspot_contact_id);
        } catch (error) {
          failed.push({ contactId: row.hubspot_contact_id, error: error.message });
        }
      }

      return { success: true, synced: synced.length, failed: failed.length, errors: failed };
    } catch (error) {
      logger.error(`Error syncing all contacts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create timeline event for pipeline activity
   */
  async createPipelineTimelineEvent(contactId, eventType, data) {
    try {
      await this.checkRateLimit();

      await this.client.post('/crm/v3/objects/engagements', {
        engagement: {
          type: 'NOTE',
          timestamp: Date.now()
        },
        associations: [{
          to: { id: contactId },
          type: 'HUBSPOT_DEFINED',
          category: 'HUBSPOT_DEFINED'
        }],
        metadata: {
          body: `Pipeline Event: ${eventType}`,
          ...data
        }
      });

      logger.info(`Created pipeline timeline event for contact ${contactId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error creating timeline event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Full sync - syncs all data to HubSpot
   */
  async fullSync() {
    try {
      logger.info('Starting full HubSpot sync...');

      // 1. Initialize custom objects
      await this.initializeCustomObjects();

      // 2. Sync all pipeline runs
      const pipelineRuns = await this.syncAllPipelineRuns(100);
      logger.info(`Synced ${pipelineRuns.synced} pipeline runs`);

      // 3. Sync current metrics
      await this.syncPipelineMetrics('24 hours');
      logger.info('Synced pipeline metrics');

      // 4. Sync all contacts with pipeline data
      const contacts = await this.syncAllContactsPipelineData(100);
      logger.info(`Synced ${contacts.synced} contacts with pipeline data`);

      return {
        success: true,
        pipelineRuns,
        contacts,
        metrics: { synced: true }
      };
    } catch (error) {
      logger.error(`Error in full sync: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format label from object type
   */
  formatLabel(str) {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

module.exports = new HubSpotDashboardSync();
