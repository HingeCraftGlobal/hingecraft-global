# 🧪 Final System Test - Complete Guide

## 📋 Test Overview

This guide provides step-by-step instructions for testing the entire automation system across three phases:

1. **Phase I:** Initial ingestion and immediate send (Time 0:00)
2. **Phase II:** Validating 24-hour delay (Time 0:05 to 24:00)
3. **Phase III:** Sequence advancement (Time ≈ 24:05)

---

## 📊 Phase I: Initial Ingestion and Immediate Send

### **Step 1: Set Trigger** ⏱️ 2 minutes

**Action:**
1. Go to: https://script.google.com
2. Open your project
3. Click **Triggers** tab (⏰ icon)
4. Click **Add Trigger**
5. Configure:
   - **Function:** `checkFolderForNewFiles`
   - **Deployment:** Head
   - **Event source:** Time-driven
   - **Type:** Minutes timer
   - **Frequency:** Every 5 minutes
6. Click **Save**

**Expected Result:**
- Script executes automatically every 5 minutes
- Execution appears in Apps Script Executions log

**Verification:**
- ✅ Go to **Executions** tab
- ✅ Verify successful run (green checkmark)
- ✅ Check execution log for "🔍 Checking folder for new files..."

---

### **Step 2: Create Test File** ⏱️ 5 minutes

**Action:**
1. Create a test spreadsheet with the following data:

| Organization Name | Website URL | Primary Contact Email | Lead ID | City | State |
|------------------|-------------|----------------------|---------|------|-------|
| Test Organization | https://testorg.com | test@testorg.com | B2B-001 | San Francisco | CA |

2. Save as: `test_contact_1.csv` or `test_contact_1.xlsx`
3. Upload to your **monitored Google Drive folder**
4. Wait 1-5 minutes for the timer to pick it up

**Expected Result:**
The script should:
- ✅ Ingest the contact from the file
- ✅ Set `automation_next_email_step = 1`
- ✅ Call `sequenceManager()`
- ✅ Send Email 1 immediately (first email in B2B sequence)

**Verification 1: Gmail Sent Folder**
- ✅ Go to Gmail: https://mail.google.com
- ✅ Check **Sent** folder
- ✅ Look for email with subject: "Partnership Opportunity: Let's Build Together"
- ✅ Verify email contains tracking pixel and wrapped links

**Verification 2: HubSpot Contact Record**
- ✅ Go to HubSpot: https://app.hubspot.com
- ✅ Search for contact: `test@testorg.com`
- ✅ Verify:
  - ✅ Contact exists
  - ✅ `automation_next_email_step = 2` (advanced from 1)
  - ✅ `automation_next_send_timestamp` = Current time + 24 hours
  - ✅ `automation_template_set = set_three_b2b`
  - ✅ `automation_lead_type = B2B`

**Verification 3: Execution Log**
- ✅ Go to Apps Script **Executions** tab
- ✅ Check latest execution log
- ✅ Verify messages:
  - ✅ "📦 Preparing bulk AnyMail payload..."
  - ✅ "✅ Enriched X contacts"
  - ✅ "📧 Running sequence manager..."
  - ✅ "✅ Email sent to test@testorg.com"

---

### **Step 3: Test Tracking** ⏱️ 5 minutes

**Action:**
1. Open the sent Email 1 in an external inbox (use a test Gmail account)
2. **Open the email** (this triggers the tracking pixel)
3. **Click one of the links** in the email

**Expected Result:**
- Tracking pixel loads (invisible 1x1 image)
- Link click is logged
- Events sent to GA4 and HubSpot

**Verification 1: HubSpot Contact Record**
- ✅ Go to HubSpot contact: `test@testorg.com`
- ✅ Check properties:
  - ✅ `total_emails_opened = 1` (or incremented)
  - ✅ `total_clicks = 1` (or incremented)
  - ✅ `last_email_opened_at` = Recent timestamp
  - ✅ `last_link_clicked_at` = Recent timestamp

**Verification 2: GA4 Realtime Report**
- ✅ Go to Google Analytics: https://analytics.google.com
- ✅ Navigate to **Reports → Realtime**
- ✅ Look for custom events:
  - ✅ `email_opened` event (should appear within seconds)
  - ✅ `link_clicked` event (should appear within seconds)
- ✅ Check event parameters:
  - ✅ `template_set = set_three_b2b`
  - ✅ `client_id` matches HubSpot contact ID

**Verification 3: Web App Endpoint**
- ✅ Check Apps Script **Executions** log
- ✅ Look for `doGet()` executions
- ✅ Verify successful tracking calls

---

## ⏰ Phase II: Validating 24-Hour Delay

### **Step 4: Observe Timer** ⏱️ Several hours (monitoring)

**Action:**
1. Let the trigger continue running every 5 minutes
2. Monitor for several hours (at least 2-3 hours)
3. Check execution logs periodically

**Expected Result:**
- Script runs `sequenceManager()` repeatedly
- **Email 2 should NOT be sent** during this period
- Contact should be skipped because 24 hours haven't passed

**Verification: Execution Log**
- ✅ Go to Apps Script **Executions** tab
- ✅ Check multiple execution logs
- ✅ Verify messages:
  - ✅ "📧 Starting sequence manager..."
  - ✅ "Found 0 contacts ready for the next sequence step"
  - ✅ OR: "Skipping [test@testorg.com]: Not yet 24 hours"
