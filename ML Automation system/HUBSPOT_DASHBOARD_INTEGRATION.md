# 🚀 HubSpot Dashboard Integration - Complete Guide

## ✅ Integration Complete!

Your automation system now syncs **all pipeline data to HubSpot**, creating custom objects, updating contact properties, and building dashboards.

---

## 📊 What Gets Synced to HubSpot

### 1. **Custom Objects** ✅

#### Pipeline Run Object
- **Name**: Pipeline Run
- **Properties**:
  - Pipeline Run Name
  - Status (processing, completed, failed)
  - File Name
  - Total Rows
  - Processed Rows
  - Leads Created
  - Emails Sent
  - Started At
  - Completed At
  - Error Message

#### Pipeline Metrics Object
- **Name**: Pipeline Metrics
- **Properties**:
  - Metrics Name
  - Timeframe
  - Pipeline Total/Completed/Failed
  - Leads Total/Classified
  - Emails Total/Sent/Opened/Bounced
  - Sequences Total/Active
  - Recorded At

### 2. **Contact Properties** ✅

All contacts are updated with automation data:

- `automation_lead_type` - Lead classification
- `automation_template_set` - Template set assigned
- `automation_lead_score` - Lead score
- `automation_classified_at` - When lead was classified
- `automation_sequence_status` - Current sequence status
- `automation_sequence_step` - Current step in sequence
- `automation_sequence_started` - When sequence started
- `automation_emails_sent` - Total emails sent
- `automation_emails_opened` - Total emails opened
- `automation_emails_clicked` - Total emails clicked
- `automation_emails_replied` - Total emails replied
- `automation_last_email_sent` - Last email sent timestamp
- `automation_last_email_opened` - Last email opened timestamp
- `automation_last_email_clicked` - Last email clicked timestamp
- `automation_last_email_replied` - Last email replied timestamp
- `automation_source` - Lead source
- `automation_source_file` - Source file ID
- `automation_ingested_at` - When lead was ingested

### 3. **Timeline Events** ✅

Pipeline activities are logged as timeline events:
- Pipeline run started
- Pipeline run completed
- Pipeline run failed
- Lead classified
- Sequence started
- Email sent
- Email opened/clicked/replied

---

## 🚀 How to Sync Data to HubSpot

### Option 1: Full Sync (Recommended First Time)

**Via Script:**
```bash
node scripts/sync-to-hubspot.js
```

**Via API:**
```bash
curl -X POST http://localhost:7101/api/hubspot/full-sync
```

This syncs:
- ✅ Initializes custom objects
- ✅ Syncs all pipeline runs
- ✅ Syncs current metrics
- ✅ Updates all contacts with pipeline data

### Option 2: Initialize Custom Objects Only

**Via API:**
```bash
curl -X POST http://localhost:7101/api/hubspot/init-custom-objects
```

### Option 3: Sync Specific Items

**Sync a specific pipeline run:**
```bash
curl -X POST http://localhost:7101/api/hubspot/sync-pipeline-run/{ingestId}
```

**Sync metrics:**
```bash
curl -X POST http://localhost:7101/api/hubspot/sync-metrics \
  -H "Content-Type: application/json" \
  -d '{"timeframe": "24 hours"}'
```

**Sync all pipeline runs:**
```bash
curl -X POST http://localhost:7101/api/hubspot/sync-all-pipeline-runs \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}'
```

**Sync all contacts:**
```bash
curl -X POST http://localhost:7101/api/hubspot/sync-all-contacts \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}'
```

**Update specific contact:**
```bash
curl -X POST http://localhost:7101/api/hubspot/update-contact/{contactId} \
  -H "Content-Type: application/json" \
  -d '{"leadId": "lead-id-here"}'
```

---

## 📊 Viewing Data in HubSpot

### Custom Objects

1. Go to **Settings** → **Objects** → **Custom Objects**
2. Find **Pipeline Run** and **Pipeline Metrics**
3. View all pipeline runs and metrics

### Contact Properties

1. Go to **Contacts**
2. Open any contact
3. Scroll to **Properties** section
4. Look for properties starting with `automation_*`

### Timeline Events

1. Go to **Contacts**
2. Open any contact
3. View **Timeline** tab
4. See all pipeline activities

### Building Dashboards

1. Go to **Reports** → **Dashboards**
2. Create new dashboard
3. Add reports using:
   - **Pipeline Run** custom object
   - **Pipeline Metrics** custom object
   - **Contact** properties (automation_*)

---

## 🔄 Automatic Sync

To set up automatic syncing, you can:

1. **Add to cron job** (syncs every hour):
```javascript
// In your cron jobs
const cron = require('cron');
const hubspotDashboardSync = require('./src/services/hubspotDashboardSync');

const syncCron = new cron.CronJob('0 * * * *', async () => {
  await hubspotDashboardSync.syncPipelineMetrics('24 hours');
  await hubspotDashboardSync.syncAllPipelineRuns(10); // Last 10 runs
}, null, true);
```

2. **Sync on pipeline completion**:
```javascript
// In driveIngest.js after processing
await hubspotDashboardSync.syncPipelineRun(ingestId);
```

3. **Sync on contact update**:
```javascript
// In hubspotEnhanced.js after upsert
await hubspotDashboardSync.updateContactPipelineProperties(contactId, leadId);
```

---

## 📈 Dashboard Examples

### Pipeline Performance Dashboard

**Metrics to Track:**
- Total Pipeline Runs (last 30 days)
- Success Rate (%)
- Average Processing Time
- Leads Created per Run
- Emails Sent per Run

**Reports:**
- Pipeline Run Status (pie chart)
- Pipeline Runs Over Time (line chart)
- Leads Created by Pipeline (bar chart)

### Lead Processing Dashboard

**Metrics to Track:**
- Total Leads Processed
- Classification Rate
- HubSpot Sync Rate
- Sequence Enrollment Rate

**Reports:**
- Lead Type Distribution
- Classification Over Time
- Sequence Status Breakdown

### Email Performance Dashboard

**Metrics to Track:**
- Total Emails Sent
- Open Rate
- Click Rate
- Reply Rate
- Bounce Rate

**Reports:**
- Email Engagement Over Time
- Open Rate by Lead Type
- Reply Rate by Sequence Step

---

## ✅ Next Steps

1. **Run Initial Sync:**
   ```bash
   node scripts/sync-to-hubspot.js
   ```

2. **Verify in HubSpot:**
   - Check custom objects exist
   - Check contact properties updated
   - Check timeline events logged

3. **Create Dashboards:**
   - Build custom dashboards in HubSpot
   - Use Pipeline Run and Pipeline Metrics objects
   - Use automation_* contact properties

4. **Set Up Auto-Sync:**
   - Add cron job for periodic syncing
   - Sync on pipeline completion
   - Sync on contact updates

---

## 🎯 Summary

**What's Now in HubSpot:**
- ✅ Custom Objects (Pipeline Run, Pipeline Metrics)
- ✅ Contact Properties (All automation data)
- ✅ Timeline Events (All pipeline activities)
- ✅ Full Database Sync (All pipeline data)

**What You Can Do:**
- ✅ View pipeline metrics in HubSpot
- ✅ Track lead processing in HubSpot
- ✅ Monitor email performance in HubSpot
- ✅ Build custom dashboards
- ✅ Create workflows based on pipeline data

---

*All pipeline data is now synced to HubSpot!* 🎉
