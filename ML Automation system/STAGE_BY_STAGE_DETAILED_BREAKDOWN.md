# 🔍 Complete Automation Flow - Stage-by-Stage Detailed Breakdown

**Date**: December 12, 2025  
**Purpose**: Comprehensive breakdown of every stage with database table mappings

---

## 📋 Overview

This document provides the **highest level of detail** for each stage in the automation pipeline, showing exactly what happens, which database tables are used, and how data flows through the system.

---

## Stage 1: File Detection → Pipeline Created

### 1.1 Google Drive Polling Mechanism

**Component**: `src/index.js` - `pollDriveFolder()`

**Process Flow**:
```
Every 30 seconds:
  1. Call googleDrive.scanFolder(folderId)
  2. Query Google Drive API: files.list()
  3. Filter by supported MIME types
  4. Check file.modifiedTime > lastScanTime
  5. Check !processedFileIds.has(file.id)
  6. If new file → orchestrator.processDriveFile(file.id)
```

**Database Queries**:
- **Check existing**: `SELECT id FROM import_batches WHERE file_id = $1 AND status = 'completed'`
- **Purpose**: Avoid reprocessing same file

**Tracker Updates**:
- `systemWatcher.activateWatcher(fileId, fileName)`
- Component status: `googleDrive` → 'active'
- Mode: 'standby' → 'active'
- Pipeline ID generated (UUID)

**Database Tables Used**:
- `import_batches` - New record created
- `audit_log` - File detection event logged

**Data Flow**:
```
Google Drive API
  ↓
File Metadata (id, name, mimeType, modifiedTime)
  ↓
Orchestrator.processDriveFile(fileId)
  ↓
Pipeline Created (pipelineId)
```

---

## Stage 2: File Processing → File Parsed

### 2.1 File Metadata Retrieval

**Component**: `googleDrive.getFileMetadata(fileId)`

**API Call**:
```javascript
drive.files.get({
  fileId: fileId,
  fields: 'id, name, mimeType, createdTime, modifiedTime, size, webViewLink'
})
```

**Database Record**:
- `import_batches.file_id` = fileId
- `import_batches.filename` = fileMetadata.name
- `import_batches.status` = 'processing'

### 2.2 File Type Detection

**Component**: `fileProcessor.detectFileType(name, mimeType)`

**Supported Types**:
- Google Sheets: `application/vnd.google-apps.spreadsheet`
- Excel: `.xlsx`, `.xls`, `.xlsm`
- CSV: `.csv`, `.tsv`, `.tab`
- OpenDocument: `.ods`

**Detection Logic**:
```javascript
if (mimeType === 'application/vnd.google-apps.spreadsheet') {
  return 'gsheet'; // Use Sheets API
} else if (name.endsWith('.xlsx')) {
  return 'xlsx'; // Download and parse
} else if (name.endsWith('.csv')) {
  return 'csv'; // Download and parse
}
```

### 2.3 File Reading

**For Google Sheets**:
```javascript
sheets.spreadsheets.values.get({
  spreadsheetId: fileId,
  range: 'Sheet1'
})
// Returns: { values: [[headers], [row1], [row2], ...] }
```

**For Other Formats**:
```javascript
drive.files.get({ fileId, alt: 'media' })
// Returns: Buffer
// Then: fileProcessor.processFile(buffer, name, mimeType)
```

### 2.4 File Parsing

**Component**: `fileProcessor.processFile(buffer, name, mimeType)`

**Process**:
1. Detect delimiter (CSV: comma, TSV: tab)
2. Parse first row → headers array
3. Parse remaining rows → data objects
4. Normalize headers (lowercase, trim, replace spaces with underscores)
5. Map each row to object: `{ rowNumber, data: { header1: value1, ... } }`

**Output Structure**:
```javascript
{
  headers: ['email', 'first_name', 'last_name', 'organization', ...],
  rows: [
    { rowNumber: 2, data: { email: 'test1@example.com', first_name: 'John', ... } },
    { rowNumber: 3, data: { email: 'test2@example.com', first_name: 'Jane', ... } },
    ...
  ],
  totalRows: 100
}
```

