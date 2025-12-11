/**
 * Email Wave Sender Service
 * Sends emails in segmented waves (50-100 per wave) to reduce spam risk
 */

const anymail = require('./anymail');
const gmail = require('./gmail');
const db = require('../utils/database');
const logger = require('../utils/logger');
const { anymailRateLimiter } = require('../utils/rateLimiter');
const config = require('../../config/api_keys');

class EmailWaveSender {
  constructor() {
    this.waveSize = config.email.waveSize || 75; // Default 75 emails per wave
    this.waveDelay = config.email.waveDelay || 60000; // 1 minute delay between waves
    this.maxDailyLimit = config.email.dailyLimit || 1000;
    this.maxHourlyLimit = config.email.hourlyLimit || 100;
  }

  /**
   * Send emails in waves to prevent spam
   * @param {Array} emails - Array of email objects {to, subject, html, lead_id, sequence_id, step_number}
   * @returns {Object} Results with sent, failed, and wave information
   */
  async sendInWaves(emails) {
    if (!emails || emails.length === 0) {
      return {
        success: true,
        total: 0,
        sent: 0,
        failed: 0,
        waves: 0
      };
    }

    logger.info(`Starting wave-based email sending for ${emails.length} emails`);
    
    const waves = this.createWaves(emails);
    const results = {
      total: emails.length,
      sent: 0,
      failed: 0,
      waves: waves.length,
      waveResults: []
    };

    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i];
      logger.info(`Processing wave ${i + 1}/${waves.length} with ${wave.length} emails`);
      
      const waveResult = await this.sendWave(wave, i + 1);
      
      results.sent += waveResult.sent;
      results.failed += waveResult.failed;
      results.waveResults.push({
        waveNumber: i + 1,
        total: wave.length,
        sent: waveResult.sent,
        failed: waveResult.failed,
        errors: waveResult.errors
      });

