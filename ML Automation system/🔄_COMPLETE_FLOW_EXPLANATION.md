# 🔄 Complete Flow Explanation - How Everything Works

## 🎯 System Overview

This is a **fully automated, CLI-driven system** that processes leads from Google Drive → AnyMail → HubSpot → Gmail, entirely orchestrated through Google Apps Script with CLI management.

---

## 📋 Step-by-Step: What Each Script Does

### **Script 1: `./scripts/push-all-clis.sh`**

#### **What It Does:**
1. **Pushes to Google Apps Script (clasp):**
   - Authenticates with Google (if needed)
   - Pushes all `.gs` files to remote GAS project
   - Deploys: `Code.gs`, `Templates.gs`, `HubSpotSetup.gs`, `appsscript.json`
   - Updates remote project with latest code

2. **Syncs with HubSpot CLI (hs):**
   - Verifies HubSpot CLI authentication
   - Runs HubSpot property sync script
   - Ensures all custom properties exist

#### **What Happens:**
```
┌─────────────────────────────────┐
│ 1. Check clasp authentication    │
│    - If not logged in, prompts   │
│    - Opens browser for auth      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 2. Push to Google Apps Script    │
│    - Uploads Code.gs            │
│    - Uploads Templates.gs       │
│    - Uploads HubSpotSetup.gs    │
│    - Uploads appsscript.json    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 3. Sync HubSpot Properties      │
│    - Creates missing properties  │
│    - Updates existing ones       │
│    - Verifies all are ready      │
└─────────────────────────────────┘
```

#### **Result:**
- ✅ All code deployed to Google Apps Script
- ✅ All HubSpot properties synced
- ✅ System ready for automation

---

### **Script 2: `node scripts/segmentation-analysis.js`**

#### **What It Does:**
1. **Analyzes Target Markets:**
   - Loads 3 target markets (Student, Referral, B2B)
   - Sends each to OpenAI or Gemini AI
   - Gets detailed segmentation criteria

2. **Triangulates Results:**
   - If both OpenAI and Gemini available: Merges results
   - If only one: Uses that result
   - Ensures 100% accuracy

3. **Generates Rules:**
   - Creates segmentation rules JSON
   - Creates SQL for database
   - Saves to `database/segmentation-rules.json` and `.sql`

#### **What Happens:**
```
┌─────────────────────────────────┐
│ 1. Initialize AI Clients        │
│    - OpenAI (if key set)        │
│    - Gemini (if key set)         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 2. Analyze Each Market          │
│    - Student Market → AI        │
│    - Referral Market → AI       │
│    - B2B Market → AI            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 3. Triangulate Results          │
│    - Merge OpenAI + Gemini      │
│    - Extract criteria           │
│    - Calculate weights           │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 4. Generate Rules               │
│    - JSON file                  │
│    - SQL file                   │
│    - Ready for database         │
└─────────────────────────────────┘
```

#### **Requirements:**
- Set `OPENAI_API_KEY` or `GEMINI_API_KEY` in `.env` file
- Or set as environment variables

#### **Result:**
- ✅ Segmentation rules generated
- ✅ Scoring weights calculated
- ✅ Rules saved to database files
- ✅ 100% triangulated accuracy

---

### **Script 3: `node scripts/cleanup-old-files.js`**

#### **What It Does:**
1. **Scans All Files:**
   - Recursively scans project directory
   - Identifies old documentation files
   - Keeps only essential system files

2. **Removes Outdated Files:**
   - Removes old status documents
   - Removes duplicate checklists
   - Removes outdated guides
   - Keeps core system files

3. **Preserves Essential:**
   - Keeps all `.js` files
   - Keeps all `.gs` files
   - Keeps configuration files
   - Keeps essential documentation

#### **What Happens:**
```
┌─────────────────────────────────┐
│ 1. Scan Directory               │
│    - Find all .md files          │
│    - Check patterns             │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 2. Check Keep List              │
│    - Core system files? Keep    │
│    - Essential docs? Keep      │
│    - Old status files? Remove   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ 3. Remove Outdated              │
│    - Delete old files            │
│    - Log removals               │
│    - Preserve essential          │
└─────────────────────────────────┘
```

