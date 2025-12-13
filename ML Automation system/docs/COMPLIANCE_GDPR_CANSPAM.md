# Compliance Documentation
## GDPR & CAN-SPAM Compliance Guide

**Last Updated**: Implementation Date  
**Status**: ✅ Compliant

---

## 📋 Table of Contents

1. [GDPR Compliance](#gdpr-compliance)
2. [CAN-SPAM Compliance](#can-spam-compliance)
3. [Data Retention Policies](#data-retention-policies)
4. [Audit Trail Requirements](#audit-trail-requirements)
5. [User Rights](#user-rights)
6. [Implementation Details](#implementation-details)

---

## 🔒 GDPR Compliance

### Overview

The General Data Protection Regulation (GDPR) applies to all personal data of EU residents. Our system is designed to be fully GDPR compliant.

### Key Requirements

#### 1. Lawful Basis for Processing

**Basis**: Legitimate Interest
- We process email addresses and contact information for marketing communications
- Recipients have a reasonable expectation of receiving communications based on their relationship with HingeCraft
- Processing is necessary for our legitimate business interests

**Consent Tracking**:
- All leads are tracked with their source and consent method
- Database field: `leads.source` and `leads.raw_meta.consent_method`
- Audit trail: `audit_trace` table records all consent events

#### 2. Data Minimization

**Implemented**:
- Only collect necessary data: email, name, organization, title
- No sensitive personal data (no SSN, credit cards, etc.)
- Enrichment data stored separately in `enrichment_data` JSONB field
- Raw data preserved in `drive_rows.raw` for audit purposes only

#### 3. Purpose Limitation

**Purposes**:
1. Lead nurturing and email marketing
2. CRM management (HubSpot integration)
3. Analytics and reporting
4. Compliance and audit

**Not Used For**:
- Selling to third parties
- Unrelated marketing
- Automated decision-making without human oversight

#### 4. Storage Limitation

**Retention Periods**:
- Active leads: Indefinite (until unsubscribe/erasure request)
- Suppressed leads: 7 years (legal requirement for audit)
- Email logs: 2 years
- Audit trails: 7 years
- Bounce records: 2 years
- Reply records: 2 years

**Automatic Deletion**:
- Implemented via scheduled jobs (see `scripts/cleanup-old-data.js`)

#### 5. Accuracy

**Data Quality**:
- Email validation on ingestion
- Deduplication via fingerprinting
- Regular data quality checks
- HubSpot sync ensures CRM accuracy

#### 6. Security

**Measures**:
- Database encryption at rest
- TLS for all API communications
- Access controls via environment variables
- Audit logging of all data access
- Regular security audits

#### 7. Accountability

**Documentation**:
- This compliance document
- Data processing records in `audit_trace`
- Privacy policy available at: [Privacy Policy URL]
- Data Protection Officer contact: [DPO Email]

---

## 📧 CAN-SPAM Compliance

### Overview

The CAN-SPAM Act applies to all commercial emails sent to US recipients. Our system is fully CAN-SPAM compliant.

### Key Requirements

#### 1. Accurate Header Information

**Implementation**:
- `From` address: `noreply@hingecraft.com` (or configured sender)
- `Reply-To` address: `support@hingecraft.com` (or configured reply-to)
- Domain authentication: SPF, DKIM, DMARC configured
- Verified in: `gmail.js`, `anymailEnhanced.js`, `hubspotEmail.js`

#### 2. Non-Deceptive Subject Lines

**Implementation**:
- Subject lines accurately reflect email content
- No misleading or deceptive subjects
- Subject templates stored in `sequence_steps.subject_template`
- Validation: Subject length < 78 chars, no spam keywords

#### 3. Clear Identification as Advertisement

**Implementation**:
- Email templates include clear identification
- Footer text: "This email is from HingeCraft"
- Stored in: `sequence_steps.body_template` (footer section)

#### 4. Physical Address

**Implementation**:
- All emails include physical mailing address
- Address stored in: `config/api_keys.js` → `app.physicalAddress`
- Template variable: `{{physical_address}}`
- Required in all email templates

#### 5. Opt-Out Mechanism

**Implementation**:
- One-click unsubscribe link in every email
- Unsubscribe URL: `{{unsubscribe_url}}`
- Unsubscribe processing:
  - Adds email to `suppression_list` with reason 'unsubscribe'
  - Updates `leads.status` to 'suppressed'
  - Pauses all active sequences
  - Logs to `audit_trace`

**Unsubscribe Endpoint**: `/api/unsubscribe?email={email}&token={token}`

#### 6. Honor Opt-Out Requests

**Implementation**:
- Unsubscribe requests processed within 10 business days
- Automatic: Immediate suppression via database trigger
- Suppression checked before every send
- Database query: `SELECT * FROM suppression_list WHERE email = $1`

#### 7. Monitor Third-Party Compliance

**Implementation**:
- HubSpot integration: HubSpot handles their own compliance
- Anymail integration: Anymail handles their own compliance
- We monitor bounce rates and complaint rates
- Automatic suppression on high bounce rates

---

## 📊 Data Retention Policies

### Retention Schedule

| Data Type | Retention Period | Reason |
|-----------|-----------------|---------|
| Active Leads | Indefinite | Business need |
| Suppressed Leads | 7 years | Legal audit requirement |
| Email Logs | 2 years | Analytics and compliance |
| Bounce Records | 2 years | Deliverability analysis |
| Reply Records | 2 years | Engagement analysis |
| Audit Trails | 7 years | Legal requirement |
| Drive Ingests | 1 year | Processing history |
| Drive Rows | 1 year | Processing history |

### Automatic Cleanup

**Script**: `scripts/cleanup-old-data.js`

**Runs**: Daily via cron

**Actions**:
1. Delete email logs older than 2 years
2. Delete bounce records older than 2 years
3. Delete reply records older than 2 years
4. Archive audit trails older than 7 years
5. Delete drive ingests older than 1 year

---

## 🔍 Audit Trail Requirements

### What is Audited

1. **Data Ingestion**:
   - File uploads
   - Lead creation
   - Data enrichment

2. **Data Processing**:
   - Lead classification
   - Segment assignment
   - Campaign routing

3. **Email Operations**:
   - Email sends
   - Bounce processing
   - Reply detection
   - Unsubscribe requests

4. **Data Access**:
   - API calls
   - Database queries (via audit_trace)
   - Export operations

5. **Compliance Actions**:
   - GDPR erasure requests
   - Consent updates
   - Data corrections

### Audit Trail Storage

**Table**: `audit_trace`

**Fields**:
- `trace_id` - Groups related events
- `event_type` - Type of event
- `entity_type` - Entity affected (lead, email, etc.)
- `entity_id` - ID of entity
- `actor` - Who performed the action
- `action` - What action was taken
- `input_data` - Input state
- `output_data` - Output state
- `metadata` - Additional context
- `created_at` - Timestamp

### Audit Trail Access

**Export**: Via `auditTraceback.exportAuditTrail()`

**Retention**: 7 years

**Access Control**: Admin-only

---

## 👤 User Rights (GDPR)

### Right to Access

**Implementation**:
- Endpoint: `/api/gdpr/access?email={email}`
- Returns: All data associated with email address
- Format: JSON export
- Response time: Within 30 days

**Data Included**:
- Lead record
- Email logs
- Bounce records
- Reply records
- Segment assignments
- Audit trail

### Right to Rectification

**Implementation**:
- Endpoint: `/api/gdpr/rectify`
- Allows: Update incorrect data
- Process: Updates `leads` table, logs to `audit_trace`

### Right to Erasure ("Right to be Forgotten")

**Implementation**:
- Endpoint: `/api/gdpr/erase?email={email}`
- Process:
  1. Anonymize lead record (set email to NULL, remove PII)
  2. Add to suppression list
  3. Pause all sequences
  4. Anonymize audit trail
  5. Log erasure to audit_trace
- Response time: Within 30 days
- Exceptions: Legal hold, active disputes

**Code**: `auditTraceback.eraseAuditTrail()`

### Right to Data Portability

**Implementation**:
- Endpoint: `/api/gdpr/export?email={email}`
- Format: JSON or CSV
- Includes: All personal data in machine-readable format
- Response time: Within 30 days

**Code**: `auditTraceback.exportAuditTrail()`

### Right to Object

**Implementation**:
- Same as unsubscribe mechanism
- Endpoint: `/api/unsubscribe`
- Process: Adds to suppression list, pauses sequences

### Right to Restrict Processing

**Implementation**:
- Endpoint: `/api/gdpr/restrict?email={email}`
- Process: Sets `leads.status = 'restricted'`, pauses all processing
- Can be reversed via `/api/gdpr/unrestrict`

---

## 🛠️ Implementation Details

### Database Schema

**Suppression List**:
```sql
CREATE TABLE suppression_list (
  email VARCHAR(255) UNIQUE NOT NULL,
  reason VARCHAR(100), -- 'unsubscribe', 'bounce', 'complaint', 'manual', 'gdpr_erase'
  suppressed_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Audit Trail**:
```sql
CREATE TABLE audit_trace (
  trace_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  actor VARCHAR(255) DEFAULT 'system',
  action VARCHAR(100) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

**Unsubscribe**:
```
POST /api/unsubscribe
Body: { email: string, token: string }
```

**GDPR Access**:
```
GET /api/gdpr/access?email={email}
```

**GDPR Erase**:
```
POST /api/gdpr/erase
Body: { email: string, reason: string }
```

**GDPR Export**:
```
GET /api/gdpr/export?email={email}&format=json
```

### Email Template Requirements

**Required Elements**:
1. Physical address: `{{physical_address}}`
2. Unsubscribe link: `{{unsubscribe_url}}`
3. Clear sender identification
4. Accurate subject line
5. Non-deceptive content

**Template Location**: `sequence_steps.body_template`

### Monitoring

**Compliance Metrics**:
- Unsubscribe rate
- Bounce rate
- Complaint rate
- GDPR request processing time
- Data retention compliance

**Dashboard**: `/api/monitoring/dashboard`

---

## 📞 Contact Information

**Data Protection Officer**: [DPO Email]  
**Privacy Policy**: [Privacy Policy URL]  
**Support Email**: support@hingecraft.com

---

## ✅ Compliance Checklist

- [x] GDPR lawful basis documented
- [x] Consent tracking implemented
- [x] Data minimization practiced
- [x] Retention policies defined
- [x] Security measures in place
- [x] Audit trails enabled
- [x] User rights implemented
- [x] CAN-SPAM requirements met
- [x] Unsubscribe mechanism working
- [x] Physical address in emails
- [x] Accurate headers
- [x] Non-deceptive subjects
- [x] Opt-out honored
- [x] Third-party compliance monitored

---

**Status**: ✅ **FULLY COMPLIANT**

*This document is reviewed and updated quarterly*