- ✅ **Confirm:** No "Email sent" messages for Email 2

**Verification: HubSpot Contact**
- ✅ Check contact: `test@testorg.com`
- ✅ Verify:
  - ✅ `automation_next_email_step` still = 2 (not advanced)
  - ✅ `automation_next_send_timestamp` = Future timestamp (24 hours from Email 1)
  - ✅ No new emails sent

---

## 🚀 Phase III: Sequence Advancement

### **Step 5: Wait 24 Hours** ⏱️ 24 hours (waiting)

**Action:**
1. Wait until the `automation_next_send_timestamp` has passed
2. Wait for the next timer run (within 5 minutes)
3. Monitor the execution log

**Expected Result:**
- Contact should be identified as eligible
- `Current Time > automation_next_send_timestamp`
- Contact should be included in the search results

**Verification: Execution Log**
- ✅ Go to Apps Script **Executions** tab
- ✅ Check the execution log after 24 hours
- ✅ Verify:
  - ✅ "Found 1 contacts ready for the next sequence step"
  - ✅ **NO** "Skipping" messages
  - ✅ "Processing contact: test@testorg.com"

---

### **Step 6: Send Email 2** ⏱️ 5 minutes

**Action:**
1. The `sequenceManager()` should automatically execute
2. Email 2 should be sent
3. Contact record should be updated

**Expected Result:**
- Email 2 sent (second email in B2B sequence)
- Contact record updated:
  - `automation_next_email_step = 3`
  - `automation_next_send_timestamp = Now + 24 hours`
  - `automation_emails_sent` incremented

**Verification 1: Gmail Sent Folder**
- ✅ Go to Gmail **Sent** folder
- ✅ Look for email with subject: "Why HingeCraft? The Value Proposition"
- ✅ Verify it's sent to `test@testorg.com`
- ✅ Verify timestamp is after the 24-hour mark

**Verification 2: HubSpot Contact Record**
- ✅ Go to HubSpot contact: `test@testorg.com`
- ✅ Verify:
  - ✅ `automation_next_email_step = 3` (advanced from 2)
  - ✅ `automation_next_send_timestamp` = Current time + 24 hours
  - ✅ `automation_emails_sent = 2` (or incremented)
  - ✅ `last_contact_sent_date` = Recent timestamp

**Verification 3: Execution Log**
- ✅ Check Apps Script **Executions** log
- ✅ Verify:
  - ✅ "✅ Email sent to test@testorg.com"
  - ✅ "✅ Sequence run complete: 1 emails sent/advanced"

---

## ✅ Success Criteria

### **All Phases Pass If:**

**Phase I:**
- ✅ Email 1 sent immediately
- ✅ Contact created in HubSpot
- ✅ Tracking pixel and links work
- ✅ GA4 events logged

**Phase II:**
- ✅ Email 2 NOT sent during 24-hour period
- ✅ Execution logs show skipping
- ✅ Contact step remains at 2

**Phase III:**
- ✅ Email 2 sent after 24 hours
- ✅ Contact step advanced to 3
- ✅ Timestamp updated for next 24 hours

---

## 📊 Test Results Template

```
Phase I Results:
[ ] Step 1: Trigger set and running
[ ] Step 2: Test file processed, Email 1 sent
[ ] Step 3: Tracking verified (opens and clicks)

Phase II Results:
[ ] Step 4: 24-hour delay verified (Email 2 not sent)

Phase III Results:
[ ] Step 5: Contact identified as eligible after 24 hours
[ ] Step 6: Email 2 sent, sequence advanced

Overall Status: [ ] PASS / [ ] FAIL
```

---

## 🐛 Troubleshooting

### **Issue: Email 1 not sent**
- Check: Drive folder access permissions
- Check: Script Properties (MONITORED_FOLDER_ID)
- Check: Execution log for errors
- Check: HubSpot API token

### **Issue: Tracking not working**
- Check: Web App deployed and URL in Script Properties
- Check: GA4 properties in Script Properties
- Check: `doGet()` execution logs
- Check: HubSpot tracking properties exist

### **Issue: Email 2 sent too early**
- Check: `automation_next_send_timestamp` calculation
- Check: HubSpot Search API filter logic
- Check: Time zone settings

### **Issue: Email 2 not sent after 24 hours**
- Check: `automation_next_send_timestamp` value
- Check: Current time vs timestamp comparison
- Check: HubSpot Search API query
- Check: Execution logs for errors

---

## 📄 Test Files

**Test File Template:** `test_contact_1.csv`
- Located in project root
- Contains sample B2B contact data
- Ready to upload to Drive folder

**Test Report:** `final-system-test-report.json`
- Generated by test script
- Contains all test steps and results

---

## 🎯 Next Steps After Test

**If All Tests Pass:**
1. ✅ System is production-ready
2. ✅ Upload real lead files
3. ✅ Monitor first production run
4. ✅ Verify all sequences working

**If Tests Fail:**
1. Review error logs
2. Check troubleshooting section
3. Fix identified issues
4. Re-run test

---

**Test Duration:** ~24 hours (mostly waiting)  
**Active Testing Time:** ~30 minutes  
**Status:** Ready to execute