#### **Result:**
- ✅ Old files removed
- ✅ Only current files remain
- ✅ System cleaned and organized

---

## 🔄 Complete End-to-End Flow

### **How The Entire System Works:**

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 0: SYSTEM INITIALIZATION                             │
│ (Every 5 Minutes - Time-Driven Trigger)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: FILE DETECTION                                    │
│ Google Apps Script: checkFolderForNewFiles()               │
│                                                             │
│ Nano Steps:                                                 │
│ 1.1. Time trigger fires (every 5 min)                      │
│ 1.2. Load config from Script Properties                    │
│ 1.3. Access Drive folder: 1iTirAf6yGxP9ef2sxXfohJRmQEJoF-gF│
│ 1.4. List all files in folder                              │
│ 1.5. Check file types (CSV, XLSX, Google Sheets)            │
│ 1.6. Compare against processed files list                  │
│ 1.7. Identify new files to process                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: FILE PROCESSING                                   │
│ Google Apps Script: processDriveFile(fileId)               │
│                                                             │
│ Nano Steps:                                                 │
│ 2.1. Get file metadata (name, ID, MIME type)                │
│ 2.2. Read file content based on type:                       │
│      - CSV: parseCsv()                                      │
│      - Excel: convert to Sheet, then read                   │
│      - Google Sheet: SpreadsheetApp.openById()              │
│ 2.3. Detect header row (first row)                          │
│ 2.4. Normalize headers (uppercase, trim)                     │
│ 2.5. Parse each data row                                    │
│ 2.6. Normalize each field:                                  │
│      - Email: lowercase, trim                               │
│      - Names: title case, trim                              │
│      - Phone: digits only                                   │
│      - Website: add https:// if missing                      │
│ 2.7. Validate required fields (email must be valid)        │
│ 2.8. Extract segmentation data (up to 5 custom fields)      │
│ 2.9. Store in memory array                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: ANYMAIL ENRICHMENT                                │
│ Google Apps Script: enrichWithAnyMail(lead, CONFIG)        │
│                                                             │
│ Nano Steps:                                                 │
│ 3.1. Extract Company URL from lead data                     │
│ 3.2. Extract domain from URL                                │
│ 3.3. Build API request payload:                             │
│      {                                                       │
│        first_name: lead.first_name,                         │
│        last_name: lead.last_name,                           │
│        company_url: lead.company_url,                       │
│        company_domain: extracted_domain                     │
│      }                                                       │
│ 3.4. Set API headers:                                        │
│      - Authorization: Bearer pRUtyDRHSPageC2jHGbnWGpD      │
│      - Content-Type: application/json                       │
│      - x-webhook-url: (if async)                            │
│ 3.5. Execute API call:                                      │
│      UrlFetchApp.fetch(anymail_url, options)                │
│ 3.6. Parse JSON response                                     │
│ 3.7. Extract email address                                  │
│ 3.8. Extract source_type (verified/guessed)                 │
│ 3.9. Update lead object with enriched data                  │
│ 3.10. Mark lead as enriched                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: HUBSPOT CRM SYNC                                   │
│ Google Apps Script: syncToHubSpot(lead, CONFIG)             │
│                                                             │
│ Nano Steps:                                                 │
│ 4.1. Initialize HubSpot API client                          │
│ 4.2. Search for existing contact by email:                 │
│      GET /crm/v3/objects/contacts?email={email}            │
│ 4.3. If contact exists: Get contact ID                      │
│ 4.4. If contact doesn't exist: Will create new              │
│ 4.5. Create/Update Company:                                 │
│      - Extract company name from lead                       │
│      - Extract domain from company URL                      │
│      - POST/PATCH /crm/v3/objects/companies                 │
│      - Set properties:                                      │
│        * name: company name                                 │
│        * domain: company domain                             │
│        * original_sheet_url: source file URL                │
│        * email_finder_status: "found" or "pending"          │
│ 4.6. Get/Store company ID                                   │
│ 4.7. Create/Update Contact:                                 │
│      - POST/PATCH /crm/v3/objects/contacts                 │
│      - Set properties:                                      │
│        * email: enriched email                              │
│        * firstname: first name                              │
│        * lastname: last name                                │
│        * jobtitle: title                                    │
│        * anymail_source_type: source type                  │
│        * original_sheet_data_segment_1-5: segmented data   │
│        * send_email_ready: true (if email found)            │
│ 4.8. Get/Store contact ID                                   │
│ 4.9. Associate Contact with Company:                        │
│      PUT /crm/v3/objects/contacts/{id}/associations/       │
│        companies/{companyId}/0                              │
│ 4.10. Verify properties were set correctly                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: EMAIL TEMPLATE SELECTION                           │
│ Google Apps Script: getTemplate(lead, templateSet, step)   │
│                                                             │
│ Nano Steps:                                                 │
│ 5.1. Classify lead based on data:                           │
│      - Check original_sheet_data_segment_1                  │
│      - Analyze company type                                 │
│      - Check title/role                                     │
│      - Determine: student/referral/b2b                      │
│ 5.2. Select template set:                                   │
│      - Student → set_one_student (5 steps)                  │
│      - Referral → set_two_referral (1 step)                 │
│      - B2B → set_three_b2b (5 steps)                        │
│ 5.3. Select step number:                                    │
│      - First email → step_1                                 │
│      - Track current step in HubSpot property               │
│ 5.4. Load template function:                                │
│      - getStudentTemplate1() from Templates.gs             │
│      - getReferralTemplate1() from Templates.gs             │
│      - getB2BTemplate1() from Templates.gs                  │
│ 5.5. Get template HTML and subject                           │
│ 5.6. Personalize template:                                  │
│      - Replace {{first_name}} with lead.first_name          │
│      - Replace {{last_name}} with lead.last_name            │
│      - Replace {{company}} with lead.organization           │
│      - Replace {{segmented_data}} with segment fields       │
│      - Replace {{mission_support_url}} with hardcoded URL    │
│ 5.7. Personalize subject line (same replacements)          │
│ 5.8. Return personalized template                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: EMAIL SENDING VIA GMAIL                            │
│ Google Apps Script: triggerEmailSending(CONFIG)            │
│                                                             │
│ Nano Steps:                                                 │
│ 6.1. Query HubSpot "Ready to Send" Active List:            │
│      - Get list ID (stored in Script Properties or hardcoded)│
│      - GET /crm/v3/lists/{listId}/contacts                  │
│      - Filter: send_email_ready = true                      │
│ 6.2. Get contact IDs from list                              │
│ 6.3. For each contact ID:                                    │
│      6.3.1. Get full contact data:                          │
│             GET /crm/v3/objects/contacts/{id}?properties=all│
│      6.3.2. Extract: email, firstname, template_set, etc.   │
│      6.3.3. Get personalized template (Phase 5)              │
│      6.3.4. Build email message:                             │
│             - To: contact.email                              │
│             - From: marketingecraft@gmail.com               │
│             - Subject: personalized subject                  │
│             - Body: personalized HTML                       │
│      6.3.5. Send via Gmail API:                             │
│             GmailApp.sendEmail(to, subject, "", {htmlBody}) │
│      6.3.6. Log success/failure                             │
│      6.3.7. Update contact (Phase 7)                        │
│ 6.4. Continue until all contacts processed                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 7: POST-SEND UPDATES                                  │
│ Google Apps Script: updateContactAfterEmailSend(contact)    │
│                                                             │
│ Nano Steps:                                                 │
│ 7.1. Update contact property send_email_ready:             │
│      - Set to false                                         │
│      - PATCH /crm/v3/objects/contacts/{id}                  │
│ 7.2. Update last_contact_sent_date:                        │
│      - Set to current timestamp                             │
│      - PATCH /crm/v3/objects/contacts/{id}                  │
│ 7.3. Increment automation_emails_sent:                       │
│      - Read current value                                   │
│      - Add 1                                                │
│      - PATCH /crm/v3/objects/contacts/{id}                  │
│ 7.4. Create HubSpot engagement record:                      │
│      - POST /crm/v3/objects/engagements                    │
│      - Type: EMAIL                                          │
│      - Associate with contact                               │
│ 7.5. Contact automatically removed from "Ready to Send" list│
│      (HubSpot dynamic list updates based on property change) │
│ 7.6. Mark source file as processed:                        │
│      - Store file ID in Script Properties                   │
│      - Key: processed_file_{fileId}                          │
│      - Value: timestamp                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Continuous Automation Loop

