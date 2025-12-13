# ✅ Complete Pipeline Integration - Ready for Testing

**Date**: December 12, 2025  
**Status**: ✅ **ALL COMPONENTS INTEGRATED**

---

## 🎯 Complete Flow

```
Google Drive File Upload
  ↓
[Segment 1] File Detection (30s polling)
  → drive_ingests table
  ↓
[Segment 2] File Parsing
  → drive_rows table (raw + normalized)
  ↓
[Segment 3] AnyMail Enrichment
  → drive_rows.anymail_data
  → drive_rows.anymail_status
  ↓
[Segment 4] HubSpot Sync
  → hubspot_sync table
  → drive_rows.hubspot_contact_id
  ↓
[Segment 5] Lead Classification
  → lead_classifications table
  → leads.lead_type (priority_donor | warm_prospect | cold_nurture)
  → leads.template_set (set_one_student | set_two_referral | set_three_b2b)
  ↓
[Segment 6] Template Routing
  → lead_sequences table
  → Sequence initialized based on template_set
  ↓
[Segment 7] Email Sending
  → email_logs table
  → hubspot_email_log table
  → Templates personalized with mission_support_url
  ↓
[Segment 8] Event Tracking
  → drive_ingest_audit
  → audit_log
  → Pipeline completed
```

---

## 📊 Database Tables Created

### New Tables
1. **lead_classifications** - Stores classification results
2. **template_mappings** - Maps lead_type → template_set
3. **drive_ingests** - Tracks Google Drive file processing
4. **drive_rows** - Stores parsed rows from files
5. **drive_ingest_audit** - Audit log for ingest events
6. **classification_rules** - Configurable classification rules
7. **hubspot_email_log** - HubSpot email sending logs

### Updated Tables
- **leads** - Added: `lead_type`, `lead_score`, `classification_signals`, `template_set`, `drive_ingest_id`, `drive_row_id`

---

## 📧 Email Template Sets

### SET ONE: Student Movement (5 emails)
- **Sequence Type**: `set_one_student`
- **For**: `priority_donor` leads
- **Emails**:
  1. Welcome to the Movement (Immediate)
  2. Here's What You Just Joined (24h)
  3. Follow the Journey (48h)
  4. Your First Action Step (72h)
  5. Become a Recognized Member (96h)

### SET TWO: Referral Email (1 email)
- **Sequence Type**: `set_two_referral`
- **For**: `warm_prospect` leads
- **Email**: Decision Maker → Students referral

### SET THREE: B2B Partnerships (5 emails)
- **Sequence Type**: `set_three_b2b`
- **For**: `cold_nurture` leads
- **Emails**:
  1. Intro + Movement Story (Day 1)
  2. The $1 Abundance Pass (Day 4)
  3. AI Skills Drop (Day 7)
  4. Why Local Participation Matters (Day 10)
  5. Donation Soft-Ask (Day 14)

---

## 🔍 Lead Classification

### Classification Rules
1. **High-Value Domains** (+50 points)
   - example-funder.com, philanthropy.org, foundation.org, donor.org

2. **C-Level Titles** (+40 points)
   - founder, ceo, cto, co-founder, c-level, president, executive director

3. **Director/Manager Titles** (+20 points)
   - director, manager, lead, head, vp, vice president

4. **AnyMail Source Bonus** (+5 points)
   - anymail, anymail_finder, email_finder

5. **Aspirational Companies** (+30 points)
   - Matches against aspirational_companies table

### Classification Thresholds
- **Priority Donor**: Score >= 80
- **Warm Prospect**: Score >= 40
- **Cold/Nurture**: Score < 40

### Template Routing
- `priority_donor` → `set_one_student`
- `warm_prospect` → `set_two_referral`
- `cold_nurture` → `set_three_b2b`

---

## 🔗 Template Variables

All templates support these variables:

### Standard Variables
- `{{first_name}}` - Lead's first name
- `{{last_name}}` - Lead's last name
- `{{name}}` - Full name or "there"
- `{{organization}}` - Company/school name
- `{{email}}` - Email address
- `{{city}}` - City
- `{{country}}` - Country

