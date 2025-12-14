/**
 * Drive Trigger Fix - Enhanced File Detection
 * 
 * This file contains improved functions for detecting and processing
 * new files from Google Drive, addressing the Drive-to-Scripts issue.
 */

/**
 * Enhanced checkFolderForNewFiles with better error handling
 * This is the PRIMARY trigger - set up as Time-Driven (every 5 minutes)
 */
function checkFolderForNewFiles() {
  try {
    const CONFIG = getConfig();
    Logger.log('🔍 [Drive Trigger] Checking folder for new files...');
    Logger.log(`📁 Folder ID: ${CONFIG.MONITORED_FOLDER_ID}`);
    
    // Get folder
    let folder;
    try {
      folder = DriveApp.getFolderById(CONFIG.MONITORED_FOLDER_ID);
    } catch (e) {
      Logger.log(`❌ Error accessing folder: ${e.toString()}`);
      Logger.log(`   Make sure folder ID is correct and script has access`);
      return;
    }
    
    Logger.log(`✅ Folder found: ${folder.getName()}`);
    
    // Get all files
    const files = folder.getFiles();
    const processedFileIds = getProcessedFileIds();
    
    let newFilesFound = 0;
    let processedCount = 0;
    
    // Process each file
    while (files.hasNext()) {
      try {
        const file = files.next();
        const fileId = file.getId();
        const fileName = file.getName();
        const mimeType = file.getMimeType();
        
        // Check if already processed
        if (processedFileIds.includes(fileId)) {
          Logger.log(`⏭️  Skipping already processed: ${fileName}`);
          continue;
        }
        
        // Check file type (only process CSV and Sheets)
        if (!isSupportedFileType(mimeType)) {
          Logger.log(`⚠️  Unsupported file type: ${fileName} (${mimeType})`);
          markFileAsProcessed(fileId); // Mark as processed to skip in future
          continue;
        }
        
        Logger.log(`📄 New file detected: ${fileName} (${fileId})`);
        Logger.log(`   Type: ${mimeType}`);
        
        // Process the file
        const result = processDriveFile(fileId, fileName, mimeType);
        
        if (result && result.success) {
          markFileAsProcessed(fileId);
          newFilesFound++;
          Logger.log(`✅ Successfully processed: ${fileName}`);
        } else {
          Logger.log(`⚠️  Processing incomplete for: ${fileName}`);
        }
        
        processedCount++;
        
        // Limit processing per run to avoid timeout
        if (processedCount >= 10) {
          Logger.log(`⚠️  Reached processing limit (10 files). Remaining files will be processed in next run.`);
          break;
        }
        
      } catch (fileError) {
        Logger.log(`❌ Error processing file: ${fileError.toString()}`);
        continue; // Continue with next file
      }
    }
    
    // Summary
    if (newFilesFound === 0) {
      Logger.log('✅ No new files found');
    } else {
      Logger.log(`✅ Processing complete: ${newFilesFound} new file(s) processed`);
    }
    
  } catch (error) {
    Logger.log(`❌ Error in checkFolderForNewFiles: ${error.toString()}`);
    Logger.log(`Stack: ${error.stack || 'No stack trace'}`);
    
    // Try to send error notification
    try {
      sendErrorNotification(error);
    } catch (e) {
      Logger.log(`Could not send error notification: ${e.toString()}`);
    }
  }
}

/**
 * Check if file type is supported
 */
function isSupportedFileType(mimeType) {
  const supportedTypes = [
    'application/vnd.google-apps.spreadsheet', // Google Sheets
    'text/csv',                                // CSV files
    'application/vnd.ms-excel',                // Excel files
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // Excel .xlsx
  ];
  
  return supportedTypes.includes(mimeType) || mimeType.includes('csv') || mimeType.includes('spreadsheet');
}

/**
 * Enhanced readDriveFile with better error handling
 */
function readDriveFileEnhanced(fileId, mimeType) {
  try {
    Logger.log(`📖 Reading file: ${fileId} (${mimeType})`);
    
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      // Google Sheet
      try {
        const spreadsheet = SpreadsheetApp.openById(fileId);
        const sheet = spreadsheet.getActiveSheet();
        const data = sheet.getDataRange().getValues();
        
        if (data.length < 2) {
          Logger.log('⚠️  Sheet has no data rows (only headers or empty)');
          return [];
        }
        
        const headers = data[0];
        Logger.log(`📊 Found ${data.length - 1} data rows with ${headers.length} columns`);
        
        return data.slice(1).map((row, index) => {
          const obj = {};
          headers.forEach((header, colIndex) => {
            obj[header] = row[colIndex] || '';
          });
          return obj;
        });
        
      } catch (e) {
        Logger.log(`❌ Error reading Google Sheet: ${e.toString()}`);
        return [];
      }
      
    } else if (mimeType === 'text/csv' || mimeType.includes('csv')) {
      // CSV file
      try {
        const file = DriveApp.getFileById(fileId);
        const content = file.getBlob().getDataAsString();
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          Logger.log('⚠️  CSV has no data rows');
          return [];
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        Logger.log(`📊 Found ${lines.length - 1} data rows with ${headers.length} columns`);
        
        return lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, colIndex) => {
            obj[header] = values[colIndex] || '';
          });
          return obj;
        });
        
      } catch (e) {
        Logger.log(`❌ Error reading CSV: ${e.toString()}`);
        return [];
      }
    }
    
    Logger.log(`⚠️  Unsupported file type: ${mimeType}`);
    return [];
    
  } catch (error) {
    Logger.log(`❌ Error in readDriveFileEnhanced: ${error.toString()}`);
    return [];
  }
}

/**
 * Test function to verify Drive access
 */
function testDriveAccess() {
  try {
    const CONFIG = getConfig();
    Logger.log('🧪 Testing Drive Access...');
    
    const folder = DriveApp.getFolderById(CONFIG.MONITORED_FOLDER_ID);
    Logger.log(`✅ Folder accessible: ${folder.getName()}`);
    
    const files = folder.getFiles();
    let count = 0;
    while (files.hasNext() && count < 5) {
      const file = files.next();
      Logger.log(`   - ${file.getName()} (${file.getMimeType()})`);
      count++;
    }
    
    Logger.log(`✅ Drive access test successful`);
    return true;
    
  } catch (error) {
    Logger.log(`❌ Drive access test failed: ${error.toString()}`);
    return false;
  }
}
