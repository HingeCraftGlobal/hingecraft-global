# Compliance Documentation
## GDPR & CAN-SPAM Compliance Guide

**Last Updated**: Implementation Date  
**Version**: 1.0

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

The General Data Protection Regulation (GDPR) applies to all processing of personal data of EU residents. This system is designed to be GDPR-compliant.

### Legal Basis for Processing

**Consent**: Explicit consent obtained before sending marketing emails.

**Legitimate Interest**: Processing necessary for business operations (e.g., email delivery tracking).

### Data Minimization

- Only collect data necessary for the stated purpose
- Personal data is not retained longer than necessary
- Data is automatically purged according to retention policies

### User Rights (GDPR Article 15-22)

#### 1. Right of Access (Article 15)

Users can request access to their personal data.

**Implementation**:
```sql
-- Export user data
SELECT * FROM leads WHERE email = 'user@example.com';
SELECT * FROM email_logs WHERE to_email = 'user@example.com';
SELECT * FROM email_tracking WHERE lead_id IN (SELECT id FROM leads WHERE email = 'user@example.com');
```

**API Endpoint**: `GET /api/gdpr/export?email={email}`

#### 2. Right to Rectification (Article 16)

Users can request correction of inaccurate data.

**Implementation**:
```sql
UPDATE leads SET first_name = 'Corrected Name' WHERE email = 'user@example.com';
```

**API Endpoint**: `PUT /api/gdpr/rectify`

#### 3. Right to Erasure (Article 17) - "Right to be Forgotten"

Users can request deletion of their personal data.

**Implementation**:
- Use `auditTraceback.eraseAuditTrail()` service
- Anonymizes data while preserving audit records
- Removes from active processing

**API Endpoint**: `DELETE /api/gdpr/erase?email={email}`

**Process**:
1. Remove from `leads` table (or anonymize)
2. Remove from `suppression_list` (if unsubscribe)
3. Anonymize `email_logs` records
4. Anonymize `email_tracking` records
5. Anonymize `audit_trace` records
6. Log erasure action in audit trail

#### 4. Right to Restrict Processing (Article 18)

Users can request restriction of data processing.

**Implementation**:
```sql
UPDATE leads SET status = 'suppressed' WHERE email = 'user@example.com';
INSERT INTO suppression_list (email, reason) VALUES ('user@example.com', 'gdpr_restriction');
```

#### 5. Right to Data Portability (Article 20)

Users can request their data in a machine-readable format.

**Implementation**:
- Use `auditTraceback.exportAuditTrail()` service
- Exports in JSON or CSV format
- Includes all personal data and processing history

**API Endpoint**: `GET /api/gdpr/export?email={email}&format=json`

#### 6. Right to Object (Article 21)

Users can object to processing of their personal data.

**Implementation**:
```sql
INSERT INTO suppression_list (email, reason) VALUES ('user@example.com', 'objection');
UPDATE leads SET status = 'suppressed' WHERE email = 'user@example.com';
```

### Consent Management

**Consent Storage**:
- Consent timestamp stored in `leads` table
- Consent source tracked (e.g., 'form_submission', 'api', 'import')
- Consent can be withdrawn at any time

**Withdrawal Process**:
1. User clicks unsubscribe link
2. System adds to `suppression_list` with reason 'unsubscribe'
3. All active sequences paused
4. Future emails blocked

### Data Protection Officer (DPO)

If required, designate a DPO and provide contact information:
- Email: dpo@hingecraft.com
- Address: [Your Address]

---

## 📧 CAN-SPAM Compliance

### Overview

The CAN-SPAM Act applies to all commercial emails sent to US recipients. This system complies with all CAN-SPAM requirements.

### Requirements

#### 1. Accurate Header Information

**Implementation**:
- `From` address must be accurate and not misleading
- `Reply-To` address must be valid and monitored
- Domain must have valid SPF, DKIM, and DMARC records

**Verification**: Items 1815-1816 in verification checklist

#### 2. Non-Deceptive Subject Lines

**Implementation**:
- Subject lines accurately reflect email content
- No misleading or deceptive subject lines
- Subject length optimized (< 78 characters)

**Verification**: Items 1817-1818 in verification checklist

#### 3. Identify Message as Advertisement

**Implementation**:
- Commercial emails clearly identified as advertisements
- Educational/non-commercial emails exempt
- Identification in email body or subject

#### 4. Include Physical Address

**Implementation**:
- Physical mailing address included in all commercial emails
- Address stored in `config/api_keys.js` as `physicalAddress`
- Automatically inserted into email templates

**Required Format**:
```
HingeCraft
[Street Address]
[City, State ZIP]
[Country]
```

**Verification**: Item 1806 in verification checklist

#### 5. Provide Opt-Out Mechanism

**Implementation**:
- Clear and conspicuous unsubscribe link in every email
- One-click unsubscribe functionality
- Unsubscribe processed within 10 business days

**Unsubscribe Link Requirements**:
- Visible and easy to find
- Functional (not broken)
- Processes immediately (or within 10 days)
- No cost to user
- No requirement to provide information beyond email

**Implementation Details**:
```javascript
// Unsubscribe URL format
https://hingecraft.com/unsubscribe?email={email}&token={token}

// Processing
1. User clicks unsubscribe link
2. System validates token
3. Adds to suppression_list
4. Pauses all active sequences
5. Confirms unsubscribe
```

**Verification**: Items 1809-1814 in verification checklist

#### 6. Honor Opt-Out Requests Promptly

