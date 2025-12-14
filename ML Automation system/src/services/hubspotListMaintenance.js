/**
 * HubSpot List Maintenance Service
 * HubSpot is ONLY for list maintenance - all automation happens in backend
 * This service syncs database data to HubSpot for list segmentation
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');
const { hubspotRateLimiter } = require('../utils/rateLimiter');

class HubSpotListMaintenance {
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
   * Push ALL properties from database to HubSpot
   * Automates property creation
   */
  async pushAllProperties() {
    try {
      logger.info('🚀 Pushing ALL properties from database to HubSpot...');

      // Get all database columns that need properties
      const allProperties = await this.getAllDatabaseProperties();
      
      const results = {
        created: [],
        existing: [],
        failed: []
      };

      for (const prop of allProperties) {
        try {
          await this.checkRateLimit();
          
          const response = await this.client.post(
            '/crm/v3/properties/contacts',
            {
              name: prop.name,
              label: prop.label,
              type: prop.type,
              fieldType: prop.fieldType,
              description: prop.description,
              groupName: 'contactinformation'
            }
          );

          results.created.push(prop.name);
          logger.info(`✅ Created property: ${prop.name}`);
        } catch (error) {
          if (error.response?.status === 409) {
            results.existing.push(prop.name);
            logger.info(`Property exists: ${prop.name}`);
          } else {
            results.failed.push({ name: prop.name, error: error.message });
            logger.error(`Failed: ${prop.name} - ${error.message}`);
          }
        }
      }

      logger.info(`✅ Properties: ${results.created.length} created, ${results.existing.length} existing`);
      return results;
    } catch (error) {
      logger.error('Error pushing properties:', error);
      throw error;
    }
  }

  /**
   * Get all properties from database schema
   */
  async getAllDatabaseProperties() {
    const properties = [];

    // Source & Ingestion Properties
    properties.push(
      { name: 'automation_source', label: 'Automation Source', type: 'string', fieldType: 'text', description: 'Source: google_drive, manual, api' },
      { name: 'automation_source_file_id', label: 'Automation Source File ID', type: 'string', fieldType: 'text', description: 'Google Drive file ID' },
      { name: 'automation_source_row_number', label: 'Automation Source Row Number', type: 'number', fieldType: 'number', description: 'Row number in source file' },
      { name: 'automation_ingested_at', label: 'Automation Ingested At', type: 'datetime', fieldType: 'date', description: 'When lead was ingested' }
    );

    // AnyMail Properties
    properties.push(
      { name: 'anymail_source_type', label: 'AnyMail Source Type', type: 'string', fieldType: 'text', description: 'verified, guessed, not_found' },
      { name: 'automation_anymail_enriched', label: 'Automation AnyMail Enriched', type: 'bool', fieldType: 'boolcheckbox', description: 'Whether enriched by AnyMail' },
      { name: 'automation_enriched_at', label: 'Automation Enriched At', type: 'datetime', fieldType: 'date', description: 'When enrichment completed' },
      { name: 'send_email_ready', label: 'Send Email Ready', type: 'bool', fieldType: 'boolcheckbox', description: 'Ready for email sending' }
    );

    // Classification Properties
    properties.push(
      { name: 'automation_lead_type', label: 'Automation Lead Type', type: 'string', fieldType: 'text', description: 'NGO, School, Student, B2B' },
      { name: 'automation_template_set', label: 'Automation Template Set', type: 'string', fieldType: 'text', description: 'Template set assigned' },
      { name: 'automation_lead_score', label: 'Automation Lead Score', type: 'number', fieldType: 'number', description: 'Lead quality score 0-100' },
      { name: 'automation_classified_at', label: 'Automation Classified At', type: 'datetime', fieldType: 'date', description: 'When classified' },
      { name: 'automation_persona_score', label: 'Automation Persona Score', type: 'number', fieldType: 'number', description: 'Persona matching score' },
      { name: 'automation_fm_stage', label: 'Automation FM Stage', type: 'string', fieldType: 'text', description: 'Ferguson Matrix stage' },
      { name: 'automation_preferred_tone', label: 'Automation Preferred Tone', type: 'string', fieldType: 'text', description: 'Preferred tone' },
      { name: 'automation_tier', label: 'Automation Tier', type: 'number', fieldType: 'number', description: 'Lead tier 1-5' },
      { name: 'automation_has_donated', label: 'Automation Has Donated', type: 'bool', fieldType: 'boolcheckbox', description: 'Has donated' }
    );

    // Sequence Properties
    properties.push(
      { name: 'automation_sequence_id', label: 'Automation Sequence ID', type: 'string', fieldType: 'text', description: 'Sequence identifier' },
      { name: 'automation_sequence_status', label: 'Automation Sequence Status', type: 'enumeration', fieldType: 'select', description: 'active, paused, completed', options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' }
      ]},
      { name: 'automation_sequence_step', label: 'Automation Sequence Step', type: 'number', fieldType: 'number', description: 'Current step 1-5' },
      { name: 'automation_sequence_started', label: 'Automation Sequence Started', type: 'datetime', fieldType: 'date', description: 'When started' },
      { name: 'automation_next_action_due', label: 'Automation Next Action Due', type: 'datetime', fieldType: 'date', description: 'Next action due' }
    );

    // Email Engagement Properties
    properties.push(
      { name: 'automation_emails_sent', label: 'Automation Emails Sent', type: 'number', fieldType: 'number', description: 'Total sent' },
      { name: 'automation_emails_opened', label: 'Automation Emails Opened', type: 'number', fieldType: 'number', description: 'Total opened' },
      { name: 'automation_emails_clicked', label: 'Automation Emails Clicked', type: 'number', fieldType: 'number', description: 'Total clicked' },
      { name: 'automation_emails_replied', label: 'Automation Emails Replied', type: 'number', fieldType: 'number', description: 'Total replied' },
      { name: 'automation_emails_bounced', label: 'Automation Emails Bounced', type: 'number', fieldType: 'number', description: 'Total bounced' },
      { name: 'automation_last_email_sent', label: 'Automation Last Email Sent', type: 'datetime', fieldType: 'date', description: 'Last sent timestamp' },
      { name: 'automation_last_email_opened', label: 'Automation Last Email Opened', type: 'datetime', fieldType: 'date', description: 'Last opened timestamp' },
      { name: 'automation_last_email_clicked', label: 'Automation Last Email Clicked', type: 'datetime', fieldType: 'date', description: 'Last clicked timestamp' },
      { name: 'automation_last_email_replied', label: 'Automation Last Email Replied', type: 'datetime', fieldType: 'date', description: 'Last replied timestamp' }
    );

    // Segmentation Properties
    properties.push(
      { name: 'automation_segment_name', label: 'Automation Segment Name', type: 'string', fieldType: 'text', description: 'Primary segment' },
      { name: 'automation_segment_type', label: 'Automation Segment Type', type: 'string', fieldType: 'text', description: 'primary, secondary, tertiary' },
      { name: 'automation_segments', label: 'Automation Segments', type: 'string', fieldType: 'text', description: 'All segments comma-separated' }
    );

    // AI Analysis Properties
    properties.push(
      { name: 'automation_ai_analyzed', label: 'Automation AI Analyzed', type: 'bool', fieldType: 'boolcheckbox', description: 'AI analysis completed' },
      { name: 'automation_ai_confidence', label: 'Automation AI Confidence', type: 'number', fieldType: 'number', description: 'AI confidence 0-100' },
      { name: 'automation_ai_recommendations', label: 'Automation AI Recommendations', type: 'string', fieldType: 'textarea', description: 'AI recommendations JSON' }
    );

    // Status Properties
    properties.push(
      { name: 'automation_status', label: 'Automation Status', type: 'enumeration', fieldType: 'select', description: 'new, enriched, contacted, converted, suppressed', options: [
        { label: 'New', value: 'new' },
        { label: 'Enriched', value: 'enriched' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Converted', value: 'converted' },
        { label: 'Suppressed', value: 'suppressed' }
      ]},
      { name: 'automation_campaign_id', label: 'Automation Campaign ID', type: 'string', fieldType: 'text', description: 'Campaign ID' },
      { name: 'automation_campaign_name', label: 'Automation Campaign Name', type: 'string', fieldType: 'text', description: 'Campaign name' }
    );

    // Segmented Data Properties (from Google Drive sheet)
    // Get actual columns from drive_rows normalized data
    const segmentProps = await this.getSegmentedDataProperties();
    properties.push(...segmentProps);

    return properties;
  }

  /**
   * Get segmented data properties from actual database
   */
  async getSegmentedDataProperties() {
    try {
      // Get sample normalized data to determine columns
      const result = await db.query(`
        SELECT normalized 
        FROM drive_rows 
        WHERE normalized IS NOT NULL 
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        // Default segmented data properties
        return [
          { name: 'original_sheet_data_segment_1', label: 'Original Sheet Data Segment 1', type: 'string', fieldType: 'text', description: 'Segmented data field 1' },
          { name: 'original_sheet_data_segment_2', label: 'Original Sheet Data Segment 2', type: 'string', fieldType: 'text', description: 'Segmented data field 2' },
          { name: 'original_sheet_data_segment_3', label: 'Original Sheet Data Segment 3', type: 'string', fieldType: 'text', description: 'Segmented data field 3' },
          { name: 'original_sheet_data_segment_4', label: 'Original Sheet Data Segment 4', type: 'string', fieldType: 'text', description: 'Segmented data field 4' },
          { name: 'original_sheet_data_segment_5', label: 'Original Sheet Data Segment 5', type: 'string', fieldType: 'text', description: 'Segmented data field 5' }
        ];
      }

      const normalized = result.rows[0].normalized;
      const keys = Object.keys(normalized);
      
      return keys.map((key, index) => ({
        name: `original_sheet_data_${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        label: `Original Sheet Data ${key}`,
        type: 'string',
        fieldType: 'text',
        description: `Segmented data: ${key}`
      }));
    } catch (error) {
      logger.warn('Could not determine segmented properties, using defaults');
      return [
        { name: 'original_sheet_data_segment_1', label: 'Original Sheet Data Segment 1', type: 'string', fieldType: 'text', description: 'Segmented data field 1' }
      ];
    }
  }

  /**
   * Sync ALL database data to HubSpot for list maintenance
   * This is the main sync function that pushes all data
   */
  async syncAllDataForListMaintenance() {
    try {
      logger.info('🔄 Syncing ALL database data to HubSpot for list maintenance...');

      // Get all leads with complete data
      const leadsResult = await db.query(`
        SELECT 
          l.*,
          dr.source_file_id,
          dr.source_row_number,
          dr.normalized as segmented_data,
          dr.anymail_data,
          dr.anymail_status,
          ls.sequence_id,
          ls.current_step,
          ls.status as sequence_status,
          ls.started_at as sequence_started,
          ls.next_action_due,
          (SELECT array_agg(segment_name) FROM lead_segments WHERE lead_id = l.id) as segments,
          (SELECT COUNT(*) FROM email_tracking WHERE lead_id = l.id) as emails_sent,
          (SELECT COUNT(*) FROM email_tracking WHERE lead_id = l.id AND opened_at IS NOT NULL) as emails_opened,
          (SELECT COUNT(*) FROM email_tracking WHERE lead_id = l.id AND clicked_at IS NOT NULL) as emails_clicked,
          (SELECT COUNT(*) FROM email_tracking WHERE lead_id = l.id AND replied_at IS NOT NULL) as emails_replied,
          (SELECT COUNT(*) FROM email_bounces WHERE lead_id = l.id) as emails_bounced,
          (SELECT MAX(sent_at) FROM email_tracking WHERE lead_id = l.id) as last_email_sent,
          (SELECT MAX(opened_at) FROM email_tracking WHERE lead_id = l.id) as last_email_opened,
          (SELECT MAX(clicked_at) FROM email_tracking WHERE lead_id = l.id) as last_email_clicked,
          (SELECT MAX(replied_at) FROM email_tracking WHERE lead_id = l.id) as last_email_replied
        FROM leads l
        LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
        LEFT JOIN lead_sequences ls ON l.id = ls.lead_id
        ORDER BY l.created_at DESC
      `);

      const leads = leadsResult.rows;
      logger.info(`Found ${leads.length} leads to sync`);

      // Batch sync contacts
      const batchSize = 100;
      const results = {
        created: 0,
        updated: 0,
        failed: 0
      };

      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const batchResult = await this.syncBatchToHubSpot(batch);
        results.created += batchResult.created;
        results.updated += batchResult.updated;
        results.failed += batchResult.failed;
      }

      logger.info(`✅ Sync complete: ${results.created} created, ${results.updated} updated, ${results.failed} failed`);
      return results;
    } catch (error) {
      logger.error('Error syncing data:', error);
      throw error;
    }
  }

  /**
   * Sync batch of leads to HubSpot
   */
  async syncBatchToHubSpot(leads) {
    try {
      const contacts = leads.map(lead => ({
        email: lead.email,
        properties: this.buildContactProperties(lead)
      }));

      // Check existing contacts
      const emails = contacts.map(c => c.email.toLowerCase());
      const existing = await this.findContactsByEmails(emails);
      const existingMap = new Map(existing.map(c => [c.properties.email.toLowerCase(), c.id]));

      const toCreate = [];
      const toUpdate = [];

      for (const contact of contacts) {
        const email = contact.email.toLowerCase();
        if (existingMap.has(email)) {
          toUpdate.push({
            id: existingMap.get(email),
            properties: contact.properties
          });
        } else {
          toCreate.push(contact);
        }
      }

      const results = { created: 0, updated: 0, failed: 0 };

      // Batch create
      if (toCreate.length > 0) {
        try {
          await this.checkRateLimit();
          const response = await this.client.post(
            '/crm/v3/objects/contacts/batch/create',
            { inputs: toCreate }
          );
          results.created = response.data.results?.length || 0;
        } catch (error) {
          logger.error('Batch create failed:', error.message);
          results.failed += toCreate.length;
        }
      }

      // Batch update
      if (toUpdate.length > 0) {
        try {
          await this.checkRateLimit();
          await this.client.post(
            '/crm/v3/objects/contacts/batch/update',
            { inputs: toUpdate }
          );
          results.updated = toUpdate.length;
        } catch (error) {
          logger.error('Batch update failed:', error.message);
          results.failed += toUpdate.length;
        }
      }

      return results;
    } catch (error) {
      logger.error('Error syncing batch:', error);
      return { created: 0, updated: 0, failed: leads.length };
    }
  }

  /**
   * Build contact properties from lead data
   */
  buildContactProperties(lead) {
    const props = {
      email: lead.email,
      firstname: lead.first_name || '',
      lastname: lead.last_name || '',
      company: lead.organization || '',
      jobtitle: lead.title || '',
      phone: lead.phone || '',
      website: lead.website || '',
      city: lead.city || '',
      state: lead.state || '',
      country: lead.country || ''
    };

    // Source properties
    if (lead.source) props.automation_source = lead.source;
    if (lead.source_file_id) props.automation_source_file_id = lead.source_file_id;
    if (lead.source_row_number) props.automation_source_row_number = lead.source_row_number.toString();
    if (lead.created_at) props.automation_ingested_at = new Date(lead.created_at).getTime().toString();

    // AnyMail properties
    if (lead.anymail_data) {
      const anymail = typeof lead.anymail_data === 'string' ? JSON.parse(lead.anymail_data) : lead.anymail_data;
      props.anymail_source_type = anymail.verified ? 'verified' : 'guessed';
      props.automation_anymail_enriched = 'true';
      if (lead.enriched_at) props.automation_enriched_at = new Date(lead.enriched_at).getTime().toString();
    }
    props.send_email_ready = lead.email && lead.lead_type ? 'true' : 'false';

    // Classification properties
    if (lead.lead_type) props.automation_lead_type = lead.lead_type;
    if (lead.template_set) props.automation_template_set = lead.template_set;
    if (lead.lead_score) props.automation_lead_score = lead.lead_score.toString();
    if (lead.persona_score) props.automation_persona_score = lead.persona_score.toString();
    if (lead.fm_stage) props.automation_fm_stage = lead.fm_stage;
    if (lead.preferred_tone) props.automation_preferred_tone = lead.preferred_tone;
    if (lead.tier) props.automation_tier = lead.tier.toString();
    if (lead.has_donated) props.automation_has_donated = lead.has_donated.toString();
    if (lead.status) props.automation_status = lead.status;

    // Sequence properties
    if (lead.sequence_id) props.automation_sequence_id = lead.sequence_id.toString();
    if (lead.sequence_status) props.automation_sequence_status = lead.sequence_status;
    if (lead.current_step) props.automation_sequence_step = lead.current_step.toString();
    if (lead.sequence_started) props.automation_sequence_started = new Date(lead.sequence_started).getTime().toString();
    if (lead.next_action_due) props.automation_next_action_due = new Date(lead.next_action_due).getTime().toString();

    // Email engagement
    if (lead.emails_sent) props.automation_emails_sent = lead.emails_sent.toString();
    if (lead.emails_opened) props.automation_emails_opened = lead.emails_opened.toString();
    if (lead.emails_clicked) props.automation_emails_clicked = lead.emails_clicked.toString();
    if (lead.emails_replied) props.automation_emails_replied = lead.emails_replied.toString();
    if (lead.emails_bounced) props.automation_emails_bounced = lead.emails_bounced.toString();
    if (lead.last_email_sent) props.automation_last_email_sent = new Date(lead.last_email_sent).getTime().toString();
    if (lead.last_email_opened) props.automation_last_email_opened = new Date(lead.last_email_opened).getTime().toString();
    if (lead.last_email_clicked) props.automation_last_email_clicked = new Date(lead.last_email_clicked).getTime().toString();
    if (lead.last_email_replied) props.automation_last_email_replied = new Date(lead.last_email_replied).getTime().toString();

    // Segmentation
    if (lead.segments && lead.segments.length > 0) {
      props.automation_segment_name = lead.segments[0];
      props.automation_segments = lead.segments.join(', ');
    }

    // Segmented data from normalized JSON
    if (lead.segmented_data) {
      const segmented = typeof lead.segmented_data === 'string' ? JSON.parse(lead.segmented_data) : lead.segmented_data;
      Object.keys(segmented).forEach((key, index) => {
        const propName = `original_sheet_data_${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        props[propName] = segmented[key]?.toString() || '';
      });
    }

    return props;
  }

  /**
   * Find contacts by emails
   */
  async findContactsByEmails(emails) {
    try {
      await this.checkRateLimit();
      const response = await this.client.post(
        '/crm/v3/objects/contacts/batch/read',
        {
          properties: ['email'],
          inputs: emails.map(email => ({ id: email, idProperty: 'email' }))
        }
      );
      return response.data.results || [];
    } catch (error) {
      logger.warn('Batch read failed, will create new contacts');
      return [];
    }
  }

  /**
   * Get contacts from HubSpot list for email sending
   * This is called by backend to get list of contacts ready to send
   */
  async getContactsFromList(listName) {
    try {
      // Find list by name
      const lists = await this.client.get('/contacts/v1/lists', {
        params: { count: 100 }
      });

      const list = lists.data.lists?.find(l => l.name === listName);
      if (!list) {
        logger.warn(`List ${listName} not found`);
        return [];
      }

      // Get contacts from list
      const contacts = await this.client.get(`/contacts/v1/lists/${list.listId}/contacts/all`, {
        params: {
          property: [
            'email', 'firstname', 'lastname', 'company', 'jobtitle',
            'automation_lead_type', 'automation_template_set', 'automation_segment_name',
            'automation_segments', 'original_sheet_data_segment_1', 'original_sheet_data_segment_2',
            'original_sheet_data_segment_3', 'original_sheet_data_segment_4', 'original_sheet_data_segment_5'
          ]
        }
      });

      return contacts.data.contacts || [];
    } catch (error) {
      logger.error(`Error getting contacts from list ${listName}:`, error);
      return [];
    }
  }

  /**
   * Update contact after email sent
   */
  async updateContactAfterEmailSend(contactId, emailData) {
    try {
      await this.checkRateLimit();
      await this.client.patch(
        `/crm/v3/objects/contacts/${contactId}`,
        {
          properties: {
            automation_last_email_sent: new Date().getTime().toString(),
            automation_emails_sent: (parseInt(emailData.current_count || 0) + 1).toString()
          }
        }
      );
      return { success: true };
    } catch (error) {
      logger.error('Error updating contact after email send:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check rate limit
   */
  async checkRateLimit() {
    const rateLimit = hubspotRateLimiter.isAllowed('hubspot-api');
    if (!rateLimit.allowed) {
      await new Promise(resolve => setTimeout(resolve, rateLimit.waitTime * 1000));
    }
  }
}

module.exports = new HubSpotListMaintenance();
