# 🔧 Drive Trigger Fix - Complete Solution

## Issue
The Drive-to-Scripts integration was not working properly. Files added to the monitored Drive folder were not being detected or processed.

## Solution
Enhanced the `checkFolderForNewFiles` function with:
1. ✅ Better error handling for folder access
2. ✅ File type validation (only process CSV/Sheets)
3. ✅ Processing limits to avoid timeouts
4. ✅ Enhanced logging for debugging
5. ✅ Skip already processed files

## Changes Made

### 1. Enhanced checkFolderForNewFiles
- Added folder access error handling
- Added file type checking
- Added processing limits (10 files per run)
- Better logging

### 2. Added isSupportedFileType Function
Checks if file type is supported:
- Google Sheets (`application/vnd.google-apps.spreadsheet`)
- CSV files (`text/csv`)
- Excel files (`.xlsx`, `.xls`)

### 3. Enhanced Error Handling
- Catches folder access errors
- Continues processing if one file fails
- Logs detailed error messages

## Setup

### Step 1: Set Up Time-Driven Trigger
1. Go to Google Apps Script editor
2. Click "Triggers" (clock icon)
3. Add trigger:
   - **Function:** `checkFolderForNewFiles`
   - **Event source:** `Time-driven`
   - **Type:** `Minutes timer`
   - **Interval:** `Every 5 minutes`

### Step 2: Test Drive Access
Run this function in Apps Script editor:
```javascript
function testDriveAccess() {
  const CONFIG = getConfig();
  const folder = DriveApp.getFolderById(CONFIG.MONITORED_FOLDER_ID);
  Logger.log('Folder: ' + folder.getName());
  
  const files = folder.getFiles();
  let count = 0;
  while (files.hasNext() && count < 5) {
    const file = files.next();
    Logger.log(file.getName() + ' (' + file.getMimeType() + ')');
    count++;
  }
}
```

### Step 3: Verify Folder Permissions
1. Make sure the script has access to the Drive folder
2. Folder ID: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
3. The script needs "View" permission on the folder

## Testing

1. **Add a test file** to the monitored Drive folder
2. **Wait 5 minutes** (or manually run `checkFolderForNewFiles`)
3. **Check execution logs** in Apps Script editor
4. **Verify** file appears in HubSpot

## Troubleshooting

### Error: "Cannot access folder"
- **Fix:** Verify folder ID is correct
- **Fix:** Make sure script has access to folder
- **Fix:** Check Script Properties for `MONITORED_FOLDER_ID`

### Error: "Unsupported file type"
- **Fix:** Only CSV and Google Sheets are supported
- **Fix:** Convert file to CSV or Google Sheet format

### Files not being processed
- **Check:** Execution logs for errors
- **Check:** Trigger is set up correctly
- **Check:** File hasn't already been processed (check `processed_file_ids` property)

---

**Status:** ✅ Fixed and ready for testing
