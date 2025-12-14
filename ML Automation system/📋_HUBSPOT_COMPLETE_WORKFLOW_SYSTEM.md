# 📋 HubSpot Complete Workflow System

## 🎯 Overview

Complete HubSpot workflow system built from entire database schema using HubSpot Dev Mode features:
- **Custom Apps** - For Google Drive and external API integrations
- **Serverless Functions** - For AnyMail, Gemini AI, and classification
- **CRM Objects API** - For all data sync operations
- **Workflows** - For automation and sequencing
- **Custom Properties** - For all database fields
- **Lists** - For segmentation
- **Webhooks** - For two-way sync

---

## 📊 Database to HubSpot Mapping

### Complete Property Mapping

All database tables and columns are mapped to HubSpot properties:

#### **leads** table → Contact Properties
- `email` → `email` (standard)
- `first_name` → `firstname` (standard)
- `last_name` → `lastname` (standard)
- `organization` → `company` (standard)
- `title` → `jobtitle` (standard)
- `phone` → `phone` (standard)
- `website` → `website` (standard)
- `city` → `city` (standard)
- `state` → `state` (standard)
- `country` → `country` (standard)
- `source` → `automation_source`
- `source_file_id` → `automation_source_file_id`
- `source_row_number` → `automation_source_row_number`
- `lead_type` → `automation_lead_type`
- `template_set` → `automation_template_set`
- `lead_score` → `automation_lead_score`
- `status` → `automation_status`
- `tier` → `automation_tier`
- `persona_score` → `automation_persona_score`
- `fm_stage` → `automation_fm_stage`
- `preferred_tone` → `automation_preferred_tone`
- `has_donated` → `automation_has_donated`

#### **lead_sequences** table → Contact Properties
- `sequence_id` → `automation_sequence_id`
- `current_step` → `automation_sequence_step`
- `status` → `automation_sequence_status`
- `last_sent_at` → `automation_last_email_sent`
- `next_action_due` → `automation_next_action_due`

#### **email_tracking** table → Contact Properties
- `emails_sent` → `automation_emails_sent`
- `emails_opened` → `automation_emails_opened`
- `emails_clicked` → `automation_emails_clicked`
- `emails_replied` → `automation_emails_replied`

#### **lead_segments** table → Contact Properties
- `segment_name` → `automation_segment_name`
- `segment_type` → `automation_segment_type`

#### **lead_analysis** table → Contact Properties
- `analysis_type` → `automation_analysis_type`
- `analysis_data` → `automation_analysis_data` (JSON string)

---

## 🔄 Complete Workflow System

### Workflow 1: Google Drive File Upload → Initial Contact Creation
**Trigger**: `automation_source = 'google_drive'`
**Actions**:
1. Set `automation_ingested_at` = now
2. Add to list: "New Google Drive Leads"

**Purpose**: Captures all leads imported from Google Drive files

---

### Workflow 2: Data Segmentation
**Trigger**: `automation_ingested_at` has property
**Actions**:
- Branch on `automation_lead_type`:
  - `NGO` → Add to "NGO Leads" list
  - `School` → Add to "School Leads" list
  - `Student` → Add to "Student Leads" list

**Purpose**: Automatically segments leads based on classification

---

### Workflow 3: AnyMail Enrichment Trigger
**Trigger**: 
- `website` has property
- `email` does NOT have property
**Actions**:
- Call Serverless Function: `anymail_enrichment`

**Purpose**: Triggers email finding when company URL exists but email doesn't

---

### Workflow 4: AnyMail Data Enrichment Complete
**Trigger**: `automation_anymail_enriched = 'true'`
**Actions**:
1. Set `automation_enriched_at` = now
2. Add to list: "Enriched Leads"

**Purpose**: Marks leads as enriched and adds to tracking list

---

### Workflow 5: Lead Classification
**Trigger**: `automation_enriched_at` has property
**Actions**:
1. Call Serverless Function: `classify_lead`
2. Set `automation_classified_at` = now

