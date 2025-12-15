# ✅ Final System Test - Quick Checklist

## 📋 Phase I: Initial Ingestion (Time 0:00)

### Step 1: Set Trigger
- [ ] Go to Apps Script → Triggers tab
- [ ] Add trigger: `checkFolderForNewFiles` - Every 5 minutes
- [ ] Verify: Execution log shows successful run

### Step 2: Create Test File
- [ ] Upload `test_contact_1.csv` to monitored Drive folder
- [ ] Wait 1-5 minutes
- [ ] Verify: Email 1 sent (check Gmail Sent folder)
- [ ] Verify: HubSpot contact created
- [ ] Verify: `automation_next_email_step = 2`
- [ ] Verify: `automation_next_send_timestamp` = Now + 24 hours

### Step 3: Test Tracking
- [ ] Open Email 1 in external inbox
- [ ] Click a link in the email
- [ ] Verify: HubSpot `total_emails_opened = 1`
- [ ] Verify: HubSpot `total_clicks = 1`
- [ ] Verify: GA4 Realtime shows `email_opened` event
- [ ] Verify: GA4 Realtime shows `link_clicked` event

---

## ⏰ Phase II: 24-Hour Delay (Time 0:05 to 24:00)

### Step 4: Observe Timer
- [ ] Monitor execution logs for several hours
- [ ] Verify: Email 2 NOT sent
- [ ] Verify: Execution logs show "Skipping" or "Found 0 contacts"
- [ ] Verify: HubSpot `automation_next_email_step` still = 2

---

## 🚀 Phase III: Sequence Advancement (Time ≈ 24:05)

### Step 5: Wait 24 Hours
- [ ] Wait until `automation_next_send_timestamp` passes
- [ ] Wait for next timer run (within 5 minutes)
- [ ] Verify: Execution log shows "Found 1 contacts ready"
- [ ] Verify: NO "Skipping" messages

### Step 6: Send Email 2
- [ ] Verify: Email 2 sent (check Gmail Sent folder)
- [ ] Verify: HubSpot `automation_next_email_step = 3`
- [ ] Verify: HubSpot `automation_next_send_timestamp` = Now + 24 hours
- [ ] Verify: `automation_emails_sent = 2`

---

## ✅ Success Criteria

**All Tests Pass If:**
- [ ] Phase I: Email 1 sent immediately, tracking works
- [ ] Phase II: Email 2 NOT sent during 24-hour period
- [ ] Phase III: Email 2 sent after 24 hours, sequence advanced

**Overall Status:** [ ] PASS / [ ] FAIL

---

**Test File:** `test_contact_1.csv`  
**Full Guide:** `🧪_FINAL_SYSTEM_TEST_GUIDE.md`  
**Test Script:** `tests/final-system-test.js`
