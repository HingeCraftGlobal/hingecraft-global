# ✅ Complete System Setup Checklist

## 🎯 Full Pipeline Setup - Everything You Need

This checklist covers **every step** needed to get your automation pipeline fully operational.

---

## ✅ PHASE 1: Database & Infrastructure (COMPLETE)

- [x] Database created and running
- [x] All migrations applied (16 tables)
- [x] All indexes created
- [x] All triggers created
- [x] Database connection verified

**Status**: ✅ **COMPLETE**

---

## ✅ PHASE 2: HubSpot CRM Integration (IN PROGRESS)

### 2.1 API Authentication
- [x] Personal Access Key obtained
- [x] API key saved in config
- [x] Connection tested and verified

### 2.2 Custom Properties
- [ ] **RUN**: Create all automation properties
  ```bash
  node -e "const s=require('./src/services/hubspotCompleteSetup');s.createAllProperties().then(r=>console.log('Created:',r.created)).catch(e=>console.error(e));"
  ```

### 2.3 Data Sync
- [x] Test sync completed (1 lead)
- [ ] **RUN**: Sync ALL database data
  ```bash
  DB_HOST=localhost DB_PORT=7543 node scripts/push-to-hubspot-live.js
  ```

**Status**: ⚠️ **NEEDS: Property creation + Full data sync**

---

## ⚠️ PHASE 3: Google OAuth & Drive Setup (REQUIRED)

### 3.1 Google OAuth
- [ ] **VERIFY**: OAuth completed
  ```bash
  curl http://localhost:7101/auth/status
  ```
  Should return: `{ "authenticated": true }`

- [ ] **IF NOT**: Complete OAuth
  - Visit: http://localhost:7101/auth/google
  - Authorize all scopes
  - Verify token stored

