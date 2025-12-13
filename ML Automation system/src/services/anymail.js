/**
 * Anymail API Integration Service
 * Handles email finding and sending via Anymail API
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');
const { anymailRateLimiter } = require('../utils/rateLimiter');

class AnymailService {
  constructor() {
    this.apiKey = config.anymail.apiKey;
    this.baseUrl = config.anymail.baseUrl;
    this.webhookUrl = process.env.ANYMAIL_WEBHOOK_URL || 
                      process.env.WEBHOOK_URL || 
                      'http://localhost:3001/api/webhooks/anymail';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Find email address for a contact (with webhook)
   * Automatically includes x-webhook-url header for async results
   */
  async findEmail(domain, firstName, lastName, companyName, useWebhook = true) {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };

      // Auto-configure webhook URL if enabled
      if (useWebhook && this.webhookUrl) {
        headers['x-webhook-url'] = this.webhookUrl;
        logger.info(`AnyMail find request with webhook: ${this.webhookUrl}`);
      }

      const response = await this.client.post('/find', {
        domain: domain,
        first_name: firstName,
        last_name: lastName,
        company: companyName
      }, {
        headers: headers
      });

      // If webhook is used, response may be immediate acknowledgment
      // Actual results will come via webhook
      if (useWebhook && response.data.status === 'queued') {
        return {
          queued: true,
          webhook_url: this.webhookUrl,
          message: 'Request queued, results will be sent to webhook'
        };
      }

      return {
        email: response.data.email,
        confidence: response.data.confidence || 0,
        sources: response.data.sources || []
      };
    } catch (error) {
      logger.error('Error finding email via Anymail:', error.message);
      return null;
    }
  }

  /**
   * Verify email address (with webhook)
   * Automatically includes x-webhook-url header for async results
   */
  async verifyEmail(email, useWebhook = true) {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };

      // Auto-configure webhook URL if enabled
      if (useWebhook && this.webhookUrl) {
        headers['x-webhook-url'] = this.webhookUrl;
        logger.info(`AnyMail verify request with webhook: ${this.webhookUrl}`);
      }

      const response = await this.client.post('/verify', {
        email: email
      }, {
        headers: headers
      });

      // If webhook is used, response may be immediate acknowledgment
      if (useWebhook && response.data.status === 'queued') {
        return {
          queued: true,
          webhook_url: this.webhookUrl,
          message: 'Request queued, results will be sent to webhook'
        };
      }

      return {
        valid: response.data.valid || false,
        deliverable: response.data.deliverable || false,
        score: response.data.score || 0,
        reason: response.data.reason || ''
      };
    } catch (error) {
      logger.error('Error verifying email via Anymail:', error.message);
      return {
        valid: false,
        deliverable: false,
        score: 0,
        reason: 'API Error'
      };
    }
  }

  /**
   * Send email via Anymail
   */
  async sendEmail({ to, subject, html, text, from, replyTo, templateId, personalization }) {
    try {
      // Check rate limit
      const rateLimit = anymailRateLimiter.isAllowed('anymail-api');
      if (!rateLimit.allowed) {
        logger.warn(`Rate limit reached, waiting ${rateLimit.waitTime}s`);
        await new Promise(resolve => setTimeout(resolve, rateLimit.waitTime * 1000));
      }

      const payload = {
        to: to,
        subject: subject,
        from: from || config.email.fromAddress,
        reply_to: replyTo || config.email.replyTo
      };

      if (templateId) {
        payload.template_id = templateId;
        payload.personalization = personalization || {};
      } else {
        payload.html = html;
        payload.text = text;
      }

      const response = await retry(
        () => this.client.post('/messages', payload),
        { maxRetries: 3 }
      );

      return {
        success: true,
        messageId: response.data.message_id,
        provider: 'anymail',
        status: 'sent'
      };
    } catch (error) {
      logger.error('Error sending email via Anymail:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'anymail'
      };
    }
  }

  /**
   * Get email status
   */
  async getEmailStatus(messageId) {
    try {
      const response = await this.client.get(`/messages/${messageId}`);

      return {
        messageId: messageId,
        status: response.data.status,
        delivered: response.data.delivered || false,
        opened: response.data.opened || false,
        clicked: response.data.clicked || false,
        bounced: response.data.bounced || false,
        events: response.data.events || []
      };
    } catch (error) {
      logger.error(`Error getting email status for ${messageId}:`, error.message);
      return null;
    }
  }

  /**
   * Batch find emails (with webhook)
   * Automatically includes x-webhook-url header for async results
   */
  async batchFindEmails(contacts, useWebhook = true) {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      };

      // Auto-configure webhook URL if enabled
      if (useWebhook && this.webhookUrl) {
        headers['x-webhook-url'] = this.webhookUrl;
        logger.info(`AnyMail batch find request with webhook: ${this.webhookUrl}`);
      }

      const response = await this.client.post('/batch/find', {
        contacts: contacts.map(contact => ({
          domain: contact.domain,
          first_name: contact.firstName,
          last_name: contact.lastName,
          company: contact.company
        }))
      }, {
        headers: headers
      });

      // If webhook is used, response may be immediate acknowledgment
      if (useWebhook && response.data.status === 'queued') {
        return {
          queued: true,
          webhook_url: this.webhookUrl,
          contact_count: contacts.length,
          message: 'Batch request queued, results will be sent to webhook'
        };
      }

      return response.data.results || [];
    } catch (error) {
      logger.error('Error batch finding emails:', error.message);
      return [];
    }
  }
}

module.exports = new AnymailService();
