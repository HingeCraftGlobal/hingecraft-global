/**
 * Google Drive Integration Service
 * Handles file scanning, reading, and monitoring from Google Drive
 */

const { google } = require('googleapis');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const fileProcessor = require('./fileProcessor');
const fileTypeProcessor = require('./fileTypeProcessor');

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
      const redirectUri = process.env.OAUTH_REDIRECT_URI || 
                         process.env.REDIRECT_URI || 
                         'http://localhost:7101/oauth2callback';
      
      const oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        redirectUri
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
    const redirectUri = process.env.OAUTH_REDIRECT_URI || 
                       process.env.REDIRECT_URI || 
                       'http://localhost:7101/oauth2callback';
    
    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      redirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.google.scopes,
      prompt: 'consent'
    });
  }

  /**
   * Scan folder for new files (all supported spreadsheet types)
   */
  async scanFolder(folderId = null) {
    try {
      const targetFolderId = folderId || this.folderId;
      
      // Build query to find all supported file types
      const supportedExtensions = [
        '.gsheet', '.xlsx', '.xls', '.xlsm', '.xltx', '.xltm',
        '.ods', '.csv', '.tsv', '.tab', '.txt'
      ];
      
      // Query for spreadsheet MIME types and common extensions
      const mimeTypes = [
        'application/vnd.google-apps.spreadsheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.oasis.opendocument.spreadsheet',
        'text/csv',
        'text/tab-separated-values',
        'text/plain'
      ];
      
      // Build query - find files with supported MIME types or extensions
      const extensionQuery = supportedExtensions.map(ext => `name contains '${ext}'`).join(' or ');
      const mimeQuery = mimeTypes.map(mime => `mimeType='${mime}'`).join(' or ');
      const query = `'${targetFolderId}' in parents and trashed=false and (${mimeQuery} or ${extensionQuery})`;
      
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
        orderBy: 'modifiedTime desc'
      });

      const files = response.data.files || [];
      logger.info(`Found ${files.length} supported spreadsheet files in folder ${targetFolderId}`);
      
      // Filter to only supported files
      const supportedFiles = files.filter(file => {
        const isSupported = fileProcessor.isSupported(file.name, file.mimeType);
        if (!isSupported) {
          logger.warn(`Unsupported file type skipped: ${file.name} (${file.mimeType})`);
        }
        return isSupported;
      });
      
      return supportedFiles.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        size: file.size,
        fileType: fileProcessor.detectFileType(file.name, file.mimeType),
        supported: true
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
   * Process file - supports ALL spreadsheet file types
   */
  async processFile(fileId) {
    try {
      const metadata = await this.getFileMetadata(fileId);
      
      // Check if file type is supported
      if (!fileProcessor.isSupported(metadata.name, metadata.mimeType)) {
        const supported = fileProcessor.getSupportedTypes();
        throw new Error(`Unsupported file type: ${metadata.name} (${metadata.mimeType}). Supported types: ${supported.extensions.join(', ')}`);
      }

      const fileType = fileProcessor.detectFileType(metadata.name, metadata.mimeType);
      logger.info(`Processing file: ${metadata.name} (Type: ${fileType}, MIME: ${metadata.mimeType})`);
      
      // Google Sheets - use Sheets API
      if (metadata.mimeType === 'application/vnd.google-apps.spreadsheet' || fileType === 'gsheet') {
        logger.info(`Processing as Google Sheet: ${metadata.name}`);
        return await this.readSheet(fileId);
      }
      
      // All other file types - download and process
      logger.info(`Downloading file for processing: ${metadata.name}`);
      const buffer = await this.downloadFile(fileId);
      
      // Use universal file processor
      const result = await fileProcessor.processFile(buffer, metadata.name, metadata.mimeType);
      
      logger.info(`Successfully processed ${metadata.name}: ${result.totalRows} rows, ${result.headers.length} columns`);
      return result;
      
    } catch (error) {
      logger.error(`Error processing file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get supported file types information
   */
  getSupportedFileTypes() {
    return fileProcessor.getSupportedTypes();
  }
}

module.exports = new GoogleDriveService();