**Purpose**: Classifies lead using ML model after enrichment

---

### Workflow 6: Template Assignment
**Trigger**: `automation_lead_type` has property
**Actions**:
- Branch on `automation_lead_type`:
  - `NGO` → Set `automation_template_set` = 'ngo_templates'
  - `School` → Set `automation_template_set` = 'school_templates'
  - `Student` → Set `automation_template_set` = 'student_templates'

**Purpose**: Assigns correct email template set based on lead type

---

### Workflow 7: Sequence Enrollment
**Trigger**:
- `automation_template_set` has property
- `automation_sequence_status` does NOT have property
**Actions**:
1. Set `automation_sequence_status` = 'active'
2. Set `automation_sequence_step` = '1'
3. Set `automation_sequence_started` = now

**Purpose**: Enrolls lead in email sequence

---

### Workflow 8: Email Sending (Step 1)
**Trigger**:
- `automation_sequence_status` = 'active'
- `automation_sequence_step` = '1'
- `automation_sequence_started` has property
**Actions**:
1. Send email: `{{automation_template_set}}_step_1`
2. Set `automation_last_email_sent` = now
3. Increment `automation_emails_sent`

**Purpose**: Sends first email in sequence

---

### Workflow 9: Email Engagement Tracking
**Trigger**: `automation_last_email_sent` has property
**Actions**:
- Branch on `email_opened`:
  - `true` → Increment `automation_emails_opened`, Set `automation_last_email_opened` = now
- Branch on `email_clicked`:
  - `true` → Increment `automation_emails_clicked`, Set `automation_last_email_clicked` = now

**Purpose**: Tracks email opens and clicks

---

### Workflow 10: Sequence Step Progression
**Trigger**:
- `automation_sequence_status` = 'active'
- `automation_last_email_sent` has property
**Actions**:
1. Delay 24 hours
2. Increment `automation_sequence_step`
3. Branch on step:
  - Step 2 → Send email: `{{automation_template_set}}_step_2`
  - Step 3 → Send email: `{{automation_template_set}}_step_3`
  - Step 4 → Send email: `{{automation_template_set}}_step_4`
  - Step 5 → Send email: `{{automation_template_set}}_step_5`, Set status = 'completed'

**Purpose**: Progresses through email sequence steps

---

### Workflow 11: High Lead Score Notification
**Trigger**: `automation_lead_score >= 85`
**Actions**:
- Send notification email to: `marketingecraft@gmail.com`
- Message: "High-value lead: {{firstname}} {{lastname}} (Score: {{automation_lead_score}})"

**Purpose**: Alerts team to high-value leads

---

### Workflow 12: Bounce Handling
**Trigger**: `automation_emails_bounced > 0`
**Actions**:
1. Set `automation_status` = 'suppressed'
2. Remove from all lists

**Purpose**: Handles email bounces and suppresses contacts

---

### Workflow 13: Reply Detection
**Trigger**: `automation_emails_replied > 0`
**Actions**:
1. Set `automation_sequence_status` = 'paused'
2. Add to list: "Replied Leads"
3. Create task: Follow-up (assign to owner)

**Purpose**: Pauses automation when lead replies

---

### Workflow 14: Gemini AI Analysis
**Trigger**: `automation_lead_score >= 70`
**Actions**:
1. Call Serverless Function: `gemini_drag_analysis`
2. Set `automation_ai_analyzed` = 'true'

**Purpose**: Performs DRAG analysis on high-scoring leads

---

## 🔧 Serverless Functions

### 1. anymail_enrichment
**Endpoint**: `/api/serverless/anymail-enrichment`
**Purpose**: Calls AnyMail API to find email addresses
**Trigger**: Contact property change (website added, email missing)

