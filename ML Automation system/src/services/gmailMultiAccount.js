/**
 * Multi-Account Gmail Service
 * Supports sending from multiple Gmail accounts (departments@hingecraft-global.ai and marketingecraft@gmail.com)
 */

const { google } = require('googleapis');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const oauthManager = require('../utils/oauth');
const { retry } = require('../utils/retry');

class GmailMultiAccountService {
  constructor() {
    this.accounts = {
      'departments@hingecraft-global.ai': {
        auth: null,
        gmail: null,
        credentials: null
      },
      'marketingecraft@gmail.com': {
        auth: null,
        gmail: null,
        credentials: null
      }
    };
  }

  /**
   * Initialize Gmail OAuth2 client for a specific account
   */
  async initializeAccount(email, credentials) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        config.google.gmailClientId,
        config.google.clientSecret,
        'http://localhost:3001/oauth2callback'
      );

      if (credentials) {
        oauth2Client.setCredentials(credentials);
      }

      const account = this.accounts[email];
      if (!account) {
        throw new Error(`Account ${email} not configured`);
      }

      account.auth = oauth2Client;
      account.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      account.credentials = credentials;
      
      logger.info(`Gmail service initialized for ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to initialize Gmail service for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Initialize all accounts
   */
  async initializeAll(credentialsMap = {}) {
    try {
      for (const [email, credentials] of Object.entries(credentialsMap)) {
        if (this.accounts[email]) {
          await this.initializeAccount(email, credentials);
        }
      }
      logger.info('All Gmail accounts initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Gmail accounts:', error);
      throw error;
    }
  }

  /**
   * Get authorization URL for OAuth flow for a specific account
   */
  getAuthUrl(email) {
    const oauth2Client = new google.auth.OAuth2(
      config.google.gmailClientId,
      config.google.clientSecret,
      'http://localhost:3001/oauth2callback'
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.metadata'
      ],
      prompt: 'consent',
      state: email // Include email in state to identify which account
    });
  }

  /**
   * Send email via Gmail API from a specific account
   */
  async sendEmail({ to, subject, html, text, from, replyTo }) {
    try {
      // Determine which account to use
      const fromEmail = from || config.email.fromAddress;
      const accountEmail = this.getAccountForEmail(fromEmail);
      
      if (!accountEmail) {
        throw new Error(`No Gmail account configured for ${fromEmail}`);
      }

      const account = this.accounts[accountEmail];
      if (!account.gmail) {
        await this.initializeAccount(accountEmail, account.credentials);
      }

      // Refresh token if needed
      if (oauthManager.needsRefresh()) {
        await oauthManager.refreshToken();
        const credentials = await oauthManager.getCredentials(accountEmail);
        if (credentials) {
          account.auth.setCredentials(credentials);
          account.gmail = google.gmail({ version: 'v1', auth: account.auth });
        }
      }

      const replyToEmail = replyTo || fromEmail;

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
        () => account.gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage
          }
        }),
        { maxRetries: 3 }
      );

      logger.info(`Sent email via Gmail from ${fromEmail} to ${to}, message ID: ${response.data.id}`);
      
      return {
        success: true,
        messageId: response.data.id,
        provider: 'gmail',
        account: accountEmail,
        status: 'sent'
      };
    } catch (error) {
      logger.error(`Error sending email via Gmail from ${from}:`, error.message);
      return {
        success: false,
        error: error.message,
        provider: 'gmail',
        account: from
      };
    }
  }

  /**
   * Get account for email address
   */
  getAccountForEmail(email) {
    if (email === 'departments@hingecraft-global.ai') {
      return 'departments@hingecraft-global.ai';
    } else if (email === 'marketingecraft@gmail.com' || email === 'marketinghingecraft@gmail.com') {
      return 'marketingecraft@gmail.com';
    }
    // Default to marketing account
    return 'marketingecraft@gmail.com';
  }

  /**
   * Send personalized follow-up email
   */
  async sendFollowUp(lead, template, fromEmail = null) {
    try {
      // Personalize template
      const personalizedSubject = this.personalizeTemplate(template.subject, lead);
      const personalizedBody = this.personalizeTemplate(template.body, lead);

      const from = fromEmail || this.selectAccountForLead(lead);

      return await this.sendEmail({
        to: lead.email,
        subject: personalizedSubject,
        html: personalizedBody,
        from: from,
        replyTo: from
      });
    } catch (error) {
      logger.error('Error sending follow-up:', error.message);
      throw error;
    }
  }

  /**
   * Select appropriate account for lead
   */
  selectAccountForLead(lead) {
    // Use departments account for certain lead types
    if (lead.lead_type === 'NGO' || lead.lead_type === 'School') {
      return 'departments@hingecraft-global.ai';
    }
    // Default to marketing account
    return 'marketingecraft@gmail.com';
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
  async getMessage(email, messageId) {
    try {
      const accountEmail = this.getAccountForEmail(email);
      const account = this.accounts[accountEmail];
      
      if (!account.gmail) {
        throw new Error(`Account ${accountEmail} not initialized`);
      }

      const response = await account.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      });

      return response.data;
    } catch (error) {
      logger.error(`Error getting message ${messageId} from ${email}:`, error.message);
      return null;
    }
  }
}

module.exports = new GmailMultiAccountService();
