# 🔐 Google Service Account Setup

## ✅ Service Account Created

The Google Service Account has been created and configured for the automation system.

### **Service Account Details**

- **Project ID:** `automations-ml`
- **Service Account Email:** `hingecraft-hubspot-automation@automations-ml.iam.gserviceaccount.com`
- **Client ID:** `108403251952981394066`
- **JSON File Location:** `google-apps-script/google-service-account.json`

---

## 📋 Setup Steps

### Step 1: Grant Drive Access ✅

1. Go to Google Drive folder: `HubSpot_Leads_Input`
2. Folder ID: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
3. Click **"Share"**
4. Add email: `hingecraft-hubspot-automation@automations-ml.iam.gserviceaccount.com`
5. Grant **"Viewer"** access (read-only is sufficient)
6. Click **"Send"**

**Status:** ⬜ Not Started | ✅ Complete

---

### Step 2: Verify API Access

The following APIs should be enabled in Google Cloud Console:

- ✅ **Google Drive API** - For reading files
- ✅ **Gmail API** - For sending emails
- ✅ **Google Sheets API** - For parsing spreadsheets

**Status:** ⬜ Not Started | ✅ Complete

---

### Step 3: Store in Script Properties (Optional)

If you need to use the service account JSON in Google Apps Script:

1. Go to Google Apps Script editor
2. Project Settings → Script Properties
3. Add property:
   - **Key:** `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value:** Copy entire JSON content from `google-service-account.json`

**Note:** For the current implementation, the service account is used implicitly by Google Apps Script when accessing Drive files. No explicit storage needed.

---

## 🔒 Security Notes

1. **Keep JSON Secure:** The service account JSON provides access to your Google Drive
2. **Read-Only Access:** Service account only needs "Viewer" access to Drive folder
3. **No Public Sharing:** Don't commit the JSON file to public repositories
4. **Rotate if Compromised:** If the key is exposed, create a new service account

---

## ✅ Verification

Test that the service account can access the Drive folder:

1. The Google Apps Script `checkFolderForNewFiles()` function should be able to:
   - Access the monitored folder
   - List files in the folder
   - Read file contents

2. If you get permission errors:
   - Verify the service account email has access to the folder
   - Check that the folder ID is correct
   - Ensure Google Drive API is enabled

---

**Status:** ✅ Service Account JSON saved and ready
