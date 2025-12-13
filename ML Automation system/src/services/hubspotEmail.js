/**
 * HubSpot Email Sending Service
 * Sends emails via HubSpot transactional/developer API using templates
 */

const fetch = require('node-fetch');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');

class HubSpotEmail {
  constructor() {
    this.apiKey = config.hubspot.apiKey;
    this.baseUrl = config.hubspot.baseUrl || 'https://api.hubapi.com';
  }

  /**
   * Send email via HubSpot using template
   * @param {Object} params - {to, templateId, substitutions, leadId, templateSet, stepNumber}
   */
  async sendTemplateEmail({ to, templateId, substitutions = {}, leadId, templateSet, stepNumber }) {
    try {
      // Use HubSpot Marketing Email API or Transactional API
      // Adjust endpoint based on your HubSpot plan
      const endpoint = `${this.baseUrl}/marketing/v3/transactional/singleEmail/send?hapikey=${this.apiKey}`;

      const body = {
        emailId: templateId,
        message: {
          to: to,
          from: config.email.fromAddress,
          replyTo: config.email.replyTo
        },
        contactProperties: substitutions,
        customProperties: {
          lead_id: leadId,
          template_set: templateSet,
          step_number: stepNumber
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${result.message || response.statusText}`);
      }

      // Log email send
      await this.logEmailSend({
        leadId,
        hubspotMessageId: result.id || result.messageId,
        templateId,
        templateSet,
        stepNumber,
        toEmail: to,
        status: 'sent',
        response: result
      });

      logger.info(`HubSpot email sent: ${to} (template: ${templateId})`);

      return {
        success: true,
        messageId: result.id || result.messageId,
        provider: 'hubspot',
        status: 'sent'
      };
    } catch (error) {
      logger.error(`Error sending HubSpot email to ${to}:`, error);

      // Log failed send
      await this.logEmailSend({
        leadId,
        templateId,
        templateSet,
        stepNumber,
        toEmail: to,
        status: 'failed',
        response: { error: error.message }
      });

      return {
        success: false,
        error: error.message,
        provider: 'hubspot'
      };
    }
  }

  /**
   * Log email send to database
   */
  async logEmailSend({ leadId, hubspotMessageId, templateId, templateSet, stepNumber, toEmail, status, response }) {
    try {
      await db.query(
        `INSERT INTO hubspot_email_log (
          lead_id, hubspot_message_id, template_id, template_set, step_number,
          to_email, status, sent_at, response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
        [
          leadId,
          hubspotMessageId,
          templateId,
          templateSet,
          stepNumber,
          toEmail,
          status,
          JSON.stringify(response)
        ]
      );
    } catch (error) {
      logger.error('Error logging HubSpot email:', error);
    }
  }

  /**
   * Get template ID for lead type and step
   */
  async getTemplateIdForLead(leadType, templateSet, stepNumber) {
    try {
      // Query sequence_steps to get template_id
      const result = await db.query(
        `SELECT ss.template_id, ss.subject_template, ss.body_template
         FROM sequences s
         JOIN sequence_steps ss ON s.id = ss.sequence_id
         WHERE s.sequence_type = $1 AND ss.step_number = $2 AND s.is_active = true
         LIMIT 1`,
        [templateSet, stepNumber]
      );

      if (result.rows.length > 0) {
        return {
          template_id: result.rows[0].template_id,
          subject: result.rows[0].subject_template,
          body: result.rows[0].body_template
        };
      }

      return null;
    } catch (error) {
      logger.error('Error getting template ID:', error);
      return null;
    }
  }

  /**
   * Send email for lead sequence step
   */
  async sendSequenceStepEmail(leadId, sequenceId, stepNumber) {
    try {
      // Get lead data
      const leadResult = await db.query(
        'SELECT * FROM leads WHERE id = $1',
        [leadId]
      );

      if (leadResult.rows.length === 0) {
        throw new Error(`Lead ${leadId} not found`);
      }

      const lead = leadResult.rows[0];

      // Get sequence
      const seqResult = await db.query(
        'SELECT * FROM sequences WHERE id = $1',
        [sequenceId]
      );

      if (seqResult.rows.length === 0) {
        throw new Error(`Sequence ${sequenceId} not found`);
      }

      const sequence = seqResult.rows[0];

      // Get step template
      const stepResult = await db.query(
        'SELECT * FROM sequence_steps WHERE sequence_id = $1 AND step_number = $2',
        [sequenceId, stepNumber]
      );

      if (stepResult.rows.length === 0) {
        throw new Error(`Step ${stepNumber} not found for sequence ${sequenceId}`);
      }

      const step = stepResult.rows[0];

      // Personalize template
      const subject = this.personalizeTemplate(step.subject_template, lead);
      const body = this.personalizeTemplate(step.body_template, lead);

      // Prepare substitutions for HubSpot
      const substitutions = {
        firstName: lead.first_name || '',
        lastName: lead.last_name || '',
        email: lead.email || '',
        company: lead.organization || '',
        title: lead.title || '',
        city: lead.city || '',
        country: lead.country || '',
        mission_support_url: `${process.env.MISSION_SUPPORT_URL || 'https://hingecraft.com/mission-support'}?lead_id=${leadId}`,
        student_page_url: `${process.env.STUDENT_PAGE_URL || 'https://hingecraft.com/student'}?lead_id=${leadId}`,
        build_log_url: `${process.env.BUILD_LOG_URL || 'https://hingecraft.com/build-log'}`,
        submit_creation_url: `${process.env.SUBMIT_CREATION_URL || 'https://hingecraft.com/submit'}?lead_id=${leadId}`,
        school_unique_link: `${process.env.SCHOOL_LINK_URL || 'https://hingecraft.com/join'}?school=${lead.organization}&lead_id=${leadId}`,
        unsubscribe_url: `${process.env.UNSUBSCRIBE_URL || 'https://hingecraft.com/unsubscribe'}?email=${encodeURIComponent(lead.email)}`,
        preferences_url: `${process.env.PREFERENCES_URL || 'https://hingecraft.com/preferences'}?email=${encodeURIComponent(lead.email)}`
      };

      // Send via HubSpot
      return await this.sendTemplateEmail({
        to: lead.email,
        templateId: step.template_id,
        substitutions,
        leadId: lead.id,
        templateSet: sequence.sequence_type,
        stepNumber: step.step_number
      });
    } catch (error) {
      logger.error(`Error sending sequence step email:`, error);
      throw error;
    }
  }

  /**
   * Personalize template with lead data
   */
  personalizeTemplate(template, lead) {
    if (!template) return '';

    let personalized = template;
    personalized = personalized.replace(/\{\{first_name\}\}/g, lead.first_name || '');
    personalized = personalized.replace(/\{\{last_name\}\}/g, lead.last_name || '');
    personalized = personalized.replace(/\{\{name\}\}/g, `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'there');
    personalized = personalized.replace(/\{\{organization\}\}/g, lead.organization || '');
    personalized = personalized.replace(/\{\{company\}\}/g, lead.organization || '');
    personalized = personalized.replace(/\{\{email\}\}/g, lead.email || '');
    personalized = personalized.replace(/\{\{city\}\}/g, lead.city || '');
    personalized = personalized.replace(/\{\{country\}\}/g, lead.country || '');
    personalized = personalized.replace(/\{\{title\}\}/g, lead.title || '');

    return personalized;
  }
}

module.exports = new HubSpotEmail();
