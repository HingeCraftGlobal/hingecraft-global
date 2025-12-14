/**
 * HubSpot Workflow and Webhook Service
 * Manages HubSpot workflows and receives webhooks from HubSpot
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');
const hubspotEnhanced = require('./hubspotEnhanced');

class HubSpotWorkflowWebhook {
  constructor() {
    this.apiKey = config.hubspot.personalAccessKey;
    this.portalId = config.hubspot.portalId;
    this.client = axios.create({
      baseURL: config.hubspot.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Create or update HubSpot workflow
   */
  async createWorkflow(name, triggers, actions) {
    try {
      // Check if workflow exists
      const existing = await this.findWorkflowByName(name);
      
      if (existing) {
        logger.info(`Workflow ${name} already exists, updating...`);
        // Update existing workflow
        const response = await this.client.put(
          `/automation/v3/workflows/${existing.id}`,
          {
            name,
            enabled: true,
            triggers,
            actions
          }
        );
        return { success: true, workflowId: existing.id, action: 'updated' };
      } else {
        // Create new workflow
        const response = await this.client.post(
          '/automation/v3/workflows',
          {
            name,
            enabled: true,
            triggers,
            actions
          }
        );
        return { success: true, workflowId: response.data.id, action: 'created' };
      }
    } catch (error) {
      logger.error(`Error creating workflow ${name}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find workflow by name
   */
  async findWorkflowByName(name) {
    try {
      const response = await this.client.get('/automation/v3/workflows', {
        params: { limit: 100 }
      });

      const workflows = response.data.workflows || [];
      return workflows.find(w => w.name === name);
    } catch (error) {
      logger.error('Error finding workflow:', error.message);
      return null;
    }
  }

  /**
   * Create webhook subscription in HubSpot
   * This registers our endpoint to receive HubSpot webhooks
   */
  async createWebhookSubscription(webhookUrl, events) {
    try {
      // HubSpot webhook subscriptions
      const subscription = {
        eventType: events, // e.g., 'contact.creation', 'contact.propertyChange'
        propertyName: null, // For property change events
        active: true
      };

      // Create subscription via HubSpot API
      const response = await this.client.post(
        '/webhooks/v3/subscriptions',
        {
          ...subscription,
          webhookUrl: webhookUrl
        }
      );

      logger.info(`Webhook subscription created: ${response.data.id}`);
      return { success: true, subscriptionId: response.data.id };
    } catch (error) {
      logger.error('Error creating webhook subscription:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle incoming HubSpot webhook
   * This is called when HubSpot sends us a webhook
   */
  async handleWebhook(webhookData, signature) {
    try {
      logger.info('Received HubSpot webhook');

      const { eventType, objectId, properties, subscriptionId } = webhookData;

      // Handle different event types
      switch (eventType) {
        case 'contact.creation':
          await this.handleContactCreation(objectId, properties);
          break;
        case 'contact.propertyChange':
          await this.handleContactPropertyChange(objectId, properties);
          break;
        case 'contact.deletion':
          await this.handleContactDeletion(objectId);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${eventType}`);
      }

      return { success: true, eventType, objectId };
    } catch (error) {
      logger.error('Error handling HubSpot webhook:', error);
      throw error;
    }
  }

  /**
   * Handle contact creation webhook
   */
  async handleContactCreation(contactId, properties) {
    try {
      logger.info(`Contact created in HubSpot: ${contactId}`);

      // Check if we have this contact in our database
      const email = properties?.email;
      if (!email) return;

      const leadResult = await db.query(
        'SELECT * FROM leads WHERE email = $1',
        [email.toLowerCase()]
      );

      if (leadResult.rows.length > 0) {
        // Update hubspot_sync table
        await db.query(
          `INSERT INTO hubspot_sync (lead_id, hubspot_contact_id, sync_status, last_sync_at)
           VALUES ($1, $2, 'synced', NOW())
           ON CONFLICT (lead_id) DO UPDATE
           SET hubspot_contact_id = $2, sync_status = 'synced', last_sync_at = NOW()`,
          [leadResult.rows[0].id, contactId]
        );
      }
    } catch (error) {
      logger.error('Error handling contact creation:', error);
    }
  }

  /**
   * Handle contact property change webhook
   */
  async handleContactPropertyChange(contactId, properties) {
    try {
      logger.info(`Contact property changed in HubSpot: ${contactId}`);

      // Sync property changes back to database if needed
      // This ensures two-way sync
      const email = properties?.email;
      if (!email) return;

      const leadResult = await db.query(
        'SELECT * FROM leads WHERE email = $1',
        [email.toLowerCase()]
      );

      if (leadResult.rows.length > 0) {
        // Update lead with HubSpot property changes
        // Only sync certain properties back
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (properties.firstname) {
          updates.push(`first_name = $${paramIndex++}`);
          values.push(properties.firstname);
        }
        if (properties.lastname) {
          updates.push(`last_name = $${paramIndex++}`);
          values.push(properties.lastname);
        }
        if (properties.company) {
          updates.push(`organization = $${paramIndex++}`);
          values.push(properties.company);
        }

        if (updates.length > 0) {
          values.push(leadResult.rows[0].id);
          await db.query(
            `UPDATE leads SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
            values
          );
        }
      }
    } catch (error) {
      logger.error('Error handling property change:', error);
    }
  }

  /**
   * Handle contact deletion webhook
   */
  async handleContactDeletion(contactId) {
    try {
      logger.info(`Contact deleted in HubSpot: ${contactId}`);

      // Update sync status
      await db.query(
        `UPDATE hubspot_sync 
         SET sync_status = 'deleted', last_sync_at = NOW()
         WHERE hubspot_contact_id = $1`,
        [contactId]
      );
    } catch (error) {
      logger.error('Error handling contact deletion:', error);
    }
  }

  /**
   * Get webhook URL for this system
   */
  getWebhookUrl() {
    const baseUrl = process.env.WEBHOOK_BASE_URL || config.app.baseUrl || 'http://localhost:3001';
    return `${baseUrl}/api/webhooks/hubspot`;
  }

  /**
   * Setup default workflows
   */
  async setupDefaultWorkflows() {
    try {
      logger.info('Setting up default HubSpot workflows...');

      const workflows = [
        {
          name: 'Auto-Segment New Contacts',
          triggers: [{
            type: 'CONTACT_CREATION'
          }],
          actions: [{
            type: 'ADD_TO_LIST',
            listId: 'automation_new_contacts'
          }]
        },
        {
          name: 'Notify on High Lead Score',
          triggers: [{
            type: 'PROPERTY_VALUE',
            propertyName: 'automation_lead_score',
            operator: 'GTE',
            value: '85'
          }],
          actions: [{
            type: 'SEND_NOTIFICATION',
            email: config.email.fromAddress
          }]
        }
      ];

      const results = [];
      for (const workflow of workflows) {
        const result = await this.createWorkflow(
          workflow.name,
          workflow.triggers,
          workflow.actions
        );
        results.push(result);
      }

      return { success: true, workflows: results };
    } catch (error) {
      logger.error('Error setting up workflows:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new HubSpotWorkflowWebhook();