**Database Updates**:
- `import_batches.total_rows` = fileData.totalRows

**Tracker Updates**:
- Stage: `fileProcessing` → 'started'
- `systemWatcher.watchFileProcessing(fileId, fileType, totalRows, headers.length)`
- Stage: `fileProcessing` → 'completed' with duration

**Database Tables Used**:
- `import_batches` - Updated with total_rows

---

## Stage 3: Lead Processing → Leads Normalized

### 3.1 Lead Normalization

**Component**: `leadProcessor.normalizeLead(rawRow)`

**Normalization Steps**:

1. **Email Normalization**:
   ```javascript
   email = rawRow.email.toLowerCase().trim()
   // Validate: email regex
   // Extract domain: email.split('@')[1]
   ```

2. **Name Normalization**:
   ```javascript
   if (rawRow.name) {
     const parts = rawRow.name.split(' ');
     first_name = parts[0];
     last_name = parts.slice(1).join(' ');
   } else {
     first_name = rawRow.first_name || '';
     last_name = rawRow.last_name || '';
   }
   // Normalize: trim, capitalize first letter
   ```

3. **Organization Normalization**:
   ```javascript
   organization = (rawRow.organization || rawRow.company || '').trim()
   // Capitalize: organization.charAt(0).toUpperCase() + organization.slice(1).toLowerCase()
   ```

4. **Phone Normalization**:
   ```javascript
   phone = (rawRow.phone || '').replace(/\D/g, '') // Remove non-digits
   // Format: (XXX) XXX-XXXX if US format detected
   ```

5. **Website Normalization**:
   ```javascript
   website = (rawRow.website || '').trim()
   // Ensure starts with http:// or https://
   if (website && !website.startsWith('http')) {
     website = 'https://' + website;
   }
   ```

### 3.2 Fingerprinting (Deduplication)

**Component**: `leadProcessor.computeFingerprint(lead)`

**Process**:
1. Create fingerprint string:
   ```
   normalized_email|normalized_name|normalized_org|normalized_domain
   ```
2. Hash with SHA256 (database function):
   ```sql
   SELECT compute_fingerprint(email, name, organization, domain)
   ```
3. Check for existing fingerprint:
   ```sql
   SELECT id FROM leads WHERE fingerprint = $1
   ```
4. If exists → Mark as duplicate, skip
5. If new → Continue processing

**Database Function**:
```sql
CREATE OR REPLACE FUNCTION compute_fingerprint(
  p_email VARCHAR,
  p_name VARCHAR,
  p_org VARCHAR,
  p_domain VARCHAR
) RETURNS VARCHAR AS $$
-- Returns SHA256 hash (first 64 chars)
$$;
```

### 3.3 Lead Validation

**Component**: `leadProcessor.validateLead(lead)`

**Validations**:

1. **Email Validation**:
   ```javascript
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(lead.email)) {
     validation_errors.push('Invalid email format');
   }
   ```

2. **Suppression Check**:
   ```sql
   SELECT email FROM suppression_list WHERE email = $1
   ```
   - If found → Skip lead

3. **Required Fields**:
   - Email: Required
   - Name: At least first_name or name required

4. **Domain Validation**:
   - Check against known spam domains list
   - Check against disposable email domains

### 3.4 Staging

**Component**: `leadProcessor.stageLeads(fileData, fileId, importId)`

**Process**:
1. For each row in fileData.rows:
   - Normalize lead
   - Compute fingerprint
   - Validate lead
   - Insert into `staging_leads`:
     ```sql
     INSERT INTO staging_leads (
       import_id, source, file_id, row_number,
       raw_row, normalized, fingerprint, status, validation_errors
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ```

**Staging Status Values**:
- `'pending'` - Initial state
- `'validated'` - Passed validation
- `'duplicate'` - Fingerprint exists
- `'error'` - Validation failed

### 3.5 Lead Enrichment (Optional)

**Component**: `leadProcessor.enrichLead(lead)`

**Anymail Enrichment** (if configured):
```javascript
const enrichment = await anymail.enrichEmail(lead.email);
// Returns: { deliverability, social_profiles, company_info, ... }
```

