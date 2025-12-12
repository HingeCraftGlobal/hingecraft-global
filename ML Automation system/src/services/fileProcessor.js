/**
 * Universal File Processor
 * Handles all spreadsheet file types that can arrive in Google Drive
 * Supports: .xlsx, .xls, .xlsm, .csv, .tsv, .txt, .ods, .tab, and more
 */

const XLSX = require('xlsx');
const csv = require('csv-parse/sync');
const logger = require('../utils/logger');

class FileProcessor {
  constructor() {
    // Supported file extensions
    this.supportedExtensions = [
      // Excel formats
      '.xlsx', '.xls', '.xlsm', '.xltx', '.xltm',
      // Text-based formats
      '.csv', '.tsv', '.txt', '.tab',
      // OpenDocument
      '.ods',
      // Google Sheets (handled separately)
      '.gsheet'
    ];

    // MIME type mappings
    this.mimeTypeMap = {
      // Excel
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsm',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'xltx',
      'application/vnd.ms-excel.template.macroEnabled.12': 'xltm',
      // Google Sheets
      'application/vnd.google-apps.spreadsheet': 'gsheet',
      // CSV
      'text/csv': 'csv',
      'application/csv': 'csv',
      // TSV
      'text/tab-separated-values': 'tsv',
      'text/tsv': 'tsv',
      // Text
      'text/plain': 'txt',
      // OpenDocument
      'application/vnd.oasis.opendocument.spreadsheet': 'ods'
    };
  }

  /**
   * Detect file type from filename or MIME type
   */
  detectFileType(filename, mimeType) {
    // First try file extension (more specific)
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (extension && this.supportedExtensions.includes(extension)) {
      return extension.substring(1); // Remove the dot
    }

    // Then try MIME type
    if (mimeType && this.mimeTypeMap[mimeType]) {
      return this.mimeTypeMap[mimeType];
    }

    // For .tab files with text/plain, return 'tab'
    if (extension === '.tab' && mimeType && mimeType.startsWith('text/')) {
      return 'tab';
    }

    // Default to CSV for unknown text files
    if (mimeType && mimeType.startsWith('text/')) {
      return 'csv';
    }

    return null;
  }

  /**
   * Check if file type is supported
   */
  isSupported(filename, mimeType) {
    const fileType = this.detectFileType(filename, mimeType);
    return fileType !== null;
  }

  /**
   * Process Excel file (.xlsx, .xls, .xlsm)
   */
  processExcel(buffer, filename) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', // Default value for empty cells
        raw: false // Convert dates and numbers to strings
      });

      if (jsonData.length === 0) {
        return { headers: [], rows: [], totalRows: 0 };
      }

      const headers = Object.keys(jsonData[0]);
      const rows = jsonData.map((row, index) => ({
        rowNumber: index + 2, // +2 for header row
        data: row
      }));

      logger.info(`Processed Excel file: ${jsonData.length} rows, ${headers.length} columns`);
      
      return {
        headers,
        rows,
        totalRows: rows.length,
        sheetName: sheetName
      };
    } catch (error) {
      logger.error('Error processing Excel file:', error);
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  /**
   * Process CSV file
   */
  processCSV(buffer, filename, delimiter = ',') {
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

      const headers = Object.keys(records[0]);
      const rows = records.map((row, index) => ({
        rowNumber: index + 2,
        data: row
      }));

      logger.info(`Processed CSV file: ${records.length} rows, ${headers.length} columns`);
      
      return {
        headers,
        rows,
        totalRows: rows.length
      };
    } catch (error) {
      logger.error('Error processing CSV file:', error);
      throw new Error(`Failed to process CSV file: ${error.message}`);
    }
  }

  /**
   * Process TSV file (Tab-Separated Values)
   */
  processTSV(buffer, filename) {
    return this.processCSV(buffer, filename, '\t');
  }

  /**
   * Process TAB file (Tab-delimited)
   */
  processTAB(buffer, filename) {
    return this.processTSV(buffer, filename);
  }

  /**
   * Process TXT file (try to detect delimiter)
   */
  processTXT(buffer, filename) {
    try {
      const text = buffer.toString('utf8');
      const firstLine = text.split('\n')[0];
      
      // Detect delimiter
      let delimiter = ',';
      if (firstLine.includes('\t')) {
        delimiter = '\t';
      } else if (firstLine.includes('|')) {
        delimiter = '|';
      } else if (firstLine.includes(';')) {
        delimiter = ';';
      }

      logger.info(`Detected delimiter for TXT file: ${delimiter === '\t' ? 'TAB' : delimiter}`);
      return this.processCSV(buffer, filename, delimiter);
    } catch (error) {
      logger.error('Error processing TXT file:', error);
      throw new Error(`Failed to process TXT file: ${error.message}`);
    }
  }

  /**
   * Process ODS file (OpenDocument Spreadsheet)
   */
  processODS(buffer, filename) {
    try {
      // xlsx library can read ODS files
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '',
        raw: false
      });

      if (jsonData.length === 0) {
        return { headers: [], rows: [], totalRows: 0 };
      }

      const headers = Object.keys(jsonData[0]);
      const rows = jsonData.map((row, index) => ({
        rowNumber: index + 2,
        data: row
      }));

      logger.info(`Processed ODS file: ${jsonData.length} rows`);
      
      return {
        headers,
        rows,
        totalRows: rows.length,
        sheetName: sheetName
      };
    } catch (error) {
      logger.error('Error processing ODS file:', error);
      throw new Error(`Failed to process ODS file: ${error.message}`);
    }
  }

  /**
   * Universal file processor - routes to appropriate handler
   */
  async processFile(buffer, filename, mimeType) {
    try {
      const fileType = this.detectFileType(filename, mimeType);
      
      if (!fileType) {
        throw new Error(`Unsupported file type: ${filename} (${mimeType})`);
      }

      logger.info(`Processing file: ${filename} as ${fileType.toUpperCase()}`);

      switch (fileType) {
        case 'xlsx':
        case 'xls':
        case 'xlsm':
        case 'xltx':
        case 'xltm':
          return this.processExcel(buffer, filename);

        case 'csv':
          return this.processCSV(buffer, filename);

        case 'tsv':
          return this.processTSV(buffer, filename);

        case 'tab':
          return this.processTAB(buffer, filename);

        case 'txt':
          return this.processTXT(buffer, filename);

        case 'ods':
          return this.processODS(buffer, filename);

        default:
          throw new Error(`File type ${fileType} not yet implemented`);
      }
    } catch (error) {
      logger.error(`Error processing file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Get list of supported file types
   */
  getSupportedTypes() {
    return {
      extensions: this.supportedExtensions,
      mimeTypes: Object.keys(this.mimeTypeMap),
      descriptions: {
        'xlsx': 'Excel 2007+ (Open XML)',
        'xls': 'Excel 97-2003',
        'xlsm': 'Excel Macro-Enabled',
        'xltx': 'Excel Template',
        'xltm': 'Excel Macro Template',
        'csv': 'Comma-Separated Values',
        'tsv': 'Tab-Separated Values',
        'txt': 'Text File (auto-detect delimiter)',
        'tab': 'Tab-Delimited',
        'ods': 'OpenDocument Spreadsheet',
        'gsheet': 'Google Sheets'
      }
    };
  }
}

module.exports = new FileProcessor();





