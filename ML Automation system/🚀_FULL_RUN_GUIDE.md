# 🚀 Full Run Guide - Complete Execution Tracking

## ⚡ System Status: ACTIVE EXECUTION

**Test File:** `test_chandler_tracking.csv`  
**Test Contact:** `chandlerferguson319@gmail.com`  
**Status:** File dropped, system processing

---

## 📋 Complete Execution Flow

### **Phase I: Initial Ingestion & Immediate Send** (Time 0:00)

#### **Step 1: Trigger Fires** ⏱️ Within 5 minutes

**What Happens:**
- Time-driven trigger executes `checkFolderForNewFiles()`
- Script scans monitored Drive folder

**Where to Check:**
- Apps Script → Executions tab
- Look for: Latest `checkFolderForNewFiles` execution

**Expected Log:**
```
🔍 Checking folder for new files...
📁 Accessing folder: [Folder Name]
📦 Preparing bulk AnyMail payload from all new files...
```

**Verification:**
- [ ] Execution appears in log
- [ ] Status: ✅ Success (green checkmark)
- [ ] Execution time: Recent (within 5 minutes)

---

#### **Step 2: File Scan** ⏱️ Immediate

**What Happens:**
- Script detects `test_chandler_tracking.csv`
- Reads file content
- Prepares bulk payload

**Expected Log:**
```
📄 Processing file: test_chandler_tracking.csv
📦 Found 1 unique contacts for bulk enrichment
```

**Verification:**
- [ ] Log shows: "📄 Processing file: test_chandler_tracking.csv"
- [ ] Log shows: "📦 Found 1 unique contacts"

---

#### **Step 3: Contact Creation** ⏱️ 10-30 seconds

**What Happens:**
- AnyMail enrichment (if configured)
- HubSpot contact created/updated
- Properties set for sequence

**Expected Log:**
```
📧 Running bulk AnyMail enrichment...
✅ Enriched 1 contacts via AnyMail Bulk API
📦 Processing bulk results and pushing to HubSpot...
✅ Bulk processing complete: 1 processed, 1 created, 0 updated
```

**Verification: HubSpot Contact**
- [ ] Go to: https://app.hubspot.com
- [ ] Search: `chandlerferguson319@gmail.com`
- [ ] Verify contact exists
- [ ] Check properties:
  - [ ] `email = chandlerferguson319@gmail.com`
  - [ ] `company = Ferguson Ventures`
  - [ ] `automation_lead_type = B2B`
  - [ ] `automation_template_set = set_three_b2b`
  - [ ] `automation_next_email_step = 2` (after Email 1)
  - [ ] `automation_next_send_timestamp` = Current time + 24 hours

---

#### **Step 4: Sequence Start** ⏱️ Immediate

**What Happens:**
- `sequenceManager()` called
- Contact identified as ready (step 1, timestamp = now)
- Email 1 prepared

**Expected Log:**
```
📧 Running sequence manager for follow-up emails...
📧 Starting sequence manager (Time-Based Search)...
Found 1 contacts ready for the next sequence step.
Processing contact: chandlerferguson319@gmail.com
```

**Verification:**
- [ ] Log shows: "Found 1 contacts ready for the next sequence step"
- [ ] Log shows: "Processing contact: chandlerferguson319@gmail.com"

---

#### **Step 5: Email Sent** ⏱️ Immediate

**What Happens:**
- Email template retrieved (set_three_b2b, step 1)
- Tracking pixel injected
- Links wrapped with tracking
- Email sent via Gmail

**Expected Log:**
```
Sending email 1 to chandlerferguson319@gmail.com
Template: set_three_b2b, Step: 1
✅ Email sent successfully
```

**Verification: Gmail Sent Folder**
- [ ] Go to: https://mail.google.com
- [ ] Click: **Sent** folder
- [ ] Look for: "Partnership Opportunity: Let's Build Together"
- [ ] Verify:
  - [ ] To: `chandlerferguson319@gmail.com`
  - [ ] From: `marketingecraft@gmail.com`
  - [ ] Timestamp: Recent

**Verification: Email Content**
- [ ] Open email (check HTML source)
- [ ] Verify: Tracking pixel present (`<img src="[TRACKING_URL]?t=o&c=...">`)
- [ ] Verify: Links wrapped (`href="[TRACKING_URL]?t=l&c=...&url=..."`)

