# 🧪 Chandler Test - Verification Guide

## 📋 Test File: `test_chandler_tracking.csv`

**Test Contact:** `chandlerferguson319@gmail.com`  
**Lead Type:** B2B (detected from Lead ID: B2B-001)  
**Template Set:** `set_three_b2b` (automatically assigned)  
**Sequence:** 5-step B2B sequence with 24-hour timing

---

## 📊 Test File Structure

| Column | Value | Purpose |
|--------|-------|---------|
| Organization Name | Ferguson Ventures | Company name |
| Website URL | https://fergusonventures.com | Domain extraction |
| Primary Contact Email | chandlerferguson319@gmail.com | **Recipient email** |
| Lead ID | B2B-001 | Determines lead type (B2B) |
| City | San Francisco | Personalization |
| State | CA | Personalization |
| Focus Areas | SaaS | Segment data 1 |
| Target Age Range | 25-45 | Segment data 2 |
| Annual Budget Range | 30M-50M ARR | Segment data 3 |
| Partnership Likelihood | High | Segment data 4 |

**Note:** The system will automatically:
- Detect B2B from Lead ID (`B2B-001`)
- Assign template set: `set_three_b2b`
- Extract segment data from available columns

---

## ✅ Phase I: Initial Ingestion Verification

### **Step 1: File Processing**

**Expected Result:**
- ✅ File detected in Drive folder
- ✅ Contact ingested: `chandlerferguson319@gmail.com`
- ✅ Lead type detected: `B2B`
- ✅ Template set assigned: `set_three_b2b`

**Verification:**
1. Check Apps Script **Executions** log:
   - ✅ "📦 Preparing bulk AnyMail payload..."
   - ✅ "✅ Enriched X contacts"
   - ✅ "📦 Processing bulk results..."

2. Check HubSpot contact: `chandlerferguson319@gmail.com`
   - ✅ Contact exists
   - ✅ `automation_lead_type = B2B`
   - ✅ `automation_template_set = set_three_b2b`
   - ✅ `automation_next_email_step = 2` (after Email 1 sent)
   - ✅ `automation_next_send_timestamp` = Current time + 24 hours
   - ✅ `original_sheet_data_segment_1 = SaaS`
   - ✅ `original_sheet_data_segment_2 = 25-45`
   - ✅ `original_sheet_data_segment_3 = 30M-50M ARR`
   - ✅ `original_sheet_data_segment_4 = High`

---

### **Step 2: Email 1 Sent**

**Expected Result:**
- ✅ Email 1 sent immediately (no delay)
- ✅ Subject: "Partnership Opportunity: Let's Build Together"
- ✅ Sent to: `chandlerferguson319@gmail.com`
- ✅ Contains tracking pixel
- ✅ Contains wrapped links

**Verification:**
1. Check Gmail **Sent** folder:
   - ✅ Email with subject: "Partnership Opportunity: Let's Build Together"
   - ✅ Sent to: `chandlerferguson319@gmail.com`
   - ✅ Timestamp: Within 5 minutes of file upload

2. Check email content:
   - ✅ Personalization: "Hi Chandler" or "Chandler"
   - ✅ Company mention: "Ferguson Ventures"
   - ✅ Tracking pixel: Invisible 1x1 image
   - ✅ Links: All wrapped with tracking URLs

3. Check HubSpot:
   - ✅ `automation_next_email_step = 2`
   - ✅ `automation_next_send_timestamp` = Now + 24 hours
   - ✅ `automation_emails_sent = 1`
   - ✅ `last_contact_sent_date` = Recent timestamp

---

### **Step 3: Tracking Verification**

**Action:**
1. Open email in `chandlerferguson319@gmail.com` inbox
2. Click a link in the email

**Expected Result:**
- ✅ Email open tracked
- ✅ Link click tracked
- ✅ Events logged to GA4
- ✅ HubSpot properties updated

**Verification 1: HubSpot**
- ✅ `total_emails_opened = 1` (or incremented)
- ✅ `total_clicks = 1` (or incremented)
- ✅ `last_email_opened_at` = Recent timestamp
- ✅ `last_link_clicked_at` = Recent timestamp

**Verification 2: GA4 Realtime**
- ✅ Go to: https://analytics.google.com
- ✅ Navigate to **Reports → Realtime**
- ✅ Look for events:
  - ✅ `email_opened` (appears within seconds)
  - ✅ `link_clicked` (appears within seconds)
- ✅ Check event parameters:
  - ✅ `template_set = set_three_b2b`
  - ✅ `client_id` = HubSpot contact ID