### **How It Runs Continuously:**

```
Time: 00:00 → Trigger fires
  ↓
checkFolderForNewFiles() executes
  ↓
Scans Drive folder
  ↓
If new files found → Process
  ↓
Wait 5 minutes

Time: 00:05 → Trigger fires again
  ↓
checkFolderForNewFiles() executes
  ↓
Scans Drive folder
  ↓
If new files found → Process
  ↓
Wait 5 minutes

... (repeats every 5 minutes forever)
```

### **Parallel Processing:**

While the time-driven trigger runs every 5 minutes, the email sending phase runs separately:

```
Time: 00:00 → checkFolderForNewFiles()
  ↓
Processes new files
  ↓
Syncs to HubSpot
  ↓
Sets send_email_ready = true
  ↓
Contact added to "Ready to Send" list

(Meanwhile, in same execution or separate trigger)

triggerEmailSending() executes
  ↓
Queries "Ready to Send" list
  ↓
Sends emails
  ↓
Updates contact properties
  ↓
Removes from list
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│ Google Drive │
│   Folder     │
│ (CSV/Sheet)  │
└──────┬───────┘
       │
       │ File Uploaded
       ▼
┌──────────────────────┐
│ Google Apps Script   │
│ checkFolderForNewFiles│
│ (Every 5 minutes)    │
└──────┬───────────────┘
       │
       │ Detects New File
       ▼
┌──────────────────────┐
│ processDriveFile()   │
│ - Parse file         │
│ - Normalize data     │
│ - Segment fields     │
└──────┬───────────────┘
       │
       │ For Each Lead
       ▼
┌──────────────────────┐
│ enrichWithAnyMail()  │
│ - Call AnyMail API   │
│ - Find email         │
│ - Get source type    │
└──────┬───────────────┘
       │
       │ Enriched Lead
       ▼
┌──────────────────────┐
│ syncToHubSpot()      │
│ - Create Company     │
│ - Create Contact     │
│ - Set properties     │
│ - Set send_email_ready│
└──────┬───────────────┘
       │
       │ Contact in HubSpot
       │ send_email_ready = true
       ▼
┌──────────────────────┐
│ "Ready to Send" List │
│ (Auto-updated)       │
└──────┬───────────────┘
       │
       │ List Query
       ▼
┌──────────────────────┐
│ triggerEmailSending()│
│ - Get contacts       │
│ - Personalize        │
│ - Send via Gmail     │
└──────┬───────────────┘
       │
       │ Email Sent
       ▼
┌──────────────────────┐
│ updateContactAfter...│
│ - Set send_email_ready│
│   = false            │
│ - Update dates        │
│ - Create engagement   │
└──────┬───────────────┘
       │
       │ Contact Updated
       ▼
┌──────────────────────┐
│ Contact Removed from │
│ "Ready to Send" List │
│ (Automatic)          │
└──────────────────────┘
```