### 2. classify_lead
**Endpoint**: `/api/serverless/classify-lead`
**Purpose**: Classifies lead using ML model
**Trigger**: Contact creation or property change

### 3. gemini_drag_analysis
**Endpoint**: `/api/serverless/gemini-analysis`
**Purpose**: Performs DRAG analysis using Gemini AI
**Trigger**: Contact property change (high lead score)

### 4. google_drive_sync
**Endpoint**: `/api/serverless/google-drive-sync`
**Purpose**: Syncs data from Google Drive files
**Trigger**: Webhook from Google Drive

---

## 📱 Custom Apps

### HingeCraft Automation App
**Scopes**:
- `contacts` - Read/write contacts
- `content` - Email templates
- `automation` - Workflows
- `files` - File management
- `timeline` - Timeline events

**Endpoints**:
- `/api/custom-apps/google-drive` - Google Drive integration
- `/api/custom-apps/anymail` - AnyMail integration
- `/api/custom-apps/gemini` - Gemini AI integration

---

## 🔗 Webhooks

### Incoming (HubSpot → System)
- **Contact Creation**: `/api/webhooks/hubspot`
- **Contact Property Change**: `/api/webhooks/hubspot`
- **Contact Deletion**: `/api/webhooks/hubspot`
- **Email Engagement**: `/api/webhooks/hubspot`

### Outgoing (System → HubSpot)
- **AnyMail Results**: Auto-syncs via CRM Objects API
- **Gemini Analysis**: Auto-syncs via CRM Objects API
- **Email Tracking**: Auto-syncs via Timeline API

---

## 📋 Lists for Segmentation

1. **New Google Drive Leads** - All leads from Google Drive
2. **Enriched Leads** - Leads enriched with AnyMail
3. **Replied Leads** - Leads who replied
4. **High Score Leads** - Leads with score >= 85
5. **Active Sequences** - Leads in active sequences
6. **NGO Leads** - NGO segment
7. **School Leads** - School segment
8. **Student Leads** - Student segment
9. **Dynamic Lists** - From `lead_segments` table

---

## 🚀 Usage

### Build Complete Workflow System
```bash
node scripts/build-complete-hubspot-workflows.js
```

This will:
1. Map all database properties to HubSpot
2. Create all 14 workflows
3. Configure serverless functions
4. Setup webhooks
5. Create segmentation lists

### Verify Workflows
Check HubSpot → Automation → Workflows to see all created workflows

---

## ✅ Requirements Checklist

### Data Ingestion & Transformation ✅
- [x] Google Drive File Upload → Custom App
- [x] Leads Taken & Data Segmented → Workflows
- [x] Company URL to AnyMail → Serverless Function

### Data Enrichment & Mapping ✅
- [x] AnyMail Data Back to HubSpot → CRM Objects API
- [x] Fills in All Data → Custom Properties

### Automation & Outbound ✅
- [x] Configure Entire Segmentation Process → Lists & Workflows
- [x] Filling Proper Data for Each Prospect → Workflows
- [x] Sending Email → Workflows + Marketing Email Tool

---

## 📊 Data Flow

1. **Google Drive** → File detected
2. **Custom App** → Downloads and processes file
3. **CRM Objects API** → Creates contacts in HubSpot
4. **Workflow 1** → Marks as ingested
5. **Workflow 3** → Triggers AnyMail if needed
6. **Serverless Function** → Calls AnyMail API
7. **CRM Objects API** → Updates contact with email
8. **Workflow 4** → Marks as enriched
9. **Workflow 5** → Classifies lead
10. **Workflow 6** → Assigns template set
11. **Workflow 7** → Enrolls in sequence
12. **Workflow 8** → Sends first email
13. **Workflow 9** → Tracks engagement
14. **Workflow 10** → Progresses sequence
15. **Workflow 13** → Pauses on reply
16. **Workflow 14** → AI analysis for high scores

---

**System is 100% complete using HubSpot Dev Mode!** 🚀