**Lead Scoring**:
```javascript
const score = leadProcessor.scoreLead(lead);
// Factors:
// - Email domain quality: 0-20
// - Name completeness: 0-15
// - Organization: 0-15
// - Phone: 0-10
// - Website: 0-10
// - Location: 0-10
// - Enrichment: 0-20
// Total: 0-100
```

**Enrichment Data Structure**:
```json
{
  "anymail": {
    "deliverability": "high",
    "social_profiles": [...],
    "company_info": {...}
  },
  "persona_score": 75,
  "fm_stage": "awareness",
  "bpsd_tags": ["tech", "b2b"],
  "preferred_tone": "professional"
}
```

### 3.6 Final Lead Object

**Structure**:
```javascript
{
  id: UUID, // Generated on insert
  email: 'normalized@example.com',
  first_name: 'John',
  last_name: 'Doe',
  organization: 'Acme Corp',
  title: 'Manager',
  phone: '5551234',
  website: 'https://example.com',
  city: 'San Francisco',
  state: 'CA',
  country: 'USA',
  source: 'google_drive',
  source_file_id: 'google_drive_file_id',
  source_row_number: 2,
  fingerprint: 'sha256hash...',
  persona_score: 75,
  fm_stage: 'awareness',
  bpsd_tag: ['tech', 'b2b'],
  preferred_tone: 'professional',
  status: 'new',
  tier: 1,
  enrichment_data: { ... },
  raw_meta: { original_row_data },
  created_at: NOW(),
  updated_at: NOW()
}
```

**Tracker Updates**:
- Stage: `leadProcessing` → 'started'
- `systemWatcher.watchLeadProcessing(processed, errors, enriched, validated)`
- Stage: `leadProcessing` → 'completed' with metrics

**Database Tables Used**:
- `staging_leads` - All leads staged here first
- `leads` - Final validated leads (after deduplication)
- `suppression_list` - Checked for suppression

---

## Stage 4: Database Integration → Leads Inserted

### 4.1 Bulk Insert Preparation

**Component**: `leadProcessor.insertLeads(validatedLeads)`

**Process**:
1. Get validated leads from staging:
   ```sql
   SELECT * FROM staging_leads 
   WHERE import_id = $1 AND status = 'validated'
   ```
2. Group into batches of 100
3. Prepare bulk INSERT statement

### 4.2 Database Insert

**SQL Statement**:
```sql
INSERT INTO leads (
  email, first_name, last_name, organization, title, phone, website,
  city, state, country, source, source_file_id, source_row_number,
  fingerprint, persona_score, fm_stage, bpsd_tag, preferred_tone,
  status, tier, enrichment_data, raw_meta
)
VALUES 
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22),
  ($23, $24, ...), -- Next lead
  ...
ON CONFLICT (email) DO UPDATE
SET 
  updated_at = NOW(),
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  organization = EXCLUDED.organization,
  ...
ON CONFLICT (fingerprint) DO NOTHING
```

**Conflict Handling**:
- **Email conflict**: Update existing lead (upsert)
- **Fingerprint conflict**: Skip (duplicate)
- **Other conflicts**: Log and continue

### 4.3 Update Staging Status

**SQL**:
```sql
UPDATE staging_leads
SET status = 'processed', processed_at = NOW()
WHERE import_id = $1 AND status = 'validated'
```

### 4.4 Update Import Batch

**SQL**:
```sql
UPDATE import_batches
SET processed_rows = (
  SELECT COUNT(*) FROM staging_leads 
  WHERE import_id = $1 AND status = 'processed'
)
WHERE id = $1
```

**Tracker Updates**:
- Stage: `databaseIntegration` → 'started'
- `systemWatcher.watchDatabaseOperation('insert', 'leads', count, 0)`
- Stage: `databaseIntegration` → 'completed'

**Database Tables Used**:
- `leads` - Final lead records
- `staging_leads` - Status updated to 'processed'
- `import_batches` - processed_rows updated

---

## Stage 5: Email Collection → Emails Collected

### 5.1 Email Extraction