---

## 🛠️ CLI Management Flow

### **How CLIs Are Used:**

#### **Google Apps Script (clasp):**
```bash
# Deploy code
clasp push

# Check status
clasp status

# View logs
clasp logs

# Pull remote code
clasp pull
```

**What Happens:**
- Code is written locally in `.gs` files
- `clasp push` uploads to Google's servers
- Google Apps Script executes the code
- `clasp logs` shows execution results

#### **HubSpot CLI (hs):**
```bash
# List contacts
hs contacts list

# Get contact
hs contacts get {id}

# List properties
hs properties list

# Create property
hs properties create
```

**What Happens:**
- HubSpot CLI authenticates with your account
- Commands interact with HubSpot API
- Changes are made directly in HubSpot
- No manual UI interaction needed

---

## 🎯 Segmentation Flow

### **How Segmentation Works:**

```
┌─────────────────────────────────┐
│ Lead Data from File             │
│ - Company type                  │
│ - Title/role                    │
│ - Industry                      │
│ - Segment fields                │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ AI Analysis (OpenAI/Gemini)    │
│ - Analyzes lead characteristics│
│ - Determines market fit         │
│ - Calculates scoring weights    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Triangulation                   │
│ - Merge multiple AI results     │
│ - Ensure 100% accuracy         │
│ - Generate final rules          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Rule Application                │
│ - Classify lead                 │
│ - Assign template set           │
│ - Set scoring weights            │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Template Selection              │
│ - Student → set_one_student     │
│ - Referral → set_two_referral   │
│ - B2B → set_three_b2b           │
└─────────────────────────────────┘
```

