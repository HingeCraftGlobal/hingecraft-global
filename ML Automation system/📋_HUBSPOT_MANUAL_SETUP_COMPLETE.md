# 📋 HubSpot Manual Setup - Complete Guide

## ⚠️ IMPORTANT UPDATE

**HubSpot is now used ONLY as a container for leads and segmentation via properties.**

**NO WORKFLOWS ARE NEEDED** - All automation is handled by Google Apps Script.

For the simplified setup, see: **`📋_HUBSPOT_SIMPLIFIED_SETUP.md`**

This document contains the FULL setup guide (including workflows) for reference, but workflows are **NOT REQUIRED** for the current implementation.

---

## 🎯 Overview

This document provides **ALL manual steps** required to configure HubSpot for the complete automation system. No code execution - only UI configuration and credential storage.

**NOTE:** Parts 4 and 5 (Marketing Emails and Workflows) are **NOT NEEDED** for the current implementation.

---

## 🔑 PART 1: HubSpot OAuth Scopes (Private App)

### Required Scopes - Complete List

Navigate to: **HubSpot Account → Settings → Integrations → Private Apps → Create Private App**

**Select ALL of the following scopes:**

#### **CRM Scopes** (Required for Contact/Company Management)
```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.companies.read
crm.objects.companies.write
crm.objects.custom.read
crm.objects.custom.write
crm.schemas.contacts.read
crm.schemas.contacts.write
crm.schemas.companies.read
crm.schemas.companies.write
crm.schemas.custom.read
crm.schemas.custom.write
```

#### **Automation Scopes** (Required for Workflows)
```
automation
automation.read
automation.write
```

#### **Marketing Email Scopes** (Required for Email Sending)
```
marketing-email.read
marketing-email.write
marketing-email.send
```

#### **Content Scopes** (Required for Email Templates)
```
content
content.read
content.write
```

#### **Files Scopes** (Required for File Management)
```
files
files.read
files.write
```

#### **Timeline Scopes** (Required for Timeline Events)
```
timeline
timeline.read
timeline.write
```

#### **Webhooks Scopes** (Required for Webhook Subscriptions)
```
webhooks
webhooks.read
webhooks.write
```

#### **Lists Scopes** (Required for Segmentation Lists)
```
lists
lists.read
lists.write
```

#### **Engagements Scopes** (Required for Email Tracking)
```
engagements.read
engagements.write
```

#### **OAuth Scopes** (Required for External Integrations)
```
oauth
```

**Total: 30+ scopes required**

**After creating the Private App:**
1. Copy the **Access Token** (starts with `pat-`)
2. Save it securely - you'll need it for Serverless Functions

---

## 🧱 PART 2: Custom Properties Configuration

Navigate to: **Settings → Properties**

### **Property Group Creation**

1. Create Property Group: **"Automation Information"**
   - Display Order: 100
   - Group Name: `automation_information`
   - Label: `Automation Information`

---

### **COMPANY Properties** (Create in Settings → Properties → Companies)

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `original_sheet_url` | Original Sheet URL | Single-line text | Google Drive file URL where company was imported from |
| `email_finder_status` | Email Finder Status | Single-line text | Status: 'pending', 'found', 'failed', 'skipped' |
| `automation_source` | Automation Source | Single-line text | Source: 'google_drive', 'manual', 'api' |
| `automation_ingested_at` | Automation Ingested At | Date picker | When company was first ingested |
| `automation_company_segment` | Automation Company Segment | Single-line text | Company segment classification |

---

### **CONTACT Properties** (Create in Settings → Properties → Contacts)

#### **Source & Ingestion Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_source` | Automation Source | Single-line text | Source: 'google_drive', 'manual', 'api' |
| `automation_source_file_id` | Automation Source File ID | Single-line text | Google Drive file ID |
| `automation_source_row_number` | Automation Source Row Number | Number | Row number in source file |
| `automation_ingested_at` | Automation Ingested At | Date picker | When lead was first ingested |

#### **AnyMail Enrichment Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `anymail_source_type` | AnyMail Source Type | Single-line text | 'verified', 'guessed', 'not_found' |
| `automation_anymail_enriched` | Automation AnyMail Enriched | Checkbox | Whether lead was enriched by AnyMail |
| `automation_enriched_at` | Automation Enriched At | Date picker | When AnyMail enrichment completed |
| `send_email_ready` | Send Email Ready | Checkbox | Whether lead is ready for email sending |

