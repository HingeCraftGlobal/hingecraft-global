# 📋 Complete Automated Flow - HubSpot List Maintenance

## 🎯 System Architecture

**HubSpot Role:** List Maintenance ONLY  
**Email Sending:** Via Gmail (marketingecraft@gmail.com)  
**All Automation:** Backend processing

---

## 🔄 Complete Automated Flow

### Phase 1: Google Drive → Database (Backend)

1. **File Detected** (Automated - every 30 seconds)
   - System polls Google Drive folder
   - Detects new CSV/XLSX files

2. **File Processing** (Automated)
   - Backend downloads and parses file
   - Extracts all columns into `drive_rows.normalized` JSONB
   - Creates `drive_ingests` record

3. **AnyMail Enrichment** (Automated)
   - Backend calls AnyMail API with Company URL
   - Includes `x-webhook-url` header automatically
   - AnyMail processes (5-15 seconds)
   - Results arrive via webhook: `/api/webhooks/anymail`

4. **Webhook Processing** (Automated - Exact Order)
   - Step 1: Receive AnyMail webhook
   - Step 2: Auto-fill prospect data
   - Step 3: Select template from database
   - Step 4: Send personalized email (via Gmail)
   - Step 5: Segment and sync to HubSpot

5. **Lead Classification** (Automated)
   - Backend ML model classifies lead
   - Determines: `lead_type`, `template_set`, `lead_score`
   - Stores in database

6. **Database Storage** (Automated)
   - All data stored in PostgreSQL
   - Complete lead record with all enrichment
   - Segmented data in `drive_rows.normalized`

---

### Phase 2: Database → HubSpot (List Maintenance)

7. **Property Push** (Automated - One Time)
   - Run: `node scripts/automate-hubspot-setup.js`
   - Pushes ALL 40+ properties to HubSpot
   - Creates all custom properties automatically

8. **Data Sync** (Automated - Continuous)
   - Backend syncs ALL leads to HubSpot contacts
   - Updates all properties with database data
   - Includes: segmented data, classification, enrichment
   - Service: `hubspotListMaintenance.syncAllDataForListMaintenance()`

9. **List Population** (Automatic - Via Workflows)
   - HubSpot workflows automatically add contacts to lists
   - Based on property values:
     - `send_email_ready = true` → "Ready to Send" list
     - `automation_lead_type = NGO` → "NGO Leads" list
     - `automation_lead_score >= 85` → "High Score Leads" list
     - `automation_anymail_enriched = true` → "Enriched Leads" list
     - etc.

**HubSpot Role:** List maintenance ONLY - no email sending

---

### Phase 3: HubSpot Lists → Email Sending (Backend)

10. **Pull from HubSpot List** (Automated - Every 5 minutes)
    - Backend calls: `hubspotListMaintenance.getContactsFromList('Ready to Send')`
    - Retrieves all contacts with their properties
    - Gets: email, name, company, segmented data, template_set, etc.

11. **Template Selection** (Automated)
    - Backend determines template based on:
      - `automation_template_set` from HubSpot
      - `automation_sequence_step` from database
      - Lead type and segments

12. **Personalization** (Automated)
    - Backend personalizes email using:
      - Contact properties from HubSpot
      - Segmented data from HubSpot (`original_sheet_data_segment_*`)
      - Company profile from database
    - Replaces tokens: `{{first_name}}`, `{{company}}`, `{{segment_1}}`, etc.

13. **Send via Gmail** (Automated)
    - Backend sends email via Gmail API
    - From: `marketingecraft@gmail.com`
    - Uses Gmail OAuth (personal account)
    - Service: `gmailMultiAccount.sendEmail()`

14. **Update HubSpot** (Automated)
    - Backend updates HubSpot contact:
      - `automation_last_email_sent` = now
      - `automation_emails_sent` = increment
    - Contact may be removed from "Ready to Send" list (via workflow)

15. **Database Logging** (Automated)
    - Backend logs email send in `email_tracking` table
    - Tracks: sent_at, template_id, status, etc.

---

## 🛠️ Services & Scripts

### Services

1. **`hubspotListMaintenance.js`**
   - `pushAllProperties()` - Pushes all properties automatically
   - `syncAllDataForListMaintenance()` - Syncs all data to HubSpot
   - `getContactsFromList(listName)` - Pulls contacts from HubSpot list
   - `updateContactAfterEmailSend()` - Updates HubSpot after email

