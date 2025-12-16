# Apps Script Execution Logs Diagnosis Guide

## How to Check Execution Logs

1. Go to: https://script.google.com
2. Open your project
3. Click "Executions" tab
4. Find latest execution of checkFolderForNewFiles
5. Review logs for errors

## Common Errors


### 1. No item with the given ID could be found

**Cause:** MONITORED_FOLDER_ID is incorrect or folder doesn't exist

**Solution:** Verify MONITORED_FOLDER_ID in Script Properties matches actual Drive folder ID


### 2. API key invalid

**Cause:** HUBSPOT_TOKEN or ANYMAIL_API_KEY is incorrect

**Solution:** Verify API keys in Script Properties are correct and active


### 3. Gmail permission denied

**Cause:** Gmail API not authorized

**Solution:** Re-authorize Gmail in Apps Script: Run → Review permissions


### 4. Function not found

**Cause:** Code not deployed or function name changed

**Solution:** Run clasp push to deploy latest code


### 5. Exception: Rate limit exceeded

**Cause:** Too many API calls too quickly

**Solution:** Add delays between API calls or reduce batch size


### 6. Exception: Invalid email address

**Cause:** Email format is invalid

**Solution:** Check email addresses in source file are valid


### 7. Exception: Contact already exists

**Cause:** Contact already in HubSpot

**Solution:** This is normal - system should update existing contact


## Success Indicators

- "File processed: X leads"
- "Contact created/updated in HubSpot"
- "Email sent successfully"
- "Sequence initialized"

## Failure Indicators

- "Exception:" messages
- "Error:" or "Failed:" messages
- API status codes: 400, 401, 403, 404, 500
- "Permission denied" messages