#### **Lead Classification Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_lead_type` | Automation Lead Type | Single-line text | 'NGO', 'School', 'Student', 'B2B', etc. |
| `automation_template_set` | Automation Template Set | Single-line text | 'set_one_student', 'set_two_referral', 'set_three_b2b' |
| `automation_lead_score` | Automation Lead Score | Number | Lead quality score (0-100) |
| `automation_classified_at` | Automation Classified At | Date picker | When lead was classified |
| `automation_persona_score` | Automation Persona Score | Number | Persona matching score |
| `automation_fm_stage` | Automation FM Stage | Single-line text | Ferguson Matrix stage |
| `automation_preferred_tone` | Automation Preferred Tone | Single-line text | Preferred communication tone |
| `automation_tier` | Automation Tier | Number | Lead tier (1-5) |
| `automation_has_donated` | Automation Has Donated | Checkbox | Whether lead has donated |

#### **Sequence Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_sequence_id` | Automation Sequence ID | Single-line text | Sequence identifier |
| `automation_sequence_name` | Automation Sequence Name | Single-line text | Name of sequence |
| `automation_sequence_status` | Automation Sequence Status | Dropdown | 'active', 'paused', 'completed', 'cancelled' |
| `automation_sequence_step` | Automation Sequence Step | Number | Current step in sequence (1-5) |
| `automation_sequence_started` | Automation Sequence Started | Date picker | When sequence started |
| `automation_next_action_due` | Automation Next Action Due | Date picker | When next action is due |

#### **Email Engagement Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_emails_sent` | Automation Emails Sent | Number | Total emails sent |
| `automation_emails_opened` | Automation Emails Opened | Number | Total emails opened |
| `automation_emails_clicked` | Automation Emails Clicked | Number | Total emails clicked |
| `automation_emails_replied` | Automation Emails Replied | Number | Total emails replied |
| `automation_emails_bounced` | Automation Emails Bounced | Number | Total emails bounced |
| `automation_last_email_sent` | Automation Last Email Sent | Date picker | Timestamp of last email sent |
| `automation_last_email_opened` | Automation Last Email Opened | Date picker | Timestamp of last email opened |
| `automation_last_email_clicked` | Automation Last Email Clicked | Date picker | Timestamp of last email clicked |
| `automation_last_email_replied` | Automation Last Email Replied | Date picker | Timestamp of last email replied |

#### **Segmentation Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_segment_name` | Automation Segment Name | Single-line text | Primary segment name |
| `automation_segment_type` | Automation Segment Type | Single-line text | 'primary', 'secondary', 'tertiary' |
| `automation_segments` | Automation Segments | Single-line text | Comma-separated list of all segments |

#### **AI Analysis Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_ai_analyzed` | Automation AI Analyzed | Checkbox | Whether Gemini AI analysis completed |
| `automation_ai_confidence` | Automation AI Confidence | Number | AI confidence score (0-100) |
| `automation_ai_recommendations` | Automation AI Recommendations | Multi-line text | JSON string of AI recommendations |
| `automation_analysis_type` | Automation Analysis Type | Single-line text | 'drag_analysis', 'seo_training', 'smart_sort' |

#### **Status Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_status` | Automation Status | Dropdown | 'new', 'enriched', 'contacted', 'converted', 'suppressed' |
| `automation_campaign_id` | Automation Campaign ID | Single-line text | Campaign identifier |
| `automation_campaign_name` | Automation Campaign Name | Single-line text | Campaign name |

#### **Segmented Data Fields** (From Google Drive Sheet)

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `original_sheet_data_segment_1` | Original Sheet Data Segment 1 | Single-line text | First segmented data field from sheet |
| `original_sheet_data_segment_2` | Original Sheet Data Segment 2 | Single-line text | Second segmented data field |
| `original_sheet_data_segment_3` | Original Sheet Data Segment 3 | Single-line text | Third segmented data field |
| `original_sheet_data_segment_4` | Original Sheet Data Segment 4 | Single-line text | Fourth segmented data field |
| `original_sheet_data_segment_5` | Original Sheet Data Segment 5 | Single-line text | Fifth segmented data field |

**Note:** Add more `original_sheet_data_segment_N` properties as needed based on your sheet columns.

---

### **Property Creation Checklist**

- [ ] Property Group "Automation Information" created
- [ ] All 5 Company Properties created
- [ ] All 40+ Contact Properties created
- [ ] All Internal Names (API Names) noted exactly as listed above
- [ ] All Field Types match exactly

**CRUCIAL:** The Internal Name (API Name) must match EXACTLY - case-sensitive!

---

## 🔐 PART 3: External API Keys Storage

Navigate to: **HubSpot → Settings → Integrations → Private Apps → [Your App] → Secrets**