2. **`hubspotListWorkflows.js`**
   - `createAllListWorkflows()` - Creates 10 list maintenance workflows
   - Automatic list population based on properties

3. **`emailSenderFromHubSpotLists.js`**
   - `sendEmailsFromHubSpotList()` - Main function
   - Pulls from HubSpot, personalizes, sends via Gmail
   - Updates HubSpot after send

4. **`anymailWebhookHandler.js`**
   - Handles AnyMail webhooks
   - Exact 5-step flow
   - Syncs to HubSpot for list maintenance

5. **`driveToAnymailSync.js`**
   - Processes Google Drive files
   - Enriches with AnyMail
   - Syncs to HubSpot

### Scripts

1. **`automate-hubspot-setup.js`**
   - One-time setup script
   - Pushes properties, syncs data, creates workflows

2. **`build-complete-hubspot-workflows.js`**
   - Creates all workflows (if needed)

---

## 📋 HubSpot Lists (Auto-Populated)

1. **New Google Drive Leads** - `automation_source = 'google_drive'`
2. **Enriched Leads** - `automation_anymail_enriched = true`
3. **Ready to Send** - `send_email_ready = true`
4. **NGO Leads** - `automation_lead_type = 'NGO'`
5. **School Leads** - `automation_lead_type = 'School'`
6. **Student Leads** - `automation_lead_type = 'Student'`
7. **High Score Leads** - `automation_lead_score >= 85`
8. **Active Sequences** - `automation_sequence_status = 'active'`
9. **Replied Leads** - `automation_emails_replied > 0`
10. **Suppressed Leads** - `automation_status = 'suppressed'`

---

## 🔑 Required HubSpot Scopes (Minimal)

**Only 6 scopes needed:**

```
crm.objects.contacts.read      # Pull contacts from lists
crm.objects.contacts.write     # Update contacts after email send
crm.objects.companies.read     # Read company data
crm.objects.companies.write    # Create/update companies
lists.read                     # Read list members
lists.write                    # Manage lists
```

**NOT needed:**
- ❌ `marketing-email.*` (emails sent via Gmail)
- ❌ `automation.*` (automation in backend)
- ❌ `content.*` (templates in database)

---

## 🚀 Usage

### Initial Setup (One Time)

```bash
# Run automated setup
node scripts/automate-hubspot-setup.js
```

This will:
1. ✅ Push all 40+ properties to HubSpot
2. ✅ Sync all database data to HubSpot
3. ✅ Create all 10 list workflows
4. ✅ Create all 10 lists

### Daily Operations (Fully Automated)

**No manual intervention needed!**

1. Drop file in Google Drive
2. System automatically:
   - Processes file
   - Enriches with AnyMail
   - Classifies lead
   - Syncs to HubSpot
   - Adds to lists
   - Pulls from "Ready to Send" list
   - Sends emails via Gmail
   - Updates HubSpot

### Manual Email Send (If Needed)

```bash
# Send emails from specific list
curl -X POST http://localhost:3001/api/email/send-from-hubspot-list \
  -H "Content-Type: application/json" \
  -d '{"listName": "Ready to Send", "limit": 50}'
```

---

## 📊 Data Flow Diagram

```
Google Drive File
    ↓
Backend Processing
    ↓
AnyMail Enrichment (webhook)
    ↓
Database Storage
    ↓
HubSpot Sync (for lists)
    ↓
HubSpot Lists (auto-populated)
    ↓
Backend Pulls from Lists
    ↓
Template Selection (from database)
    ↓
Personalization (HubSpot + Database data)
    ↓
Gmail Send (marketingecraft@gmail.com)
    ↓
HubSpot Update
    ↓
Database Logging
```

---

## ✅ What's Automated

- ✅ Property creation (40+ properties)
- ✅ Data sync (all leads)
- ✅ List creation (10 lists)
- ✅ Workflow creation (10 workflows)
- ✅ List population (automatic)
- ✅ Email sending (pulls from lists, sends via Gmail)
- ✅ HubSpot updates (after email send)

## 📝 What's Manual

- Private App creation (6 scopes)
- Access Token copy
- External API keys (stored in backend)
- Gmail OAuth (one-time)

---

**System is 95% automated - HubSpot is ONLY for list maintenance!** 🚀
