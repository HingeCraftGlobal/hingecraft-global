/**
 * Google Drive Integration Service
 * Handles file scanning, reading, and monitoring from Google Drive
 */

const { google } = require('googleapis');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.sheets = null;
    this.folderId = config.google.driveFolderId;
  }

  /**
   * Initialize Google OAuth2 client
   */
  async initialize() {
    try {
      const oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        'http://localhost:3001/oauth2callback' // Redirect URI
      );

      // For service account or refresh token flow
      // You'll need to implement token refresh logic here
      // For now, this is a placeholder that needs OAuth flow completion
      
      this.auth = oauth2Client;
      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      this.sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      
      logger.info('Google Drive service initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Google Drive service:', error);
      throw error;
    }
  }

  /**
   * Set OAuth2 credentials (after OAuth flow)
   */
  setCredentials(credentials) {
    if (this.auth) {
      this.auth.setCredentials(credentials);
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      logger.info('Google Drive credentials updated');
    } else {
      this.initialize().then(() => {
        this.setCredentials(credentials);
      });
    }
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl() {
    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      'http://localhost:3001/oauth2callback'
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.google.scopes,
      prompt: 'consent'
    });
  }

  /**
   * Scan folder for new files
   */
  async scanFolder(folderId = null) {
    try {
      const targetFolderId = folderId || this.folderId;
      
      const response = await this.drive.files.list({
        q: `'${targetFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
        orderBy: 'modifiedTime desc'
      });

      const files = response.data.files || [];
      logger.info(`Found ${files.length} files in folder ${targetFolderId}`);
      
      return files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime
      }));
    } catch (error) {
      logger.error('Error scanning folder:', error);
      throw error;
    }
  }

  /**
   * Read Google Sheet file
   */
  async readSheet(fileId, range = 'Sheet1') {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: fileId,
        range: range
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        return { headers: [], rows: [] };
      }

      const headers = rows[0];
      const dataRows = rows.slice(1).map((row, index) => {
        const rowObj = {};
        headers.forEach((header, colIndex) => {
          rowObj[header] = row[colIndex] || '';
        });
        return {
          rowNumber: index + 2, // +2 because index starts at 0 and we skipped header
          data: rowObj
        };
      });

      return {
        headers,
        rows: dataRows,
        totalRows: dataRows.length
      };
    } catch (error) {
      logger.error(`Error reading sheet ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Download CSV file
   */
  async downloadFile(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error) {
      logger.error(`Error downloading file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, createdTime, modifiedTime, size, webViewLink'
      });

      return response.data;
    } catch (error) {
      logger.error(`Error getting file metadata ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Watch folder for changes (sets up webhook)
   */
  async watchFolder(folderId, webhookUrl) {
    try {
      const response = await this.drive.files.watch({
        fileId: folderId,
        requestBody: {
          id: `webhook-${Date.now()}`,
          type: 'web_hook',
          address: webhookUrl
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error setting up folder watch:', error);
      throw error;
    }
  }

  /**
   * Process file based on MIME type
   */
  async processFile(fileId) {
    try {
      const metadata = await this.getFileMetadata(fileId);
      
      if (metadata.mimeType === 'application/vnd.google-apps.spreadsheet') {
        // Google Sheet
        return await this.readSheet(fileId);
      } else if (metadata.mimeType === 'text/csv' || metadata.name.endsWith('.csv')) {
        // CSV file - download and parse
        const buffer = await this.downloadFile(fileId);
        const csv = require('csv-parse/sync');
        const records = csv.parse(buffer.toString(), {
          columns: true,
          skip_empty_lines: true
        });
        
        return {
          headers: Object.keys(records[0] || {}),
          rows: records.map((row, index) => ({
            rowNumber: index + 2,
            data: row
          })),
          totalRows: records.length
        };
      } else {
        throw new Error(`Unsupported file type: ${metadata.mimeType}`);
      }
    } catch (error) {
      logger.error(`Error processing file ${fileId}:`, error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();
