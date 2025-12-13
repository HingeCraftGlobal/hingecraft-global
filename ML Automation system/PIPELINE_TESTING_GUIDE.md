# 🧪 Pipeline Testing Guide
## Step-by-Step Pipeline Verification After Google OAuth

**Purpose**: Test each step of the automation pipeline individually to verify full functionality

---

## 🚀 Quick Start

After completing Google OAuth authentication, run:

```bash
node tests/pipeline-step-by-step-test.js
```

This will test all 15 pipeline steps in sequence.

---

## 📋 Pipeline Steps Overview

### Step 1: Google Drive File Detection ✅
**What it tests**: File detection from Google Drive
**Expected**: File detected and `drive_ingests` record created
**Database**: `drive_ingests` table

### Step 2: File Parsing ✅
**What it tests**: CSV/XLSX parsing into rows
**Expected**: Rows parsed and stored in `drive_rows`
**Database**: `drive_rows` table

### Step 3: Lead Normalization ✅
**What it tests**: Data normalization (email, name, company extraction)
**Expected**: Normalized data in `drive_rows.normalized`
**Database**: `drive_rows.normalized` JSONB field

### Step 4: AnyMail Enrichment ✅
**What it tests**: Email discovery via AnyMail API
**Expected**: Emails enriched and stored in `drive_rows.anymail_data`
**Database**: `drive_rows.anymail_status`, `drive_rows.anymail_data`

### Step 5: HubSpot Contact Sync ✅
**What it tests**: Contact creation/update in HubSpot
**Expected**: Contacts synced to HubSpot, IDs stored
**Database**: `drive_rows.hubspot_contact_id`, `hubspot_sync` table

### Step 6: Lead Classification ✅
**What it tests**: Lead type classification (priority_donor, warm_prospect, cold_nurture)
**Expected**: Leads classified with scores and signals
**Database**: `leads.lead_type`, `leads.lead_score`, `lead_classifications` table

### Step 7: Template Routing ✅
**What it tests**: Template set assignment based on lead type
**Expected**: Correct template set assigned (set_one_student, set_two_referral, set_three_b2b)
**Database**: `leads.template_set`, `template_mappings` table

### Step 8: Sequence Initialization ✅
**What it tests**: Email sequence enrollment
**Expected**: Sequence initialized for lead
**Database**: `lead_sequences` table

### Step 9: Email Sending ✅
**What it tests**: Email sending via Gmail/Anymail/HubSpot
**Expected**: Emails sent and logged
**Database**: `email_logs` table

### Step 10: Email Tracking ✅
**What it tests**: Open and click tracking setup
**Expected**: Tracking tokens generated
**Database**: `email_tracking` table

### Step 11: Bounce Handling ✅
**What it tests**: Bounce detection and processing
**Expected**: Bounces classified and suppressed
**Database**: `email_bounces` table

### Step 12: Reply Detection ✅
**What it tests**: Reply detection and thread management
**Expected**: Replies detected, sequences paused
**Database**: `email_replies`, `email_threads` tables

### Step 13: Segment Reconciliation ✅
**What it tests**: Multi-segment conflict resolution
**Expected**: Segments reconciled, conflicts resolved
**Database**: `lead_segments`, `segment_conflicts` tables

### Step 14: Audit Trail ✅
**What it tests**: Full audit traceback capability
**Expected**: Complete audit chain from file to email
**Database**: `audit_trace` table

### Step 15: Monitoring & Dashboards ✅
**What it tests**: Metrics, health checks, alerts
**Expected**: Dashboard accessible, metrics accurate
**API**: `/api/monitoring/dashboard`

---

## 🧪 Testing Each Step Individually

### Prerequisites

1. **Google OAuth Complete**: 
   ```bash
   curl http://localhost:7101/auth/status
   ```
   Should return `{ "authenticated": true }`

2. **File Uploaded to Google Drive**:
   - Upload a test CSV/XLSX file to your configured Drive folder
   - File should contain: email, name, company, title columns

3. **Database Migration Run**:
   ```bash
   docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation < database/004_bounce_thread_audit_tables.sql
   ```

### Manual Step Testing

#### Test Step 1: File Detection
```bash
# Check for recent ingests
curl http://localhost:7101/api/ingests | jq '.[0]'
```

#### Test Step 2: File Parsing
```bash
# Get ingest details
INGEST_ID="your-ingest-id"
curl http://localhost:7101/api/ingests/$INGEST_ID | jq
```