**Implementation**:
- Unsubscribe processed immediately (or within 10 business days)
- No further commercial emails sent after unsubscribe
- Suppression list checked before every send

**Database Check**:
```sql
SELECT * FROM suppression_list WHERE email = 'user@example.com';
```

**Verification**: Items 1792, 2181-2184 in verification checklist

#### 7. Monitor Third-Party Compliance

**Implementation**:
- All email service providers (Anymail, Gmail, HubSpot) must comply
- Contracts require CAN-SPAM compliance
- Regular audits of third-party practices

---

## 📅 Data Retention Policies

### Email Logs

**Retention Period**: 2 years

**Purpose**: Delivery tracking, analytics, compliance

**Deletion Process**:
```sql
DELETE FROM email_logs 
WHERE sent_at < NOW() - INTERVAL '2 years'
AND status NOT IN ('pending', 'queued');
```

### Bounce Records

**Retention Period**: 1 year

**Purpose**: Suppression management, deliverability analysis

**Deletion Process**:
```sql
DELETE FROM email_bounces 
WHERE created_at < NOW() - INTERVAL '1 year'
AND is_suppressed = FALSE;
```

### Audit Trail

**Retention Period**: 7 years (legal requirement)

**Purpose**: Compliance, legal defense, forensic analysis

**Deletion Process**:
- Audit trails are NOT deleted
- Anonymized for GDPR erasure requests
- Retained for legal/compliance purposes

### Suppression Lists

**Retention Period**: Permanent (until user requests removal)

**Purpose**: Prevent accidental re-engagement

**Note**: Suppression records are kept to prevent future sends, even after GDPR erasure.

---

## 📊 Audit Trail Requirements

### What is Logged

1. **File Ingestion**: File detection, parsing, row processing
2. **Lead Processing**: Classification, segmentation, enrichment
3. **Email Sending**: Send attempts, delivery status, opens, clicks
4. **Bounce Handling**: Bounce detection, classification, suppression
5. **Reply Detection**: Reply detection, thread matching, automation pause
6. **Segment Reconciliation**: Conflict detection, resolution
7. **Compliance Actions**: GDPR requests, unsubscribe, data exports

### Audit Trail Access

**Access Control**: 
- Audit trails accessible only to authorized personnel
- Access logged and monitored
- Regular access reviews

**Export Capability**:
- Full audit trail exportable for compliance audits
- Exportable in JSON or CSV format
- Includes all verification checks performed

---

## 👤 User Rights Implementation

### Unsubscribe Process

1. User clicks unsubscribe link in email
2. System validates unsubscribe token
3. Adds email to `suppression_list` with reason 'unsubscribe'
4. Pauses all active sequences for that lead
5. Sends confirmation email
6. Logs action in audit trail

**API Endpoint**: `POST /api/unsubscribe`

### GDPR Export Request

1. User requests data export
2. System collects all personal data
3. Exports in requested format (JSON/CSV)
4. Delivers securely to user
5. Logs export in audit trail

**API Endpoint**: `GET /api/gdpr/export?email={email}&format={json|csv}`

### GDPR Erasure Request

1. User requests data erasure
2. System anonymizes all personal data
3. Removes from active processing
4. Preserves audit records (anonymized)
5. Confirms erasure completion
6. Logs erasure in audit trail

**API Endpoint**: `DELETE /api/gdpr/erase?email={email}`

---

## 🔧 Implementation Details

### Database Tables for Compliance

- `suppression_list` - Tracks unsubscribes and suppressions
- `audit_trace` - Full audit trail with traceback
- `email_logs` - Email sending history
- `email_bounces` - Bounce tracking
- `email_replies` - Reply tracking

### Service Methods

**GDPR Services**:
- `auditTraceback.exportAuditTrail()` - Export user data
- `auditTraceback.eraseAuditTrail()` - Erase user data
- `bounceHandler.suppressEmail()` - Suppress email
- `threadHandler.pauseAutomationForReply()` - Pause on reply

**CAN-SPAM Services**:
- Unsubscribe link generation in templates
- Physical address insertion in templates
- Suppression list checking before sends
- One-click unsubscribe processing

### Configuration

**Required Environment Variables**:
```bash
UNSUBSCRIBE_URL=https://hingecraft.com/unsubscribe
UNSUBSCRIBE_SECRET=your-secret-key
PHYSICAL_ADDRESS=Your Physical Address
GDPR_CONTACT_EMAIL=dpo@hingecraft.com
```

### Monitoring

**Compliance Metrics**:
- Unsubscribe rate
- GDPR request processing time
- Suppression list size
- Bounce rate (deliverability)
- Reply rate (engagement)

**Alerts**:
- High unsubscribe rate (> 1%)
- GDPR request backlog
- Suppression list errors
- Deliverability issues

---

## ✅ Compliance Checklist

### GDPR
- [x] Consent management implemented
- [x] Right of access implemented
- [x] Right to erasure implemented
- [x] Right to data portability implemented
- [x] Data minimization practiced
- [x] Audit trail maintained
- [x] DPO contact information provided

### CAN-SPAM
- [x] Accurate header information
- [x] Non-deceptive subject lines
- [x] Physical address included
- [x] Unsubscribe mechanism provided
- [x] Opt-out honored promptly
- [x] Suppression list maintained
- [x] One-click unsubscribe functional

---

## 📞 Contact Information

**Data Protection Officer**: dpo@hingecraft.com  
**Privacy Policy**: https://hingecraft.com/privacy  
**Terms of Service**: https://hingecraft.com/terms

---

*This document is maintained and updated as compliance requirements evolve.*
