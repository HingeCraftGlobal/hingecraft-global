/**
 * Email Sender from HubSpot Lists
 * Pulls contacts from HubSpot lists and sends emails via Gmail
 * This is the backend automation that uses HubSpot ONLY for list maintenance
 */

const hubspotListMaintenance = require('./hubspotListMaintenance');
const gmailMultiAccount = require('./gmailMultiAccount');
const db = require('../utils/database');
const logger = require('../utils/logger');
const templateRouter = require('./templateRouter');
const emailTemplateLoader = require('./emailTemplateLoader');

class EmailSenderFromHubSpotLists {
  constructor() {
    this.listName = 'Ready to Send'; // Default list name
  }

  /**
   * Main function: Pull from HubSpot list and send emails
   * This is called by the backend automation system
   */
  async sendEmailsFromHubSpotList(listName = 'Ready to Send', limit = 100) {
    try {
      logger.info(`📧 Pulling contacts from HubSpot list: ${listName}`);

      // Step 1: Get contacts from HubSpot list
      const contacts = await hubspotListMaintenance.getContactsFromList(listName);
      
      if (contacts.length === 0) {
        logger.info('No contacts in list');
        return { sent: 0, skipped: 0, failed: 0 };
      }

      logger.info(`Found ${contacts.length} contacts in list`);

      // Step 2: Process each contact
      const results = {
        sent: 0,
        skipped: 0,
        failed: 0,
        details: []
      };

      const toProcess = contacts.slice(0, limit);
      
      for (const contact of toProcess) {
        try {
          const result = await this.processContact(contact);
          if (result.success) {
            results.sent++;
          } else if (result.skipped) {
            results.skipped++;
          } else {
            results.failed++;
          }
          results.details.push(result);
        } catch (error) {
          logger.error(`Error processing contact ${contact.properties.email}:`, error);
          results.failed++;
          results.details.push({
            email: contact.properties.email,
            success: false,
            error: error.message
          });
        }
      }

      logger.info(`✅ Email send complete: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed`);
      return results;
    } catch (error) {
      logger.error('Error sending emails from HubSpot list:', error);
      throw error;
    }
  }