#### Test Step 3-6: Lead Processing
```bash
# Check leads
curl "http://localhost:7101/api/leads?limit=5" | jq
```

#### Test Step 7-8: Sequence
```bash
# Check sequences
LEAD_ID="your-lead-id"
curl http://localhost:7101/api/leads/$LEAD_ID/classification | jq
```

#### Test Step 9: Email Sending
```bash
# Check email logs
curl "http://localhost:7101/api/email-logs?limit=5" | jq
```

#### Test Step 10-15: Advanced Features
```bash
# Monitoring dashboard
curl http://localhost:7101/api/monitoring/dashboard | jq

# Health check
curl http://localhost:7101/api/monitoring/health | jq
```

---

## 🔍 Verification Queries

### Check Pipeline Status
```sql
-- Recent ingests
SELECT id, filename, status, total_rows, processed_rows, anymail_enriched, hubspot_synced
FROM drive_ingests
ORDER BY inserted_at DESC
LIMIT 5;

-- Leads created
SELECT COUNT(*) as total_leads,
       COUNT(*) FILTER (WHERE lead_type IS NOT NULL) as classified,
       COUNT(*) FILTER (WHERE template_set IS NOT NULL) as routed
FROM leads
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Sequences initialized
SELECT COUNT(*) as total_sequences,
       COUNT(*) FILTER (WHERE status = 'active') as active,
       COUNT(*) FILTER (WHERE status = 'paused') as paused
FROM lead_sequences
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Emails sent
SELECT COUNT(*) as total_emails,
       COUNT(*) FILTER (WHERE status = 'sent') as sent,
       COUNT(*) FILTER (WHERE status = 'opened') as opened,
       COUNT(*) FILTER (WHERE status = 'clicked') as clicked
FROM email_logs
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

---

## 🐛 Troubleshooting

### Step 1 Fails: No Files Detected
**Solution**: 
- Verify Google OAuth is complete
- Check Drive folder ID in config
- Upload a test file to Drive folder
- Manually trigger: `POST /api/trigger-poll`

### Step 4 Fails: AnyMail Not Enriching
**Solution**:
- Check AnyMail API key in config
- Verify API quota not exceeded
- Check `drive_rows.anymail_status` for errors

### Step 5 Fails: HubSpot Sync Fails
**Solution**:
- Check HubSpot API key
- Verify rate limits not exceeded
- Check `hubspot_sync.sync_status` for errors

### Step 6 Fails: No Classification
**Solution**:
- Verify classification rules in `classification_rules` table
- Check `leads` table for required fields
- Manually classify: `POST /api/leads/:id/classify`

### Step 9 Fails: No Emails Sent
**Solution**:
- Check sequence is active
- Verify email templates exist
- Check Gmail OAuth token valid
- Review `email_logs.status` for errors

---

## 📊 Expected Results

After running the full test, you should see:

```
✅ Step 1: Google Drive File Detection: PASSED
✅ Step 2: File Parsing: PASSED
✅ Step 3: Lead Normalization: PASSED
✅ Step 4: AnyMail Enrichment: PASSED
✅ Step 5: HubSpot Contact Sync: PASSED
✅ Step 6: Lead Classification: PASSED
✅ Step 7: Template Routing: PASSED
✅ Step 8: Sequence Initialization: PASSED
✅ Step 9: Email Sending: PASSED
✅ Step 10: Email Tracking: PASSED
✅ Step 11: Bounce Handling: PASSED
✅ Step 12: Reply Detection: PASSED
✅ Step 13: Segment Reconciliation: PASSED
✅ Step 14: Audit Trail: PASSED
✅ Step 15: Monitoring & Dashboards: PASSED

Success Rate: 100%
```

---

## 🎯 Next Steps After Testing

1. **Review Results**: Check any failed steps
2. **Fix Issues**: Address any failures
3. **Re-test**: Run test again to verify fixes
4. **Production**: Once all pass, system is ready for production

---

## 📚 Related Documentation

- **Deployment**: `DEPLOYMENT_COMPLETE.md`
- **Implementation**: `FINAL_IMPLEMENTATION_SUMMARY.md`
- **Compliance**: `docs/COMPLIANCE_GDPR_CANSPAM.md`
- **Verification**: `VERIFICATION_CHECKLIST_LAYER_8_CONTINUATION.md`

---

**Ready to test your pipeline!** 🚀
