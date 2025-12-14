# 📋 Google Apps Script Setup - Complete Guide

## 🎯 Overview

This guide sets up Google Apps Script to automate the entire flow:
**Google Drive → AnyMail → HubSpot → Gmail Send**

**OAuth Status:** ✅ Already enabled and complete for both Google Drive and Gmail

---

## 🔑 Phase 1: Google Environment Setup

### Step 1: Create Monitored Google Drive Folder

1. Go to **Google Drive**
2. Create folder: **"HubSpot_Leads_Input"**
3. Note the **Folder ID** from the URL:
   - URL: `https://drive.google.com/drive/folders/1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
   - Folder ID: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
4. **Share folder** with your Google account (if needed)

---

### Step 2: Set Up Google Apps Script Project

1. Go to **script.google.com**
2. Click **"New Project"**
3. Name it: **"HingeCraft_Automation"**
4. **Copy the entire `Code.gs` file** from:
   - `google-apps-script/Code.gs`
5. **Paste into the Apps Script editor**
6. **Update CONFIG section** with your values:
   ```javascript
   const CONFIG = {
     HUBSPOT_ACCESS_TOKEN: 'pat-...', // Your Private App Token
     HUBSPOT_PORTAL_ID: '244560986',
     ANYMAIL_API_KEY: 'pRUtyDRHSPageC2jHGbnWGpD',
     MONITORED_FOLDER_ID: '1MpKKqjpabi10iDh1vWliaiLQsj8wktiz',
     GMAIL_FROM_ADDRESS: 'marketingecraft@gmail.com'
   };
   ```

---

### Step 3: Enable Required APIs

1. In **Google Apps Script editor**, click **"Services"** (left sidebar)
2. Click **"+ Add a service"**
3. Add these services:
   - **Gmail API** (for sending emails)
   - **Drive API** (for reading files)
   - **Sheets API** (for parsing spreadsheets)

**OR** via Google Cloud Console:

1. Go to **Google Cloud Console** → **APIs & Services** → **Library**
2. Enable:
   - **Gmail API**
   - **Google Drive API**
   - **Google Sheets API**

---

### Step 4: Create Installable Trigger

1. In **Apps Script editor**, click **"Triggers"** (clock icon, left sidebar)
2. Click **"+ Add Trigger"**
3. Configure:
   - **Function to run:** `onNewFileAdded`
   - **Event source:** `From Drive`
   - **Event type:** `On change`
   - **Failure notification settings:** `Notify me immediately`
4. Click **"Save"**
5. **Authorize** the script when prompted (OAuth is already complete)

**Backup Trigger (Time-Driven):**

1. Click **"+ Add Trigger"** again
2. Configure:
   - **Function to run:** `checkFolderForNewFiles`
   - **Event source:** `Time-driven`
   - **Type of time based trigger:** `Minutes timer`
   - **Minute interval:** `Every 5 minutes`
3. Click **"Save"**

---

## 🔒 Phase 2: Security & Credentials

### Step 5: Store HubSpot Access Token

**Option A: In Script Properties (Recommended)**

1. In Apps Script editor, go to **"Project Settings"** (gear icon)
2. Scroll to **"Script Properties"**
3. Click **"Add script property"**
4. Add:
   - **Property:** `HUBSPOT_ACCESS_TOKEN`
   - **Value:** Your Private App token (starts with `pat-`)
5. Click **"Save script properties"**

**Option B: Direct in Code (Less Secure)**

Update the `CONFIG` object in `Code.gs`:
```javascript
HUBSPOT_ACCESS_TOKEN: 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39'
```

---

### Step 6: Store AnyMail API Key

Same as Step 5, add:
- **Property:** `ANYMAIL_API_KEY`
- **Value:** `pRUtyDRHSPageC2jHGbnWGpD`

Or update in `CONFIG` object.

---

## 🧱 Phase 3: HubSpot Database Setup

### Step 7: Verify Properties (Already Automated)

**✅ Properties are auto-pushed!**

Run this to verify:
```bash
node scripts/automate-hubspot-setup.js
```

**Required Properties (Auto-created):**
- Company: `original_sheet_url`, `email_finder_status`
- Contact: `anymail_source_type`, `send_email_ready`, `original_sheet_data_segment_*`, `last_contact_sent_date`

---

### Step 8: Verify Lists (Already Automated)

**✅ Lists are auto-created!**

The automated script creates:
- **"Ready to Send"** - Active list for contacts ready to email
- **"New Google Drive Leads"** - All leads from Drive
- **"Enriched Leads"** - Leads enriched with AnyMail
- Plus 7 more lists

---

## 📧 Phase 4: Gmail Template Setup (NOT NEEDED)

**✅ Templates are in Database, NOT Gmail!**

The system uses templates from your database (`sequence_steps` table), NOT Gmail drafts.

**No Gmail draft creation needed!**

---

## 🚀 Phase 5: Test the Automation

### Test File Upload

1. **Upload a CSV file** to the monitored Drive folder
2. **Check Apps Script execution log:**
   - Apps Script → **"Executions"** (left sidebar)
   - Should show `onNewFileAdded` or `checkFolderForNewFiles` running
3. **Check HubSpot:**
   - Go to **Contacts**
   - Should see new contacts created
   - Check **"Ready to Send"** list - should populate
4. **Check email sending:**
   - The script automatically sends emails via Gmail
   - Check Gmail sent folder for `marketingecraft@gmail.com`

---

## ✅ Verification Checklist

- [ ] Google Apps Script project created
- [ ] `Code.gs` pasted with all templates
- [ ] CONFIG updated with your values
- [ ] Gmail API enabled
- [ ] Drive API enabled
- [ ] Sheets API enabled
- [ ] Installable trigger created (`onNewFileAdded`)
- [ ] Time-driven trigger created (`checkFolderForNewFiles`)
- [ ] HubSpot Access Token stored
- [ ] AnyMail API Key stored
- [ ] Monitored folder ID set
- [ ] OAuth authorized (already complete)
- [ ] Test file uploaded
- [ ] Contacts appear in HubSpot
- [ ] Emails sent via Gmail

---

## 📊 Email Templates Loaded

### Set One: Student Movement (5 emails)
- Step 1: Welcome to the Movement
- Step 2: Here's What You Just Joined
- Step 3: Follow the Journey
- Step 4: Your First Action Step
- Step 5: Become a Recognized Member

### Set Two: Referral Email (1 email)
- Step 1: A New $1 Student Pass Just Launched

### Set Three: B2B Partnerships (5 emails)
- Step 1: Introducing Hingecraft
- Step 2: The $1 Abundance Pass
- Step 3: How Hingecraft Approaches AI
- Step 4: Why Local Participation Matters
- Step 5: Supporting Access (Optional)

**Total: 11 email templates** (all from database)

---

## 🔄 Complete Automated Flow

1. **File Uploaded** → Google Drive folder
2. **Trigger Fires** → `onNewFileAdded` or `checkFolderForNewFiles`
3. **File Read** → Apps Script reads CSV/Sheet
4. **Segmentation** → Extracts Company URL and data
5. **AnyMail Enrichment** → Calls AnyMail API with webhook
6. **HubSpot Sync** → Creates/updates contacts and companies
7. **List Population** → HubSpot workflows add to lists
8. **Email Sending** → Script pulls from "Ready to Send" list
9. **Template Selection** → Based on `automation_template_set`
10. **Personalization** → Replaces tokens with contact data
11. **Gmail Send** → Via `marketingecraft@gmail.com`
12. **HubSpot Update** → Marks as sent

---

## 🛠️ Troubleshooting

### Trigger Not Firing
- Check trigger is set to "On change" from Drive
- Verify folder ID is correct
- Check execution logs for errors

### Gmail Send Failing
- Verify OAuth is complete (already done)
- Check Gmail API is enabled
- Verify `marketingecraft@gmail.com` has send permissions

### HubSpot Sync Failing
- Verify Access Token is correct
- Check scopes: `crm.objects.contacts.write`, `crm.objects.companies.write`
- Check execution logs for API errors

---

**System is ready - OAuth is complete, templates are loaded!** 🚀