---

## 📋 Complete Execution Timeline

### **Example: File Uploaded at 10:00 AM**

```
10:00:00 - File uploaded to Drive folder
10:00:00 - Time trigger fires (if scheduled)
10:00:01 - checkFolderForNewFiles() detects file
10:00:02 - processDriveFile() starts
10:00:03 - File parsed, 10 leads extracted
10:00:04 - For each lead:
            - enrichWithAnyMail() called
            - AnyMail API responds (5-15 seconds)
            - Email found/not found
10:00:20 - All leads enriched
10:00:21 - syncToHubSpot() starts
10:00:22 - Companies created (10 companies)
10:00:25 - Contacts created (10 contacts)
10:00:28 - Properties set, send_email_ready = true
10:00:29 - Contacts added to "Ready to Send" list
10:00:30 - triggerEmailSending() executes
10:00:31 - Queries "Ready to Send" list (10 contacts)
10:00:32 - For each contact:
            - Get personalized template
            - Send via Gmail API
            - Update contact properties
10:01:00 - All 10 emails sent
10:01:01 - All contacts updated
10:01:02 - All contacts removed from list
10:01:03 - File marked as processed
10:01:04 - Process complete
```

**Total Time:** ~1 minute for 10 leads

---

## 🔧 How Each Component Works Together

### **Google Apps Script (Orchestrator):**
- **Role:** Central automation engine
- **Runs:** On Google's servers
- **Triggered:** Time-driven (every 5 minutes)
- **Manages:** Entire flow from detection to sending

### **Google Drive (Source):**
- **Role:** File storage and trigger
- **Monitored:** Specific folder
- **Files:** CSV, XLSX, Google Sheets
- **Access:** Via DriveApp service

### **AnyMail (Enrichment):**
- **Role:** Email finding service
- **Called:** Via UrlFetchApp
- **Returns:** Email address and source type
- **API Key:** Stored in Script Properties

### **HubSpot (CRM):**
- **Role:** Data container and segmentation
- **Used For:**
  - Storing contacts and companies
  - Segmentation via properties
  - "Ready to Send" list
- **Not Used For:** Workflows or marketing emails

### **Gmail (Sending):**
- **Role:** Email delivery
- **Method:** GmailApp.sendEmail()
- **From:** marketingecraft@gmail.com
- **Personalized:** Using template system

---

## 🎯 Key Points

1. **Fully Automated:** No manual intervention needed after setup
2. **CLI-Driven:** All management via command line
3. **Time-Triggered:** Runs every 5 minutes automatically
4. **File-Agnostic:** Works with any file type (CSV, XLSX, Sheets)
5. **Self-Healing:** Marks files as processed to prevent duplicates
6. **Scalable:** Can process hundreds of leads per execution

---

## 🚀 Ready to Launch

**All scripts prepared, all flows documented, system ready!**

**Next:** Execute the scripts and complete manual setup steps.