**Verification 3: Apps Script Logs**
- ✅ Check **Executions** tab
- ✅ Look for `doGet()` executions
- ✅ Verify successful tracking calls

---

## ⏰ Phase II: 24-Hour Delay Verification

### **Step 4: Monitor Timer**

**Expected Result:**
- ✅ Script runs every 5 minutes
- ✅ Email 2 **NOT sent** during 24-hour period
- ✅ Contact skipped in sequence manager

**Verification:**
1. Check Apps Script **Executions** log (multiple runs):
   - ✅ "📧 Starting sequence manager..."
   - ✅ "Found 0 contacts ready for the next sequence step"
   - ✅ OR: Contact not in search results (timestamp not passed)

2. Check HubSpot:
   - ✅ `automation_next_email_step` still = 2
   - ✅ `automation_next_send_timestamp` = Future timestamp
   - ✅ No new emails sent

3. Check Gmail:
   - ✅ Only Email 1 in Sent folder
   - ✅ No Email 2 during 24-hour period

---

## 🚀 Phase III: Sequence Advancement Verification

### **Step 5: Wait 24 Hours**

**Expected Result:**
- ✅ After 24 hours, contact becomes eligible
- ✅ `Current Time > automation_next_send_timestamp`
- ✅ Contact included in search results

**Verification:**
1. Check Apps Script **Executions** log (after 24 hours):
   - ✅ "Found 1 contacts ready for the next sequence step"
   - ✅ "Processing contact: chandlerferguson319@gmail.com"
   - ✅ **NO** "Skipping" messages

---

### **Step 6: Email 2 Sent**

**Expected Result:**
- ✅ Email 2 sent automatically
- ✅ Subject: "Why HingeCraft? The Value Proposition"
- ✅ Contact record updated

**Verification:**
1. Check Gmail **Sent** folder:
   - ✅ Email with subject: "Why HingeCraft? The Value Proposition"
   - ✅ Sent to: `chandlerferguson319@gmail.com`
   - ✅ Timestamp: After 24-hour mark

2. Check HubSpot:
   - ✅ `automation_next_email_step = 3` (advanced from 2)
   - ✅ `automation_next_send_timestamp` = Current time + 24 hours
   - ✅ `automation_emails_sent = 2`
   - ✅ `last_contact_sent_date` = Recent timestamp

3. Check Apps Script **Executions** log:
   - ✅ "✅ Email sent to chandlerferguson319@gmail.com"
   - ✅ "✅ Sequence run complete: 1 emails sent/advanced"

---

## 📊 Expected Sequence Timeline

**Email 1:** Sent immediately (Time 0:00)
- Subject: "Partnership Opportunity: Let's Build Together"
- Step: 1 → 2

**Email 2:** Sent after 24 hours (Time 24:00)
- Subject: "Why HingeCraft? The Value Proposition"
- Step: 2 → 3

**Email 3:** Sent after 48 hours (Time 48:00)
- Subject: "Success Stories: What Partners Are Saying"
- Step: 3 → 4

**Email 4:** Sent after 72 hours (Time 72:00)
- Subject: "Next Steps: How to Get Started"
- Step: 4 → 5

**Email 5:** Sent after 96 hours (Time 96:00)
- Subject: "Final Call: Don't Miss This Opportunity"
- Step: 5 → 6 (completed)

---

## ✅ Success Criteria

**Phase I Passes If:**
- ✅ Email 1 sent immediately
- ✅ Contact created in HubSpot with correct properties
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

## 🐛 Troubleshooting

### **Issue: Email not sent**
- Check: Drive folder access
- Check: Script Properties (MONITORED_FOLDER_ID)
- Check: Execution log for errors
- Check: HubSpot API token

### **Issue: Wrong template set**
- Check: Lead ID format (B2B-001 = B2B)
- Check: `determineLeadTypeFromRow()` logic
- Check: `mapLeadTypeToTemplateSet()` mapping

### **Issue: Tracking not working**
- Check: Web App deployed
- Check: TRACKING_ENDPOINT_URL in Script Properties
- Check: GA4 properties in Script Properties
- Check: `doGet()` execution logs

---

## 📄 Test File Location

**File:** `test_chandler_tracking.csv`  
**Location:** Project root  
**Status:** Ready to upload to Drive folder

---

**Test Contact:** `chandlerferguson319@gmail.com`  
**Template Set:** `set_three_b2b` (B2B sequence)  
**Sequence:** 5 emails, 24-hour timing  
**Status:** Ready to test
