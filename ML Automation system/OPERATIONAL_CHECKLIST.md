# ✅ Complete Operational Checklist

**Date**: January 27, 2025  
**Purpose**: Ensure all Google Cloud Platform scopes, APIs, and authentication are properly configured

---

## 🔐 1. GOOGLE OAUTH SCOPES (Required)

### Current Status: ⚠️ **NEEDS VERIFICATION**

### Required Scopes:

#### 🔵 Gmail Scopes
- [ ] `https://www.googleapis.com/auth/gmail.send` - Send email
- [ ] `https://www.googleapis.com/auth/gmail.modify` - Modify threads, replies, opens
- [ ] `https://www.googleapis.com/auth/gmail.metadata` - Read inbox metadata for lead-status logic

#### 🟢 Google Sheets Scopes
- [ ] `https://www.googleapis.com/auth/spreadsheets` - Full read/write to Sheets

#### 🟡 Google Drive Scopes
- [ ] `https://www.googleapis.com/auth/drive.file` - Create & manage automation files
- [ ] `https://www.googleapis.com/auth/drive.readonly` - Read uploaded CSV/XLSX files
- [ ] `https://www.googleapis.com/auth/drive.metadata.readonly` - View folder structure

---

## 🔑 2. OAUTH AUTHENTICATION TYPES

### Required Authentication Methods:

- [ ] **OAuth Web App Client ID** - For Gmail sending/modification
- [ ] **Service Account JSON** - For Sheets ingestion, Drive watcher
- [ ] **Refresh Token** - For Gmail delegated access (Anymail sequences)

### Current Configuration:
- ✅ Client ID: `590501748738-2pboatbfqmapuq2raaeg4qnd8fq8bbej.apps.googleusercontent.com`
- ⚠️ Client Secret: Configured
- ⚠️ Refresh Token: **NEEDS OAUTH COMPLETION**
- ⚠️ Service Account: **NEEDS VERIFICATION**

---

## 🔌 3. GOOGLE CLOUD PLATFORM APIs

### Required APIs (Must be Enabled):

- [ ] **Gmail API** - For sending emails and thread management
- [ ] **Google Sheets API** - For lead import and enrichment
- [ ] **Google Drive API** - For file uploads and automation triggers
- [ ] **People API** - Required by Gmail senders for profile validation
- [ ] **Cloud Resource Manager API** - Backend OAuth requirement

### Verification:
```bash
# Check if APIs are enabled (requires gcloud CLI)
gcloud services list --enabled
```

---

## 📧 4. GMAIL CONFIGURATION

### Email Sending Setup:

- [ ] **2-Step Verification Enabled** - Required for App Passwords
- [ ] **App Password Generated** - If using SMTP (not Gmail API)
- [ ] **OAuth 2.0 Configured** - For Gmail API access
- [ ] **Daily Sending Limits** - Personal Gmail: ~500/day
- [ ] **Unsubscribe Links** - Required in all emails

### Current Status:
- ⚠️ OAuth: **PENDING AUTHORIZATION**
- ⚠️ App Password: **NOT CONFIGURED** (if needed)
- ⚠️ Sending Limits: **MUST BE MONITORED**

---

## 📊 5. SYSTEM COMPONENTS

### Core Services:

- [x] **Google Drive Service** - Initialized
- [x] **Gmail Service** - Initialized
- [x] **OAuth Manager** - Initialized
- [x] **File Processor** - Ready (11+ file types)
- [x] **System Watcher** - Active
- [x] **Pipeline Orchestrator** - Ready
- [x] **Database** - Connected (11 tables)

### File Detection:

- [x] **Polling Mechanism** - Active (every 30 seconds)
- [x] **Webhook Endpoint** - Configured (`/webhook/drive`)
- [x] **Manual Trigger** - Available (`/api/trigger-poll`)
- [x] **Dashboard** - Live (http://localhost:7080)

---

## 🗄️ 6. DATABASE STATUS

### Tables Initialized:

- [x] `leads` - Main lead store
- [x] `staging_leads` - Temporary staging
- [x] `import_batches` - Import tracking
- [x] `sequences` - Email sequences
- [x] `sequence_steps` - Sequence steps
- [x] `lead_sequences` - Lead enrollment
- [x] `email_logs` - Email history
- [x] `hubspot_sync` - HubSpot sync
- [x] `message_logs` - Event tracking
- [x] `suppression_list` - Suppressed emails
- [x] `audit_log` - Audit trail

---

## 🐳 7. DOCKER CONTAINERS

### Running Services:

- [x] **hingecraft-automation** - Port 7101 (HEALTHY)
- [x] **hingecraft-postgres** - Port 7543 (HEALTHY)
- [x] **hingecraft-redis** - Port 7638 (HEALTHY)
- [x] **hingecraft-dashboard** - Port 7080 (ACTIVE)

---

## 🔍 8. VERIFICATION STEPS

### Step 1: Verify OAuth Scopes
```bash
curl http://localhost:7101/auth/google | jq .authUrl
# Check the URL contains all required scopes
```

### Step 2: Check OAuth Status
```bash
curl http://localhost:7101/auth/status
# Should return: {"authorized": true, "hasRefreshToken": true}
```

### Step 3: Test Google Drive Access
```bash
curl -X POST http://localhost:7101/api/trigger-poll
# Should successfully scan folder (no auth errors)
```

### Step 4: Verify APIs Enabled
- Visit: https://console.cloud.google.com/apis/library
- Check each required API is enabled

### Step 5: Test File Detection
1. Drop a test file in Google Drive folder
2. Wait 30 seconds (or trigger manually)
3. Check dashboard: http://localhost:7080
4. Verify pipeline starts

---

## ⚠️ 9. CRITICAL ITEMS TO COMPLETE

### High Priority:

1. **🔴 Complete OAuth Authorization**
   - Visit: http://localhost:7101/auth/google
   - Authorize all scopes
   - Verify tokens saved

2. **🔴 Verify All Scopes in Code**
   - Check `config/api_keys.js`
   - Ensure all 7 scopes included
   - Update if missing

3. **🔴 Enable All Required APIs**
   - Gmail API
   - Sheets API
   - Drive API
   - People API
   - Cloud Resource Manager API

4. **🟡 Configure Service Account** (if needed)
   - Generate Service Account JSON
   - Add to project
   - Configure for Sheets/Drive

5. **🟡 Set Up Gmail App Password** (if using SMTP)
   - Enable 2-Step Verification
   - Generate App Password
   - Configure in system

---

## 📋 10. QUICK VERIFICATION COMMANDS

```bash
# Check OAuth status
curl http://localhost:7101/auth/status

# Check system health
curl http://localhost:7101/health

# Check pipeline status
curl http://localhost:7101/api/pipeline/status

# Trigger manual poll
curl -X POST http://localhost:7101/api/trigger-poll

# Check container status
cd "ML Automation system" && docker-compose ps
```

---

## ✅ COMPLETION CRITERIA

System is fully operational when:

- [x] All Docker containers running
- [x] Database initialized (11 tables)
- [x] System watcher active
- [x] Polling mechanism active
- [x] Dashboard accessible
- [ ] **OAuth authorized** (with all scopes)
- [ ] **All APIs enabled** in Google Cloud
- [ ] **File detection working** (test successful)
- [ ] **Email sending configured** (Gmail API or SMTP)
- [ ] **HubSpot integration** ready

---

**Next Steps**: Complete OAuth authorization and verify all scopes/APIs are enabled!
