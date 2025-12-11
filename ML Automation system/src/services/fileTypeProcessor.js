/**
 * Universal File Type Processor
 * Handles all spreadsheet file types that can arrive in Google Drive
 */

const XLSX = require('xlsx');
const csv = require('csv-parse/sync');
const logger = require('../utils/logger');

class FileTypeProcessor {
  constructor() {
    // Supported file types and their MIME types
    this.supportedTypes = {
      // Google Sheets
      'application/vnd.google-apps.spreadsheet': 'google_sheet',
      'application/vnd.google-apps.file': 'google_sheet',
      
      // Microsoft Excel
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx', // .xlsx
      'application/vnd.ms-excel': 'xls', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsm', // .xlsm
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'xltx', // .xltx
      'application/vnd.ms-excel.template.macroEnabled.12': 'xltm', // .xltm
      
      // OpenDocument
      'application/vnd.oasis.opendocument.spreadsheet': 'ods', // .ods
      
      // Text-based formats
      'text/csv': 'csv',
      'text/tab-separated-values': 'tsv',
      'text/plain': 'txt',
      'text/txt': 'txt',
      
      // Other
      'application/csv': 'csv',
      'application/x-csv': 'csv'
    };

    // File extensions mapping
    this.extensionMap = {
      '.gsheet': 'google_sheet',
      '.xlsx': 'xlsx',
      '.xls': 'xls',
      '.xlsm': 'xlsm',
      '.xltx': 'xltx',
      '.xltm': 'xltm',
      '.ods': 'ods',
      '.csv': 'csv',
      '.tsv': 'tsv',
      '.tab': 'tsv',
      '.txt': 'txt'
    };
  }

  /**
   * Detect file type from MIME type or extension
   */
  detectFileType(mimeType, filename) {
    // Try MIME type first
    if (mimeType && this.supportedTypes[mimeType]) {
      return this.supportedTypes[mimeType];
    }

    // Fall back to extension
    if (filename) {
      const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      if (this.extensionMap[ext]) {
        return this.extensionMap[ext];
      }
    }

    // Default to CSV for unknown types
    logger.warn(`Unknown file type: ${mimeType || 'unknown'}, defaulting to CSV`);
    return 'csv';
  }

  /**
   * Check if file type is supported
   */
  isSupported(mimeType, filename) {
    const fileType = this.detectFileType(mimeType, filename);
    return fileType !== null;
  }

  /**
   * Process Excel file (.xlsx, .xls, .xlsm)
   */
  processExcel(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        return { headers: [], rows: [], totalRows: 0 };
      }

      const headers = jsonData[0];
      const dataRows = jsonData.slice(1).map((row, index) => {
        const rowObj = {};
        headers.forEach((header, colIndex) => {
          rowObj[header] = row[colIndex] || '';
        });
        return {
          rowNumber: index + 2,
          data: rowObj
        };
      });

      return {
        headers,
        rows: dataRows,
        totalRows: dataRows.length
      };
    } catch (error) {
      logger.error('Error processing Excel file:', error);
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  /**
   * Process CSV file
   */
  processCSV(buffer, delimiter = ',') {
    try {
      const text = buffer.toString('utf8');
      const records = csv.parse(text, {
        columns: true,
        skip_empty_lines: true,
        delimiter: delimiter,
        relax_column_count: true,
        trim: true
      });

      if (records.length === 0) {
        return { headers: [], rows: [], totalRows: 0 };
      }

      return {
        headers: Object.keys(records[0] || {}),
        rows: records.map((row, index) => ({
          rowNumber: index + 2,
          data: row
        })),
        totalRows: records.length
      };
    } catch (error) {
      logger.error('Error processing CSV file:', error);
      throw new Error(`Failed to process CSV file: ${error.message}`);
    }
  }

  /**
   * Process TSV (Tab-Separated Values) file
   */
  processTSV(buffer) {
    return this.processCSV(buffer, '\t');
  }

  /**
   * Process ODS (OpenDocument Spreadsheet) file
   */
  processODS(buffer) {
    try {
      // ODS files can be processed similar to Excel
      // xlsx library can handle ODS with proper configuration
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        return { headers: [], rows: [], totalRows: 0 };
      }

      const headers = jsonData[0];
      const dataRows = jsonData.slice(1).map((row, index) => {
        const rowObj = {};
        headers.forEach((header, colIndex) => {
          rowObj[header] = row[colIndex] || '';
        });
        return {
          rowNumber: index + 2,
          data: rowObj
        };
      });

      return {
        headers,
        rows: dataRows,
        totalRows: dataRows.length
      };
    } catch (error) {
      logger.error('Error processing ODS file:', error);
      throw new Error(`Failed to process ODS file: ${error.message}`);
    }
  }

  /**
   * Process text file (attempts to auto-detect delimiter)
   */
  processText(buffer) {
    try {
      const text = buffer.toString('utf8');
      const firstLine = text.split('\n')[0];
      
      // Auto-detect delimiter
      let delimiter = ',';
      if (firstLine.includes('\t')) {
        delimiter = '\t';
      } else if (firstLine.includes(';')) {
        delimiter = ';';
      } else if (firstLine.includes('|')) {
        delimiter = '|';
      }
      
      logger.info(`Auto-detected delimiter for text file: ${delimiter === '\t' ? 'TAB' : delimiter}`);
      return this.processCSV(buffer, delimiter);
    } catch (error) {
      logger.error('Error processing text file:', error);
      throw new Error(`Failed to process text file: ${error.message}`);
    }
  }

  /**
   * Universal file processor - handles all file types
   */
  async processFile(buffer, mimeType, filename) {
    const fileType = this.detectFileType(mimeType, filename);
    
    logger.info(`Processing file: ${filename} as type: ${fileType}`);

    switch (fileType) {
      case 'google_sheet':
        // Should be handled by Google Sheets API, not here
        throw new Error('Google Sheets should be processed via Google Sheets API');
      
      case 'xlsx':
      case 'xls':
      case 'xlsm':
      case 'xltx':
      case 'xltm':
        return this.processExcel(buffer);
      
      case 'ods':
        return this.processODS(buffer);
      
      case 'csv':
        return this.processCSV(buffer, ',');
      
      case 'tsv':
        return this.processTSV(buffer);
      
      case 'txt':
        return this.processText(buffer);
      
      default:
        // Try CSV as fallback
        logger.warn(`Unknown file type ${fileType}, attempting CSV parsing`);
        return this.processCSV(buffer);
    }
  }

  /**
   * Get list of all supported file types
   */
  getSupportedTypes() {
    return {
      extensions: Object.keys(this.extensionMap),
      mimeTypes: Object.keys(this.supportedTypes),
      descriptions: {
        'Google Sheets': ['.gsheet'],
        'Microsoft Excel': ['.xlsx', '.xls', '.xlsm', '.xltx', '.xltm'],
        'OpenDocument': ['.ods'],
        'CSV': ['.csv'],
        'TSV': ['.tsv', '.tab'],
        'Text': ['.txt']
      }
    };
  }
}

module.exports = new FileTypeProcessor();
