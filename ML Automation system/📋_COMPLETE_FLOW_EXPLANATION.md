# 📋 Complete Automation Flow - Full Explanation

## 🎯 System Overview

This is a **CLI-driven automation system** that processes leads from Google Drive → AnyMail → HubSpot → Gmail, entirely orchestrated through Google Apps Script (GAS) with CLI management tools.

---

## 🔄 Complete End-to-End Flow

### **MAJOR CHECKPOINT 1: File Detection & Ingestion**

#### Nano Checkpoints:
1. **Time-Driven Trigger** (Every 5 minutes)
   - Google Apps Script `checkFolderForNewFiles()` executes
   - CLI: Managed via `clasp` deployment

2. **Folder Access Verification**
   - Checks Drive folder: `1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF`
   - Verifies service account access
   - Validates folder permissions

3. **File Type Detection**
   - Supports: CSV, XLSX, Google Sheets
   - Validates file extension
   - Checks MIME type

4. **New File Identification**
   - Compares against processed files (stored in Script Properties)
   - Marks new files for processing
   - Skips already processed files

**CLI Commands:**
```bash
# Deploy Google Apps Script
cd google-apps-script
clasp push

# Check deployment status
clasp status

# View execution logs
clasp logs
```

---

### **MAJOR CHECKPOINT 2: File Processing & Data Extraction**

#### Nano Checkpoints:
1. **File Download**
   - Downloads file from Google Drive
   - Converts Google Sheets to CSV format
   - Stores file content in memory

2. **Row Parsing**
   - Extracts all rows from CSV/Sheet
   - Identifies header row
   - Maps columns to standard fields

3. **Data Normalization**
   - Normalizes email addresses (lowercase, trim)
   - Standardizes names (title case)
   - Cleans phone numbers
   - Validates website URLs

4. **Field Mapping**
   - Maps: First Name, Last Name, Email, Company, Title, Website
   - Extracts Company URL for AnyMail enrichment
   - Segments additional data (up to 5 custom fields)

**CLI Commands:**
```bash
# Test file processing
node tests/full-system-simulation.js

# Check file structure
node tests/quick-system-check.js
```

---

### **MAJOR CHECKPOINT 3: AnyMail Email Enrichment**

#### Nano Checkpoints:
1. **API Request Preparation**
   - Constructs AnyMail API request
   - Uses API Key: `pRUtyDRHSPageC2jHGbnWGpD`
   - Includes Company URL, First Name, Last Name

2. **AnyMail API Call**
   - Endpoint: `https://api.anymail.com/v1/find-person-email`
   - Method: POST with webhook header
   - Includes `x-webhook-url` for async results

3. **Email Discovery**
   - Finds verified email addresses
   - Returns source type (verified, guessed, etc.)
   - Provides confidence score

4. **Data Enrichment**
   - Updates lead with found email
   - Stores `anymail_source_type` property
   - Marks lead as enriched

**CLI Commands:**
```bash
# Verify AnyMail configuration
grep -r "pRUtyDRHSPageC2jHGbnWGpD" config/

# Test AnyMail connection
node -e "const anymail = require('./src/services/anymail'); anymail.testConnection();"
```

---

### **MAJOR CHECKPOINT 4: HubSpot CRM Sync**

#### Nano Checkpoints:
1. **Contact Lookup**
   - Searches HubSpot by email
   - Checks for existing contact
   - Determines create vs. update

2. **Company Creation/Update**
   - Creates company from Company URL/Name
   - Sets custom properties:
     - `original_sheet_url`
     - `email_finder_status`
   - Associates contact with company

3. **Contact Creation/Update**
   - Creates/updates contact with:
     - Email, First Name, Last Name
     - Title, Company association
     - Custom properties:
       - `anymail_source_type`
       - `original_sheet_data_segment_1-5`
       - `send_email_ready` (set to `true` if email found)

4. **Property Updates**
   - Updates all custom properties
   - Sets segmentation data
   - Marks contact as ready for email

**CLI Commands:**
```bash
# Sync HubSpot properties
node scripts/automate-hubspot-setup.js

# Verify HubSpot connection
node -e "const hubspot = require('./src/services/hubspot'); hubspot.testConnection().then(console.log);"

# HubSpot CLI sync
hs contacts list --limit 5
```

---

### **MAJOR CHECKPOINT 5: Email Template Selection**

#### Nano Checkpoints:
1. **Lead Classification**
   - Analyzes lead data
   - Determines lead type (student, referral, b2b)
   - Assigns template set

2. **Template Set Selection**
   - `set_one_student` - 5-step sequence
   - `set_two_referral` - 1-step sequence
   - `set_three_b2b` - 5-step sequence

3. **Template Personalization**
   - Replaces `{{first_name}}` with actual name
   - Replaces `{{segmented_data}}` with custom fields
   - Replaces `{{mission_support_url}}` with link

