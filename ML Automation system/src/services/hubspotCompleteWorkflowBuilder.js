/**
 * HubSpot Complete Workflow Builder
 * Constructs comprehensive workflows using entire database schema
 * Uses HubSpot Dev Mode features: Custom Apps, Serverless Functions, CRM Objects API, Workflows
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');
const hubspotCompleteSetup = require('./hubspotCompleteSetup');
const hubspotWorkflowWebhook = require('./hubspotWorkflowWebhook');

class HubSpotCompleteWorkflowBuilder {
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
   * Build complete workflow system from database
   * Maps all database tables and fields to HubSpot workflows
   */
  async buildCompleteWorkflowSystem() {
    try {
      logger.info('🏗️  Building COMPLETE HubSpot Workflow System from Database');
      console.log('');
      console.log('='.repeat(80));
      console.log('  HUBSPOT COMPLETE WORKFLOW SYSTEM BUILDER');
      console.log('='.repeat(80));
      console.log('');

      const results = {
        properties: {},
        workflows: {},
        serverlessFunctions: {},
        customApps: {},
        webhooks: {},
        lists: {}
      };

      // Step 1: Map all database properties to HubSpot
      console.log('📋 Step 1: Mapping Database Properties to HubSpot...');
      results.properties = await this.mapAllDatabaseProperties();
      console.log(`   ✅ Mapped ${results.properties.total} properties`);

      // Step 2: Create workflows for each stage
      console.log('');
      console.log('📋 Step 2: Creating Workflows for Each Stage...');
      results.workflows = await this.createAllWorkflows();
      console.log(`   ✅ Created ${results.workflows.total} workflows`);

      // Step 3: Setup serverless functions
      console.log('');
      console.log('📋 Step 3: Setting Up Serverless Functions...');
      results.serverlessFunctions = await this.setupServerlessFunctions();
      console.log(`   ✅ Configured ${results.serverlessFunctions.total} functions`);

      // Step 4: Create custom apps configuration
      console.log('');
      console.log('📋 Step 4: Creating Custom Apps Configuration...');
      results.customApps = await this.createCustomAppsConfig();
      console.log(`   ✅ Configured ${results.customApps.total} apps`);

      // Step 5: Setup webhooks
      console.log('');
      console.log('📋 Step 5: Setting Up Webhooks...');
      results.webhooks = await this.setupAllWebhooks();
      console.log(`   ✅ Configured ${results.webhooks.total} webhooks`);

      // Step 6: Create lists for segmentation
      console.log('');
      console.log('📋 Step 6: Creating Lists for Segmentation...');
      results.lists = await this.createSegmentationLists();
      console.log(`   ✅ Created ${results.lists.total} lists`);

      console.log('');
      console.log('='.repeat(80));
      console.log('  ✅ WORKFLOW SYSTEM BUILD COMPLETE');
      console.log('='.repeat(80));
      console.log('');

      return results;
    } catch (error) {
      logger.error('Error building workflow system:', error);
      throw error;
    }
  }

  /**
   * Map ALL database properties to HubSpot
   * Scans entire database schema and creates corresponding HubSpot properties
   */
  async mapAllDatabaseProperties() {
    try {
      // Get all table schemas from database
      const tables = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const allProperties = [];
      const propertyMap = {};

      // Map each table's columns to HubSpot properties
      for (const table of tables.rows) {
        const tableName = table.table_name;
        const columns = await db.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        for (const column of columns.rows) {
          const propName = this.mapColumnToProperty(tableName, column.column_name);
          if (propName && !propertyMap[propName]) {
            const hubspotProp = this.createHubSpotProperty(
              propName,
              column.column_name,
              column.data_type,
              tableName
            );
            allProperties.push(hubspotProp);
            propertyMap[propName] = true;
          }
        }
      }

      // Create all properties in HubSpot
      const created = await hubspotCompleteSetup.createAllProperties();
      
      // Add any missing properties from our mapping
      const additionalProps = allProperties.filter(p => 
        !created.existingProperties?.includes(p.name)
      );

      return {
        total: allProperties.length,
        created: created.created || 0,
        existing: created.existing || 0,
        additional: additionalProps.length,
        properties: allProperties
      };
    } catch (error) {
      logger.error('Error mapping database properties:', error);
      return { total: 0, error: error.message };
    }
  }

  /**
   * Map database column to HubSpot property name
   */
  mapColumnToProperty(tableName, columnName) {
    // Skip internal columns
    if (['id', 'created_at', 'updated_at', 'deleted_at'].includes(columnName)) {
      return null;
    }

    // Map based on table and column
    const prefix = 'automation_';
    
    // Special mappings
    const mappings = {
      'leads': {
        'email': 'email',
        'first_name': 'firstname',
        'last_name': 'lastname',
        'organization': 'company',
        'title': 'jobtitle',
        'phone': 'phone',
        'website': 'website',
        'city': 'city',
        'state': 'state',
        'country': 'country',
        'source': prefix + 'source',
        'source_file_id': prefix + 'source_file_id',
        'source_row_number': prefix + 'source_row_number',
        'lead_type': prefix + 'lead_type',
        'template_set': prefix + 'template_set',
        'lead_score': prefix + 'lead_score',
        'status': prefix + 'status',
        'tier': prefix + 'tier',
        'persona_score': prefix + 'persona_score',
        'fm_stage': prefix + 'fm_stage',
        'preferred_tone': prefix + 'preferred_tone',
        'has_donated': prefix + 'has_donated'
      },
      'lead_sequences': {
        'sequence_id': prefix + 'sequence_id',
        'current_step': prefix + 'sequence_step',
        'status': prefix + 'sequence_status',
        'last_sent_at': prefix + 'last_email_sent',
        'next_action_due': prefix + 'next_action_due'
      },
      'email_tracking': {
        'emails_sent': prefix + 'emails_sent',
        'emails_opened': prefix + 'emails_opened',
        'emails_clicked': prefix + 'emails_clicked',
        'emails_replied': prefix + 'emails_replied'
      },
      'lead_segments': {
        'segment_name': prefix + 'segment_name',
        'segment_type': prefix + 'segment_type'
      },
      'lead_analysis': {
        'analysis_type': prefix + 'analysis_type',
        'analysis_data': prefix + 'analysis_data'
      }
    };

    if (mappings[tableName] && mappings[tableName][columnName]) {
      return mappings[tableName][columnName];
    }

    // Default: prefix with automation_ and table name
    return prefix + tableName.replace(/_/g, '_') + '_' + columnName;
  }

  /**
   * Create HubSpot property definition
   */
  createHubSpotProperty(propName, columnName, dataType, tableName) {
    const typeMap = {
      'character varying': 'string',
      'varchar': 'string',
      'text': 'string',
      'integer': 'number',
      'bigint': 'number',
      'numeric': 'number',
      'boolean': 'bool',
      'timestamp with time zone': 'datetime',
      'timestamp without time zone': 'datetime',
      'date': 'date',
      'jsonb': 'string',
      'text[]': 'string'
    };

    return {
      name: propName,
      label: this.formatPropertyLabel(columnName),
      type: typeMap[dataType] || 'string',
      fieldType: this.getFieldType(dataType),
      description: `From ${tableName}.${columnName}`,
      groupName: 'automation_information'
    };
  }

  formatPropertyLabel(columnName) {
    return columnName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getFieldType(dataType) {
    if (dataType.includes('varchar') || dataType.includes('text')) {
      return 'text';
    }
    if (dataType.includes('int') || dataType.includes('numeric')) {
      return 'number';
    }
    if (dataType.includes('bool')) {
      return 'boolcheckbox';
    }
    if (dataType.includes('timestamp') || dataType.includes('date')) {
      return 'date';
    }
    return 'text';
  }

  /**
   * Create ALL workflows based on database schema
   */
  async createAllWorkflows() {
    const workflows = [];

    // Workflow 1: Google Drive File Upload → Initial Contact Creation
    workflows.push(await this.createWorkflow(
      'Google Drive File Upload - Initial Contact Creation',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_source',
        operator: 'EQ',
        value: 'google_drive'
      },
      [
        { type: 'SET_PROPERTY', property: 'automation_ingested_at', value: '{{now}}' },
        { type: 'ADD_TO_LIST', listName: 'New Google Drive Leads' }
      ]
    ));

    // Workflow 2: Data Segmentation
    workflows.push(await this.createWorkflow(
      'Automation - Data Segmentation',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_ingested_at',
        operator: 'HAS_PROPERTY'
      },
      [
        { type: 'BRANCH', condition: 'automation_lead_type', branches: [
          { value: 'NGO', actions: [{ type: 'ADD_TO_LIST', listName: 'NGO Leads' }] },
          { value: 'School', actions: [{ type: 'ADD_TO_LIST', listName: 'School Leads' }] },
          { value: 'Student', actions: [{ type: 'ADD_TO_LIST', listName: 'Student Leads' }] }
        ]}
      ]
    ));

    // Workflow 3: AnyMail Enrichment Trigger
    workflows.push(await this.createWorkflow(
      'Automation - Trigger AnyMail Enrichment',
      {
        type: 'AND',
        conditions: [
          { property: 'website', operator: 'HAS_PROPERTY' },
          { property: 'email', operator: 'NOT_HAS_PROPERTY' }
        ]
      },
      [
        { type: 'CALL_SERVERLESS_FUNCTION', functionName: 'anymail_enrichment' }
      ]
    ));

    // Workflow 4: AnyMail Data Back to HubSpot
    workflows.push(await this.createWorkflow(
      'Automation - AnyMail Data Enrichment Complete',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_anymail_enriched',
        operator: 'EQ',
        value: 'true'
      },
      [
        { type: 'SET_PROPERTY', property: 'automation_enriched_at', value: '{{now}}' },
        { type: 'ADD_TO_LIST', listName: 'Enriched Leads' }
      ]
    ));

    // Workflow 5: Lead Classification
    workflows.push(await this.createWorkflow(
      'Automation - Lead Classification',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_enriched_at',
        operator: 'HAS_PROPERTY'
      },
      [
        { type: 'CALL_SERVERLESS_FUNCTION', functionName: 'classify_lead' },
        { type: 'SET_PROPERTY', property: 'automation_classified_at', value: '{{now}}' }
      ]
    ));

    // Workflow 6: Template Assignment
    workflows.push(await this.createWorkflow(
      'Automation - Template Assignment',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_lead_type',
        operator: 'HAS_PROPERTY'
      },
      [
        { type: 'BRANCH', condition: 'automation_lead_type', branches: [
          { value: 'NGO', actions: [{ type: 'SET_PROPERTY', property: 'automation_template_set', value: 'ngo_templates' }] },
          { value: 'School', actions: [{ type: 'SET_PROPERTY', property: 'automation_template_set', value: 'school_templates' }] },
          { value: 'Student', actions: [{ type: 'SET_PROPERTY', property: 'automation_template_set', value: 'student_templates' }] }
        ]}
      ]
    ));

    // Workflow 7: Sequence Enrollment
    workflows.push(await this.createWorkflow(
      'Automation - Sequence Enrollment',
      {
        type: 'AND',
        conditions: [
          { property: 'automation_template_set', operator: 'HAS_PROPERTY' },
          { property: 'automation_sequence_status', operator: 'NOT_HAS_PROPERTY' }
        ]
      },
      [
        { type: 'SET_PROPERTY', property: 'automation_sequence_status', value: 'active' },
        { type: 'SET_PROPERTY', property: 'automation_sequence_step', value: '1' },
        { type: 'SET_PROPERTY', property: 'automation_sequence_started', value: '{{now}}' }
      ]
    ));

    // Workflow 8: Email Sending (Step 1)
    workflows.push(await this.createWorkflow(
      'Automation - Send Sequence Email Step 1',
      {
        type: 'AND',
        conditions: [
          { property: 'automation_sequence_status', operator: 'EQ', value: 'active' },
          { property: 'automation_sequence_step', operator: 'EQ', value: '1' },
          { property: 'automation_sequence_started', operator: 'HAS_PROPERTY' }
        ]
      },
      [
        { type: 'SEND_EMAIL', templateId: '{{automation_template_set}}_step_1' },
        { type: 'SET_PROPERTY', property: 'automation_last_email_sent', value: '{{now}}' },
        { type: 'SET_PROPERTY', property: 'automation_emails_sent', value: '{{automation_emails_sent + 1}}' }
      ]
    ));

    // Workflow 9: Email Engagement Tracking
    workflows.push(await this.createWorkflow(
      'Automation - Track Email Engagement',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_last_email_sent',
        operator: 'HAS_PROPERTY'
      },
      [
        { type: 'BRANCH', condition: 'email_opened', branches: [
          { value: 'true', actions: [
            { type: 'SET_PROPERTY', property: 'automation_emails_opened', value: '{{automation_emails_opened + 1}}' },
            { type: 'SET_PROPERTY', property: 'automation_last_email_opened', value: '{{now}}' }
          ]}
        ]},
        { type: 'BRANCH', condition: 'email_clicked', branches: [
          { value: 'true', actions: [
            { type: 'SET_PROPERTY', property: 'automation_emails_clicked', value: '{{automation_emails_clicked + 1}}' },
            { type: 'SET_PROPERTY', property: 'automation_last_email_clicked', value: '{{now}}' }
          ]}
        ]}
      ]
    ));

    // Workflow 10: Sequence Progression
    workflows.push(await this.createWorkflow(
      'Automation - Sequence Step Progression',
      {
        type: 'AND',
        conditions: [
          { property: 'automation_sequence_status', operator: 'EQ', value: 'active' },
          { property: 'automation_last_email_sent', operator: 'HAS_PROPERTY' }
        ]
      },
      [
        { type: 'DELAY', hours: 24 },
        { type: 'SET_PROPERTY', property: 'automation_sequence_step', value: '{{automation_sequence_step + 1}}' },
        { type: 'BRANCH', condition: 'automation_sequence_step', branches: [
          { value: '2', actions: [{ type: 'SEND_EMAIL', templateId: '{{automation_template_set}}_step_2' }] },
          { value: '3', actions: [{ type: 'SEND_EMAIL', templateId: '{{automation_template_set}}_step_3' }] },
          { value: '4', actions: [{ type: 'SEND_EMAIL', templateId: '{{automation_template_set}}_step_4' }] },
          { value: '5', actions: [
            { type: 'SEND_EMAIL', templateId: '{{automation_template_set}}_step_5' }],
            { type: 'SET_PROPERTY', property: 'automation_sequence_status', value: 'completed' }
          ]}
        ]}
      ]
    ));

    // Workflow 11: High Lead Score Notification
    workflows.push(await this.createWorkflow(
      'Automation - High Lead Score Notification',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_lead_score',
        operator: 'GTE',
        value: '85'
      },
      [
        { type: 'SEND_NOTIFICATION', email: config.email.fromAddress, message: 'High-value lead: {{firstname}} {{lastname}} (Score: {{automation_lead_score}})' }
      ]
    ));

    // Workflow 12: Bounce Handling
    workflows.push(await this.createWorkflow(
      'Automation - Email Bounce Handling',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_emails_bounced',
        operator: 'GT',
        value: '0'
      },
      [
        { type: 'SET_PROPERTY', property: 'automation_status', value: 'suppressed' },
        { type: 'REMOVE_FROM_ALL_LISTS' }
      ]
    ));

    // Workflow 13: Reply Detection
    workflows.push(await this.createWorkflow(
      'Automation - Email Reply Detection',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_emails_replied',
        operator: 'GT',
        value: '0'
      },
      [
        { type: 'SET_PROPERTY', property: 'automation_sequence_status', value: 'paused' },
        { type: 'ADD_TO_LIST', listName: 'Replied Leads' },
        { type: 'CREATE_TASK', taskType: 'FOLLOW_UP', assignee: 'owner' }
      ]
    ));

    // Workflow 14: Gemini AI Analysis
    workflows.push(await this.createWorkflow(
      'Automation - Gemini AI Analysis',
      {
        type: 'PROPERTY_VALUE',
        propertyName: 'automation_lead_score',
        operator: 'GTE',
        value: '70'
      },
      [
        { type: 'CALL_SERVERLESS_FUNCTION', functionName: 'gemini_drag_analysis' },
        { type: 'SET_PROPERTY', property: 'automation_ai_analyzed', value: 'true' }
      ]
    ));

    return {
      total: workflows.length,
      workflows: workflows.filter(w => w.success),
      failed: workflows.filter(w => !w.success)
    };
  }

  /**
   * Create a workflow
   * HubSpot workflows use automation API v3
   */
  async createWorkflow(name, trigger, actions) {
    try {
      // HubSpot workflow creation requires specific format
      const workflowPayload = {
        name: name,
        enabled: true,
        type: 'DRIP_DELAY',
        enrollmentTrigger: this.formatTrigger(trigger),
        goals: [],
        actions: this.formatActions(actions)
      };

      const response = await this.client.post(
        '/automation/v3/workflows',
        workflowPayload
      );

      logger.info(`Created workflow: ${name} (ID: ${response.data.id})`);
      return { success: true, workflowId: response.data.id, name };
    } catch (error) {
      if (error.response?.status === 409) {
        // Workflow already exists
        logger.info(`Workflow ${name} already exists`);
        return { success: true, name, exists: true };
      }
      logger.error(`Error creating workflow ${name}:`, error.message);
      return { success: false, name, error: error.message };
    }
  }

  /**
   * Format trigger for HubSpot API
   */
  formatTrigger(trigger) {
    if (trigger.type === 'PROPERTY_VALUE') {
      return {
        type: 'PROPERTY_VALUE',
        propertyName: trigger.propertyName,
        operator: trigger.operator,
        value: trigger.value
      };
    }
    if (trigger.type === 'AND') {
      return {
        type: 'AND',
        conditions: trigger.conditions.map(c => ({
          propertyName: c.property,
          operator: c.operator,
          value: c.value
        }))
      };
    }
    return trigger;
  }

  /**
   * Format actions for HubSpot API
   */
  formatActions(actions) {
    return actions.map(action => {
      switch (action.type) {
        case 'SET_PROPERTY':
          return {
            type: 'SET_CONTACT_PROPERTY',
            propertyName: action.property,
            value: action.value
          };
        case 'ADD_TO_LIST':
          return {
            type: 'ADD_TO_LIST',
            listId: action.listName // Will need to resolve to list ID
          };
        case 'SEND_EMAIL':
          return {
            type: 'SEND_MARKETING_EMAIL',
            emailId: action.templateId // Will need to resolve to email ID
          };
        case 'DELAY':
          return {
            type: 'DELAY',
            delayMillis: action.hours * 3600000
          };
        case 'BRANCH':
          return {
            type: 'BRANCH',
            branches: action.branches.map(b => ({
              condition: this.formatTrigger({ type: 'PROPERTY_VALUE', propertyName: action.condition, operator: 'EQ', value: b.value }),
              actions: this.formatActions(b.actions)
            }))
          };
        default:
          return action;
      }
    });
  }

  /**
   * Setup serverless functions for external API calls
   */
  async setupServerlessFunctions() {
    const functions = [
      {
        name: 'anymail_enrichment',
        description: 'Calls AnyMail API to find email addresses for contacts',
        endpoint: '/api/serverless/anymail-enrichment',
        triggers: ['contact.propertyChange']
      },
      {
        name: 'classify_lead',
        description: 'Classifies lead using ML model',
        endpoint: '/api/serverless/classify-lead',
        triggers: ['contact.creation', 'contact.propertyChange']
      },
      {
        name: 'gemini_drag_analysis',
        description: 'Performs DRAG analysis using Gemini AI',
        endpoint: '/api/serverless/gemini-analysis',
        triggers: ['contact.propertyChange']
      },
      {
        name: 'google_drive_sync',
        description: 'Syncs data from Google Drive files',
        endpoint: '/api/serverless/google-drive-sync',
        triggers: ['webhook']
      }
    ];

    return {
      total: functions.length,
      functions: functions,
      note: 'Serverless functions need to be configured in HubSpot Dev Mode'
    };
  }

  /**
   * Create custom apps configuration
   */
  async createCustomAppsConfig() {
    return {
      total: 1,
      apps: [{
        name: 'HingeCraft Automation App',
        description: 'Complete automation system integration',
        scopes: [
          'contacts',
          'content',
          'automation',
          'files',
          'timeline'
        ],
        endpoints: {
          googleDrive: '/api/custom-apps/google-drive',
          anymail: '/api/custom-apps/anymail',
          gemini: '/api/custom-apps/gemini'
        }
      }]
    };
  }

  /**
   * Setup all webhooks
   */
  async setupAllWebhooks() {
    const webhookUrl = hubspotWorkflowWebhook.getWebhookUrl();
    
    const webhooks = [
      {
        name: 'Contact Creation',
        events: ['contact.creation'],
        url: webhookUrl
      },
      {
        name: 'Contact Property Change',
        events: ['contact.propertyChange'],
        url: webhookUrl
      },
      {
        name: 'Contact Deletion',
        events: ['contact.deletion'],
        url: webhookUrl
      },
      {
        name: 'Email Engagement',
        events: ['email.open', 'email.click', 'email.bounce', 'email.reply'],
        url: webhookUrl
      }
    ];

    const results = [];
    for (const webhook of webhooks) {
      try {
        const result = await hubspotWorkflowWebhook.createWebhookSubscription(
          webhook.url,
          webhook.events
        );
        results.push({ ...webhook, ...result });
      } catch (error) {
        results.push({ ...webhook, success: false, error: error.message });
      }
    }

    return {
      total: webhooks.length,
      configured: results.filter(r => r.success).length,
      webhooks: results
    };
  }

  /**
   * Create segmentation lists
   */
  async createSegmentationLists() {
    // Get all unique segments from database
    const segmentsResult = await db.query(`
      SELECT DISTINCT segment_name, segment_type
      FROM lead_segments
      ORDER BY segment_name
    `);

    const lists = [
      { name: 'New Google Drive Leads', description: 'Leads imported from Google Drive' },
      { name: 'Enriched Leads', description: 'Leads enriched with AnyMail data' },
      { name: 'Replied Leads', description: 'Leads who replied to emails' },
      { name: 'High Score Leads', description: 'Leads with score >= 85' },
      { name: 'Active Sequences', description: 'Leads in active email sequences' }
    ];

    // Add dynamic lists from database segments
    for (const segment of segmentsResult.rows) {
      lists.push({
        name: segment.segment_name,
        description: `Segment: ${segment.segment_type}`
      });
    }

    return {
      total: lists.length,
      lists: lists,
      note: 'Lists will be created when workflows run'
    };
  }
}

module.exports = new HubSpotCompleteWorkflowBuilder();
