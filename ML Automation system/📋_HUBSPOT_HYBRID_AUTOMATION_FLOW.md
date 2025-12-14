# 📋 HubSpot Hybrid Automation Flow

## 🎯 Overview

**HubSpot is ONLY for list maintenance** - All automation happens in the backend.

### Flow Architecture

```
Google Drive → Backend Processing → HubSpot (Lists Only) → Backend Email Sending → Gmail
```

---

## 🔄 Complete Flow

### Phase 1: Data Ingestion & Enrichment (Backend)

**All happens in backend - HubSpot NOT involved**

1. **Google Drive File Detected**
   - Backend monitors Google Drive folder
   - Detects new CSV/XLSX files

2. **File Processing**
   - Backend downloads and parses file
   - Extracts: Company URL, names, titles, locations, etc.
   - Segments data into normalized structure

3. **AnyMail Enrichment**
   - Backend calls AnyMail API with Company URL
   - Receives email addresses via webhook
   - Enriches lead data

4. **Lead Classification**
   - Backend ML model classifies lead
   - Determines: lead_type, template_set, lead_score
   - Assigns segments

5. **Database Storage**
   - All data stored in PostgreSQL database
   - Complete lead record with all enrichment

---

### Phase 2: HubSpot Sync (List Maintenance Only)

**Backend syncs data to HubSpot for list segmentation**

6. **Property Push** (Automated)
   - Backend pushes ALL properties to HubSpot via API
   - Creates all custom properties automatically

7. **Contact Sync** (Automated)
   - Backend syncs ALL leads to HubSpot contacts
   - Updates all properties with database data
   - Creates/updates contacts in batches

8. **List Population** (Automatic via Workflows)
   - HubSpot workflows automatically add contacts to lists
   - Based on property values:
     - `send_email_ready = true` → "Ready to Send" list
     - `automation_lead_type = NGO` → "NGO Leads" list
     - `automation_lead_score >= 85` → "High Score Leads" list
     - etc.

**HubSpot Role:** List maintenance ONLY - no email sending, no heavy processing

---

### Phase 3: Email Sending (Backend via Gmail)

**Backend pulls from HubSpot lists and sends via Gmail**

9. **Pull from HubSpot List**
   - Backend calls HubSpot API: `getContactsFromList('Ready to Send')`
   - Retrieves all contacts with their properties
   - Gets: email, name, company, segmented data, template_set, etc.

10. **Template Selection**
    - Backend determines template based on:
      - `automation_template_set` from HubSpot
      - `automation_sequence_step` from database
      - Lead type and segments

11. **Personalization**
    - Backend personalizes email using:
      - Contact properties from HubSpot
      - Segmented data from HubSpot
      - Company profile from database

12. **Send via Gmail**
    - Backend sends email via Gmail API
    - From: `marketingecraft@gmail.com`
    - Uses Gmail OAuth (personal account)

13. **Update HubSpot**
    - Backend updates HubSpot contact:
      - `automation_last_email_sent` = now
      - `automation_emails_sent` = increment
    - Contact may be removed from "Ready to Send" list (via workflow)

14. **Database Logging**
    - Backend logs email send in database
    - Tracks: sent_at, template_id, status, etc.

---

## 🛠️ Automated Components

### ✅ Fully Automated (Via API)

1. **Property Creation**
   - All 40+ properties pushed automatically
   - Script: `automate-hubspot-setup.js`

2. **Data Sync**
   - All database data synced to HubSpot
   - Batch operations for efficiency
   - Script: `automate-hubspot-setup.js`

3. **List Workflows**
   - 10 list maintenance workflows created
   - Automatic list population
   - Script: `automate-hubspot-setup.js`

4. **Email Sending**
   - Pulls from HubSpot lists
   - Sends via Gmail
   - Updates HubSpot after send
   - Service: `emailSenderFromHubSpotLists.js`

---

## 📋 Manual Steps (What CANNOT be Automated)

### 1. HubSpot Private App Creation
- Navigate to HubSpot → Settings → Private Apps
- Create app with scopes:
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.companies.read`
  - `crm.objects.companies.write`
  - `lists.read`
  - `lists.write`
- Copy Access Token

### 2. Google Service Account Setup
- Create service account in Google Cloud
- Download JSON key
- Grant Drive access to service account email
- Store JSON in HubSpot secrets (if using serverless)

### 3. Gmail OAuth Setup
- Complete OAuth flow for `marketingecraft@gmail.com`
- Grant Gmail send permissions
- Store refresh token

### 4. Verify Lists in HubSpot UI
- Check that lists are populated
- Verify workflow triggers are working
- Test list criteria

---

## 🔑 Required HubSpot Scopes (Minimal)

**Only these scopes needed:**

```
crm.objects.contacts.read      # Pull contacts from lists
crm.objects.contacts.write     # Update contacts after email send
crm.objects.companies.read     # Read company data
crm.objects.companies.write    # Create/update companies
lists.read                     # Read list members
lists.write                    # (Optional) Manage lists
```

**NOT needed:**
- ❌ `marketing-email.*` (emails sent via Gmail)
- ❌ `automation.*` (automation in backend)
- ❌ `content.*` (templates in database)

---

## 📊 Services & Scripts

### Services

1. **`hubspotListMaintenance.js`**
   - Pushes all properties
   - Syncs all data to HubSpot
   - Gets contacts from lists
   - Updates contacts after email send

2. **`hubspotListWorkflows.js`**
   - Creates list maintenance workflows
   - Manages list population

3. **`emailSenderFromHubSpotLists.js`**
   - Pulls contacts from HubSpot lists
   - Personalizes and sends via Gmail
   - Updates HubSpot after send

### Scripts

1. **`automate-hubspot-setup.js`**
   - Runs all automated setup
   - Pushes properties
   - Syncs data
   - Creates workflows

---

## 🚀 Usage

### Initial Setup (One Time)

```bash
# Run automated setup
node scripts/automate-hubspot-setup.js
```

This will:
1. Push all properties to HubSpot
2. Sync all database data to HubSpot
3. Create all list workflows

### Daily Operations

**Backend automatically:**
1. Monitors Google Drive
2. Processes files
3. Enriches with AnyMail
4. Syncs to HubSpot
5. Pulls from "Ready to Send" list
6. Sends emails via Gmail
7. Updates HubSpot

**No manual intervention needed!**

---

## ✅ Benefits of Hybrid Approach

1. **Minimal HubSpot Scopes** - Only CRM and Lists
2. **No HubSpot Email Limits** - Uses Gmail directly
3. **Full Control** - All automation in backend
4. **Cost Effective** - HubSpot Free plan sufficient
5. **Scalable** - Gmail can handle high volume
6. **Flexible** - Easy to modify automation logic

---

**System is 100% automated except for initial manual setup!** 🚀
