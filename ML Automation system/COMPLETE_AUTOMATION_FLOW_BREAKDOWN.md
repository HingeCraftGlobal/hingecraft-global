# 🔍 Complete Automation Flow - Detailed Breakdown

**Date**: December 12, 2025  
**Purpose**: Comprehensive breakdown of every stage in the automation pipeline

---

## 📋 Table of Contents

1. [Stage 1: File Detection → Pipeline Created](#stage-1-file-detection--pipeline-created)
2. [Stage 2: File Processing → File Parsed](#stage-2-file-processing--file-parsed)
3. [Stage 3: Lead Processing → Leads Normalized](#stage-3-lead-processing--leads-normalized)
4. [Stage 4: Database Integration → Leads Inserted](#stage-4-database-integration--leads-inserted)
5. [Stage 5: Email Collection → Emails Collected](#stage-5-email-collection--emails-collected)
6. [Stage 6: HubSpot Sync → Contacts Created](#stage-6-hubspot-sync--contacts-created)
7. [Stage 7: Sequence Initialization → Sequences Started](#stage-7-sequence-initialization--sequences-started)
8. [Stage 8: Email Sending → Emails Sent](#stage-8-email-sending--emails-sent)
9. [Stage 9: Event Tracking → Pipeline Completed](#stage-9-event-tracking--pipeline-completed)

---

## Stage 1: File Detection → Pipeline Created

### Overview
The system monitors Google Drive folder for new files and creates a pipeline when detected.

### Detailed Process

#### 1.1 Google Drive Polling
- **Component**: `googleDrive.scanFolder()`
- **Frequency**: Every 30 seconds
- **Location**: `src/index.js` - `pollDriveFolder()`
- **Process**:
  1. Query Google Drive API for files in folder `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
  2. Filter by supported file types (CSV, Excel, Google Sheets)
  3. Check file modification time vs. last scan time
  4. Check if file ID already processed (in `processedFileIds` Set)

#### 1.2 File Detection Logic
- **Check**: `fileModified > lastScanTime && !processedFileIds.has(file.id)`
- **Action**: Mark file as processed, add to `processedFileIds`
- **Trigger**: Call `orchestrator.processDriveFile(file.id)`

#### 1.3 Pipeline Creation
- **Component**: `systemWatcher.startPipelineTracking()`
- **Process**:
  1. Generate unique `pipelineId` (UUID)
  2. Create pipeline tracking record in memory
  3. Initialize stage tracking object
  4. Set pipeline status to `'processing'`
  5. Log pipeline start event

#### 1.4 Database Records Created
- **Table**: `import_batches`
  - `id`: UUID (importId)
  - `source`: 'google_drive'
  - `file_id`: Google Drive file ID
  - `filename`: File name from metadata
  - `status`: 'processing'
  - `created_at`: Current timestamp

#### 1.5 Tracker Updates
- **Component**: `systemWatcher`
- **Updates**:
  - `activePipelines` Map: Add pipeline entry
  - `componentStatus.googleDrive`: Set to 'active'
  - Log event: `'FILE_DETECTED'` with file metadata

### Database Tables Involved
- `import_batches` - New record created
- `audit_log` - Event logged (optional)

### Success Criteria
- ✅ File detected within 30 seconds
- ✅ Pipeline ID generated
- ✅ Import batch record created
- ✅ System watcher tracking pipeline
- ✅ File metadata retrieved

### Error Handling
- File not found → Error logged, pipeline marked failed
- API rate limit → Retry with exponential backoff
- Invalid file type → Skip file, log warning

---

## Stage 2: File Processing → File Parsed

### Overview
Download/read file from Google Drive and parse into structured data.

### Detailed Process

#### 2.1 File Metadata Retrieval
- **Component**: `googleDrive.getFileMetadata(fileId)`
- **Process**:
  1. Call Google Drive API: `drive.files.get()`
  2. Retrieve: `id`, `name`, `mimeType`, `createdTime`, `modifiedTime`, `size`
  3. Validate file is supported type

#### 2.2 File Type Detection
- **Component**: `fileProcessor.detectFileType(name, mimeType)`
- **Supported Types**:
  - Google Sheets: `application/vnd.google-apps.spreadsheet` → Use Sheets API
  - Excel: `.xlsx`, `.xls`, `.xlsm` → Download and parse
  - CSV: `.csv`, `.tsv` → Download and parse
  - OpenDocument: `.ods` → Download and parse

#### 2.3 File Reading
**For Google Sheets**:
- **Component**: `googleDrive.readSheet(fileId)`
- **Process**:
  1. Call Google Sheets API: `sheets.spreadsheets.values.get()`
  2. Read range: 'Sheet1' (or specified range)
  3. Extract values array

**For Other Formats**:
- **Component**: `googleDrive.downloadFile(fileId)`
- **Process**:
  1. Call Google Drive API: `drive.files.get()` with `alt: 'media'`
  2. Download file as buffer
  3. Pass to `fileProcessor.processFile(buffer, name, mimeType)`

#### 2.4 File Parsing
- **Component**: `fileProcessor.processFile()`
- **Process**:
  1. Detect delimiter (CSV: comma, TSV: tab)
  2. Parse first row as headers
  3. Parse remaining rows as data
  4. Normalize column names (lowercase, trim, replace spaces)
  5. Return: `{ headers: [], rows: [], totalRows: number }`

#### 2.5 Data Structure Created
```javascript
{
  headers: ['email', 'first_name', 'last_name', 'organization', ...],
  rows: [
    { rowNumber: 2, data: { email: '...', first_name: '...', ... } },
    { rowNumber: 3, data: { email: '...', first_name: '...', ... } },
    ...
  ],
  totalRows: 100
}
```

#### 2.6 Tracker Updates
- **Component**: `systemWatcher.watchFileProcessing()`
- **Updates**:
  - Stage: `fileProcessing` → `'started'`
  - Log: File type, row count, column count
  - Stage: `fileProcessing` → `'completed'` with duration

### Database Tables Involved
- `import_batches` - Updated with `total_rows`
- `audit_log` - File processing event logged

### Success Criteria
- ✅ File downloaded/read successfully
- ✅ Headers extracted correctly
- ✅ All rows parsed
- ✅ Data structure created
- ✅ File type detected correctly

### Error Handling
- Download fails → Retry 3 times, then mark failed
- Parse error → Log row number and error, continue with other rows
- Invalid format → Mark import batch as error

---

## Stage 3: Lead Processing → Leads Normalized

### Overview
Process raw lead data: normalize, validate, deduplicate, and enrich.

### Detailed Process

#### 3.1 Lead Normalization
- **Component**: `leadProcessor.normalizeLead(rawRow)`
- **Process**:
  1. Extract email (required field)
  2. Normalize email: lowercase, trim
  3. Extract name fields:
     - If `name` exists → Split into `first_name`, `last_name`
     - If `first_name` and `last_name` exist → Use as-is
     - If only `first_name` → Set `last_name` to empty
  4. Normalize organization: trim, capitalize
  5. Normalize phone: Remove non-digits, format
  6. Extract domain from email for fingerprinting

#### 3.2 Fingerprinting (Deduplication)
- **Component**: `leadProcessor.computeFingerprint(lead)`
- **Process**:
  1. Create fingerprint string: `email|normalized_name|normalized_org|normalized_domain`
  2. Hash with SHA256: `compute_fingerprint()` database function
  3. Check if fingerprint exists in `leads` table
  4. If exists → Mark as duplicate, skip insertion
  5. If new → Continue processing

#### 3.3 Lead Validation
- **Component**: `leadProcessor.validateLead(lead)`
- **Validations**:
  1. **Email**: Valid format, not empty
  2. **Name**: At least first_name or name present
  3. **Suppression Check**: Email not in `suppression_list`
  4. **Domain Check**: Not a known spam domain
  5. **Required Fields**: Email is required

#### 3.4 Staging
- **Component**: `leadProcessor.stageLeads()`
- **Process**:
  1. Insert into `staging_leads` table:
     - `import_id`: Link to import batch
     - `raw_row`: Original JSONB data
     - `normalized`: Normalized JSONB data
     - `fingerprint`: Computed fingerprint
     - `status`: 'pending' → 'validated' or 'duplicate' or 'error'
  2. Batch insert for performance (100 rows at a time)

#### 3.5 Lead Enrichment (Optional)
- **Component**: `leadProcessor.enrichLead(lead)`
- **Process** (if configured):
  1. Call Anymail API for email validation
  2. Get GenSpark ID (if configured)
  3. Score lead: `leadProcessor.scoreLead(lead)`
  4. Determine persona, Ferguson Matrix stage, BPSD tags
  5. Store in `enrichment_data` JSONB field

#### 3.6 Lead Scoring
- **Component**: `leadProcessor.scoreLead(lead)`
- **Scoring Factors**:
  - Email domain quality (0-20 points)
  - Name completeness (0-15 points)
  - Organization presence (0-15 points)
  - Phone number (0-10 points)
  - Website presence (0-10 points)
  - Location data (0-10 points)
  - Enrichment data (0-20 points)
- **Total**: 0-100 points
- **Qualification**: Score >= 65 for sequence enrollment

#### 3.7 Final Lead Objects
```javascript
{
  id: UUID,
  email: 'normalized@example.com',
  first_name: 'John',
  last_name: 'Doe',
  organization: 'Acme Corp',
  phone: '5551234',
  website: 'https://example.com',
  city: 'San Francisco',
  state: 'CA',
  country: 'USA',
  source: 'google_drive',
  source_file_id: '...',
  source_row_number: 2,
  fingerprint: 'sha256hash...',
  persona_score: 75,
  status: 'new',
  enrichment_data: { ... }
}
```

#### 3.8 Tracker Updates
- **Component**: `systemWatcher.watchLeadProcessing()`
- **Updates**:
  - Stage: `leadProcessing` → `'started'`
  - Log: Processed count, errors count, enriched count
  - Stage: `leadProcessing` → `'completed'` with metrics

### Database Tables Involved
- `staging_leads` - All leads staged here first
- `leads` - Final normalized leads (after deduplication)
- `suppression_list` - Checked for email suppression

### Success Criteria
- ✅ All rows processed
- ✅ Leads normalized correctly
- ✅ Duplicates identified and skipped
- ✅ Validation errors logged
- ✅ Enrichment completed (if configured)
- ✅ Scores calculated

### Error Handling
- Invalid email → Mark as error, continue with next
- Duplicate → Skip insertion, log duplicate
- Validation failure → Mark in `validation_errors` array
- Enrichment failure → Continue without enrichment

---

## Stage 4: Database Integration → Leads Inserted

### Overview
Insert validated leads into the canonical `leads` table.

### Detailed Process

#### 4.1 Bulk Insert Preparation
- **Component**: `leadProcessor.insertLeads()`
- **Process**:
  1. Get validated leads from `staging_leads` where `status = 'validated'`
  2. Group into batches of 100 for performance
  3. Prepare INSERT statement with all fields

#### 4.2 Database Insert
- **SQL**: 
```sql
INSERT INTO leads (
  email, first_name, last_name, organization, title, phone, website,
  city, state, country, source, source_file_id, source_row_number,
  fingerprint, persona_score, status, enrichment_data, raw_meta
)
VALUES ($1, $2, $3, ...)
ON CONFLICT (email) DO UPDATE
SET updated_at = NOW(), ...
ON CONFLICT (fingerprint) DO NOTHING
```

#### 4.3 Conflict Handling
- **Email Conflict**: Update existing lead with new data
- **Fingerprint Conflict**: Skip (duplicate detected)
- **Other Conflicts**: Log and continue

#### 4.4 Update Staging Status
- **SQL**:
```sql
UPDATE staging_leads
SET status = 'processed', processed_at = NOW()
WHERE import_id = $1 AND status = 'validated'
```

#### 4.5 Index Updates
- Database automatically updates indexes:
  - `idx_leads_email`
  - `idx_leads_fingerprint`
  - `idx_leads_status`
  - `idx_leads_source`

#### 4.6 Tracker Updates
- **Component**: `systemWatcher.watchDatabaseOperation()`
- **Updates**:
  - Stage: `databaseIntegration` → `'started'`
  - Log: Operation type ('insert'), table ('leads'), count
  - Stage: `databaseIntegration` → `'completed'` with metrics

### Database Tables Involved
- `leads` - Final lead records inserted
- `staging_leads` - Status updated to 'processed'
- `import_batches` - `processed_rows` updated

### Success Criteria
- ✅ All validated leads inserted
- ✅ Duplicates handled correctly
- ✅ Indexes updated
- ✅ Staging records marked processed
- ✅ Import batch updated

### Error Handling
- Insert failure → Retry individual inserts
- Constraint violation → Log and skip
- Database connection lost → Retry with backoff

---

## Stage 5: Email Collection → Emails Collected

### Overview
Collect and validate emails from processed leads, optionally enrich with Anymail.

### Detailed Process

#### 5.1 Email Extraction
- **Component**: `emailWaveSender.collectEmailsFromLeads()`
- **Process**:
  1. Filter leads with valid email addresses
  2. Extract email, name, and metadata
  3. Group by sequence/step if applicable

#### 5.2 Email Validation
- **Component**: Email validation (regex + optional Anymail)
- **Validations**:
  1. Format validation (regex)
  2. Domain validation (not disposable, not spam)
  3. Anymail API check (if configured):
     - Email deliverability
     - Bounce risk
     - Spam score

#### 5.3 Suppression Check
- **SQL**:
```sql
SELECT email FROM suppression_list WHERE email = $1
```
- **Action**: Skip suppressed emails

#### 5.4 Email Enrichment (Anymail)
- **Component**: `anymail.enrichEmail(email)`
- **Process** (if configured):
  1. Call Anymail API: `GET /v1/email/{email}`
  2. Get enrichment data:
     - Email deliverability status
     - Associated social profiles
     - Company information
     - Additional contact methods
  3. Store in `leads.enrichment_data`

#### 5.5 Email Collection Result
```javascript
{
  emails: [
    {
      to: 'lead@example.com',
      lead_id: UUID,
      first_name: 'John',
      last_name: 'Doe',
      organization: 'Acme Corp',
      sequence_id: UUID,
      step_number: 1,
      template: { subject: '...', html: '...' },
      metadata: { ... }
    },
    ...
  ],
  total: 100,
  valid: 95,
  suppressed: 3,
  invalid: 2
}
```

#### 5.6 Tracker Updates
- **Component**: `systemWatcher.watchEmailCollection()`
- **Updates**:
  - Stage: `emailCollection` → `'started'`
  - Log: Total emails, enriched count, valid count
  - Stage: `emailCollection` → `'completed'` with metrics

### Database Tables Involved
- `leads` - Email addresses extracted
- `suppression_list` - Checked for suppression
- `email_logs` - Prepared for email sending

### Success Criteria
- ✅ All valid emails collected
- ✅ Suppressed emails skipped
- ✅ Invalid emails filtered
- ✅ Enrichment completed (if configured)
- ✅ Email collection ready for sending

### Error Handling
- Anymail API failure → Continue without enrichment
- Rate limit → Retry with backoff
- Invalid email → Skip and log

---

## Stage 6: HubSpot Sync → Contacts Created

### Overview
Sync leads to HubSpot CRM, creating or updating contact records.

### Detailed Process

#### 6.1 HubSpot Contact Preparation
- **Component**: `hubspot.upsertContact(lead)`
- **Process**:
  1. Map lead fields to HubSpot properties:
     - `email` → `email`
     - `first_name` → `firstname`
     - `last_name` → `lastname`
     - `organization` → `company`
     - `phone` → `phone`
     - `website` → `website`
     - Custom properties from `enrichment_data`
  2. Create HubSpot contact object

#### 6.2 HubSpot API Call
- **Endpoint**: `POST /crm/v3/objects/contacts`
- **Method**: Upsert (create or update)
- **Process**:
  1. Check if contact exists by email
  2. If exists → Update: `PATCH /crm/v3/objects/contacts/{contactId}`
  3. If new → Create: `POST /crm/v3/objects/contacts`
  4. Return HubSpot contact ID

#### 6.3 HubSpot Sync Record
- **SQL**:
```sql
INSERT INTO hubspot_sync (
  lead_id, hubspot_contact_id, sync_status, last_sync_at
)
VALUES ($1, $2, 'synced', NOW())
ON CONFLICT (hubspot_contact_id) DO UPDATE
SET lead_id = EXCLUDED.lead_id, last_sync_at = NOW()
```

#### 6.4 Company Association (Optional)
- **Process** (if organization provided):
  1. Search for company in HubSpot by name
  2. If found → Associate contact with company
  3. If not found → Create company, then associate
  4. Store `hubspot_company_id` in sync record

#### 6.5 Lead Qualification Check
- **Component**: `leadProcessor.scoreLead(lead)`
- **Process**:
  1. Calculate lead score (0-100)
  2. If score >= 65 → Lead is qualified
  3. Qualified leads → Proceed to sequence initialization
  4. Unqualified leads → Skip sequence (but still in HubSpot)

#### 6.6 Tracker Updates
- **Component**: `systemWatcher.watchHubSpotSync()`
- **Updates**:
  - Stage: `hubspotSync` → `'started'`
  - Log: Each sync (contact ID, lead ID, status, duration)
  - Stage: `hubspotSync` → `'completed'` with totals

### Database Tables Involved
- `hubspot_sync` - Sync records created/updated
- `leads` - Lead data synced
- `audit_log` - Sync events logged

### Success Criteria
- ✅ All leads synced to HubSpot
- ✅ Contact records created/updated
- ✅ HubSpot IDs stored
- ✅ Company associations created (if applicable)
- ✅ Sync status tracked

### Error Handling
- API rate limit → Retry with exponential backoff
- Contact creation failure → Log error, continue with next
- Network error → Retry 3 times
- Invalid data → Skip and log

---

## Stage 7: Sequence Initialization → Sequences Started

### Overview
Enroll qualified leads in email sequences and schedule first email.

### Detailed Process

#### 7.1 Sequence Selection
- **Component**: `sequenceEngine.initializeSequence(leadId, sequenceType)`
- **Process**:
  1. Query `sequences` table:
     ```sql
     SELECT * FROM sequences 
     WHERE sequence_type = $1 AND is_active = true
     ORDER BY created_at DESC LIMIT 1
     ```
  2. Default: `sequence_type = 'welcome'` for new leads
  3. Get sequence steps from `sequence_steps` table

#### 7.2 Sequence Steps Retrieval
- **SQL**:
```sql
SELECT * FROM sequence_steps
WHERE sequence_id = $1
ORDER BY step_number ASC
```
- **Result**: Array of steps with:
  - `step_number`: 1, 2, 3, ...
  - `delay_hours`: Hours to wait before sending
  - `subject_template`: Email subject template
  - `body_template`: Email body template
  - `conditions`: JSONB conditions (requires_open, requires_click, etc.)

#### 7.3 Lead Sequence Enrollment
- **SQL**:
```sql
INSERT INTO lead_sequences (
  lead_id, sequence_id, current_step, status,
  next_action_due, conditions_met
)
VALUES ($1, $2, 1, 'active', $3, '{}')
```
- **Process**:
  1. `current_step`: Start at step 1
  2. `status`: 'active'
  3. `next_action_due`: NOW() + delay_hours of step 1
  4. `conditions_met`: Empty JSONB (will be populated as steps complete)

#### 7.4 First Email Scheduling
- **Process**:
  1. Get step 1 template
  2. Calculate send time: `NOW() + step1.delay_hours`
  3. If `delay_hours = 0` → Send immediately
  4. If `delay_hours > 0` → Schedule for future
  5. Store in `lead_sequences.next_action_due`

#### 7.5 Template Preparation
- **Component**: `sequenceEngine.prepareTemplate(step, lead)`
- **Process**:
  1. Load template from `sequence_steps.body_template`
  2. Replace variables:
     - `{{first_name}}` → lead.first_name
     - `{{last_name}}` → lead.last_name
     - `{{organization}}` → lead.organization
     - `{{email}}` → lead.email
     - Custom variables from `enrichment_data`
  3. Generate final HTML email

#### 7.6 Sequence Status Tracking
- **Updates**:
  - `lead_sequences.status`: 'active'
  - `lead_sequences.current_step`: 1
  - `lead_sequences.next_action_due`: Calculated timestamp
  - `leads.status`: Updated to 'contacted' (if first contact)

#### 7.7 Tracker Updates
- **Component**: `systemWatcher.watchSequenceInitialization()`
- **Updates**:
  - Log: Sequence initialized, lead ID, sequence ID, step number
  - Track: Number of sequences initialized

### Database Tables Involved
- `sequences` - Sequence definitions queried
- `sequence_steps` - Step templates retrieved
- `lead_sequences` - Enrollment records created
- `leads` - Status updated to 'contacted'

### Success Criteria
- ✅ Qualified leads enrolled (score >= 65)
- ✅ Sequence selected correctly
- ✅ Steps retrieved
- ✅ Enrollment record created
- ✅ First email scheduled
- ✅ Template prepared

### Error Handling
- No sequence found → Log warning, skip enrollment
- Template error → Use default template, log error
- Enrollment failure → Retry, then skip

---

## Stage 8: Email Sending → Emails Sent

### Overview
Send welcome emails to qualified leads in waves to respect rate limits.

### Detailed Process

#### 8.1 Email Collection for Sending
- **Component**: `emailWaveSender.collectEmailsFromLeads(qualifiedLeads, template)`
- **Process**:
  1. Filter leads with:
     - Valid email address
     - Sequence initialized
     - Score >= 65
     - Not suppressed
  2. Prepare email objects with template

#### 8.2 Template Personalization
- **Component**: `emailWaveSender.personalizeTemplate(template, lead)`
- **Process**:
  1. Replace `{{first_name}}` with lead.first_name
  2. Replace `{{last_name}}` with lead.last_name
  3. Replace `{{organization}}` with lead.organization
  4. Replace `{{email}}` with lead.email
  5. Replace custom variables from `enrichment_data`
  6. Generate final HTML

#### 8.3 Wave Preparation
- **Component**: `emailWaveSender.sendInWaves(emails)`
- **Configuration** (from `config/api_keys.js`):
  - `waveSize`: 75 emails per wave
  - `waveDelay`: 60000ms (1 minute between waves)
  - `batchConcurrency`: 10 emails sent concurrently within wave

#### 8.4 Wave Sending Process
**For each wave**:
1. Take next 75 emails from queue
2. Send concurrently (10 at a time)
3. Wait for all 10 to complete
4. Send next 10
5. Repeat until wave complete
6. Wait `waveDelay` before next wave

#### 8.5 Email Sending (Gmail API)
- **Component**: `gmail.sendEmail(emailData)`
- **Process**:
  1. Build email message:
     - To: lead email
     - From: `marketinghingecraft@gmail.com`
     - Subject: Personalized subject
     - Body: Personalized HTML
  2. Call Gmail API: `gmail.users.messages.send()`
  3. Get message ID from response
  4. Store in `email_logs` table

#### 8.6 Email Log Creation
- **SQL**:
```sql
INSERT INTO email_logs (
  lead_id, sequence_id, step_number, provider,
  provider_message_id, to_email, subject, template_id,
  status, sent_at
)
VALUES ($1, $2, $3, 'gmail', $4, $5, $6, $7, 'sent', NOW())
```

#### 8.7 Rate Limiting
- **Gmail Limits**:
  - 500 emails per day (personal account)
  - ~2 emails per second
- **Implementation**:
  - Wave size: 75 (respects daily limit)
  - Delay between waves: 1 minute
  - Concurrency: 10 (allows for rate limit buffer)

#### 8.8 DRY RUN Mode
- **Check**: `config.app.dryRun`
- **If true**:
  - Validate email (format, personalization)
  - Log email (as if sent)
  - **DO NOT** actually send via Gmail API
  - Status: 'queued' (not 'sent')

#### 8.9 Tracker Updates
- **Component**: `systemWatcher.watchEmailSending()`
- **Updates**:
  - Log: Each email sent (or validated in DRY RUN)
  - Track: Sent count, failed count, wave count
  - Stage: Email sending progress

### Database Tables Involved
- `email_logs` - Email records created
- `lead_sequences` - `last_sent_at` updated
- `leads` - `last_contacted_at` updated
- `message_logs` - Email events logged (if webhook received)

### Success Criteria
- ✅ All qualified leads receive welcome email
- ✅ Emails personalized correctly
- ✅ Rate limits respected
- ✅ Email logs created
- ✅ Gmail API calls successful (or validated in DRY RUN)

### Error Handling
- Gmail API rate limit → Retry with exponential backoff
- Send failure → Log error, continue with next email
- Invalid email → Skip and log
- Network error → Retry 3 times

---

## Stage 9: Event Tracking → Pipeline Completed

### Overview
Finalize pipeline, update all records, and log completion events.

### Detailed Process

#### 9.1 Import Batch Completion
- **SQL**:
```sql
UPDATE import_batches
SET status = 'completed',
    total_rows = $1,
    processed_rows = $2,
    finished_at = NOW()
WHERE id = $3
```

#### 9.2 Pipeline Summary Creation
- **Component**: `systemWatcher.completePipelineTracking(pipelineId, summary)`
- **Summary Object**:
```javascript
{
  total_rows: 100,
  processed: 95,
  errors: 5,
  hubspot_synced: 90,
  sequences_initialized: 75,
  emails_sent: 75,
  emails_failed: 0,
  email_waves: 1
}
```

#### 9.3 Audit Log Entry
- **SQL**:
```sql
INSERT INTO audit_log (
  actor, action, entity_type, entity_id, payload
)
VALUES (
  'system', 'file_processed', 'import_batch', $1, $2
)
```
- **Payload** (JSONB):
```json
{
  "file_id": "...",
  "filename": "test.csv",
  "total_rows": 100,
  "processed": 95,
  "errors": 5,
  "synced_to_hubspot": 90,
  "sequences_initialized": 75,
  "emails_sent": 75
}
```

#### 9.4 Statistics Update
- **Component**: Statistics calculated on-demand
- **Queries**:
  - Total leads: `SELECT COUNT(*) FROM leads`
  - New leads: `SELECT COUNT(*) FROM leads WHERE status = 'new'`
  - Active sequences: `SELECT COUNT(*) FROM lead_sequences WHERE status = 'active'`
  - Emails sent: `SELECT COUNT(*) FROM email_logs WHERE status = 'sent'`

#### 9.5 Pipeline Status Update
- **Component**: `systemWatcher.completePipelineTracking()`
- **Updates**:
  - Pipeline status: 'completed'
  - All stages marked complete
  - Summary stored
  - Pipeline removed from `activePipelines` Map

#### 9.6 Component Status Reset
- **Component**: `systemWatcher`
- **Updates**:
  - All components back to 'standby'
  - `waitingForFile`: true
  - `mode`: 'standby'
  - Ready for next file

#### 9.7 Final Logging
- **Events Logged**:
  - Pipeline completed
  - Summary statistics
  - Duration
  - Success/failure status

### Database Tables Involved
- `import_batches` - Status updated to 'completed'
- `audit_log` - Completion event logged
- All other tables - Final state recorded

### Success Criteria
- ✅ Import batch marked complete
- ✅ All statistics updated
- ✅ Audit log created
- ✅ Pipeline tracking completed
- ✅ System ready for next file

### Error Handling
- Update failure → Retry
- Logging failure → Continue (non-critical)

---

## 📊 Complete Flow Summary

### Input
- File uploaded to Google Drive folder

### Processing (9 Stages)
1. File Detection (30s) → Pipeline created
2. File Processing → File parsed
3. Lead Processing → Leads normalized
4. Database Integration → Leads inserted
5. Email Collection → Emails collected
6. HubSpot Sync → Contacts created
7. Sequence Initialization → Sequences started
8. Email Sending → Emails sent
9. Event Tracking → Pipeline completed

### Output
- Leads in `leads` table
- Contacts in HubSpot
- Sequences active in `lead_sequences`
- Emails sent (logged in `email_logs`)
- Complete audit trail in `audit_log`

### Tracking
- Every stage tracked via `systemWatcher`
- All events logged
- Real-time monitoring available
- Complete pipeline report generated

---

## 🔍 Database Tables Used

### Primary Tables
1. `import_batches` - File import tracking
2. `staging_leads` - Temporary lead staging
3. `leads` - Canonical lead store
4. `sequences` - Email sequence definitions
5. `sequence_steps` - Individual email steps
6. `lead_sequences` - Lead enrollment tracking
7. `email_logs` - Email sending history
8. `hubspot_sync` - HubSpot synchronization
9. `message_logs` - Event tracking
10. `suppression_list` - Suppressed contacts
11. `audit_log` - System audit trail

### Relationships
- `leads` ← `lead_sequences` (one-to-many)
- `leads` ← `email_logs` (one-to-many)
- `leads` ← `hubspot_sync` (one-to-one)
- `sequences` ← `sequence_steps` (one-to-many)
- `sequences` ← `lead_sequences` (one-to-many)
- `import_batches` ← `staging_leads` (one-to-many via import_id)

---

**Status**: ✅ **COMPLETE BREAKDOWN READY**  
**Next**: Verify email templates with GPT
