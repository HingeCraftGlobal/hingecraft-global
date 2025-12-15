# 🔍 Real-Time Execution Monitor - Active Test

## ⚡ System Status: ACTIVE EXECUTION

**Test File:** `test_chandler_tracking.csv`  
**Test Contact:** `chandlerferguson319@gmail.com`  
**Status:** File dropped, system processing

---

## ⏳ Immediate Execution Path

### **Step 1: Trigger Fires** ⏱️ Within 5 minutes

**Location:** Google Apps Script → Executions tab

**Action:** Timer runs `checkFolderForNewFiles()`

**Expected Log Messages:**
```
🔍 Checking folder for new files...
📁 Accessing folder: [Folder Name] ([Folder ID])
📦 Preparing bulk AnyMail payload from all new files...
```

**Verification:**
- [ ] Go to: https://script.google.com
- [ ] Click **Executions** tab
- [ ] Look for latest execution of `checkFolderForNewFiles`
- [ ] Status should be: ✅ **Success** (green checkmark)
- [ ] Execution time: Within last 5 minutes

---

### **Step 2: File Scan** ⏱️ Immediate

**Function:** `checkFolderForNewFiles()`

**Expected Log Messages:**
```
📄 Processing file: test_chandler_tracking.csv
📦 Found 1 unique contacts for bulk enrichment
```

**Verification:**
- [ ] Check execution log
- [ ] Look for: "📄 Processing file: test_chandler_tracking.csv"
- [ ] Look for: "📦 Found X unique contacts"

---

### **Step 3: Ingestion & CRM Update** ⏱️ 10-30 seconds

**Function:** `processBulkResults()`

**Expected Log Messages:**
```
📧 Running bulk AnyMail enrichment...
✅ Enriched 1 contacts via AnyMail Bulk API
📦 Processing bulk results and pushing to HubSpot...
✅ Bulk processing complete: 1 processed, 1 created, 0 updated
```

**Verification: HubSpot Contact Record**
- [ ] Go to: https://app.hubspot.com
- [ ] Search for: `chandlerferguson319@gmail.com`
- [ ] Verify contact exists
- [ ] Check properties:
  - [ ] `email = chandlerferguson319@gmail.com`
  - [ ] `firstname = Chandler` (or extracted from data)
  - [ ] `company = Ferguson Ventures`
  - [ ] `automation_lead_type = B2B`
  - [ ] `automation_template_set = set_three_b2b`
  - [ ] `automation_next_email_step = 2` (after Email 1 sent)
  - [ ] `automation_next_send_timestamp` = Current time + 24 hours
  - [ ] `original_sheet_data_segment_1 = SaaS`
  - [ ] `original_sheet_data_segment_2 = 25-45`
  - [ ] `original_sheet_data_segment_3 = 30M-50M ARR`
  - [ ] `original_sheet_data_segment_4 = High`

---

### **Step 4: Sequence Start** ⏱️ Immediate

**Function:** `sequenceManager()`

**Expected Log Messages:**
```
📧 Running sequence manager for follow-up emails...
📧 Starting sequence manager (Time-Based Search)...
Found 1 contacts ready for the next sequence step.
Processing contact: chandlerferguson319@gmail.com
```

**Verification:**
- [ ] Check execution log
- [ ] Look for: "Found 1 contacts ready for the next sequence step"
- [ ] Look for: "Processing contact: chandlerferguson319@gmail.com"

---

### **Step 5: Tracking Injection** ⏱️ Immediate

**Function:** `sendPersonalizedEmail()`

**Expected Log Messages:**
```
Sending email 1 to chandlerferguson319@gmail.com
Template: set_three_b2b, Step: 1
✅ Email sent successfully
```

**Verification:**
- [ ] Check execution log
- [ ] Look for: "Sending email 1 to chandlerferguson319@gmail.com"
- [ ] Look for: "Template: set_three_b2b, Step: 1"
- [ ] Look for: "✅ Email sent successfully"

---

### **Step 6: The Send** ⏱️ Immediate

**Service:** GmailApp.sendEmail()

**Expected Result:**
- Email sent from: `marketingecraft@gmail.com`
- Email sent to: `chandlerferguson319@gmail.com`
- Subject: "Partnership Opportunity: Let's Build Together"