**Component**: `emailWaveSender.collectEmailsFromLeads(leads, template)`

**Process**:
1. Filter leads with valid emails:
   ```javascript
   const validLeads = leads.filter(lead => {
     return lead.email && 
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) &&
            !isSuppressed(lead.email);
   });
   ```

2. Extract email data:
   ```javascript
   {
     to: lead.email,
     lead_id: lead.id,
     first_name: lead.first_name,
     last_name: lead.last_name,
     organization: lead.organization,
     sequence_id: lead.sequence_id,
     step_number: lead.step_number || 1
   }
   ```

### 5.2 Suppression Check

**SQL**:
```sql
SELECT email FROM suppression_list WHERE email = $1
```
- If found → Skip email
- If not found → Continue

### 5.3 Email Enrichment (Anymail)

**Component**: `anymail.enrichEmail(email)` (if configured)

**API Call**:
```javascript
GET https://api.anymail.com/v1/email/{email}
// Returns: { deliverability, social_profiles, company_info, ... }
```

**Enrichment Data Stored**:
- In `leads.enrichment_data` JSONB field
- Used for personalization and segmentation

### 5.4 Email Collection Result

**Structure**:
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
      template: {
        subject: 'Welcome to HingeCraft, {{first_name}}!',
        html: '<p>Hi {{first_name}}, ...</p>',
        template_id: 'welcome_1'
      },
      metadata: {
        persona_score: 75,
        fm_stage: 'awareness',
        ...
      }
    },
    ...
  ],
  total: 100,
  valid: 95,
  suppressed: 3,
  invalid: 2
}
```

**Tracker Updates**:
- Stage: `emailCollection` → 'started'
- `systemWatcher.watchEmailCollection(enriched, valid, total)`
- Stage: `emailCollection` → 'completed'

**Database Tables Used**:
- `leads` - Email addresses extracted
- `suppression_list` - Checked for suppression
- `email_logs` - Prepared for sending (not yet inserted)

---

## Stage 6: HubSpot Sync → Contacts Created

### 6.1 HubSpot Contact Preparation

**Component**: `hubspot.upsertContact(lead)`

**Field Mapping**:
```javascript
{
  properties: {
    email: lead.email,
    firstname: lead.first_name,
    lastname: lead.last_name,
    company: lead.organization,
    phone: lead.phone,
    website: lead.website,
    city: lead.city,
    state: lead.state,
    country: lead.country,
    // Custom properties from enrichment_data
    persona_score: lead.persona_score,
    fm_stage: lead.fm_stage,
    ...
  }
}
```

### 6.2 HubSpot API Call

**Endpoint**: `POST /crm/v3/objects/contacts`

**Process**:
1. Check if contact exists:
   ```javascript
   GET /crm/v3/objects/contacts/{email}?idProperty=email
   ```
2. If exists → Update:
   ```javascript
   PATCH /crm/v3/objects/contacts/{contactId}
   ```
3. If new → Create:
   ```javascript
   POST /crm/v3/objects/contacts
   ```
4. Return HubSpot contact ID

### 6.3 HubSpot Sync Record

**SQL**:
```sql
INSERT INTO hubspot_sync (
  lead_id, hubspot_contact_id, hubspot_company_id,
  sync_status, last_sync_at
)
VALUES ($1, $2, $3, 'synced', NOW())
ON CONFLICT (hubspot_contact_id) DO UPDATE
SET 
  lead_id = EXCLUDED.lead_id,
  last_sync_at = NOW(),
  sync_status = 'synced'
```

### 6.4 Company Association

**Process** (if organization provided):
1. Search company:
   ```javascript
   GET /crm/v3/objects/companies?search={organization}
   ```
2. If found → Associate:
   ```javascript
   PUT /crm/v3/objects/contacts/{contactId}/associations/company/{companyId}
   ```
3. If not found → Create company, then associate
4. Store `hubspot_company_id` in sync record

### 6.5 Lead Qualification

**Component**: `leadProcessor.scoreLead(lead)`

**Scoring Logic**:
```javascript
let score = 0;

