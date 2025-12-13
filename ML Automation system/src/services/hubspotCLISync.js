/**
 * HubSpot CLI Integration Service
 * Uses HubSpot CLI commands to sync data and manage HubSpot resources
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const db = require('../utils/database');
const logger = require('../utils/logger');
const config = require('../../config/api_keys');

class HubSpotCLISync {
  constructor() {
    this.personalAccessKey = config.hubspot.personalAccessKey;
    this.portalId = config.hubspot.portalId;
    this.baseUrl = config.hubspot.baseUrl;
  }

  /**
   * Execute HubSpot CLI command
   */
  async executeCLI(command, options = {}) {
    try {
      const env = {
        ...process.env,
        HUBSPOT_PERSONAL_ACCESS_KEY: this.personalAccessKey
      };

      const result = execSync(`npx @hubspot/cli ${command}`, {
        encoding: 'utf8',
        env,
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd || process.cwd()
      });

      return { success: true, output: result };
    } catch (error) {
      logger.error(`HubSpot CLI command failed: ${command}`, error.message);
      return { success: false, error: error.message, output: error.stdout?.toString() || error.stderr?.toString() };
    }
  }

  /**
   * Initialize HubSpot CLI authentication
   */
  async initializeAuth() {
    try {
      // Set up authentication using personal access key
      const authCommand = `auth personal-access-key --personal-access-key "${this.personalAccessKey}"`;
      const result = await this.executeCLI(authCommand, { silent: true });
      
      if (result.success) {
        logger.info('HubSpot CLI authentication successful');
        return { success: true };
      } else {
        logger.warn('HubSpot CLI auth failed, will use direct API calls');
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error('Error initializing HubSpot CLI auth:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo() {
    try {
      const result = await this.executeCLI('accounts list', { silent: true });
      if (result.success) {
        return { success: true, accounts: result.output };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create custom properties via CLI
   */
  async createCustomProperties() {
    try {
      // Create automation properties for contacts
      const properties = [
        {
          name: 'automation_lead_type',
          label: 'Automation Lead Type',
          type: 'string',
          groupName: 'automation_information'
        },
        {
          name: 'automation_template_set',
          label: 'Automation Template Set',
          type: 'string',
          groupName: 'automation_information'
        },
        {
          name: 'automation_lead_score',
          label: 'Automation Lead Score',
          type: 'number',
          groupName: 'automation_information'
        },
        {
          name: 'automation_sequence_status',
          label: 'Automation Sequence Status',
          type: 'enumeration',
          options: ['active', 'paused', 'completed', 'cancelled'],
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_sent',
          label: 'Automation Emails Sent',
          type: 'number',
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_opened',
          label: 'Automation Emails Opened',
          type: 'number',
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_clicked',
          label: 'Automation Emails Clicked',
          type: 'number',
          groupName: 'automation_information'
        },
        {
          name: 'automation_emails_replied',
          label: 'Automation Emails Replied',
          type: 'number',
          groupName: 'automation_information'
        }
      ];

      const created = [];
      const failed = [];

      for (const prop of properties) {
        try {
          // Use API directly since CLI property creation is complex
          const axios = require('axios');
          const response = await axios.post(
            `${this.baseUrl}/crm/v3/properties/contacts`,
            {
              name: prop.name,
              label: prop.label,
              type: prop.type,
              fieldType: prop.type === 'enumeration' ? 'select' : 'text',
              groupName: prop.groupName,
              options: prop.options || undefined
            },
            {
              headers: {
                'Authorization': `Bearer ${this.personalAccessKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          created.push(prop.name);
          logger.info(`Created property: ${prop.name}`);
        } catch (error) {
          if (error.response?.status === 409) {
            // Property already exists
            created.push(prop.name);
            logger.info(`Property already exists: ${prop.name}`);
          } else {
            failed.push({ name: prop.name, error: error.message });
            logger.error(`Failed to create property ${prop.name}:`, error.message);
          }
        }
      }

      return { success: true, created, failed };
    } catch (error) {
      logger.error('Error creating custom properties:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync all leads to HubSpot contacts
   */
  async syncAllLeads() {
    try {
      const result = await db.query(`
        SELECT 
          l.*,
          COALESCE(
            dr.hubspot_contact_id,
            (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
          ) as hubspot_contact_id
        FROM leads l
        LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
        ORDER BY l.created_at DESC
        LIMIT 500
      `);

      const hubspot = require('./hubspot');
      const synced = [];
      const failed = [];

      for (const lead of result.rows) {
        try {
          const contactResult = await hubspot.upsertContact(lead);
          if (contactResult.success) {
            synced.push({ leadId: lead.id, contactId: contactResult.contactId });
            
            // Update with pipeline properties
            if (contactResult.contactId) {
              const hubspotDashboardSync = require('./hubspotDashboardSync');
              await hubspotDashboardSync.updateContactPipelineProperties(contactResult.contactId, lead.id);
            }
          } else {
            failed.push({ leadId: lead.id, error: contactResult.error });
          }
        } catch (error) {
          failed.push({ leadId: lead.id, error: error.message });
        }
      }

      return { success: true, synced: synced.length, failed: failed.length, details: { synced, failed } };
    } catch (error) {
      logger.error('Error syncing all leads:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Full sync - syncs everything to HubSpot
   */
  async fullSync() {
    try {
      logger.info('Starting full HubSpot sync via CLI...');

      // 1. Initialize auth
      await this.initializeAuth();

      // 2. Create custom properties
      logger.info('Creating custom properties...');
      const properties = await this.createCustomProperties();
      logger.info(`Created ${properties.created?.length || 0} properties`);

      // 3. Sync all leads
      logger.info('Syncing all leads to HubSpot...');
      const leads = await this.syncAllLeads();
      logger.info(`Synced ${leads.synced} leads`);

      // 4. Sync pipeline metrics
      const hubspotDashboardSync = require('./hubspotDashboardSync');
      await hubspotDashboardSync.syncPipelineMetrics('24 hours');

      return {
        success: true,
        properties,
        leads,
        metrics: { synced: true }
      };
    } catch (error) {
      logger.error('Error in full sync:', error);
      throw error;
    }
  }
}

module.exports = new HubSpotCLISync();