**Verification: Gmail Sent Folder**
- [ ] Go to: https://mail.google.com
- [ ] Click **Sent** folder
- [ ] Look for email with subject: "Partnership Opportunity: Let's Build Together"
- [ ] Verify:
  - [ ] To: `chandlerferguson319@gmail.com`
  - [ ] From: `marketingecraft@gmail.com`
  - [ ] Timestamp: Recent (within last 5 minutes)
  - [ ] Contains tracking pixel (invisible 1x1 image)
  - [ ] Contains wrapped links (check HTML source)

---

### **Step 7: Sequence Advance** ⏱️ Immediate

**Function:** `advanceContactSequence()`

**Expected Log Messages:**
```
✅ Sequence run complete: 1 emails sent/advanced.
```

**Verification: HubSpot Contact Record**
- [ ] Go to HubSpot contact: `chandlerferguson319@gmail.com`
- [ ] Verify properties updated:
  - [ ] `automation_next_email_step = 2` (advanced from 1)
  - [ ] `automation_next_send_timestamp` = Current time + 24 hours
  - [ ] `automation_emails_sent = 1`
  - [ ] `last_contact_sent_date` = Recent timestamp

**Calculate Timestamp:**
- Current time: [Your current time]
- Expected timestamp: [Current time + 24 hours]
- Example: If now is 10:00 AM, timestamp should be ~10:00 AM tomorrow

---

## 📧 Email Verification (Your Action)

### **Step 1: Check Inbox**

**Action:**
1. Go to: https://mail.google.com
2. Sign in as: `chandlerferguson319@gmail.com`
3. Check **Inbox** folder

**Expected Result:**
- ✅ Email received with subject: "Partnership Opportunity: Let's Build Together"
- ✅ From: `marketingecraft@gmail.com`
- ✅ Received within 5 minutes of file upload

**Status:** [ ] Received / [ ] Not Received

---

### **Step 2: Verify Email Content**

**Action:** Open the email

**Expected Content:**
- ✅ Personalization: "Hi Chandler" or "Chandler"
- ✅ Company mention: "Ferguson Ventures"
- ✅ Subject: "Partnership Opportunity: Let's Build Together"
- ✅ Body: B2B template step 1 content
- ✅ Links: All clickable links present

**Status:** [ ] Content Verified / [ ] Issues Found

---

## 📊 Tracking Verification (Your Action)

### **Step 3: Test Email Open**

**Action:**
1. Open the email in `chandlerferguson319@gmail.com` inbox
2. This automatically triggers the tracking pixel

**Expected Result:**
- Tracking pixel loads (invisible, no visible effect)
- Event logged to GA4
- HubSpot property updated

**Verification 1: HubSpot**
- [ ] Go to HubSpot contact: `chandlerferguson319@gmail.com`
- [ ] Check properties:
  - [ ] `total_emails_opened = 1` (or incremented)
  - [ ] `last_email_opened_at` = Recent timestamp

**Verification 2: GA4 Realtime**
- [ ] Go to: https://analytics.google.com
- [ ] Navigate to **Reports → Realtime**
- [ ] Look for event: `email_opened`
- [ ] Check event parameters:
  - [ ] `template_set = set_three_b2b`
  - [ ] `client_id` = HubSpot contact ID

**Status:** [ ] Open Tracked / [ ] Not Tracked

---

### **Step 4: Test Link Click**

**Action:**
1. Click any link in the email
2. You should be redirected to the actual destination

**Expected Result:**
- Link click logged
- Redirect to actual URL
- Event logged to GA4
- HubSpot property updated

**Verification 1: HubSpot**
- [ ] Go to HubSpot contact: `chandlerferguson319@gmail.com`
- [ ] Check properties:
  - [ ] `total_clicks = 1` (or incremented)
  - [ ] `last_link_clicked_at` = Recent timestamp

**Verification 2: GA4 Realtime**
- [ ] Go to GA4 Realtime Report
- [ ] Look for event: `link_clicked`
- [ ] Check event parameters:
  - [ ] `template_set = set_three_b2b`
  - [ ] `link_url` = The clicked URL

**Verification 3: Apps Script Logs**
- [ ] Check Apps Script **Executions** tab
- [ ] Look for `doGet()` executions
- [ ] Verify successful tracking calls

**Status:** [ ] Click Tracked / [ ] Not Tracked

---

## ✅ Complete Verification Checklist

### **Phase I: Immediate Execution**