      // Delay between waves (except for the last wave)
      if (i < waves.length - 1) {
        logger.info(`Waiting ${this.waveDelay / 1000}s before next wave...`);
        await this.delay(this.waveDelay);
      }
    }

    logger.info(`Wave sending complete: ${results.sent} sent, ${results.failed} failed across ${results.waves} waves`);
    
    return {
      success: results.failed === 0,
      ...results
    };
  }

  /**
   * Create waves from email array
   * @param {Array} emails - Array of email objects
   * @returns {Array} Array of waves (each wave is an array of emails)
   */
  createWaves(emails) {
    const waves = [];
    const waveSize = this.waveSize;
    
    for (let i = 0; i < emails.length; i += waveSize) {
      waves.push(emails.slice(i, i + waveSize));
    }
    
    return waves;
  }

  /**
   * Send a single wave of emails
   * @param {Array} wave - Array of email objects for this wave
   * @param {Number} waveNumber - Current wave number
   * @returns {Object} Results for this wave
   */
  async sendWave(wave, waveNumber) {
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Process emails in parallel with concurrency limit
    const concurrency = 10; // Send 10 emails at a time within a wave
    for (let i = 0; i < wave.length; i += concurrency) {
      const batch = wave.slice(i, i + concurrency);
      
      const batchPromises = batch.map(email => this.sendSingleEmail(email, waveNumber));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.sent++;
        } else {
          results.failed++;
          const error = result.status === 'rejected' 
            ? result.reason.message 
            : result.value.error;
          results.errors.push({
            email: batch[index].to,
            error: error
          });
        }
      });

      // Small delay between batches within a wave
      if (i + concurrency < wave.length) {
        await this.delay(2000); // 2 second delay between batches
      }
    }

    return results;
  }

  /**
   * Send a single email
   * @param {Object} emailData - Email object {to, subject, html, lead_id, sequence_id, step_number}
   * @param {Number} waveNumber - Current wave number
   * @returns {Object} Send result
   */
  async sendSingleEmail(emailData, waveNumber) {
    try {
      // Check rate limit
      const rateLimit = anymailRateLimiter.isAllowed('anymail-api');
      if (!rateLimit.allowed) {
        logger.warn(`Rate limit reached, waiting ${rateLimit.waitTime}s`);
        await this.delay(rateLimit.waitTime * 1000);
      }

      // Try Anymail first
      let sendResult;
      try {
        sendResult = await anymail.sendEmail({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          from: emailData.from || config.email.fromAddress,
          replyTo: emailData.replyTo || config.email.replyTo
        });
      } catch (error) {
        logger.warn(`Anymail failed for ${emailData.to}, trying Gmail:`, error.message);
        sendResult = await gmail.sendEmail({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          from: emailData.from || config.email.fromAddress,
          replyTo: emailData.replyTo || config.email.replyTo
        });
      }

      if (sendResult.success) {
        // Log email in database
        if (emailData.lead_id) {
          try {
            await db.insertEmailLog({
              lead_id: emailData.lead_id,
              sequence_id: emailData.sequence_id,
              step_number: emailData.step_number,
              provider: sendResult.provider,
              provider_message_id: sendResult.messageId,
              to_email: emailData.to,
              subject: emailData.subject,
              template_id: emailData.template_id,
              status: 'sent',
              sent_at: new Date(),
              metadata: {
                wave_number: waveNumber,
                batch_size: this.waveSize
              }
            });
          } catch (dbError) {
            logger.error('Error logging email to database:', dbError);
            // Don't fail the send if logging fails
          }
        }

        logger.info(`Email sent successfully (Wave ${waveNumber}): ${emailData.to}`);
        return {
          success: true,
          messageId: sendResult.messageId,
          provider: sendResult.provider,
          waveNumber: waveNumber
        };
      } else {
        throw new Error(sendResult.error || 'Send failed');
      }
    } catch (error) {
      logger.error(`Error sending email to ${emailData.to}:`, error.message);
      return {
        success: false,
        error: error.message,
        email: emailData.to
      };
    }
  }

  /**
   * Collect all emails from lead sheet and prepare for wave sending
   * @param {Array} leads - Array of lead objects from the sheet
   * @returns {Array} Array of email objects ready for sending
   */
  async collectEmailsFromLeads(leads, template) {
    const emails = [];
    
    for (const lead of leads) {
      // Skip if no email
      if (!lead.email) {
        logger.warn(`Skipping lead ${lead.id || lead.email}: No email address`);
        continue;
      }

      // Personalize template
      const subject = this.personalizeTemplate(template.subject, lead);
      const html = this.personalizeTemplate(template.html, lead);

      emails.push({
        to: lead.email,
        subject: subject,
        html: html,
        lead_id: lead.id,
        sequence_id: lead.sequence_id,
        step_number: lead.step_number || 1,
        template_id: template.template_id,
        from: template.from || config.email.fromAddress,
        replyTo: template.replyTo || config.email.replyTo
      });
    }

    logger.info(`Collected ${emails.length} emails from ${leads.length} leads`);
    return emails;
  }

  /**
   * Personalize email template
   */
  personalizeTemplate(template, lead) {
    if (!template) return '';
    
    let personalized = template;
    personalized = personalized.replace(/\{\{first_name\}\}/g, lead.first_name || '');
    personalized = personalized.replace(/\{\{last_name\}\}/g, lead.last_name || '');
    personalized = personalized.replace(/\{\{name\}\}/g, `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'there');
    personalized = personalized.replace(/\{\{organization\}\}/g, lead.organization || '');
    personalized = personalized.replace(/\{\{email\}\}/g, lead.email || '');
    personalized = personalized.replace(/\{\{city\}\}/g, lead.city || '');
    personalized = personalized.replace(/\{\{country\}\}/g, lead.country || '');
    
    return personalized;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get sending statistics
   */
  async getSendingStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_sent,
          COUNT(*) FILTER (WHERE status = 'sent') as sent,
          COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
          COUNT(*) FILTER (WHERE status = 'opened') as opened,
          COUNT(*) FILTER (WHERE status = 'clicked') as clicked
        FROM email_logs
        WHERE sent_at >= NOW() - INTERVAL '24 hours'
      `);

      return result.rows[0] || {
        total_sent: 0,
        sent: 0,
        bounced: 0,
        opened: 0,
        clicked: 0
      };
    } catch (error) {
      logger.error('Error getting sending stats:', error);
      return null;
    }
  }
}

module.exports = new EmailWaveSender();