---

#### **Step 6: Sequence Advanced** ⏱️ Immediate

**What Happens:**
- Contact step updated: 1 → 2
- Timestamp set: Current time + 24 hours
- Email count incremented

**Expected Log:**
```
✅ Sequence run complete: 1 emails sent/advanced.
```

**Verification: HubSpot**
- [ ] `automation_next_email_step = 2`
- [ ] `automation_next_send_timestamp` = [Current Time + 24 hours]
- [ ] `automation_emails_sent = 1`
- [ ] `last_contact_sent_date` = Recent timestamp

**Calculate Expected Timestamp:**
- Current time: _______________
- Expected timestamp: _______________ (Current + 24 hours)

---

#### **Step 7: Tracking Test** ⏱️ 2 minutes

**Action Required:**
1. Open email in `chandlerferguson319@gmail.com` inbox
2. Click any link in the email

**Expected Result:**
- Email open tracked
- Link click tracked
- Events logged to GA4 and HubSpot

**Verification: HubSpot**
- [ ] `total_emails_opened = 1`
- [ ] `total_clicks = 1`
- [ ] `last_email_opened_at` = Recent timestamp
- [ ] `last_link_clicked_at` = Recent timestamp

**Verification: GA4 Realtime**
- [ ] Go to: https://analytics.google.com
- [ ] Navigate to: **Reports → Realtime**
- [ ] Look for events:
  - [ ] `email_opened` (appears within seconds)
  - [ ] `link_clicked` (appears within seconds)
- [ ] Check parameters:
  - [ ] `template_set = set_three_b2b`
  - [ ] `client_id` = HubSpot contact ID

---

### **Phase II: 24-Hour Delay Validation** (Time 0:05 to 24:00)

#### **Step 8: Timer Monitoring** ⏱️ Several hours

**What Happens:**
- Trigger runs every 5 minutes
- `sequenceManager()` executes
- Contact NOT eligible (timestamp not passed)

**Expected Log (Multiple Runs):**
```
📧 Starting sequence manager (Time-Based Search)...
Found 0 contacts ready for the next sequence step.
```

**Verification:**
- [ ] Check multiple execution logs
- [ ] Verify: "Found 0 contacts" or skipping messages
- [ ] Verify: NO "Email sent" messages for Email 2
- [ ] Verify: HubSpot step still = 2

---

#### **Step 9: Delay Verification** ⏱️ Ongoing

**What Happens:**
- Email 2 NOT sent during 24-hour period
- Contact step remains at 2
- Timestamp remains in future

**Verification:**
- [ ] Gmail Sent folder: Only Email 1 present
- [ ] HubSpot: `automation_next_email_step` still = 2
- [ ] HubSpot: `automation_next_send_timestamp` = Future timestamp
- [ ] Execution logs: Show skipping/0 contacts

---

### **Phase III: Sequence Advancement** (Time ≈ 24:05)

#### **Step 10: 24-Hour Wait** ⏱️ 24 hours

**What Happens:**
- Wait until `automation_next_send_timestamp` passes
- Next timer run identifies contact as eligible

**Expected Log (After 24 Hours):**
```
📧 Starting sequence manager (Time-Based Search)...
Found 1 contacts ready for the next sequence step.
Processing contact: chandlerferguson319@gmail.com
```

**Verification:**
- [ ] Check execution log after 24 hours
- [ ] Verify: "Found 1 contacts ready"
- [ ] Verify: NO "Skipping" messages

---

#### **Step 11: Email 2 Sent** ⏱️ Immediate

**What Happens:**
- Email 2 sent automatically
- Subject: "Why HingeCraft? The Value Proposition"
- Contact record updated

**Expected Log:**
```
Sending email 2 to chandlerferguson319@gmail.com
Template: set_three_b2b, Step: 2
✅ Email sent successfully
✅ Sequence run complete: 1 emails sent/advanced.
```

**Verification: Gmail**
- [ ] Sent folder: Email 2 present
- [ ] Subject: "Why HingeCraft? The Value Proposition"
- [ ] Timestamp: After 24-hour mark

