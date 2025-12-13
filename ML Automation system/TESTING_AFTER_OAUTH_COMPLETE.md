# 🧪 Testing After Google OAuth - Complete Guide
## Step-by-Step Pipeline Verification

**Status**: ✅ **Ready to Test Full Pipeline**

---

## 🎯 Quick Start

After Google OAuth is complete, run:

```bash
# Automated test (recommended first)
node tests/pipeline-step-by-step-test.js

# OR interactive test (for detailed verification)
node scripts/test-pipeline-interactive.js

# OR full test suite (both)
./scripts/run-full-pipeline-test.sh
```

---

## 📋 What Gets Tested

### Automated Test (`pipeline-step-by-step-test.js`)

Tests all 15 steps automatically:
1. ✅ Google Drive File Detection
2. ✅ File Parsing
3. ✅ Lead Normalization
4. ✅ AnyMail Enrichment
5. ✅ HubSpot Sync
6. ✅ Lead Classification
7. ✅ Template Routing
8. ✅ Sequence Initialization
9. ✅ Email Sending
10. ✅ Email Tracking
11. ✅ Bounce Handling
12. ✅ Reply Detection
13. ✅ Segment Reconciliation
14. ✅ Audit Trail
15. ✅ Monitoring

**Output**: Pass/fail for each step + summary

### Interactive Test (`test-pipeline-interactive.js`)

Same 15 steps, but:
- ✅ Pauses after each step
- ✅ Shows detailed data
- ✅ Allows manual verification
- ✅ Lets you test individual components
- ✅ Provides step-by-step guidance

**Output**: Interactive prompts + detailed feedback

---

## 🚀 Step-by-Step Testing Process

### Before Testing

1. **Complete Google OAuth**:
   ```bash
   curl http://localhost:7101/auth/status
   ```
   Should return: `{ "authenticated": true }`

2. **Run Database Migration**:
   ```bash
   docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation < database/004_bounce_thread_audit_tables.sql
   ```

3. **Upload Test File**:
   - Create CSV with: email, first_name, last_name, company, title
   - Upload to Google Drive folder
   - Wait 30 seconds

### Run Tests

**Option 1: Automated (Fast)**
```bash
node tests/pipeline-step-by-step-test.js
```

**Option 2: Interactive (Detailed)**
```bash
node scripts/test-pipeline-interactive.js
```

**Option 3: Full Suite (Both)**
```bash
./scripts/run-full-pipeline-test.sh
```

---

## 📊 Understanding Test Results

### ✅ Passed Steps
- Component is working
- Data flowing correctly
- Ready for production

### ❌ Failed Steps
- Check error message
- Review troubleshooting below
- Fix and re-test

### Common Issues & Fixes

#### Step 1 Fails: No Files Detected
**Fix**:
```bash
# Manually trigger file detection
curl -X POST http://localhost:7101/api/trigger-poll
```

#### Step 4 Fails: AnyMail Not Working
**Fix**:
- Check API key in config
- Verify quota not exceeded
- Check `drive_rows.anymail_status`

#### Step 5 Fails: HubSpot Sync Fails
**Fix**:
- Check HubSpot API key
- Verify rate limits
- Check `hubspot_sync.sync_status`

#### Step 6 Fails: No Classification
**Fix**:
```bash
# Manually classify a lead
curl -X POST http://localhost:7101/api/leads/{lead_id}/classify
```

---

## 🔍 Manual Verification Queries

### Check Pipeline Status
```sql
-- Recent ingests
SELECT id, filename, status, total_rows, processed_rows 
FROM drive_ingests 
ORDER BY inserted_at DESC 
LIMIT 5;

-- Leads created today
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE lead_type IS NOT NULL) as classified
FROM leads
WHERE created_at >= CURRENT_DATE;

-- Sequences active
SELECT COUNT(*) as active_sequences
FROM lead_sequences
WHERE status = 'active';

-- Emails sent today
SELECT COUNT(*) as emails_sent,
       COUNT(*) FILTER (WHERE status = 'opened') as opened
FROM email_logs
WHERE created_at >= CURRENT_DATE;
```

---

## 🎯 Success Criteria

Your pipeline is working when:

- ✅ Files detected from Google Drive
- ✅ Files parsed into rows
- ✅ Leads normalized
- ✅ AnyMail enrichment working
- ✅ HubSpot contacts created
- ✅ Leads classified correctly
- ✅ Templates routed appropriately
- ✅ Sequences initialized
- ✅ Emails sent successfully
- ✅ Tracking working
- ✅ All 15 test steps pass

---

## 📚 Related Documentation

- **Start Guide**: `START_HERE_AFTER_OAUTH.md`
- **Testing Guide**: `PIPELINE_TESTING_GUIDE.md`
- **Deployment**: `DEPLOYMENT_COMPLETE.md`

---

## 🎉 Ready to Test!

**After Google OAuth, run:**

```bash
node tests/pipeline-step-by-step-test.js
```

**Or for interactive testing:**

```bash
node scripts/test-pipeline-interactive.js
```

---

*All systems ready. Let's test the pipeline!* 🚀
