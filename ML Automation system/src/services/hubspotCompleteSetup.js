/**
 * HubSpot Complete Setup Service
 * Creates all properties, syncs all data, and sets up complete CRM integration
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');
const { hubspotRateLimiter } = require('../utils/rateLimiter');

class HubSpotCompleteSetup {
  constructor() {
    this.apiKey = config.hubspot.personalAccessKey || config.hubspot.apiKey;
    this.portalId = config.hubspot.portalId;
    this.baseUrl = config.hubspot.baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    this.apiCallCount = 0;
  }

  /**
   * Check rate limit
   */
  async checkRateLimit() {
    const rateLimit = hubspotRateLimiter.isAllowed('hubspot-api');
    if (!rateLimit.allowed) {
      await new Promise(resolve => setTimeout(resolve, rateLimit.waitTime * 1000));
    }
    this.apiCallCount++;
  }

  /**
   * Create property group first (if needed)
   */
  async createPropertyGroup() {
    try {
      await this.checkRateLimit();
      await this.client.post('/crm/v3/properties/groups/contacts', {
        name: 'automation_information',
        label: 'Automation Information',
        displayOrder: 100
      });
      logger.info('Created property group: automation_information');
      return { success: true };
    } catch (error) {
      if (error.response?.status === 409) {
        logger.info('Property group already exists');
        return { success: true, exists: true };
      }
      // If group creation fails, we'll use default group
      logger.warn('Could not create property group, will use default');
      return { success: false };
    }
  }

  /**
   * Create all required custom properties in HubSpot
   */
  async createAllProperties() {
    try {
      logger.info('Creating all HubSpot custom properties...');

      // Try to create property group first
      await this.createPropertyGroup();

      const properties = [
        // Lead Classification Properties
        {
          name: 'automation_lead_type',
          label: 'Automation Lead Type',
          type: 'string',
          fieldType: 'text',
          description: 'Lead classification type (NGO, School, Student, etc.)',
          groupName: 'automation_information'
        },
        {
          name: 'automation_template_set',
          label: 'Automation Template Set',
          type: 'string',
          fieldType: 'text',
          description: 'Email template set assigned to this lead',
          groupName: 'automation_information'
        },
        {
          name: 'automation_lead_score',
          label: 'Automation Lead Score',
          type: 'number',
          fieldType: 'number',
          description: 'Lead quality score (0-100)',
          groupName: 'automation_information'
        },
        {
          name: 'automation_classified_at',
          label: 'Automation Classified At',
          type: 'datetime',
          fieldType: 'date',
          description: 'When the lead was classified',
          groupName: 'automation_information'
        },

        // Sequence Properties
        {
          name: 'automation_sequence_status',
          label: 'Automation Sequence Status',
          type: 'enumeration',
          fieldType: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Paused', value: 'paused' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' }
          ],
          description: 'Current status of the email sequence',
          groupName: 'automation_information'
        },
        {
          name: 'automation_sequence_step',
          label: 'Automation Sequence Step',
          type: 'number',
          fieldType: 'number',
          description: 'Current step in the email sequence',
          groupName: 'automation_information'
        },
        {
          name: 'automation_sequence_started',
          label: 'Automation Sequence Started',
          type: 'datetime',
          fieldType: 'date',
          description: 'When the sequence started',
          groupName: 'automation_information'
        },

        // Email Engagement Properties
        {
          name: 'automation_emails_sent',
          label: 'Automation Emails Sent',
          type: 'number',
          fieldType: 'number',
          description: 'Total number of emails sent to this contact',
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_opened',
          label: 'Automation Emails Opened',
          type: 'number',
          fieldType: 'number',
          description: 'Total number of emails opened',
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_clicked',
          label: 'Automation Emails Clicked',
          type: 'number',
          fieldType: 'number',
          description: 'Total number of emails clicked',
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_replied',
          label: 'Automation Emails Replied',
          type: 'number',
          fieldType: 'number',
          description: 'Total number of emails replied to',
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_bounced',
          label: 'Automation Emails Bounced',
          type: 'number',
          fieldType: 'number',
          description: 'Total number of emails bounced',
          groupName: 'automation_information'
        },
        {
          name: 'automation_last_email_sent',
          label: 'Automation Last Email Sent',
          type: 'datetime',
          fieldType: 'date',
          description: 'Timestamp of last email sent',
          groupName: 'automation_information'
        },
        {
          name: 'automation_last_email_opened',
          label: 'Automation Last Email Opened',
          type: 'datetime',
          fieldType: 'date',
          description: 'Timestamp of last email opened',
          groupName: 'automation_information'
        },
        {
          name: 'automation_last_email_clicked',
          label: 'Automation Last Email Clicked',
          type: 'datetime',
          fieldType: 'date',
          description: 'Timestamp of last email clicked',
          groupName: 'automation_information'
        },
        {
          name: 'automation_last_email_replied',
          label: 'Automation Last Email Replied',
          type: 'datetime',
          fieldType: 'date',
          description: 'Timestamp of last email replied',
          groupName: 'automation_information'
        },

        // Source Properties
        {
          name: 'automation_source',
          label: 'Automation Source',
          type: 'string',
          fieldType: 'text',
          description: 'Source of the lead (google_drive, manual, etc.)',
          groupName: 'automation_information'
        },
        {
          name: 'automation_source_file',
          label: 'Automation Source File',
          type: 'string',
          fieldType: 'text',
          description: 'File ID where lead was imported from',
          groupName: 'automation_information'
        },
        {
          name: 'automation_ingested_at',
          label: 'Automation Ingested At',
          type: 'datetime',
          fieldType: 'date',
          description: 'When the lead was first ingested into the system',
          groupName: 'automation_information'
        },

        // Campaign Properties
        {
          name: 'automation_campaign_id',
          label: 'Automation Campaign ID',
          type: 'string',
          fieldType: 'text',
          description: 'Campaign ID this lead is assigned to',
          groupName: 'automation_information'
        },
        {
          name: 'automation_campaign_name',
          label: 'Automation Campaign Name',
          type: 'string',
          fieldType: 'text',
          description: 'Name of the campaign',
          groupName: 'automation_information'
        }
      ];

      const created = [];
      const existing = [];
      const failed = [];

      for (const prop of properties) {
        try {
          await this.checkRateLimit();

          // Create property - HubSpot requires groupName, use 'contactinformation' as default
          const payload = {
            name: prop.name,
            label: prop.label,
            type: prop.type,
            fieldType: prop.fieldType,
            description: prop.description,
            groupName: 'contactinformation' // Use default HubSpot group
          };

          if (prop.options) {
            payload.options = prop.options;
          }

          await this.client.post(
            '/crm/v3/properties/contacts',
            payload
          );

          created.push(prop.name);
          logger.info(`Created property: ${prop.name}`);
        } catch (error) {
          if (error.response?.status === 409) {
            // Property already exists
            existing.push(prop.name);
            logger.info(`Property already exists: ${prop.name}`);
          } else {
            failed.push({ name: prop.name, error: error.message });
            logger.error(`Failed to create property ${prop.name}:`, error.message);
          }
        }
      }

      return {
        success: true,
        created: created.length,
        existing: existing.length,
        failed: failed.length,
        details: { created, existing, failed }
      };
    } catch (error) {
      logger.error('Error creating properties:', error);
      throw error;
    }
  }

  /**
   * Sync ALL data from database to HubSpot
   */
  async syncAllDatabaseData() {
    try {
      logger.info('Syncing ALL database data to HubSpot...');

      // Get all leads with complete data
      const leadsResult = await db.query(`
        SELECT 
          l.*,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id) as email_count,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'opened') as emails_opened,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'clicked') as emails_clicked,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'replied') as emails_replied,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'bounced') as emails_bounced,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id) as last_email_sent,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id AND status = 'opened') as last_email_opened,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id AND status = 'clicked') as last_email_clicked,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id AND status = 'replied') as last_email_replied,
          (SELECT status FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_status,
          (SELECT current_step FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_step,
          (SELECT created_at FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_started,
          (SELECT sequence_id FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_id
        FROM leads l
        ORDER BY l.created_at DESC
      `);

      const leads = leadsResult.rows;
      logger.info(`Found ${leads.length} leads to sync`);

      // Use optimized batch sync
      const hubspotOptimizedSync = require('./hubspotOptimizedSync');
      const syncResult = await hubspotOptimizedSync.syncAllLeadsOptimized();

      // Update all contacts with complete automation data
      const updateResult = await this.updateAllContactsWithCompleteData();

      return {
        success: true,
        leads: {
          total: leads.length,
          synced: syncResult.created + syncResult.updated,
          failed: syncResult.failed
        },
        contacts: updateResult,
        apiCallsUsed: this.apiCallCount
      };
    } catch (error) {
      logger.error('Error syncing all database data:', error);
      throw error;
    }
  }

  /**
   * Update all contacts with complete automation data
   */
  async updateAllContactsWithCompleteData() {
    try {
      // Get all leads with HubSpot contact IDs and complete data
      const result = await db.query(`
        SELECT 
          l.id as lead_id,
          l.email,
          COALESCE(
            dr.hubspot_contact_id,
            (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
          ) as hubspot_contact_id,
          l.lead_type,
          l.template_set,
          l.lead_score,
          l.source,
          l.created_at,
          (SELECT status FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_status,
          (SELECT current_step FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_step,
          (SELECT created_at FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_started,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id) as emails_sent,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'opened') as emails_opened,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'clicked') as emails_clicked,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'replied') as emails_replied,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'bounced') as emails_bounced,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id) as last_email_sent,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id AND status = 'opened') as last_email_opened,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id AND status = 'clicked') as last_email_clicked,
          (SELECT MAX(created_at) FROM email_logs WHERE lead_id = l.id AND status = 'replied') as last_email_replied,
          (SELECT sequence_id FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_id
        FROM leads l
        LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
        WHERE COALESCE(
          dr.hubspot_contact_id,
          (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
        ) IS NOT NULL
      `);

      const updates = result.rows
        .filter(row => row.hubspot_contact_id)
        .map(row => ({
          contactId: row.hubspot_contact_id,
          properties: {
            automation_lead_type: row.lead_type || '',
            automation_template_set: row.template_set || '',
            automation_lead_score: row.lead_score?.toString() || '0',
            automation_classified_at: row.lead_type ? (new Date(row.created_at).getTime()) : null,
            automation_sequence_status: row.sequence_status || '',
            automation_sequence_step: row.sequence_step?.toString() || '0',
            automation_sequence_started: row.sequence_started ? (new Date(row.sequence_started).getTime()) : null,
            automation_emails_sent: row.emails_sent?.toString() || '0',
            automation_emails_opened: row.emails_opened?.toString() || '0',
            automation_emails_clicked: row.emails_clicked?.toString() || '0',
            automation_emails_replied: row.emails_replied?.toString() || '0',
            automation_emails_bounced: row.emails_bounced?.toString() || '0',
            automation_last_email_sent: row.last_email_sent ? (new Date(row.last_email_sent).getTime()) : null,
            automation_last_email_opened: row.last_email_opened ? (new Date(row.last_email_opened).getTime()) : null,
            automation_last_email_clicked: row.last_email_clicked ? (new Date(row.last_email_clicked).getTime()) : null,
            automation_last_email_replied: row.last_email_replied ? (new Date(row.last_email_replied).getTime()) : null,
            automation_source: row.source || '',
            automation_source_file: row.source_file_id || '',
            automation_ingested_at: row.created_at ? (new Date(row.created_at).getTime()) : null,
            automation_sequence_id: row.sequence_id || ''
          }
        }));

      // Batch update (1 call per 100 contacts)
      const hubspotOptimizedSync = require('./hubspotOptimizedSync');
      const updateResult = await hubspotOptimizedSync.batchUpdateContactProperties(updates);

      return {
        success: true,
        updated: updateResult.updated,
        failed: updateResult.failed
      };
    } catch (error) {
      logger.error('Error updating contacts with complete data:', error);
      throw error;
    }
  }

  /**
   * Complete setup - creates properties and syncs all data
   */
  async completeSetup() {
    try {
      logger.info('🚀 Starting COMPLETE HubSpot Setup...');
      this.apiCallCount = 0;

      // Step 1: Create all properties
      logger.info('📋 Step 1: Creating all custom properties...');
      const propertiesResult = await this.createAllProperties();
      logger.info(`✅ Properties: ${propertiesResult.created} created, ${propertiesResult.existing} existing`);

      // Step 2: Sync all leads
      logger.info('');
      logger.info('📋 Step 2: Syncing all leads to HubSpot...');
      const syncResult = await this.syncAllDatabaseData();
      logger.info(`✅ Leads: ${syncResult.leads.synced}/${syncResult.leads.total} synced`);

      // Step 3: Update all contacts with complete data
      logger.info('');
      logger.info('📋 Step 3: Updating all contacts with complete automation data...');
      const updateResult = await this.updateAllContactsWithCompleteData();
      logger.info(`✅ Contacts: ${updateResult.updated} updated`);

      return {
        success: true,
        properties: propertiesResult,
        leads: syncResult.leads,
        contacts: updateResult,
        apiCallsUsed: this.apiCallCount,
        apiCallUsage: ((this.apiCallCount / 250000) * 100).toFixed(3) + '%'
      };
    } catch (error) {
      logger.error('Error in complete setup:', error);
      throw error;
    }
  }
}

module.exports = new HubSpotCompleteSetup();