### **Required Secrets to Store**

#### **1. AnyMail API Key**
- **Secret Name:** `ANYMAIL_API_KEY`
- **Value:** Your AnyMail API key (e.g., `pRUtyDRHSPageC2jHGbnWGpD`)
- **How to Store:**
  - Via HubSpot CLI: `hs secrets add ANYMAIL_API_KEY`
  - Or manually in Custom Code Action editor

#### **2. Google Service Account JSON**
- **Secret Name:** `GOOGLE_SERVICE_ACCOUNT_JSON`
- **Value:** Complete JSON content of your Google Service Account key file
- **How to Store:**
  - Via HubSpot CLI: `hs secrets add GOOGLE_SERVICE_ACCOUNT_JSON`
  - Or manually in Custom Code Action editor
  - **Format:** Paste entire JSON as string

#### **3. Gemini AI API Key**
- **Secret Name:** `GEMINI_API_KEY`
- **Value:** Your Gemini API key (e.g., `AIzaSyAngHYLqf83H-hT7tqYhaEaEMq01FFyN2U`)
- **How to Store:**
  - Via HubSpot CLI: `hs secrets add GEMINI_API_KEY`
  - Or manually in Custom Code Action editor

#### **4. Gemini Project ID**
- **Secret Name:** `GEMINI_PROJECT_ID`
- **Value:** Your Gemini project ID (e.g., `560092674546`)
- **How to Store:**
  - Via HubSpot CLI: `hs secrets add GEMINI_PROJECT_ID`
  - Or manually in Custom Code Action editor

#### **5. HubSpot Private App Token**
- **Secret Name:** `HUBSPOT_ACCESS_TOKEN`
- **Value:** The Private App Access Token you copied in Part 1
- **How to Store:**
  - Via HubSpot CLI: `hs secrets add HUBSPOT_ACCESS_TOKEN`
  - Or manually in Custom Code Action editor

#### **6. Webhook Secret (Optional but Recommended)**
- **Secret Name:** `WEBHOOK_SECRET`
- **Value:** A random secret string for webhook signature verification
- **How to Store:**
  - Via HubSpot CLI: `hs secrets add WEBHOOK_SECRET`
  - Or manually in Custom Code Action editor

---

## 📧 PART 4: Marketing Email Setup

Navigate to: **Marketing → Email → Create Email → Automated Email**

### **Email Templates to Create**

Create **15 Automated Emails** (5 for each template set):

#### **Set One: Student Movement Sequence (5 emails)**
1. **Email 1:** `set_one_email_1`
   - Subject: "You're Invited: Help Build the Future of Creativity + Sustainable Design"
   - Personalization Tokens: `{{contact.firstname}}`, `{{contact.lastname}}`, `{{contact.automation_lead_type}}`
   - **Internal ID:** Note this ID for workflow reference

2. **Email 2:** `set_one_email_2`
   - Subject: "You're now part of a growing creative movement — here's what's happening"
   - Personalization Tokens: Same as above

3. **Email 3:** `set_one_email_3`
   - Subject: "Follow the journey: See what students are building"
   - Personalization Tokens: Same as above

4. **Email 4:** `set_one_email_4`
   - Subject: "Your turn: Join the creative challenge"
   - Personalization Tokens: Same as above

5. **Email 5:** `set_one_email_5`
   - Subject: "Keep building: Resources and next steps"
   - Personalization Tokens: Same as above

#### **Set Two: Referral Email Sequence (1 email)**
1. **Email 1:** `set_two_email_1`
   - Subject: "Partnership Opportunity: Join Our Network"
   - Personalization Tokens: `{{contact.firstname}}`, `{{contact.company}}`

#### **Set Three: B2B Partnerships Sequence (5 emails)**
1. **Email 1:** `set_three_email_1`
   - Subject: "Partnership Opportunity: Let's Build Together"
   - Personalization Tokens: `{{contact.firstname}}`, `{{contact.company}}`, `{{contact.jobtitle}}`

2. **Email 2-5:** Similar structure with different content

### **Personalization Tokens to Add**

Add these tokens to your email templates:
- `{{contact.firstname}}`
- `{{contact.lastname}}`
- `{{contact.company}}`
- `{{contact.jobtitle}}`
- `{{contact.automation_lead_type}}`
- `{{contact.automation_template_set}}`
- `{{contact.automation_lead_score}}`
- `{{contact.original_sheet_data_segment_1}}`
- `{{contact.original_sheet_data_segment_2}}`
- (Add more segment tokens as needed)

### **Email Publishing Checklist**

