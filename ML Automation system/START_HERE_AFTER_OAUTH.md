# 🚀 START HERE - After Google OAuth Complete
## Complete Pipeline Testing Guide

**Status**: ✅ Ready to test full pipeline functionality

---

## ✅ Prerequisites Checklist

Before testing, ensure:

- [x] Google OAuth authentication complete
- [x] Database migration run (`004_bounce_thread_audit_tables.sql`)
- [x] Environment variables set (see `.env.example`)
- [x] Services running (`docker-compose up -d`)
- [x] Test file uploaded to Google Drive folder

---

## 🧪 Step 1: Verify OAuth Status

```bash
curl http://localhost:7101/auth/status
```

**Expected**: `{ "authenticated": true, ... }`

If not authenticated:
```bash
# Get OAuth URL
curl http://localhost:7101/auth/google

# Visit the authUrl in browser
# Complete OAuth flow
# Return to this guide
```

---

## 🧪 Step 2: Run Full Pipeline Test

```bash
node tests/pipeline-step-by-step-test.js
```

This will test all 15 pipeline steps:
1. ✅ Google Drive File Detection
2. ✅ File Parsing
3. ✅ Lead Normalization
4. ✅ AnyMail Enrichment
5. ✅ HubSpot Contact Sync
6. ✅ Lead Classification
7. ✅ Template Routing
8. ✅ Sequence Initialization
9. ✅ Email Sending
10. ✅ Email Tracking
11. ✅ Bounce Handling
12. ✅ Reply Detection
13. ✅ Segment Reconciliation
14. ✅ Audit Trail
15. ✅ Monitoring & Dashboards

---

## 📊 Step 3: Check Test Results

The test will output:
- ✅ Passed steps
- ❌ Failed steps
- 📊 Success rate

**Target**: 100% pass rate

---

## 🔍 Step 4: Manual Verification

### Check Database

```bash
# Connect to database
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_automation

# Check ingests
SELECT id, filename, status, total_rows, processed_rows FROM drive_ingests ORDER BY inserted_at DESC LIMIT 5;

# Check leads
SELECT email, lead_type, template_set, status FROM leads ORDER BY created_at DESC LIMIT 10;

# Check sequences
SELECT ls.*, s.name as sequence_name FROM lead_sequences ls JOIN sequences s ON ls.sequence_id = s.id ORDER BY ls.created_at DESC LIMIT 5;

# Check emails
SELECT to_email, status, provider, sent_at FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

### Check API Endpoints

```bash
# Monitoring dashboard
curl http://localhost:7101/api/monitoring/dashboard | jq

# Health check
curl http://localhost:7101/api/monitoring/health | jq

# Recent ingests
curl http://localhost:7101/api/ingests | jq '.[0:3]'

# Recent leads
curl "http://localhost:7101/api/leads?limit=5" | jq
```

---

## 🎯 Step 5: Test Individual Components

### Test Bounce Handling

```bash
curl -X POST http://localhost:7101/api/webhooks/bounce \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gmail",
    "providerMessageId": "test-bounce-123",
    "recipientEmail": "bounce@example.com",
    "bounceReason": "user not found",
    "bounceCode": "550"
  }'
```

### Test Reply Detection

```bash
curl -X POST http://localhost:7101/api/webhooks/reply \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gmail",
    "providerMessageId": "reply-123",
    "replyFromEmail": "test@example.com",
    "subject": "Re: Test Email",
    "body": "This is a human reply"
  }'
```

### Test Unsubscribe

```bash
curl "http://localhost:7101/api/unsubscribe?email=test@example.com&token=test-token"
```

### Test GDPR Export

```bash
curl "http://localhost:7101/api/gdpr/export?email=test@example.com&format=json" | jq
```

---

## 📈 Step 6: Monitor Dashboard

Open in browser or use curl:

```bash
# Full dashboard
curl http://localhost:7101/api/monitoring/dashboard | jq

# Real-time stats
curl http://localhost:7101/api/monitoring/realtime | jq

# Health check
curl http://localhost:7101/api/monitoring/health | jq
```

---

## 🔄 Step 7: End-to-End Flow Test

### Complete Flow Test

1. **Upload Test File**:
   - Create a CSV with: email, first_name, last_name, company, title
   - Upload to Google Drive folder
   - Wait 30 seconds for auto-detection

2. **Verify Processing**:
   ```bash
   # Check ingest status
   curl http://localhost:7101/api/ingests | jq '.[0]'
   ```

3. **Check Lead Creation**:
   ```bash
   # Get latest leads
   curl "http://localhost:7101/api/leads?limit=5" | jq
   ```

4. **Verify Classification**:
   ```bash
   # Get a lead ID from above, then:
   LEAD_ID="your-lead-id"
   curl http://localhost:7101/api/leads/$LEAD_ID/classification | jq
   ```

5. **Check Sequence**:
   ```sql
   SELECT * FROM lead_sequences WHERE lead_id = 'your-lead-id';
   ```

6. **Verify Email Sent**:
   ```sql
   SELECT * FROM email_logs WHERE lead_id = 'your-lead-id';
   ```

---

## 🐛 Troubleshooting

### OAuth Not Working
- Check redirect URI matches Google Cloud Console
- Verify test user added to OAuth consent screen
- Check OAuth scopes are correct

### Files Not Detected
- Verify Drive folder ID in config
- Check folder permissions
- Manually trigger: `POST /api/trigger-poll`

### Leads Not Classified
- Check classification rules in database
- Verify lead has required fields (email, organization)
- Manually classify: `POST /api/leads/:id/classify`

### Emails Not Sending
- Check Gmail OAuth token valid
- Verify sequence is active
- Check email templates exist
- Review `email_logs.status` for errors

---

## 📚 Documentation

- **Pipeline Testing**: `PIPELINE_TESTING_GUIDE.md`
- **Deployment**: `DEPLOYMENT_COMPLETE.md`
- **Implementation**: `FINAL_IMPLEMENTATION_SUMMARY.md`
- **Compliance**: `docs/COMPLIANCE_GDPR_CANSPAM.md`

---

## ✅ Success Criteria

Your pipeline is working correctly when:

- ✅ Files are detected from Google Drive
- ✅ Files are parsed into rows
- ✅ Leads are normalized and enriched
- ✅ Contacts are synced to HubSpot
- ✅ Leads are classified correctly
- ✅ Templates are routed appropriately
- ✅ Sequences are initialized
- ✅ Emails are sent successfully
- ✅ Tracking works (opens/clicks)
- ✅ Bounces are handled
- ✅ Replies are detected
- ✅ Segments are reconciled
- ✅ Audit trail is complete
- ✅ Monitoring shows healthy status

---

## 🎉 Next Steps

Once all tests pass:

1. **Monitor**: Check dashboard regularly
2. **Optimize**: Adjust thresholds and rules
3. **Scale**: Increase batch sizes if needed
4. **Maintain**: Review logs and metrics

---

**🚀 Your automation pipeline is ready!**

*Run the test script to verify everything works:*
```bash
node tests/pipeline-step-by-step-test.js
```
