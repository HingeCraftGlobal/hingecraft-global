/**
 * Gmail API Integration Service
 * Handles personalized email sending via Gmail API
 */

const { google } = require('googleapis');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const oauthManager = require('../utils/oauth');
const { retry } = require('../utils/retry');
const gmailMultiAccount = require('./gmailMultiAccount');

class GmailService {
  constructor() {
    this.auth = null;
    this.gmail = null;
    // Use multi-account service for sending
    this.multiAccount = gmailMultiAccount;
  }

  /**
   * Initialize Gmail OAuth2 client
   */
  async initialize(credentials) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        config.google.gmailClientId,
        config.google.clientSecret,
        'http://localhost:3001/oauth2callback'
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
    const oauth2Client = new google.auth.OAuth2(
      config.google.gmailClientId,
      config.google.clientSecret,
      'http://localhost:3001/oauth2callback'
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
   * Send email via Gmail API (uses multi-account service)
   */
  async sendEmail({ to, subject, html, text, from, replyTo }) {
    try {
      // Use multi-account service which supports both Gmail accounts
      return await this.multiAccount.sendEmail({ to, subject, html, text, from, replyTo });
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
   * Personalize email template with lead data
   */
  personalizeTemplate(template, lead) {
    let personalized = template;
    
    // Replace template variables
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