// Email domain quality (0-20)
if (isCorporateDomain(lead.email)) score += 20;
else if (isCommonDomain(lead.email)) score += 10;
else score += 5;

// Name completeness (0-15)
if (lead.first_name && lead.last_name) score += 15;
else if (lead.first_name) score += 8;

// Organization (0-15)
if (lead.organization) score += 15;

// Phone (0-10)
if (lead.phone && lead.phone.length >= 10) score += 10;

// Website (0-10)
if (lead.website) score += 10;

// Location (0-10)
if (lead.city && lead.state) score += 10;
else if (lead.city || lead.state) score += 5;

// Enrichment (0-20)
if (lead.enrichment_data?.anymail?.deliverability === 'high') score += 20;
else if (lead.enrichment_data) score += 10;

// Total: 0-100
// Qualification threshold: >= 65
```

**Qualification Result**:
- Score >= 65 → Qualified → Proceed to sequence initialization
- Score < 65 → Not qualified → Skip sequence (but still in HubSpot)

### 6.6 Tracker Updates

- Stage: `hubspotSync` → 'started'
- `systemWatcher.watchHubSpotSync(contactId, leadId, status, duration)`
- Stage: `hubspotSync` → 'completed' with sync counts

**Database Tables Used**:
- `hubspot_sync` - Sync records created/updated
- `leads` - Lead data synced
- `audit_log` - Sync events logged

---

## Stage 7: Sequence Initialization → Sequences Started

### 7.1 Sequence Selection

**Component**: `sequenceEngine.initializeSequence(leadId, sequenceType)`

**SQL**:
```sql
SELECT * FROM sequences 
WHERE sequence_type = $1 AND is_active = true
ORDER BY created_at DESC 
LIMIT 1
```

**Sequence Types**:
- `'welcome'` - Default for new leads
- `'nurture'` - For engaged leads
- `'donation'` - For donation-focused
- `'reactivation'` - For inactive leads

### 7.2 Create Sequence (If Not Exists)

**Process**:
1. If sequence not found → Create:
   ```sql
   INSERT INTO sequences (name, sequence_type, total_steps, is_active)
   VALUES ($1, $2, $3, true)
   RETURNING id
   ```
2. Create default steps:
   ```sql
   INSERT INTO sequence_steps (sequence_id, step_number, delay_hours, subject_template, body_template)
   VALUES ($1, 1, 0, $2, $3), ($1, 2, 24, $4, $5), ...
   ```

### 7.3 Get Sequence Steps

**SQL**:
```sql
SELECT * FROM sequence_steps
WHERE sequence_id = $1
ORDER BY step_number ASC
```

**Step Structure**:
```javascript
{
  id: UUID,
  sequence_id: UUID,
  step_number: 1,
  delay_hours: 0, // Immediate for step 1
  subject_template: 'Welcome to HingeCraft, {{first_name}}!',
  body_template: '<p>Hi {{first_name}}, ...</p>',
  template_id: 'welcome_1',
  conditions: {} // JSONB
}
```

### 7.4 Lead Sequence Enrollment

**SQL**:
```sql
INSERT INTO lead_sequences (
  lead_id, sequence_id, current_step, status,
  next_action_due, conditions_met
)
VALUES ($1, $2, 1, 'active', $3, '{}'::jsonb)
```

**Calculation**:
```javascript
const nextActionDue = new Date();
nextActionDue.setHours(nextActionDue.getHours() + step1.delay_hours);
// If delay_hours = 0 → Send immediately
// If delay_hours > 0 → Schedule for future
```

### 7.5 Template Preparation

**Component**: `sequenceEngine.personalizeTemplate(template, lead)`

**Variable Replacement**:
```javascript
template
  .replace(/\{\{first_name\}\}/g, lead.first_name || '')
  .replace(/\{\{last_name\}\}/g, lead.last_name || '')
  .replace(/\{\{name\}\}/g, `${lead.first_name} ${lead.last_name}`.trim() || 'there')
  .replace(/\{\{organization\}\}/g, lead.organization || '')
  .replace(/\{\{email\}\}/g, lead.email || '')
  .replace(/\{\{city\}\}/g, lead.city || '')
  .replace(/\{\{country\}\}/g, lead.country || '')