- [ ] All 15 emails created
- [ ] All personalization tokens inserted
- [ ] All emails **PUBLISHED** (not just saved)
- [ ] Internal IDs noted for each email
- [ ] Email IDs match workflow references

---

## ⚙️ PART 5: Workflow Shell Creation

Navigate to: **Automation → Workflows → Create Workflow**

### **Workflow 1: Google Drive File Upload - Initial Contact Creation**

1. **Create Workflow:**
   - Name: "Google Drive File Upload - Initial Contact Creation"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `automation_source`
   - Condition: "is equal to"
   - Value: `google_drive`

3. **Actions:**
   - Action 1: "Set contact property"
     - Property: `automation_ingested_at`
     - Value: `{{now}}`
   - Action 2: "Add to list"
     - List: "New Google Drive Leads" (create if doesn't exist)

4. **Save Workflow** (don't activate yet - will be connected later)

---

### **Workflow 2: Data Segmentation**

1. **Create Workflow:**
   - Name: "Automation - Data Segmentation"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `automation_ingested_at`
   - Condition: "has a value"

3. **Actions:**
   - Action 1: "If/then branch"
     - Condition: `automation_lead_type` equals `NGO`
     - Then: Add to list "NGO Leads"
     - Else if: `automation_lead_type` equals `School`
     - Then: Add to list "School Leads"
     - Else if: `automation_lead_type` equals `Student`
     - Then: Add to list "Student Leads"

4. **Save Workflow**

---

### **Workflow 3: AnyMail Enrichment Trigger**

1. **Create Workflow:**
   - Name: "Automation - Trigger AnyMail Enrichment"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `website`
   - Condition: "has a value"
   - AND
   - Property: `email`
   - Condition: "does not have a value"

3. **Actions:**
   - Action 1: "Custom code action"
     - Function: `anymail_enrichment`
     - Inputs: Map `website` property to function input

4. **Save Workflow**

---

### **Workflow 4: AnyMail Data Enrichment Complete**

1. **Create Workflow:**
   - Name: "Automation - AnyMail Data Enrichment Complete"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `automation_anymail_enriched`
   - Condition: "is equal to"
   - Value: `true`

3. **Actions:**
   - Action 1: "Set contact property"
     - Property: `automation_enriched_at`
     - Value: `{{now}}`
   - Action 2: "Add to list"
     - List: "Enriched Leads"

4. **Save Workflow**

---

### **Workflow 5: Lead Classification**

1. **Create Workflow:**
   - Name: "Automation - Lead Classification"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `automation_enriched_at`
   - Condition: "has a value"

3. **Actions:**
   - Action 1: "Custom code action"
     - Function: `classify_lead`
   - Action 2: "Set contact property"
     - Property: `automation_classified_at`
     - Value: `{{now}}`

4. **Save Workflow**

---

### **Workflow 6: Template Assignment**

1. **Create Workflow:**
   - Name: "Automation - Template Assignment"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `automation_lead_type`
   - Condition: "has a value"

3. **Actions:**
   - Action 1: "If/then branch"
     - Condition: `automation_lead_type` equals `NGO`
     - Then: Set `automation_template_set` = `ngo_templates`
     - Else if: `automation_lead_type` equals `School`
     - Then: Set `automation_template_set` = `school_templates`
     - Else if: `automation_lead_type` equals `Student`
     - Then: Set `automation_template_set` = `student_templates`

4. **Save Workflow**

---

### **Workflow 7: Sequence Enrollment**

1. **Create Workflow:**
   - Name: "Automation - Sequence Enrollment"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `automation_template_set`
   - Condition: "has a value"
   - AND
   - Property: `automation_sequence_status`
   - Condition: "does not have a value"

3. **Actions:**
   - Action 1: "Set contact property"
     - Property: `automation_sequence_status`
     - Value: `active`
   - Action 2: "Set contact property"
     - Property: `automation_sequence_step`
     - Value: `1`
   - Action 3: "Set contact property"
     - Property: `automation_sequence_started`
     - Value: `{{now}}`

4. **Save Workflow**

---

### **Workflow 8: Email Sending (Step 1)**

1. **Create Workflow:**
   - Name: "Automation - Send Sequence Email Step 1"
   - Type: Contact-based

2. **Enrollment Trigger:**
   - Trigger: "Contact property value changes"
   - Property: `automation_sequence_status`
   - Condition: "is equal to"
   - Value: `active`
   - AND
   - Property: `automation_sequence_step`
   - Condition: "is equal to"
   - Value: `1`

3. **Actions:**
   - Action 1: "Send marketing email"
     - Email: Select `set_one_email_1`, `set_two_email_1`, or `set_three_email_1` based on `automation_template_set`
   - Action 2: "Set contact property"
     - Property: `automation_last_email_sent`
     - Value: `{{now}}`
   - Action 3: "Set contact property"
     - Property: `automation_emails_sent`
     - Value: `{{automation_emails_sent + 1}}`

4. **Save Workflow**

---

### **Workflow 9-14: Additional Workflows**

Create similar workflows for:
- Workflow 9: Email Engagement Tracking
- Workflow 10: Sequence Step Progression
- Workflow 11: High Lead Score Notification
- Workflow 12: Bounce Handling
- Workflow 13: Reply Detection
- Workflow 14: Gemini AI Analysis

**Workflow Creation Checklist:**
- [ ] All 14 workflows created
- [ ] All enrollment triggers configured
- [ ] All actions added (Custom code actions will be connected later)
- [ ] All workflows saved (not activated yet)

---

## 📋 PART 6: Lists Creation

Navigate to: **Contacts → Lists → Create List**

### **Lists to Create**

1. **New Google Drive Leads** - Static list (will be populated by workflow)
2. **Enriched Leads** - Static list
3. **Replied Leads** - Static list
4. **High Score Leads** - Active list (score >= 85)
5. **Active Sequences** - Active list (sequence_status = active)
6. **NGO Leads** - Static list
7. **School Leads** - Static list
8. **Student Leads** - Static list

**Lists Creation Checklist:**
- [ ] All 8 lists created
- [ ] Active lists have proper criteria set
- [ ] List names match workflow references exactly

---

## ☁️ PART 7: Google Cloud Console Setup (External)

### **Step 1: Create Service Account**

1. Navigate to: **Google Cloud Console → IAM & Admin → Service Accounts**
2. Click **"Create Service Account"**
3. Name: `hingecraft-hubspot-automation`
4. Description: "Service account for HubSpot Google Drive integration"
5. Click **"Create and Continue"**
6. Skip role assignment (click **"Continue"**)
7. Click **"Done"**

### **Step 2: Generate Service Account Key**

1. Click on the created service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **JSON** format
5. Click **"Create"**
6. **Download the JSON file** - This is your `GOOGLE_SERVICE_ACCOUNT_JSON`

### **Step 3: Enable Google Drive API**

1. Navigate to: **APIs & Services → Library**
2. Search for **"Google Drive API"**
3. Click **"Enable"**

### **Step 4: Grant Access to Google Drive File**

1. Open the downloaded JSON file
2. Find the `client_email` field (e.g., `hingecraft-hubspot-automation@project-id.iam.gserviceaccount.com`)
3. Go to your Google Drive spreadsheet
4. Click **"Share"**
5. Add the service account email
6. Grant **"Viewer"** access (read-only is sufficient)
7. Click **"Send"**

**Google Cloud Checklist:**
- [ ] Service account created
- [ ] JSON key downloaded
- [ ] Google Drive API enabled
- [ ] Service account email has access to Drive file
- [ ] JSON content ready to paste into HubSpot secrets

---

## ✅ FINAL CHECKLIST

### **Before Starting Dev Mode Work:**

- [ ] **Part 1:** Private App created with ALL 30+ scopes
- [ ] **Part 1:** Access Token copied and saved
- [ ] **Part 2:** Property Group "Automation Information" created
- [ ] **Part 2:** ALL 5 Company Properties created with exact Internal Names
- [ ] **Part 2:** ALL 40+ Contact Properties created with exact Internal Names
- [ ] **Part 3:** ALL 6 secrets stored in HubSpot (AnyMail, Google, Gemini, HubSpot token, Webhook secret)
- [ ] **Part 4:** ALL 15 marketing emails created and PUBLISHED
- [ ] **Part 4:** All email Internal IDs noted
- [ ] **Part 5:** ALL 14 workflow shells created (not activated)
- [ ] **Part 6:** ALL 8 lists created
- [ ] **Part 7:** Google Service Account created and has Drive access
- [ ] **Part 7:** Google Service Account JSON downloaded

---

## 📝 Notes

1. **Internal Names are Case-Sensitive:** `automation_lead_type` ≠ `Automation_Lead_Type`
2. **Properties Must Exist Before Workflows:** Create all properties before creating workflows
3. **Emails Must Be Published:** Draft emails cannot be used in workflows
4. **Service Account JSON:** Store the entire JSON as a string in secrets
5. **Access Token:** Keep it secure - it provides full access to your HubSpot account

---

**Once ALL manual steps are complete, you're ready for Dev Mode configuration!** 🚀
