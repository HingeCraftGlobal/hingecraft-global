/**
 * Gmail API Integration Service
 * Handles personalized email sending via Gmail API
 */

const { google } = require('googleapis');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const oauthManager = require('../utils/oauth');
const { retry } = require('../utils/retry');

class GmailService {
  constructor() {
    this.auth = null;
    this.gmail = null;
  }

  /**
   * Initialize Gmail OAuth2 client
   */
  async initialize(credentials) {
    try {
      const redirectUri = process.env.OAUTH_REDIRECT_URI || 
                         process.env.REDIRECT_URI || 
                         'http://localhost:7101/oauth2callback';
      
      const oauth2Client = new google.auth.OAuth2(
        config.google.gmailClientId,
        config.google.clientSecret,
        redirectUri
      );

      if (credentials) {
        oauth2Client.setCredentials(credentials);
      }

      this.auth = oauth2Client;
      this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      logger.info('Gmail service initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Gmail service:', error);
      throw error;
    }
  }

  /**
   * Set OAuth2 credentials
   */
  setCredentials(credentials) {
    if (this.auth) {
      this.auth.setCredentials(credentials);
      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
    }
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl() {
    const redirectUri = process.env.OAUTH_REDIRECT_URI || 
                       process.env.REDIRECT_URI || 
                       'http://localhost:7101/oauth2callback';
    
    const oauth2Client = new google.auth.OAuth2(
      config.google.gmailClientId,
      config.google.clientSecret,
      redirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      prompt: 'consent'
    });
  }

  /**
   * Send email via Gmail API
   */
  async sendEmail({ to, subject, html, text, from, replyTo }) {
    try {
      // Ensure we have valid auth
      if (!this.gmail) {
        await this.initialize();
      }

      // Refresh token if needed
      if (oauthManager.needsRefresh()) {
        await oauthManager.refreshToken();
        this.auth = await oauthManager.getValidClient();
        this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      }

      const fromEmail = from || config.email.fromAddress;
      const replyToEmail = replyTo || config.email.replyTo;

      // Create email message in RFC 2822 format
      const emailLines = [
        `From: ${fromEmail}`,
        `To: ${to}`,
        `Reply-To: ${replyToEmail}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=UTF-8`,
        '',
        html || text
      ];

      const email = emailLines.join('\r\n');
      
      // Encode message in base64url format
      const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await retry(
        () => this.gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage
          }
        }),
        { maxRetries: 3 }
      );

      logger.info(`Sent email via Gmail to ${to}, message ID: ${response.data.id}`);
      
      return {
        success: true,
        messageId: response.data.id,
        provider: 'gmail',
        status: 'sent'
      };
    } catch (error) {
      logger.error('Error sending email via Gmail:', error.message);
      return {
        success: false,
        error: error.message,
        provider: 'gmail'
      };
    }
  }

  /**
   * Send personalized follow-up email
   */
  async sendFollowUp(lead, template) {
    try {
      // Personalize template
      const personalizedSubject = this.personalizeTemplate(template.subject, lead);
      const personalizedBody = this.personalizeTemplate(template.body, lead);

      return await this.sendEmail({
        to: lead.email,
        subject: personalizedSubject,
        html: personalizedBody,
        from: config.email.fromAddress,
        replyTo: config.email.replyTo
      });
    } catch (error) {
      logger.error('Error sending follow-up:', error.message);
      throw error;
    }
  }

  /**
   * Send payment receipt email (delegates to paymentReceipt service)
   */
  async sendPaymentReceipt({ paymentId, paymentData, to, from, replyTo }) {
    const paymentReceipt = require('./paymentReceipt');
    return await paymentReceipt.sendPaymentReceipt({ paymentId, paymentData, to, from, replyTo });
  }

  /**
   * Personalize email template (uses templateRouter for full personalization)
   */
  personalizeTemplate(template, lead, options = {}) {
    const templateRouter = require('./templateRouter');
    return templateRouter.personalizeTemplate(template, lead, options);
  }

  /**
   * Get message details
   */
  async getMessage(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      });

      return response.data;
    } catch (error) {
      logger.error(`Error getting message ${messageId}:`, error.message);
      return null;
    }
  }

  /**
   * Watch for new messages (for reply detection)
   */
  async watchMailbox(webhookUrl) {
    try {
      const response = await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: 'projects/your-project/topics/gmail-notifications',
          labelIds: ['INBOX']
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error setting up mailbox watch:', error.message);
      throw error;
    }
  }
}

module.exports = new GmailService();
