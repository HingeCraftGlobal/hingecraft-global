/**
 * HubSpot List Maintenance Workflows
 * Creates ONLY list-based workflows (no email sending)
 * HubSpot is used ONLY for list maintenance
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');

class HubSpotListWorkflows {
  constructor() {
    this.apiKey = config.hubspot.personalAccessKey;
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
   * Create all list maintenance workflows
   * These workflows ONLY manage lists - no email sending
   */
  async createAllListWorkflows() {
    try {
      logger.info('📋 Creating HubSpot list maintenance workflows...');

      const workflows = [];

      // Workflow 1: New Google Drive Leads List
      workflows.push(await this.createListWorkflow(
        'List: New Google Drive Leads',
        {
          property: 'automation_source',
          operator: 'EQ',
          value: 'google_drive'
        },
        'New Google Drive Leads'
      ));

      // Workflow 2: Enriched Leads List
      workflows.push(await this.createListWorkflow(
        'List: Enriched Leads',
        {
          property: 'automation_anymail_enriched',
          operator: 'EQ',
          value: 'true'
        },
        'Enriched Leads'
      ));

      // Workflow 3: Ready to Send List
      workflows.push(await this.createListWorkflow(
        'List: Ready to Send',
        {
          property: 'send_email_ready',
          operator: 'EQ',
          value: 'true'
        },
        'Ready to Send'
      ));

      // Workflow 4: NGO Leads List
      workflows.push(await this.createListWorkflow(
        'List: NGO Leads',
        {
          property: 'automation_lead_type',
          operator: 'EQ',
          value: 'NGO'
        },
        'NGO Leads'
      ));

      // Workflow 5: School Leads List
      workflows.push(await this.createListWorkflow(
        'List: School Leads',
        {
          property: 'automation_lead_type',
          operator: 'EQ',
          value: 'School'
        },
        'School Leads'
      ));

      // Workflow 6: Student Leads List
      workflows.push(await this.createListWorkflow(
        'List: Student Leads',
        {
          property: 'automation_lead_type',
          operator: 'EQ',
          value: 'Student'
        },
        'Student Leads'
      ));

      // Workflow 7: High Score Leads List
      workflows.push(await this.createListWorkflow(
        'List: High Score Leads',
        {
          property: 'automation_lead_score',
          operator: 'GTE',
          value: '85'
        },
        'High Score Leads'
      ));

      // Workflow 8: Active Sequences List
      workflows.push(await this.createListWorkflow(
        'List: Active Sequences',
        {
          property: 'automation_sequence_status',
          operator: 'EQ',
          value: 'active'
        },
        'Active Sequences'
      ));

      // Workflow 9: Replied Leads List
      workflows.push(await this.createListWorkflow(
        'List: Replied Leads',
        {
          property: 'automation_emails_replied',
          operator: 'GT',
          value: '0'
        },
        'Replied Leads'
      ));

      // Workflow 10: Suppressed Leads List
      workflows.push(await this.createListWorkflow(
        'List: Suppressed Leads',
        {
          property: 'automation_status',
          operator: 'EQ',
          value: 'suppressed'
        },
        'Suppressed Leads'
      ));

      const successful = workflows.filter(w => w.success);
      logger.info(`✅ Created ${successful.length}/${workflows.length} list workflows`);

      return {
        total: workflows.length,
        successful: successful.length,
        workflows: successful
      };
    } catch (error) {
      logger.error('Error creating list workflows:', error);
      throw error;
    }
  }

  /**
   * Create a list maintenance workflow
   */
  async createListWorkflow(name, trigger, listName) {
    try {
      // Check if workflow exists
      const existing = await this.findWorkflowByName(name);
      
      if (existing) {
        logger.info(`Workflow ${name} already exists`);
        return { success: true, workflowId: existing.id, name, exists: true };
      }

      // Create list if doesn't exist
      const listId = await this.ensureListExists(listName);

      // Create workflow
      const workflow = {
        name: name,
        type: 'DRIP_DELAY',
        enabled: true,
        enrollmentTrigger: {
          type: 'PROPERTY_VALUE',
          propertyName: trigger.property,
          operator: trigger.operator,
          value: trigger.value
        },
        goals: [],
        actions: [
          {
            type: 'ADD_TO_LIST',
            listId: listId
          }
        ]
      };

      const response = await this.client.post(
        '/automation/v3/workflows',
        workflow
      );

      logger.info(`✅ Created workflow: ${name}`);
      return { success: true, workflowId: response.data.id, name, listId };
    } catch (error) {
      logger.error(`Error creating workflow ${name}:`, error.message);
      return { success: false, name, error: error.message };
    }
  }

  /**
   * Ensure list exists, create if not
   */
  async ensureListExists(listName) {
    try {
      // Get all lists
      const response = await this.client.get('/contacts/v1/lists', {
        params: { count: 100 }
      });

      const existing = response.data.lists?.find(l => l.name === listName);
      if (existing) {
        return existing.listId;
      }

      // Create list
      const createResponse = await this.client.post('/contacts/v1/lists', {
        name: listName,
        dynamic: false // Static list
      });

      logger.info(`✅ Created list: ${listName}`);
      return createResponse.data.listId;
    } catch (error) {
      logger.error(`Error ensuring list ${listName}:`, error.message);
      throw error;
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
}

module.exports = new HubSpotListWorkflows();