- [ ] **Step 1:** Trigger fired (check Executions log)
- [ ] **Step 2:** File scanned (log shows file processing)
- [ ] **Step 3:** Contact created in HubSpot
- [ ] **Step 4:** Sequence manager called
- [ ] **Step 5:** Tracking injected
- [ ] **Step 6:** Email sent (check Gmail Sent folder)
- [ ] **Step 7:** Sequence advanced (HubSpot step = 2, timestamp set)

### **Phase II: Email Verification**

- [ ] **Email Received:** Check `chandlerferguson319@gmail.com` inbox
- [ ] **Email Content:** Verify personalization and content
- [ ] **Email Subject:** "Partnership Opportunity: Let's Build Together"

### **Phase III: Tracking Verification**

- [ ] **Email Open:** HubSpot `total_emails_opened = 1`
- [ ] **Email Open:** GA4 shows `email_opened` event
- [ ] **Link Click:** HubSpot `total_clicks = 1`
- [ ] **Link Click:** GA4 shows `link_clicked` event

---

## 📊 Expected HubSpot Properties (After Email 1)

| Property | Expected Value | Status |
|----------|---------------|--------|
| `email` | chandlerferguson319@gmail.com | [ ] |
| `firstname` | Chandler | [ ] |
| `company` | Ferguson Ventures | [ ] |
| `automation_lead_type` | B2B | [ ] |
| `automation_template_set` | set_three_b2b | [ ] |
| `automation_next_email_step` | 2 | [ ] |
| `automation_next_send_timestamp` | [Current Time + 24 hours] | [ ] |
| `automation_emails_sent` | 1 | [ ] |
| `last_contact_sent_date` | [Recent timestamp] | [ ] |
| `original_sheet_data_segment_1` | SaaS | [ ] |
| `original_sheet_data_segment_2` | 25-45 | [ ] |
| `original_sheet_data_segment_3` | 30M-50M ARR | [ ] |
| `original_sheet_data_segment_4` | High | [ ] |
| `total_emails_opened` | 1 (after opening) | [ ] |
| `total_clicks` | 1 (after clicking) | [ ] |

---

## 🐛 Troubleshooting

### **Issue: Email not received**
- Check: Gmail Sent folder (may be in Sent, not Inbox)
- Check: Spam folder
- Check: Execution log for errors
- Check: Gmail sending limits

### **Issue: Contact not created in HubSpot**
- Check: Execution log for errors
- Check: HubSpot API token
- Check: AnyMail API (if enrichment fails)
- Check: File format (CSV vs XLSX)

### **Issue: Tracking not working**
- Check: Web App deployed
- Check: TRACKING_ENDPOINT_URL in Script Properties
- Check: GA4 properties in Script Properties
- Check: `doGet()` execution logs

### **Issue: Wrong template set**
- Check: Lead ID format (B2B-001 = B2B)
- Check: `determineLeadTypeFromRow()` logic
- Check: HubSpot `automation_template_set` property

---

## 📝 Status Report Template

**Fill this out after verification:**

```
Execution Status: [ ] Success / [ ] Partial / [ ] Failed

Email 1 Status:
  [ ] Received
  [ ] Not Received
  Subject: _________________________
  Received Time: ___________________

HubSpot Contact Status:
  [ ] Created
  [ ] Not Created
  automation_next_email_step: _______
  automation_next_send_timestamp: ___
  automation_emails_sent: ___________

Tracking Status:
  Email Opens: [ ] Tracked / [ ] Not Tracked
  Link Clicks: [ ] Tracked / [ ] Not Tracked
  GA4 Events: [ ] Working / [ ] Not Working

Issues Found:
  ___________________________________
  ___________________________________
  ___________________________________
```

---

## 🎯 Next Steps

**After Email 1 Verification:**
1. ✅ Confirm email received
2. ✅ Confirm HubSpot properties set
3. ✅ Confirm tracking working
4. ⏰ Wait 24 hours for Email 2
5. 📊 Monitor execution logs during wait period

**During 24-Hour Wait:**
- Monitor execution logs (should show "Found 0 contacts" or skipping)
- Verify Email 2 NOT sent
- Verify HubSpot step remains at 2

**After 24 Hours:**
- Verify Email 2 sent automatically
- Verify HubSpot step advanced to 3
- Verify timestamp updated for next 24 hours

---

**Status:** 🔴 **ACTIVE - MONITORING REQUIRED**  
**Last Updated:** [Current Time]  
**Next Check:** [Current Time + 5 minutes]
