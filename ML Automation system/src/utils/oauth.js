/**
 * OAuth Token Management
 * Handles OAuth token storage, refresh, and management
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const config = require('../../config/api_keys');
const logger = require('./logger');

const TOKEN_FILE = path.join(__dirname, '../../tokens.json');

class OAuthManager {
  constructor() {
    this.oauth2Client = null;
    this.tokens = null;
  }

  /**
   * Initialize OAuth2 client
   */
  initialize() {
    // Use environment variable for redirect URI, or default to external port
    const redirectUri = process.env.OAUTH_REDIRECT_URI || 
                       process.env.REDIRECT_URI || 
                       'http://localhost:7101/oauth2callback';
    
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      redirectUri
    );

    // Load existing tokens
    this.loadTokens();
    
    // Set tokens if available
    if (this.tokens) {
      this.oauth2Client.setCredentials(this.tokens);
    }

    return this.oauth2Client;
  }

  /**
   * Get authorization URL
   */
  getAuthUrl() {
    if (!this.oauth2Client) {
      this.initialize();
    }

    // Get redirect URI from environment or use default
    const redirectUri = process.env.OAUTH_REDIRECT_URI || 
                       process.env.REDIRECT_URI || 
                       'http://localhost:7101/oauth2callback';

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.google.scopes,
      prompt: 'consent',
      redirect_uri: redirectUri // Explicitly include redirect_uri
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code) {
    try {
      if (!this.oauth2Client) {
        this.initialize();
      }

      const { tokens } = await this.oauth2Client.getToken(code);
      this.tokens = tokens;
      this.oauth2Client.setCredentials(tokens);
      
      // Save tokens
      this.saveTokens(tokens);
      
      logger.info('OAuth tokens obtained and saved');
      return tokens;
    } catch (error) {
      logger.error('Error getting tokens:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      if (!this.oauth2Client) {
        this.initialize();
      }

      if (!this.tokens || !this.tokens.refresh_token) {
        throw new Error('No refresh token available');
      }

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.tokens = {
        ...this.tokens,
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date
      };

      this.saveTokens(this.tokens);
      this.oauth2Client.setCredentials(this.tokens);

      logger.info('Access token refreshed');
      return this.tokens;
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh() {
    if (!this.tokens || !this.tokens.expiry_date) {
      return true;
    }

    // Refresh if expires in less than 5 minutes
    return Date.now() >= (this.tokens.expiry_date - 5 * 60 * 1000);
  }

  /**
   * Get valid OAuth client (auto-refresh if needed)
   */
  async getValidClient() {
    if (!this.oauth2Client) {
      this.initialize();
    }

    if (this.needsRefresh()) {
      await this.refreshToken();
    }

    return this.oauth2Client;
  }

  /**
   * Load tokens from file
   */
  loadTokens() {
    try {
      if (fs.existsSync(TOKEN_FILE)) {
        const data = fs.readFileSync(TOKEN_FILE, 'utf8');
        this.tokens = JSON.parse(data);
        logger.info('Tokens loaded from file');
      }
    } catch (error) {
      logger.warn('Could not load tokens:', error.message);
      this.tokens = null;
    }
  }

  /**
   * Save tokens to file
   */
  saveTokens(tokens) {
    try {
      fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
      logger.info('Tokens saved to file');
    } catch (error) {
      logger.error('Error saving tokens:', error);
    }
  }

  /**
   * Clear tokens
   */
  clearTokens() {
    this.tokens = null;
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }
    logger.info('Tokens cleared');
  }

  /**
   * Check if tokens exist
   */
  hasTokens() {
    return !!this.tokens && !!this.tokens.access_token;
  }
}

module.exports = new OAuthManager();