4. **Template Loading**
   - Loads from `Templates.gs` in Google Apps Script
   - Selects appropriate step (step_1, step_2, etc.)
   - Formats HTML email

**CLI Commands:**
```bash
# Verify templates loaded
node scripts/verify-email-templates-loaded.js

# Check template database
psql -d hingecraft_automation -c "SELECT * FROM email_templates LIMIT 5;"
```

---

### **MAJOR CHECKPOINT 6: Email Sending via Gmail**

#### Nano Checkpoints:
1. **"Ready to Send" List Query**
   - Queries HubSpot Active List
   - Filter: `send_email_ready = true`
   - Retrieves all contacts ready for email

2. **Contact Data Retrieval**
   - Pulls contact properties from HubSpot
   - Gets personalization data
   - Retrieves template set assignment

3. **Email Construction**
   - Personalizes template with contact data
   - Sets subject line
   - Formats HTML body
   - Sets From: `marketingecraft@gmail.com`

4. **Gmail API Send**
   - Uses `GmailApp.sendEmail()` in Google Apps Script
   - Sends via Gmail API
   - Returns message ID

**CLI Commands:**
```bash
# Test Gmail service
node -e "const gmail = require('./src/services/gmail'); gmail.initialize().then(() => console.log('Gmail ready'));"

# Check OAuth status
curl http://localhost:3001/auth/status
```

---

### **MAJOR CHECKPOINT 7: Post-Send Updates**

#### Nano Checkpoints:
1. **Contact Property Updates**
   - Sets `send_email_ready = false`
   - Updates `last_contact_sent_date`
   - Increments `automation_emails_sent` counter

2. **Email Log Creation**
   - Logs email in database (if using Node.js backend)
   - Stores message ID
   - Records send timestamp

3. **HubSpot Engagement Creation**
   - Creates email engagement record
   - Links to contact
   - Tracks email sent event

4. **Removal from "Ready to Send" List**
   - Contact automatically removed (via property change)
   - List updates in real-time
   - Prevents duplicate sends

**CLI Commands:**
```bash
# Check email logs
psql -d hingecraft_automation -c "SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;"

# Verify HubSpot updates
hs contacts get <contact-id> --properties send_email_ready,last_contact_sent_date
```

---

## 🛠️ CLI-Based System Management

### **Google Apps Script CLI (clasp)**

#### Deployment:
```bash
cd google-apps-script
clasp login                    # One-time authentication
clasp push                     # Deploy all files
clasp push --force            # Force push (overwrite)
```

#### Monitoring:
```bash
clasp status                  # Check tracked files
clasp logs                   # View execution logs
clasp open                    # Open in browser
```

#### Configuration:
```bash
# .clasp.json contains:
{
  "scriptId": "1H7rqzgDUSZHvDU2YPM_WJFjuLwdjhOo3HYwf4Ya-9wBR26Fz2tSTmFsS",
  "rootDir": "."
}
```

---

### **HubSpot CLI (hs)**

#### Setup:
```bash
hs init                       # Initialize HubSpot CLI
hs accounts add               # Add HubSpot account
hs auth                       # Authenticate
```

#### Property Management:
```bash
hs properties list            # List all properties
hs properties create          # Create new property
hs properties update          # Update property
```

#### Contact Management:
```bash
hs contacts list              # List contacts
hs contacts get <id>          # Get contact details
hs contacts update <id>       # Update contact
```

#### List Management:
```bash
hs lists list                 # List all lists
hs lists get <id>             # Get list details
hs lists contacts <id>        # Get contacts in list
```

---

### **Node.js Backend CLI**

#### System Testing:
```bash
node tests/quick-system-check.js          # Quick configuration check
node tests/full-system-simulation.js     # Full system simulation
node tests/test-pipeline-interactive.js   # Interactive pipeline test
```

#### Database Management:
```bash
# Run migrations
psql -d hingecraft_automation -f database/schema.sql

# Import data
node scripts/import-all-database-data.js

# Verify database
psql -d hingecraft_automation -c "\dt"    # List tables
```