  /**
   * Process a single contact: personalize and send email
   */
  async processContact(contact) {
    try {
      const email = contact.properties.email;
      if (!email) {
        return { success: false, skipped: true, reason: 'No email' };
      }

      // Get lead from database for full data
      const leadResult = await db.query(
        'SELECT * FROM leads WHERE email = $1',
        [email.toLowerCase()]
      );

      if (leadResult.rows.length === 0) {
        return { success: false, skipped: true, reason: 'Lead not in database' };
      }

      const lead = leadResult.rows[0];

      // Determine template set from HubSpot property or database
      const templateSet = contact.properties.automation_template_set || lead.template_set;
      if (!templateSet) {
        return { success: false, skipped: true, reason: 'No template set' };
      }

      // Get template from database (using template loader)
      await emailTemplateLoader.loadAllTemplates();
      let template = await emailTemplateLoader.getTemplate(templateSet, 1); // Start with step 1
      
      if (!template) {
        // Fallback to database query
        const dbTemplate = await this.getTemplateForLead(lead, templateSet);
        if (!dbTemplate) {
          return { success: false, skipped: true, reason: 'Template not found' };
        }
        template = {
          subject: dbTemplate.subject_template || dbTemplate.subject,
          body: dbTemplate.body_template || dbTemplate.body,
          template_id: dbTemplate.template_id || dbTemplate.id
        };
      }

      // Personalize template with contact data
      const personalized = this.personalizeTemplate(
        { subject: template.subject, body: template.body },
        contact,
        lead
      );

      // Send via Gmail
      const emailResult = await gmailMultiAccount.sendEmail({
        to: email,
        subject: personalized.subject,
        html: personalized.body,
        from: 'marketingecraft@gmail.com',
        replyTo: 'marketingecraft@gmail.com'
      });

      if (emailResult.success) {
        // Update HubSpot contact
        await hubspotListMaintenance.updateContactAfterEmailSend(
          contact.vid || contact.id,
          { current_count: contact.properties.automation_emails_sent || '0' }
        );

        // Log in database
        await this.logEmailSend(lead.id, emailResult, {
          id: template.template_id || template.id,
          subject: personalized.subject,
          body: personalized.body
        });

        return {
          success: true,
          email: email,
          template: templateSet,
          messageId: emailResult.messageId
        };
      } else {
        return {
          success: false,
          email: email,
          error: emailResult.error
        };
      }
    } catch (error) {
      logger.error(`Error processing contact:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get template for lead from database
   */
  async getTemplateForLead(lead, templateSet) {
    try {
      // Get current sequence step from database
      const sequenceResult = await db.query(`
        SELECT current_step, sequence_id
        FROM lead_sequences
        WHERE lead_id = $1 AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `, [lead.id]);

      const step = sequenceResult.rows.length > 0 ? sequenceResult.rows[0].current_step : 1;

      // Try to get template from email_templates table first
      let templateResult = await db.query(`
        SELECT * FROM email_templates
        WHERE template_set = $1 AND step_number = $2
        LIMIT 1
      `, [templateSet, step]);

      if (templateResult.rows.length > 0) {
        return templateResult.rows[0];
      }

      // Fallback: get from sequence_steps
      templateResult = await db.query(`
        SELECT ss.*, s.sequence_type as template_set
        FROM sequence_steps ss
        JOIN sequences s ON ss.sequence_id = s.id
        WHERE s.sequence_type = $1 AND ss.step_number = $2
        LIMIT 1
      `, [templateSet, step]);

      if (templateResult.rows.length > 0) {
        const stepData = templateResult.rows[0];
        return {
          id: stepData.id,
          template_set: stepData.template_set,
          step_number: stepData.step_number,
          subject: stepData.subject_template,
          body: stepData.body_template,
          subject_template: stepData.subject_template,
          body_template: stepData.body_template
        };
      }

      // Final fallback: get first template from set
      const fallbackResult = await db.query(`
        SELECT * FROM email_templates
        WHERE template_set = $1
        ORDER BY step_number ASC
        LIMIT 1
      `, [templateSet]);

      if (fallbackResult.rows.length > 0) {
        return fallbackResult.rows[0];
      }

      // Last resort: get from sequence_steps
      const lastResort = await db.query(`
        SELECT ss.*, s.sequence_type as template_set
        FROM sequence_steps ss
        JOIN sequences s ON ss.sequence_id = s.id
        WHERE s.sequence_type = $1
        ORDER BY ss.step_number ASC
        LIMIT 1
      `, [templateSet]);

      if (lastResort.rows.length > 0) {
        const stepData = lastResort.rows[0];
        return {
          id: stepData.id,
          template_set: stepData.template_set,
          step_number: stepData.step_number,
          subject: stepData.subject_template,
          body: stepData.body_template
        };
      }

      logger.warn(`No template found for template_set: ${templateSet}, step: ${step}`);
      return null;
    } catch (error) {
      logger.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Personalize template with contact and lead data
   */
  personalizeTemplate(template, contact, lead) {
    let subject = template.subject || template.subject_template || '';
    let body = template.body || template.body_template || '';

    // Replace tokens
    const replacements = {
      '{{first_name}}': contact.properties.firstname || lead.first_name || '',
      '{{last_name}}': contact.properties.lastname || lead.last_name || '',
      '{{name}}': `${contact.properties.firstname || lead.first_name || ''} ${contact.properties.lastname || lead.last_name || ''}`.trim() || 'there',
      '{{organization}}': contact.properties.company || lead.organization || '',
      '{{company}}': contact.properties.company || lead.organization || '',
      '{{email}}': contact.properties.email || lead.email || '',
      '{{city}}': contact.properties.city || lead.city || '',
      '{{country}}': contact.properties.country || lead.country || '',
      '{{lead_type}}': contact.properties.automation_lead_type || lead.lead_type || '',
      '{{segment_1}}': contact.properties.original_sheet_data_segment_1 || '',
      '{{segment_2}}': contact.properties.original_sheet_data_segment_2 || '',
      '{{segment_3}}': contact.properties.original_sheet_data_segment_3 || ''
    };

    Object.keys(replacements).forEach(token => {
      subject = subject.replace(new RegExp(token, 'g'), replacements[token]);
      body = body.replace(new RegExp(token, 'g'), replacements[token]);
    });

    return { subject, body };
  }

  /**
   * Log email send in database
   */
  async logEmailSend(leadId, emailResult, template) {
    try {
      await db.query(`
        INSERT INTO email_tracking (
          lead_id, provider, provider_message_id, to_email,
          subject, template_id, status, sent_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [
        leadId,
        'gmail',
        emailResult.messageId || '',
        emailResult.to || '',
        emailResult.subject || '',
        template.id || '',
        emailResult.success ? 'sent' : 'failed'
      ]);
    } catch (error) {
      logger.error('Error logging email:', error);
    }
  }
}

module.exports = new EmailSenderFromHubSpotLists();