**Verification: HubSpot**
- [ ] `automation_next_email_step = 3`
- [ ] `automation_next_send_timestamp` = Current time + 24 hours
- [ ] `automation_emails_sent = 2`

---

#### **Step 12: Step Advanced** ⏱️ Immediate

**What Happens:**
- Contact step advanced: 2 → 3
- Timestamp updated for next 24 hours

**Verification:**
- [ ] HubSpot: `automation_next_email_step = 3`
- [ ] HubSpot: `automation_next_send_timestamp` = [Current + 24 hours]
- [ ] Sequence continues automatically

---

## 📊 Complete Timeline

| Time | Event | Status |
|------|-------|--------|
| 0:00 | File detected, Email 1 sent | [ ] |
| 0:05 | Timer run 1 (Email 2 NOT sent) | [ ] |
| 0:10 | Timer run 2 (Email 2 NOT sent) | [ ] |
| ... | Timer runs continue... | [ ] |
| 24:00 | 24-hour mark reached | [ ] |
| 24:05 | Email 2 sent, Step → 3 | [ ] |
| 48:05 | Email 3 sent, Step → 4 | [ ] |
| 72:05 | Email 4 sent, Step → 5 | [ ] |
| 96:05 | Email 5 sent, Step → 6 (Complete) | [ ] |

---

## ✅ Complete Verification Checklist

### **Phase I (Immediate):**
- [ ] Step 1: Trigger fired
- [ ] Step 2: File scanned
- [ ] Step 3: Contact created in HubSpot
- [ ] Step 4: Sequence manager called
- [ ] Step 5: Email 1 sent
- [ ] Step 6: Sequence advanced (step = 2)
- [ ] Step 7: Tracking tested (opens & clicks)

### **Phase II (24-Hour Period):**
- [ ] Step 8: Timer monitored (multiple runs)
- [ ] Step 9: Delay verified (Email 2 NOT sent)

### **Phase III (After 24 Hours):**
- [ ] Step 10: 24-hour wait completed
- [ ] Step 11: Email 2 sent
- [ ] Step 12: Step advanced (step = 3)

---

## 🎯 Success Criteria

**Phase I Passes If:**
- ✅ Email 1 sent immediately
- ✅ Contact created with correct properties
- ✅ Tracking pixel and links work
- ✅ GA4 events logged

**Phase II Passes If:**
- ✅ Email 2 NOT sent during 24-hour period
- ✅ Execution logs show skipping/0 contacts
- ✅ Contact step remains at 2

**Phase III Passes If:**
- ✅ Email 2 sent after 24 hours
- ✅ Contact step advanced to 3
- ✅ Timestamp updated for next 24 hours

---

## 📝 Status Report Template

```
EXECUTION STATUS REPORT
Date: _______________
Time: _______________

Phase I Status:
  [ ] Complete
  [ ] Partial
  [ ] Failed
  Issues: _________________________________

Email 1 Status:
  [ ] Received
  [ ] Not Received
  Subject: _________________________________
  Received Time: ___________________________

HubSpot Contact Status:
  [ ] Created
  [ ] Not Created
  automation_next_email_step: ______________
  automation_next_send_timestamp: __________
  automation_emails_sent: __________________

Tracking Status:
  Email Opens: [ ] Tracked / [ ] Not Tracked
  Link Clicks: [ ] Tracked / [ ] Not Tracked
  GA4 Events: [ ] Working / [ ] Not Working

Phase II Status:
  [ ] Monitoring
  [ ] Delay Verified
  [ ] Issues Found

Phase III Status:
  [ ] Waiting (24 hours)
  [ ] Email 2 Sent
  [ ] Step Advanced

Overall Status: [ ] PASS / [ ] FAIL
```

---

## 🚀 Quick Commands

**Run Monitor:**
```bash
node scripts/monitor-execution.js
```

**Check Execution Logs:**
- Go to: https://script.google.com → Executions tab

**Check HubSpot:**
- Go to: https://app.hubspot.com → Search contact

**Check GA4:**
- Go to: https://analytics.google.com → Realtime report

---

**Status:** 🔴 **ACTIVE - MONITORING REQUIRED**  
**Next Check:** Within 5 minutes  
**Full Timeline:** ~96 hours (5 emails total)
