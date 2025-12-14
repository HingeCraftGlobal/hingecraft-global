# 📋 HubSpot Quick Reference - Copy/Paste Ready

## 🔑 OAuth Scopes (Copy All)

```
crm.objects.contacts.read
crm.objects.contacts.write
crm.objects.companies.read
crm.objects.companies.write
crm.objects.custom.read
crm.objects.custom.write
crm.schemas.contacts.read
crm.schemas.contacts.write
crm.schemas.companies.read
crm.schemas.companies.write
crm.schemas.custom.read
crm.schemas.custom.write
automation
automation.read
automation.write
marketing-email.read
marketing-email.write
marketing-email.send
content
content.read
content.write
files
files.read
files.write
timeline
timeline.read
timeline.write
webhooks
webhooks.read
webhooks.write
lists
lists.read
lists.write
engagements.read
engagements.write
oauth
```

---

## 🧱 Company Properties (Internal Names)

```
original_sheet_url
email_finder_status
automation_source
automation_ingested_at
automation_company_segment
```

---

## 🧱 Contact Properties (Internal Names)

### Source & Ingestion
```
automation_source
automation_source_file_id
automation_source_row_number
automation_ingested_at
```

### AnyMail Enrichment
```
anymail_source_type
automation_anymail_enriched
automation_enriched_at
send_email_ready
```

### Lead Classification
```
automation_lead_type
automation_template_set
automation_lead_score
automation_classified_at
automation_persona_score
automation_fm_stage
automation_preferred_tone
automation_tier
automation_has_donated
```

### Sequence
```
automation_sequence_id
automation_sequence_name
automation_sequence_status
automation_sequence_step
automation_sequence_started
automation_next_action_due
```

### Email Engagement
```
automation_emails_sent
automation_emails_opened
automation_emails_clicked
automation_emails_replied
automation_emails_bounced
automation_last_email_sent
automation_last_email_opened
automation_last_email_clicked
automation_last_email_replied
```

### Segmentation
```
automation_segment_name
automation_segment_type
automation_segments
```

### AI Analysis
```
automation_ai_analyzed
automation_ai_confidence
automation_ai_recommendations
automation_analysis_type
```

### Status
```
automation_status
automation_campaign_id
automation_campaign_name
```

### Segmented Data (Add as needed)
```
original_sheet_data_segment_1
original_sheet_data_segment_2
original_sheet_data_segment_3
original_sheet_data_segment_4
original_sheet_data_segment_5
```

---

## 🔐 Secrets to Store

```
ANYMAIL_API_KEY
GOOGLE_SERVICE_ACCOUNT_JSON
GEMINI_API_KEY
GEMINI_PROJECT_ID
HUBSPOT_ACCESS_TOKEN
WEBHOOK_SECRET
```

---

## 📧 Email Template IDs (Note These)

```
set_one_email_1
set_one_email_2
set_one_email_3
set_one_email_4
set_one_email_5
set_two_email_1
set_three_email_1
set_three_email_2
set_three_email_3
set_three_email_4
set_three_email_5
```

---

## 📋 Lists to Create

```
New Google Drive Leads
Enriched Leads
Replied Leads
High Score Leads
Active Sequences
NGO Leads
School Leads
Student Leads
```

---

**See 📋_HUBSPOT_MANUAL_SETUP_COMPLETE.md for detailed setup instructions.**
