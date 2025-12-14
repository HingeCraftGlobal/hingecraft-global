/**
 * AnyMail Webhook Handler
 * Handles incoming webhooks from AnyMail and auto-fills prospect data
 * Triggers email sending with proper template based on lead type
 */

const db = require('../utils/database');
const logger = require('../utils/logger');
const leadClassifier = require('./leadClassifier');
const templateRouter = require('./templateRouter');
const gmailMultiAccount = require('./gmailMultiAccount');
const hubspotEnhanced = require('./hubspotEnhanced');
const sequenceEngine = require('./sequenceEngine');
const crypto = require('crypto');
const config = require('../../config/api_keys');

class AnyMailWebhookHandler {
  /**
   * Verify webhook signature for security
   */
  verifyWebhookSignature(payload, signature, secret) {
    if (!secret) {
      logger.warn('Webhook secret not configured, skipping signature verification');
      return true; // Allow if no secret configured
    }

    try {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(JSON.stringify(payload)).digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
      );
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Handle incoming AnyMail webhook
   * EXACT ORDER:
   * 1. Receive AnyMail webhooks
   * 2. Auto-fill prospect data
   * 3. Select template from database
   * 4. Send personalized email
   * 5. Segment and sync to HubSpot
   */
  async handleWebhook(webhookData, signature = null) {
    try {
      logger.info('Step 1: Received AnyMail webhook');

      // Verify webhook signature if provided
      const webhookSecret = process.env.ANYMAIL_WEBHOOK_SECRET || config.anymail.webhookSecret;
      if (signature && webhookSecret) {
        const isValid = this.verifyWebhookSignature(webhookData, signature, webhookSecret);
        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
        logger.info('Webhook signature verified');
      }

      let { event, email, contact_data, metadata, result, request_id } = webhookData;

      // Handle AnyMail API webhook responses (from find/verify endpoints)
      // AnyMail sends webhook when API request completes (async)
      if (result) {
        // This is a response from an AnyMail API call (find/verify)
        logger.info('Received AnyMail API result via webhook');
        
        // Process the result
        if (result.email) {
          // Email found - create/update lead
          const lead = await this.findOrCreateLead(result.email, {
            first_name: result.first_name || contact_data?.first_name,
            last_name: result.last_name || contact_data?.last_name,
            company: result.company || contact_data?.company,
            title: result.title || contact_data?.title,
            phone: result.phone || contact_data?.phone,
            website: result.website || contact_data?.website,
            city: result.city || contact_data?.city,
            state: result.state || contact_data?.state,
            country: result.country || contact_data?.country
          });

          // Continue with normal flow
          return await this.processLeadThroughFlow(lead);
        } else if (result.valid !== undefined) {
          // Email verification result
          logger.info(`Email verification result: ${result.valid ? 'valid' : 'invalid'}`);
          // Handle verification result if needed
        }
        
        // If we have email from result, use it
        if (!email && result.email) {
          email = result.email;
        }
        
        // Merge result data into contact_data
        if (result && !contact_data) {
          contact_data = result;
        }
      }

      // STEP 1: Receive AnyMail webhooks (already received)
      if (!email) {
        throw new Error('Email is required in webhook data');
      }

      // STEP 2: Auto-fill prospect data
      logger.info('Step 2: Auto-filling prospect data');
      let lead = await this.findOrCreateLead(email, contact_data);
      
      // Enrich with AnyMail data
      if (contact_data) {
        lead = await this.enrichLeadWithAnymailData(lead, contact_data);
      }

      // Classify lead if not already classified
      if (!lead.lead_type) {
        const classification = await leadClassifier.classifyLead(lead);
        lead.lead_type = classification.lead_type;
        lead.template_set = classification.template_set;
        lead.lead_score = classification.score;

        await db.query(
          `UPDATE leads 
           SET lead_type = $1, template_set = $2, lead_score = $3, updated_at = NOW()
           WHERE id = $4`,
          [lead.lead_type, lead.template_set, lead.lead_score, lead.id]
        );
      }

      // STEP 3: Select template from database
      logger.info('Step 3: Selecting template from database');
      const template = await this.getTemplateForLead(lead);
      
      if (!template) {
        throw new Error(`No template found for lead type: ${lead.lead_type}, template_set: ${lead.template_set}`);
      }

      // STEP 4: Send personalized email
      logger.info('Step 4: Sending personalized email');
      const personalizedTemplate = await this.personalizeTemplate(template, lead);
      const fromEmail = this.selectSendingAccount(lead);

      const emailResult = await gmailMultiAccount.sendEmail({
        to: lead.email,
        subject: personalizedTemplate.subject,
        html: personalizedTemplate.body,
        from: fromEmail,
        replyTo: fromEmail
      });

      // Log email send
      await this.logEmailSend(lead.id, emailResult, personalizedTemplate);

      // STEP 5: Segment and sync to HubSpot (for list maintenance)
      logger.info('Step 5: Segmenting and syncing to HubSpot for list maintenance');
      
      // Segment lead
      await this.segmentLead(lead);
      
      // Sync to HubSpot for list maintenance (not email sending)
      const hubspotListMaintenance = require('./hubspotListMaintenance');
      await hubspotListMaintenance.syncAllDataForListMaintenance();
      
      // Mark as ready to send if conditions met
      if (lead.email && lead.lead_type && lead.template_set) {
        await db.query(
          `UPDATE leads SET status = 'ready_to_send' WHERE id = $1`,
          [lead.id]
        );
      }

      logger.info(`Webhook processed successfully: Lead ${lead.id}, Email sent: ${emailResult.success}`);

      return {
        success: true,
        lead_id: lead.id,
        email_sent: emailResult.success,
        template_used: template.name || template.id,
        segment: lead.lead_type,
        hubspot_synced: true
      };
    } catch (error) {
      logger.error('Error handling AnyMail webhook:', error);
      throw error;
    }
  }

  /**
   * Process lead through complete flow (helper method)
   */
  async processLeadThroughFlow(lead) {
    // Classify if needed
    if (!lead.lead_type) {
      const classification = await leadClassifier.classifyLead(lead);
      lead.lead_type = classification.lead_type;
      lead.template_set = classification.template_set;
      lead.lead_score = classification.score;

      await db.query(
        `UPDATE leads 
         SET lead_type = $1, template_set = $2, lead_score = $3, updated_at = NOW()
         WHERE id = $4`,
        [lead.lead_type, lead.template_set, lead.lead_score, lead.id]
      );
    }

    // Get template
    const template = await this.getTemplateForLead(lead);
    if (!template) {
      throw new Error(`No template found for lead type: ${lead.lead_type}`);
    }

    // Personalize and send
    const personalizedTemplate = await this.personalizeTemplate(template, lead);
    const fromEmail = this.selectSendingAccount(lead);

    const emailResult = await gmailMultiAccount.sendEmail({
      to: lead.email,
      subject: personalizedTemplate.subject,
      html: personalizedTemplate.body,
      from: fromEmail,
      replyTo: fromEmail
    });

    await this.logEmailSend(lead.id, emailResult, personalizedTemplate);
    await this.segmentLead(lead);
    await hubspotEnhanced.upsertContact(lead);

    return {
      success: true,
      lead_id: lead.id,
      email_sent: emailResult.success
    };
  }

  /**
   * Find or create lead in database
   */
  async findOrCreateLead(email, contactData) {
    try {
      // Try to find existing lead
      const result = await db.query(
        'SELECT * FROM leads WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Create new lead
      const { v4: uuidv4 } = require('uuid');
      const leadId = uuidv4();

      await db.query(
        `INSERT INTO leads (
          id, email, first_name, last_name, organization, title,
          phone, website, city, state, country, source, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [
          leadId,
          email.toLowerCase(),
          contactData?.first_name || contactData?.firstName || '',
          contactData?.last_name || contactData?.lastName || '',
          contactData?.company || contactData?.organization || '',
          contactData?.title || contactData?.jobTitle || '',
          contactData?.phone || '',
          contactData?.website || '',
          contactData?.city || '',
          contactData?.state || '',
          contactData?.country || '',
          'anymail_webhook'
        ]
      );

      const newLead = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
      return newLead.rows[0];
    } catch (error) {
      logger.error('Error finding/creating lead:', error);
      throw error;
    }
  }

  /**
   * Enrich lead with AnyMail data
   */
  async enrichLeadWithAnymailData(lead, anymailData) {
    try {
      const updates = {};
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      // Map AnyMail data to lead fields
      if (anymailData.first_name || anymailData.firstName) {
        updates.first_name = anymailData.first_name || anymailData.firstName;
        updateFields.push(`first_name = $${paramIndex++}`);
        updateValues.push(updates.first_name);
      }

      if (anymailData.last_name || anymailData.lastName) {
        updates.last_name = anymailData.last_name || anymailData.lastName;
        updateFields.push(`last_name = $${paramIndex++}`);
        updateValues.push(updates.last_name);
      }

      if (anymailData.company || anymailData.organization) {
        updates.organization = anymailData.company || anymailData.organization;
        updateFields.push(`organization = $${paramIndex++}`);
        updateValues.push(updates.organization);
      }

      if (anymailData.title || anymailData.jobTitle) {
        updates.title = anymailData.title || anymailData.jobTitle;
        updateFields.push(`title = $${paramIndex++}`);
        updateValues.push(updates.title);
      }

      if (anymailData.phone) {
        updates.phone = anymailData.phone;
        updateFields.push(`phone = $${paramIndex++}`);
        updateValues.push(anymailData.phone);
      }

      if (anymailData.website) {
        updates.website = anymailData.website;
        updateFields.push(`website = $${paramIndex++}`);
        updateValues.push(anymailData.website);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = NOW()`);
        updateValues.push(lead.id);

        await db.query(
          `UPDATE leads SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
          updateValues
        );

        // Return updated lead
        const updated = await db.query('SELECT * FROM leads WHERE id = $1', [lead.id]);
        return updated.rows[0];
      }

      return lead;
    } catch (error) {
      logger.error('Error enriching lead:', error);
      return lead;
    }
  }

  /**
   * Get template for lead based on lead type and template set
   */
  async getTemplateForLead(lead) {
    try {
      // Get template from database based on lead type and template set
      const result = await db.query(
        `SELECT * FROM email_templates 
         WHERE template_set = $1 
         AND lead_type = $2 
         AND is_active = true
         ORDER BY sequence_order ASC
         LIMIT 1`,
        [lead.template_set || 'default', lead.lead_type || 'General']
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Fallback to default template
      const defaultResult = await db.query(
        `SELECT * FROM email_templates 
         WHERE template_set = 'default' 
         AND is_active = true
         ORDER BY sequence_order ASC
         LIMIT 1`
      );

      if (defaultResult.rows.length > 0) {
        return defaultResult.rows[0];
      }

      throw new Error('No template found for lead');
    } catch (error) {
      logger.error('Error getting template:', error);
      throw error;
    }
  }

  /**
   * Personalize template with lead data
   */
  async personalizeTemplate(template, lead) {
    try {
      const personalized = templateRouter.personalizeTemplate(
        template.body,
        lead,
        {
          subject: template.subject,
          includeTracking: true
        }
      );

      return {
        subject: personalized.subject || template.subject,
        body: personalized.body || personalized
      };
    } catch (error) {
      logger.error('Error personalizing template:', error);
      return {
        subject: template.subject,
        body: template.body
      };
    }
  }

  /**
   * Select sending account - always marketingecraft@gmail.com
   */
  selectSendingAccount(lead) {
    const config = require('../../config/api_keys');
    // Always use marketing account
    return config.email.fromAddress || 'marketingecraft@gmail.com';
  }

  /**
   * Log email send
   */
  async logEmailSend(leadId, emailResult, template) {
    try {
      const { v4: uuidv4 } = require('uuid');
      await db.query(
        `INSERT INTO email_logs (
          id, lead_id, subject, status, provider, provider_message_id,
          sent_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          uuidv4(),
          leadId,
          template.subject,
          emailResult.success ? 'sent' : 'failed',
          'gmail',
          emailResult.messageId || null
        ]
      );
    } catch (error) {
      logger.error('Error logging email:', error);
    }
  }

  /**
   * Segment lead
   */
  async segmentLead(lead) {
    try {
      const { v4: uuidv4 } = require('uuid');
      
      // Create segment entry
      await db.query(
        `INSERT INTO lead_segments (
          id, lead_id, segment_name, segment_type, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (lead_id, segment_name) DO NOTHING`,
        [
          uuidv4(),
          lead.id,
          lead.lead_type || 'General',
          'automation'
        ]
      );

      // Sync segment to HubSpot list
      const hubspotUnifiedSync = require('./hubspotUnifiedSync');
      await hubspotUnifiedSync.syncSegmentsToLists();
    } catch (error) {
      logger.error('Error segmenting lead:', error);
    }
  }
}

module.exports = new AnyMailWebhookHandler();