### URL Variables (Auto-populated)
- `{{mission_support_url}}` - Mission Support form URL
- `{{student_page_url}}` - Student page URL
- `{{build_log_url}}` - Build log URL
- `{{submit_creation_url}}` - Submit creation URL
- `{{school_unique_link}}` - School-specific link
- `{{cta_url}}` - Call-to-action URL
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{preferences_url}}` - Preferences link

### Sender Variables (for referral emails)
- `{{sender_name}}` - Sender name
- `{{sender_title}}` - Sender title
- `{{school_name}}` - School name

---

## 🚀 Setup Instructions

### Step 1: Run Database Migrations

```bash
cd "ML Automation system"
./scripts/run-migrations.sh
```

This will:
- Create all new tables
- Insert template mappings
- Insert classification rules
- Create all email template sequences

### Step 2: Verify Templates

```bash
docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -c "
SELECT s.sequence_type, s.name, COUNT(ss.id) as steps
FROM sequences s
LEFT JOIN sequence_steps ss ON s.id = ss.sequence_id
WHERE s.sequence_type IN ('set_one_student', 'set_two_referral', 'set_three_b2b')
GROUP BY s.id, s.sequence_type, s.name;
"
```

Expected output:
- `set_one_student`: 5 steps
- `set_two_referral`: 1 step
- `set_three_b2b`: 5 steps

### Step 3: Run Micro-Tests

```bash
cd "ML Automation system"
DB_HOST=localhost DB_PORT=7543 DB_NAME=hingecraft_automation DB_USER=hingecraft_user DB_PASSWORD=hingecraft_password node tests/micro-test-pipeline.js
```

This tests:
- Database schema
- Email templates
- Classification rules
- Template mapping
- Template personalization
- Data flow

### Step 4: Test Complete Pipeline

1. **Upload test file to Google Drive**:
   - Folder: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
   - Format: CSV with columns: email, first_name, last_name, organization, title

2. **Monitor processing**:
   ```bash
   curl http://localhost:7101/api/ingests
   ```

3. **Check classification**:
   ```bash
   curl http://localhost:7101/api/leads | jq '.[0] | {email, lead_type, template_set, lead_score}'
   ```

---

## 📋 API Endpoints

### Drive Ingestion
- `POST /api/drive/process` - Process Drive file manually
- `GET /api/ingests` - List all ingests
- `GET /api/ingests/:id` - Get ingest details

### Lead Classification
- `POST /api/leads/:id/classify` - Manually classify lead
- `GET /api/leads/:id/classification` - Get lead classification

### Leads
- `GET /api/leads` - List leads (supports `?lead_type=` and `?template_set=` filters)

---

## 🧪 Micro-Testing Framework

The micro-testing framework (`tests/micro-test-pipeline.js`) tests:

1. **Database Schema** - All tables and columns exist
2. **Email Templates** - All 3 sets with correct step counts
3. **Classification Rules** - Rules load and apply correctly
4. **Template Mapping** - Lead types map to correct template sets
5. **Template Personalization** - Variables replace correctly
6. **Data Flow** - End-to-end flow works

Run tests:
```bash
node tests/micro-test-pipeline.js
```

---

## 🔧 Configuration

### Template URLs (in `config/api_keys.js`)

Add these to your config:
```javascript
app: {
  // ... existing config ...
  missionSupportUrl: 'https://hingecraft.global/mission-support',
  studentPageUrl: 'https://hingecraft.global/student',
  buildLogUrl: 'https://hingecraft.global/build-log',
  submitCreationUrl: 'https://hingecraft.global/submit',
  baseUrl: 'https://hingecraft.global'
}
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All migrations run successfully
- [ ] All 3 template sets created (11 total emails)
- [ ] Template mappings configured
- [ ] Classification rules loaded
- [ ] Micro-tests pass
- [ ] Drive polling active (every 30s)
- [ ] Sequence processing scheduled (every hour)
- [ ] API endpoints accessible
- [ ] Template personalization includes URLs

---

## 📊 Data Flow Verification

### Check Ingest Status
```sql
SELECT * FROM drive_ingest_summary ORDER BY inserted_at DESC LIMIT 5;
```

### Check Classification Distribution
```sql
SELECT * FROM lead_classification_summary;
```

### Check Template Routing
```sql
SELECT 
  lead_type,
  template_set,
  COUNT(*) as count
FROM leads
WHERE lead_type IS NOT NULL
GROUP BY lead_type, template_set;
```

---

**Status**: ✅ **COMPLETE PIPELINE INTEGRATED**  
**Next**: Run migrations and micro-tests