```

**Custom Variables** (from enrichment_data):
```javascript
// Additional variables from enrichment_data
if (lead.enrichment_data?.anymail?.company_info?.name) {
  template = template.replace(/\{\{company_name\}\}/g, lead.enrichment_data.anymail.company_info.name);
}
```

### 7.6 Sequence Status

**Updates**:
- `lead_sequences.status` = 'active'
- `lead_sequences.current_step` = 1
- `lead_sequences.next_action_due` = Calculated timestamp
- `leads.status` = 'contacted' (if first contact)

**Tracker Updates**:
- `systemWatcher.watchSequenceInitialization(leadId, sequenceId, stepNumber)`
- Log: Sequence initialized event

**Database Tables Used**:
- `sequences` - Sequence definition queried
- `sequence_steps` - Step templates retrieved
- `lead_sequences` - Enrollment record created
- `leads` - Status updated to 'contacted'

---

## Stage 8: Email Sending → Emails Sent

### 8.1 Email Collection for Sending

**Component**: `emailWaveSender.collectEmailsFromLeads(qualifiedLeads, template)`

**Filtering**:
```javascript
const qualifiedLeads = leads.filter(lead => {
  return lead.email &&
         lead.score >= 65 &&
         !isSuppressed(lead.email) &&
         lead.sequence_id; // Has sequence initialized
});
```

### 8.2 Template Personalization

**Component**: `emailWaveSender.personalizeTemplate(template, lead)`

**Process**:
1. Replace all `{{variable}}` placeholders
2. Generate final HTML
3. Validate HTML structure

**Personalized Result**:
```javascript
{
  to: 'lead@example.com',
  subject: 'Welcome to HingeCraft, John!', // Personalized
  html: '<p>Hi John,</p><p>Welcome to HingeCraft! ...</p>', // Personalized
  lead_id: UUID,
  sequence_id: UUID,
  step_number: 1
}
```

### 8.3 Wave Creation

**Component**: `emailWaveSender.createWaves(emails)`

**Configuration**:
- `waveSize`: 75 emails per wave
- `waveDelay`: 60000ms (1 minute between waves)
- `batchConcurrency`: 10 emails sent concurrently

**Wave Structure**:
```javascript
[
  [email1, email2, ..., email75], // Wave 1
  [email76, email77, ..., email150], // Wave 2
  ...
]
```

### 8.4 Wave Sending Process

**For Each Wave**:
1. Take next 75 emails
2. Send in batches of 10 (concurrent)
3. Wait for batch to complete
4. Send next batch of 10
5. Repeat until wave complete
6. Wait `waveDelay` before next wave

**Concurrency Control**:
```javascript
for (let i = 0; i < wave.length; i += 10) {
  const batch = wave.slice(i, i + 10);
  await Promise.all(batch.map(email => sendEmail(email)));
  await delay(2000); // 2 second delay between batches
}
```

### 8.5 Email Sending (Gmail API)

**Component**: `gmail.sendEmail(emailData)`

**Process**:
1. Build RFC 2822 email:
   ```
   From: marketinghingecraft@gmail.com
   To: lead@example.com
   Reply-To: marketinghingecraft@gmail.com
   Subject: Welcome to HingeCraft, John!
   Content-Type: text/html; charset=UTF-8
   
   <html>...</html>
   ```

2. Encode in base64url:
   ```javascript
   const encoded = Buffer.from(email).toString('base64')
     .replace(/\+/g, '-')
     .replace(/\//g, '_')
     .replace(/=+$/, '');
   ```

3. Send via Gmail API:
   ```javascript
   gmail.users.messages.send({
     userId: 'me',
     requestBody: { raw: encoded }
   })
   ```

4. Get message ID from response

### 8.6 Email Log Creation

**SQL**:
```sql
INSERT INTO email_logs (
  lead_id, sequence_id, step_number, provider,
  provider_message_id, to_email, subject, template_id,
  status, sent_at, metadata
)
VALUES ($1, $2, $3, 'gmail', $4, $5, $6, $7, 'sent', NOW(), $8)
```

**Metadata** (JSONB):
```json
{
  "wave_number": 1,
  "batch_size": 75,
  "personalization": {
    "variables_used": ["first_name", "organization"],
    "personalization_score": 0.8
  }
}
```

### 8.7 DRY RUN Mode

**Check**: `config.app.dryRun`

**If true**:
- Validate email format
- Validate personalization
- Log email (as if sent)
- **DO NOT** call Gmail API
- Status: 'queued' (not 'sent')

**If false**:
- Actually send via Gmail API
- Status: 'sent'
- Message ID stored

### 8.8 Rate Limiting

**Gmail Limits**:
- 500 emails per day (personal account)
- ~2 emails per second

**Implementation**:
- Wave size: 75 (respects daily limit)
- Delay between waves: 1 minute
- Concurrency: 10 (allows buffer for rate limits)

### 8.9 Tracker Updates

- `systemWatcher.watchEmailSending(sent, failed, waves)`
- Log: Each email sent
- Track: Wave progress

**Database Tables Used**:
- `email_logs` - Email records created
- `lead_sequences` - `last_sent_at` updated
- `leads` - `last_contacted_at` updated
- `message_logs` - Email events (if webhook received)

---

## Stage 9: Event Tracking → Pipeline Completed

### 9.1 Import Batch Completion

**SQL**:
```sql
UPDATE import_batches
SET 
  status = 'completed',
  total_rows = $1,
  processed_rows = $2,
  finished_at = NOW()
WHERE id = $3
```

### 9.2 Pipeline Summary

**Component**: `systemWatcher.completePipelineTracking(pipelineId, summary)`

**Summary Object**:
```javascript
{
  total_rows: 100,
  processed: 95,
  errors: 5,
  hubspot_synced: 90,
  sequences_initialized: 75,
  emails_sent: 75,
  emails_failed: 0,
  email_waves: 1,
  duration: 45000 // milliseconds
}
```

### 9.3 Audit Log Entry

**SQL**:
```sql
INSERT INTO audit_log (
  actor, action, entity_type, entity_id, payload
)
VALUES (
  'system',
  'file_processed',
  'import_batch',
  $1,
  $2::jsonb
)
```

**Payload** (JSONB):
```json
{
  "file_id": "google_drive_file_id",
  "filename": "test.csv",
  "total_rows": 100,
  "processed": 95,
  "errors": 5,
  "synced_to_hubspot": 90,
  "sequences_initialized": 75,
  "emails_sent": 75,
  "email_waves": 1,
  "pipeline_id": "uuid",
  "duration_ms": 45000
}
```

### 9.4 Statistics Update

**Queries** (on-demand):
```sql
-- Total leads
SELECT COUNT(*) FROM leads;

-- New leads
SELECT COUNT(*) FROM leads WHERE status = 'new';

-- Active sequences
SELECT COUNT(*) FROM lead_sequences WHERE status = 'active';

-- Emails sent
SELECT COUNT(*) FROM email_logs WHERE status = 'sent';

-- Emails delivered
SELECT COUNT(*) FROM email_logs WHERE delivered_at IS NOT NULL;

-- Emails opened
SELECT COUNT(*) FROM email_logs WHERE opened_at IS NOT NULL;
```

### 9.5 Pipeline Status Update

**Component**: `systemWatcher.completePipelineTracking()`

**Updates**:
- Pipeline status: 'completed'
- All stages marked complete
- Summary stored
- Pipeline removed from `activePipelines` Map

### 9.6 Component Status Reset

**Updates**:
- All components: 'standby'
- `waitingForFile`: true
- `mode`: 'standby'
- Ready for next file

**Database Tables Used**:
- `import_batches` - Status = 'completed'
- `audit_log` - Completion event logged
- All tables - Final state recorded

---

## 📊 Complete Data Flow Diagram

```
Google Drive File
  ↓
[Stage 1] File Detection
  → import_batches (new record)
  → Pipeline created (pipelineId)
  ↓
[Stage 2] File Processing
  → import_batches.total_rows updated
  → File parsed (headers, rows)
  ↓
[Stage 3] Lead Processing
  → staging_leads (all leads staged)
  → leads (validated leads inserted)
  → Deduplication via fingerprint
  → Enrichment (if configured)
  ↓
[Stage 4] Database Integration
  → leads (final records)
  → staging_leads.status = 'processed'
  → import_batches.processed_rows updated
  ↓
[Stage 5] Email Collection
  → Emails extracted from leads
  → Suppression checked
  → Enrichment (Anymail, if configured)
  ↓
[Stage 6] HubSpot Sync
  → hubspot_sync (sync records)
  → HubSpot contacts created/updated
  → Lead qualification (score >= 65)
  ↓
[Stage 7] Sequence Initialization
  → sequences (queried/created)
  → sequence_steps (templates retrieved)
  → lead_sequences (enrollment records)
  → leads.status = 'contacted'
  ↓
[Stage 8] Email Sending
  → email_logs (email records)
  → Gmail API (actual sending)
  → lead_sequences.last_sent_at updated
  → leads.last_contacted_at updated
  ↓
[Stage 9] Event Tracking
  → import_batches.status = 'completed'
  → audit_log (completion event)
  → Pipeline completed
```

---

## 🔗 Database Table Relationships

### Primary Relationships

1. **import_batches → staging_leads**:
   - `staging_leads.import_id` → `import_batches.id`
   - One import batch has many staged leads

2. **staging_leads → leads**:
   - `staging_leads.fingerprint` → `leads.fingerprint`
   - Staged leads become final leads (after deduplication)

3. **leads → lead_sequences**:
   - `lead_sequences.lead_id` → `leads.id`
   - One lead can have multiple sequences (different types)

4. **sequences → sequence_steps**:
   - `sequence_steps.sequence_id` → `sequences.id`
   - One sequence has many steps

5. **sequences → lead_sequences**:
   - `lead_sequences.sequence_id` → `sequences.id`
   - One sequence has many lead enrollments

6. **leads → email_logs**:
   - `email_logs.lead_id` → `leads.id`
   - One lead has many email logs

7. **sequences → email_logs**:
   - `email_logs.sequence_id` → `sequences.id`
   - One sequence has many email logs

8. **leads → hubspot_sync**:
   - `hubspot_sync.lead_id` → `leads.id`
   - One lead has one HubSpot sync record

---

## 📋 Complete Table Usage by Stage

### Stage 1: File Detection
- `import_batches` - CREATE
- `audit_log` - INSERT (optional)

### Stage 2: File Processing
- `import_batches` - UPDATE (total_rows)

### Stage 3: Lead Processing
- `staging_leads` - INSERT (all leads)
- `leads` - SELECT (fingerprint check)
- `suppression_list` - SELECT (suppression check)
- `leads` - INSERT (validated leads)

### Stage 4: Database Integration
- `leads` - INSERT/UPDATE (bulk insert)
- `staging_leads` - UPDATE (status = 'processed')
- `import_batches` - UPDATE (processed_rows)

### Stage 5: Email Collection
- `leads` - SELECT (email extraction)
- `suppression_list` - SELECT (suppression check)
- `leads` - UPDATE (enrichment_data, if enriched)

### Stage 6: HubSpot Sync
- `hubspot_sync` - INSERT/UPDATE (sync records)
- `leads` - SELECT (lead data)
- `audit_log` - INSERT (sync events)

### Stage 7: Sequence Initialization
- `sequences` - SELECT/INSERT (sequence definition)
- `sequence_steps` - SELECT (step templates)
- `lead_sequences` - INSERT (enrollment)
- `leads` - UPDATE (status = 'contacted')

### Stage 8: Email Sending
- `email_logs` - INSERT (email records)
- `lead_sequences` - UPDATE (last_sent_at)
- `leads` - UPDATE (last_contacted_at)
- `message_logs` - INSERT (events, if webhook)

### Stage 9: Event Tracking
- `import_batches` - UPDATE (status = 'completed')
- `audit_log` - INSERT (completion event)
- All tables - Final state recorded

---

**Status**: ✅ **COMPLETE BREAKDOWN READY**  
**Next**: Run GPT template verification