#### Service Verification:
```bash
# Test services
node scripts/verify-everything.sh
node scripts/test-hubspot-connection.js
node scripts/verify-email-templates-loaded.js
```

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ MAJOR CHECKPOINT 1: FILE DETECTION                         │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Nano 1.1: Time-Driven Trigger (Every 5 min)          │  │
│ │ Nano 1.2: Folder Access Verification                  │  │
│ │ Nano 1.3: File Type Detection                         │  │
│ │ │ Nano 1.4: New File Identification                   │  │
│ └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ MAJOR CHECKPOINT 2: FILE PROCESSING                        │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Nano 2.1: File Download                                │  │
│ │ Nano 2.2: Row Parsing                                  │  │
│ │ Nano 2.3: Data Normalization                           │  │
│ │ Nano 2.4: Field Mapping                                │  │
│ └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ MAJOR CHECKPOINT 3: ANYMAIL ENRICHMENT                     │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Nano 3.1: API Request Preparation                     │  │
│ │ Nano 3.2: AnyMail API Call                           │  │
│ │ Nano 3.3: Email Discovery                            │  │
│ │ Nano 3.4: Data Enrichment                            │  │
│ └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ MAJOR CHECKPOINT 4: HUBSPOT CRM SYNC                       │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Nano 4.1: Contact Lookup                              │  │
│ │ Nano 4.2: Company Creation/Update                    │  │
│ │ Nano 4.3: Contact Creation/Update                     │  │
│ │ Nano 4.4: Property Updates                            │  │
│ └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ MAJOR CHECKPOINT 5: EMAIL TEMPLATE SELECTION                │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Nano 5.1: Lead Classification                         │  │
│ │ Nano 5.2: Template Set Selection                      │  │
│ │ Nano 5.3: Template Personalization                    │  │
│ │ Nano 5.4: Template Loading                            │  │
│ └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ MAJOR CHECKPOINT 6: EMAIL SENDING VIA GMAIL                 │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Nano 6.1: "Ready to Send" List Query                  │  │
│ │ Nano 6.2: Contact Data Retrieval                      │  │
│ │ Nano 6.3: Email Construction                          │  │
│ │ Nano 6.4: Gmail API Send                              │  │
│ └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ MAJOR CHECKPOINT 7: POST-SEND UPDATES                       │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Nano 7.1: Contact Property Updates                    │  │
│ │ Nano 7.2: Email Log Creation                          │  │
│ │ Nano 7.3: HubSpot Engagement Creation                 │  │
│ │ Nano 7.4: Removal from "Ready to Send" List          │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Database Integration

### **Database Tables Used:**

1. **leads** - Main lead storage
2. **import_batches** - File import tracking
3. **email_logs** - Email send tracking
4. **hubspot_sync** - HubSpot sync records
5. **email_templates** - Template storage
6. **sequences** - Email sequence definitions
7. **sequence_steps** - Sequence step details
8. **lead_sequences** - Lead-sequence associations

### **CLI Database Commands:**

```bash
# Connect to database
psql -d hingecraft_automation -U hingecraft_user

# Run schema
psql -d hingecraft_automation -f database/schema.sql

# Import templates
psql -d hingecraft_automation -f database/init-email-templates.sql

# Check data
psql -d hingecraft_automation -c "SELECT COUNT(*) FROM leads;"
psql -d hingecraft_automation -c "SELECT COUNT(*) FROM email_templates;"
```

---

## 🎯 Key Configuration Points

### **Script Properties (Google Apps Script):**
- `HUBSPOT_TOKEN`: `pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39`
- `ANYMAIL_KEY`: `pRUtyDRHSPageC2jHGbnWGpD`
- `GMAIL_FROM_ADDRESS`: `marketingecraft@gmail.com`
- `MONITORED_FOLDER_ID`: `1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF`

### **CLI Configuration Files:**
- `.clasp.json` - Google Apps Script project link
- `config/api_keys.js` - API keys and configuration
- `.claspignore` - Files to exclude from deployment

---

## 🚀 Complete CLI Workflow

### **Initial Setup:**
```bash
# 1. Install CLIs
npm install -g @google/clasp
npm install -g @hubspot/cli

# 2. Authenticate
clasp login
hs init && hs accounts add

# 3. Deploy Google Apps Script
cd google-apps-script
clasp push

# 4. Set Script Properties (via Apps Script UI)
# HUBSPOT_TOKEN, ANYMAIL_KEY, GMAIL_FROM_ADDRESS, MONITORED_FOLDER_ID

# 5. Create HubSpot Properties
node scripts/automate-hubspot-setup.js

# 6. Set up Time-Driven Trigger (via Apps Script UI)
# Function: checkFolderForNewFiles
# Event: Time-driven, Every 5 minutes
```

### **Daily Operations:**
```bash
# Monitor system
clasp logs                    # Check GAS execution logs
hs contacts list --limit 10  # Check recent contacts

# Verify configuration
node tests/quick-system-check.js

# Test flow
node tests/full-system-simulation.js
```

### **Troubleshooting:**
```bash
# Check deployment
clasp status

# Pull latest from GAS
clasp pull

# Verify HubSpot connection
hs contacts list --limit 1

# Test database
psql -d hingecraft_automation -c "SELECT NOW();"
```

---

## 📋 Summary

**Total Major Checkpoints:** 7  
**Total Nano Checkpoints:** 28  
**CLI Tools Used:** `clasp`, `hs` (HubSpot CLI), Node.js scripts  
**Automation Trigger:** Time-driven (every 5 minutes)  
**Primary Orchestrator:** Google Apps Script  
**Database:** PostgreSQL (optional, for logging)  
**Email Sender:** Gmail API via Google Apps Script  

**System is 100% CLI-driven and fully automated!**


