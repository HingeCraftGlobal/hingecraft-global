# 📋 HubSpot Simplified Setup - Container & Segmentation Only

## 🎯 Overview

**IMPORTANT:** HubSpot is used **ONLY** as a container for leads and segmentation via properties. **NO WORKFLOWS ARE NEEDED.**

All automation logic is handled by **Google Apps Script**, which:
1. Reads files from Google Drive
2. Enriches with AnyMail
3. Creates/updates contacts in HubSpot
4. Segments leads using properties
5. Pulls from HubSpot lists
6. Sends emails via Gmail API

---

## 🔑 PART 1: HubSpot OAuth Scopes (Private App)

### Required Scopes - Minimal Set

Navigate to: **HubSpot Account → Settings → Integrations → Private Apps → Create Private App**

**Select ONLY these scopes:**

#### **CRM Scopes** (Required for Contact/Company Management)
```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.companies.read
crm.objects.companies.write
```

#### **Lists Scopes** (Required for Segmentation Lists)
```
lists.read
lists.write
```

**Total: 6 scopes only** (much simpler than the full setup!)

**After creating the Private App:**
1. Copy the **Access Token** (starts with `pat-`)
2. Save it: `pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39`

---

## 🧱 PART 2: Custom Properties Configuration

Navigate to: **Settings → Properties**

### **COMPANY Properties** (Create in Settings → Properties → Companies)

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `original_sheet_url` | Original Sheet URL | Single-line text | Google Drive file URL |
| `email_finder_status` | Email Finder Status | Single-line text | 'pending', 'found', 'failed' |

---

### **CONTACT Properties** (Create in Settings → Properties → Contacts)

#### **Source & Ingestion Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_source` | Automation Source | Single-line text | 'google_drive' |
| `automation_source_file_id` | Automation Source File ID | Single-line text | Google Drive file ID |
| `automation_ingested_at` | Automation Ingested At | Number | Timestamp when ingested |

#### **AnyMail Enrichment Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `anymail_source_type` | AnyMail Source Type | Single-line text | 'verified', 'guessed', 'not_found' |
| `automation_anymail_enriched` | Automation AnyMail Enriched | Single-line text | 'true' or 'false' |
| `send_email_ready` | Send Email Ready | Single-line text | 'true' or 'false' |

#### **Lead Classification Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_lead_type` | Automation Lead Type | Single-line text | 'Student', 'School', 'NGO', 'B2B' |
| `automation_template_set` | Automation Template Set | Single-line text | 'set_one_student', 'set_two_referral', 'set_three_b2b' |

#### **Email Tracking Properties**

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `automation_emails_sent` | Automation Emails Sent | Number | Total emails sent |
| `automation_last_email_sent` | Automation Last Email Sent | Number | Timestamp of last email |
| `last_contact_sent_date` | Last Contact Sent Date | Date picker | Date of last email sent |

#### **Segmented Data Fields** (From Google Drive Sheet)

| Internal Name (API Name) | Label | Field Type | Description |
|-------------------------|-------|------------|-------------|
| `original_sheet_data_segment_1` | Original Sheet Data Segment 1 | Single-line text | First segmented data field |
| `original_sheet_data_segment_2` | Original Sheet Data Segment 2 | Single-line text | Second segmented data field |
| `original_sheet_data_segment_3` | Original Sheet Data Segment 3 | Single-line text | Third segmented data field |
| `original_sheet_data_segment_4` | Original Sheet Data Segment 4 | Single-line text | Fourth segmented data field |
| `original_sheet_data_segment_5` | Original Sheet Data Segment 5 | Single-line text | Fifth segmented data field |

**Note:** Add more `original_sheet_data_segment_N` properties as needed (up to 10).

---

### **Property Creation Checklist**

- [ ] All 2 Company Properties created
- [ ] All 15+ Contact Properties created
- [ ] All Internal Names (API Names) match EXACTLY (case-sensitive!)

**CRUCIAL:** The Internal Name (API Name) must match EXACTLY - case-sensitive!

---

## 📋 PART 3: Lists Creation

Navigate to: **Contacts → Lists → Create List**

### **Lists to Create**

1. **"Ready to Send"** - Active list
   - Criteria: `send_email_ready` equals `true`
   - Purpose: Contacts ready for email sending

2. **"New Google Drive Leads"** - Active list
   - Criteria: `automation_source` equals `google_drive`
   - Purpose: All leads from Google Drive

3. **"Enriched Leads"** - Active list
   - Criteria: `automation_anymail_enriched` equals `true`
   - Purpose: Leads enriched with AnyMail

4. **"Student Leads"** - Active list (optional)
   - Criteria: `automation_lead_type` equals `Student`
   - Purpose: Student segment

5. **"B2B Leads"** - Active list (optional)
   - Criteria: `automation_lead_type` equals `B2B`
   - Purpose: B2B segment

**Lists Creation Checklist:**
- [ ] "Ready to Send" list created (REQUIRED)
- [ ] Other lists created as needed
- [ ] Active lists have proper criteria set

---

## 🔐 PART 4: Google Service Account Setup

### **Service Account Information**

The Google Service Account JSON has been saved to:
`google-apps-script/google-service-account.json`

**Service Account Details:**
- **Project ID:** `automations-ml`
- **Client Email:** `hingecraft-hubspot-automation@automations-ml.iam.gserviceaccount.com`
- **Purpose:** Access Google Drive files for automation

### **Grant Drive Access**

1. Go to your Google Drive folder: `HubSpot_Leads_Input`
2. Click **"Share"**
3. Add email: `hingecraft-hubspot-automation@automations-ml.iam.gserviceaccount.com`
4. Grant **"Viewer"** access (read-only)
5. Click **"Send"**

---

## ✅ FINAL CHECKLIST

### **Required Setup:**

- [ ] **Part 1:** Private App created with 6 scopes (CRM + Lists)
- [ ] **Part 1:** Access Token copied: `pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39`
- [ ] **Part 2:** All Company Properties created (2 properties)
- [ ] **Part 2:** All Contact Properties created (15+ properties)
- [ ] **Part 3:** "Ready to Send" list created (REQUIRED)
- [ ] **Part 4:** Service Account has access to Drive folder

### **NOT NEEDED:**

- ❌ **NO Workflows** - All automation is in Google Apps Script
- ❌ **NO Marketing Emails in HubSpot** - Emails sent via Gmail API
- ❌ **NO Custom Code Actions** - All logic in Google Apps Script
- ❌ **NO Webhooks** - Direct API calls from Google Apps Script

---

## 🔄 How It Works

1. **Google Apps Script** monitors Drive folder (every 5 minutes)
2. **New file detected** → Script reads CSV/Sheet
3. **AnyMail enrichment** → Script calls AnyMail API
4. **HubSpot sync** → Script creates/updates contacts with properties
5. **Segmentation** → Properties automatically update lists
6. **Email sending** → Script pulls from "Ready to Send" list
7. **Gmail send** → Script sends via Gmail API (not HubSpot)
8. **Tracking** → Script updates properties after send

---

## 📝 Notes

1. **Properties are the Key:** All segmentation happens via properties, not workflows
2. **Lists Auto-Update:** Active lists automatically update based on property values
3. **No Workflows Needed:** Google Apps Script handles all automation
4. **Gmail Sending:** Emails sent directly from `marketingecraft@gmail.com` via Gmail API
5. **HubSpot is Container:** HubSpot stores leads and enables segmentation, nothing more

---

**Status:** ✅ Simplified setup - HubSpot as container only