### 3.2 Google Drive Folder
- [ ] **VERIFY**: Drive folder configured
  - Folder ID: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`
  - Folder shared with service account
  - Folder permissions allow read access

- [ ] **TEST**: Upload test CSV file
  - Create CSV with: email, first_name, last_name, company, title
  - Upload to Drive folder
  - Wait 30 seconds
  - Check if file detected

**Status**: ⚠️ **REQUIRES: OAuth verification + Test file upload**

---

## ⚠️ PHASE 4: Email Templates & Sequences (REQUIRED)

### 4.1 Email Templates
- [ ] **VERIFY**: Templates exist in database
  ```sql
  SELECT COUNT(*) FROM email_templates;
  ```
  Should have templates for all sets

- [ ] **IF MISSING**: Initialize templates
  ```bash
  node scripts/init-email-templates.js
  ```

### 4.2 Sequence Configuration
- [ ] **VERIFY**: Sequences configured
  ```sql
  SELECT * FROM sequences ORDER BY name;
  ```
  Should have sequences for each lead type

- [ ] **VERIFY**: Sequence steps defined
  ```sql
  SELECT * FROM sequence_steps ORDER BY sequence_id, step_number;
  ```

**Status**: ⚠️ **REQUIRES: Template verification + Sequence setup**

---

## ⚠️ PHASE 5: Email Sending Setup (REQUIRED)

### 5.1 Gmail OAuth
- [ ] **VERIFY**: Gmail OAuth complete
  - Same as Google OAuth (above)
  - Gmail send scope authorized
  - Token has `gmail.send` permission

### 5.2 Anymail API
- [ ] **VERIFY**: Anymail API key valid
  - Key in config: `config/api_keys.js`
  - API quota available
  - Webhooks configured (if using)

### 5.3 Email Configuration
- [ ] **VERIFY**: From address configured
  - `email.fromAddress` in config
  - `email.fromName` in config
  - Reply-to address set

**Status**: ⚠️ **REQUIRES: Gmail OAuth + Anymail verification**

---

## ⚠️ PHASE 6: Pipeline Orchestration (REQUIRED)

### 6.1 Drive Watcher
- [ ] **VERIFY**: Drive polling active
  - Check logs for Drive polling
  - Verify 30-second interval
  - Test file detection

### 6.2 Lead Processing
- [ ] **VERIFY**: Lead classification working
  - Upload test file
  - Verify leads created
  - Verify classification runs
  - Verify HubSpot sync

### 6.3 Sequence Engine
- [ ] **VERIFY**: Sequence initialization
  - Verify sequences created for leads
  - Verify first email queued
  - Verify send timing configured

**Status**: ⚠️ **REQUIRES: End-to-end test with real file**

---

## ⚠️ PHASE 7: Monitoring & Tracking (SETUP NEEDED)

### 7.1 Email Tracking
- [ ] **VERIFY**: Tracking pixels configured
  - Open tracking enabled
  - Click tracking enabled
  - Tracking URLs generated

### 7.2 Webhooks
- [ ] **CONFIGURE**: Bounce webhook
  - Anymail bounce webhook URL
  - Gmail bounce handling
  - Suppression list updates

- [ ] **CONFIGURE**: Reply webhook
  - Gmail reply detection
  - Thread matching
  - Sequence pausing

### 7.3 Analytics
- [ ] **VERIFY**: Metrics collection
  - Dashboard accessible
  - Metrics updating
  - Alerts configured

**Status**: ⚠️ **REQUIRES: Webhook configuration + Testing**

---

## 🚀 QUICK SETUP COMMANDS

### Complete HubSpot Setup
```bash
# Create all properties and sync all data
DB_HOST=localhost DB_PORT=7543 node -e "
const s=require('./src/services/hubspotCompleteSetup');
s.completeSetup().then(r=>{
  console.log('✅ Setup Complete');
  console.log('Properties:',r.properties.created);
  console.log('Leads:',r.leads.synced);
  console.log('API Calls:',r.apiCallsUsed);
});
"
```

### Verify OAuth
```bash
curl http://localhost:7101/auth/status
```

### Test Full Pipeline
```bash
# Upload CSV to Drive, then:
DB_HOST=localhost DB_PORT=7543 node tests/pipeline-step-by-step-test.js
```

### Initialize Templates
```bash
node scripts/init-email-templates.js
```

---

## 📊 Current Database Status

Based on your database:
- **Leads**: 1
- **Drive Ingests**: 0
- **Drive Rows**: 0
- **Lead Sequences**: 0
- **Email Logs**: 0
- **Lead Classifications**: 0

**Next**: Upload a file to Google Drive to start the pipeline!

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Complete HubSpot Setup** (5 minutes)
   ```bash
   # Create properties and sync all data
   DB_HOST=localhost DB_PORT=7543 node -e "const s=require('./src/services/hubspotCompleteSetup');s.completeSetup();"
   ```

2. **Verify Google OAuth** (2 minutes)
   ```bash
   curl http://localhost:7101/auth/status
   # If not authenticated, visit: http://localhost:7101/auth/google
   ```

3. **Upload Test File** (5 minutes)
   - Create CSV: email, first_name, last_name, company, title
   - Upload to Google Drive folder
   - Wait for processing

4. **Verify Pipeline** (5 minutes)
   ```bash
   DB_HOST=localhost DB_PORT=7543 node tests/pipeline-step-by-step-test.js
   ```

**Total Time**: ~15 minutes to full pipeline operation

---

## ✅ What's Already Complete

- ✅ Database schema (all tables)
- ✅ All services built
- ✅ HubSpot API integration
- ✅ Pipeline tracker
- ✅ Monitoring system
- ✅ Test scripts
- ✅ Documentation

---

## ⚠️ What Needs Setup

- ⚠️ HubSpot properties creation
- ⚠️ Full database sync to HubSpot
- ⚠️ Google OAuth verification
- ⚠️ Test file upload
- ⚠️ Email templates initialization
- ⚠️ Webhook configuration

---

*Run the commands above to complete setup!* 🚀
