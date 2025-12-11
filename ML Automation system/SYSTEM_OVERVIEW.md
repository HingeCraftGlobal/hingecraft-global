# HingeCraft ML Automation System - Complete Overview

## 🎯 System Purpose

This is a fully automated end-to-end lead processing and email automation system that:

1. **Monitors Google Drive** for new lead files (CSV/Sheets)
2. **Extracts and normalizes** lead data from files
3. **Deduplicates** leads using fingerprinting
4. **Enriches** leads with missing emails via Anymail API
5. **Syncs to HubSpot** CRM automatically
6. **Sends email sequences** via Anymail/Gmail APIs
7. **Tracks engagement** (opens, clicks, replies, bounces)
8. **Manages sequences** with conditional logic

## 📋 Complete Flow

```
┌─────────────────┐
│  Google Drive   │
│   Folder Scan   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File Processor │
│  (CSV/Sheets)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lead Normalizer │
│  & Validator    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deduplication   │
│  Engine         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email Enrichment│
│  (Anymail API)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HubSpot Sync   │
│  (Create/Update)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sequence Engine │
│  (Initialize)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Email Sender   │
│ (Anymail/Gmail) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Event Tracking  │
│  (Webhooks)     │
└─────────────────┘
```

## 🔧 Components

### 1. Google Drive Service (`src/services/googleDrive.js`)
- Scans folder for new files
- Reads Google Sheets and CSV files
- Handles OAuth authentication
- Sets up webhook monitoring

### 2. Lead Processor (`src/services/leadProcessor.js`)
- Normalizes lead data from various formats
- Validates email addresses
- Computes fingerprints for deduplication
- Enriches leads with missing emails
- Scores leads based on data quality

### 3. Anymail Service (`src/services/anymail.js`)
- Finds email addresses for contacts
- Verifies email deliverability
- Sends emails via Anymail API
- Tracks email status

### 4. HubSpot Service (`src/services/hubspot.js`)
- Creates/updates contacts
- Creates/updates companies
- Associates contacts with companies
- Enrolls contacts in sequences
- Creates engagement records

### 5. Gmail Service (`src/services/gmail.js`)
- Sends personalized emails via Gmail API
- Handles OAuth authentication
- Personalizes email templates
- Monitors for replies

### 6. Sequence Engine (`src/services/sequenceEngine.js`)
- Manages email sequences
- Handles step progression
- Checks conditions (opens, clicks)
- Schedules next actions
- Personalizes email content

### 7. Orchestrator (`src/orchestrator.js`)
- Coordinates entire pipeline
- Processes files from Google Drive
- Manages workflow between services
- Handles errors and retries

### 8. Database (`database/schema.sql`)
- Stores leads, sequences, email logs
- Tracks HubSpot synchronization
- Maintains audit trail
- Manages suppression lists

## 📊 Database Schema

### Core Tables

- **leads** - Canonical lead store with all lead data
- **staging_leads** - Temporary staging before processing
- **import_batches** - Tracks file imports
- **sequences** - Email sequence definitions
- **sequence_steps** - Individual email steps in sequences
- **lead_sequences** - Tracks which leads are in which sequences
- **email_logs** - Complete email sending history
- **hubspot_sync** - HubSpot synchronization tracking
- **message_logs** - Event tracking (opens, clicks, etc.)
- **suppression_list** - Suppressed email addresses
- **audit_log** - System audit trail

## 🔐 API Configuration

All API keys are stored in `config/api_keys.js`:

- **Google OAuth**: Client ID and Secret for Drive/Gmail access
- **HubSpot**: API key for CRM integration
- **Anymail**: API key for email finding and sending
- **Database**: PostgreSQL connection details

## 🚀 Getting Started

### 1. Prerequisites
```bash
- Node.js 16+
- PostgreSQL 12+
- Google Cloud Project
- HubSpot Account
- Anymail API Key
```

### 2. Installation
```bash
cd "ML Automation system"
npm install
```

### 3. Database Setup
```bash
# Create database
createdb hingecraft_automation

# Run setup script
node database/setup.js
```

### 4. Configuration
Edit `config/api_keys.js` with your credentials:
- Google OAuth Client ID & Secret
- HubSpot API Key
- Anymail API Key
- Database connection details

### 5. OAuth Setup
```bash
# Start server
npm start

# Visit in browser
http://localhost:3001/auth/google

# Complete OAuth flow
# System will store refresh tokens
```

### 6. Test Run
```bash
# Process a test file
curl -X POST http://localhost:3001/api/process-file \
  -H "Content-Type: application/json" \
  -d '{"fileId": "your_google_drive_file_id"}'
```

## 📅 Scheduled Jobs

The system runs two scheduled jobs:

1. **Sequence Processing** (Every hour)
   - Processes pending email sends
   - Advances sequences based on timing
   - Checks conditions

2. **Folder Scanning** (Daily at 2 AM)
   - Scans Google Drive folder for new files
   - Processes any new files found

## 🔄 Webhooks

### Google Drive Webhook
- **Endpoint**: `POST /webhook/drive`
- **Purpose**: Receives notifications when files are added/changed
- **Action**: Automatically processes new files

### Anymail Webhook
- **Endpoint**: `POST /webhook/anymail`
- **Purpose**: Receives email events (delivered, opened, clicked, bounced)
- **Action**: Updates email logs and triggers follow-up actions

## 📧 Email Sequences

### Default Sequence Types

1. **Welcome Sequence**
   - Step 1: Welcome email (immediate)
   - Step 2: Mission introduction (24h delay)
   - Step 3: Value proposition (48h delay)
   - Step 4: Call to action (72h delay)
   - Step 5: Final follow-up (120h delay)

### Customizing Sequences

Edit sequences in database:
```sql
-- Update sequence steps
UPDATE sequence_steps 
SET delay_hours = 48, 
    subject_template = 'New Subject',
    body_template = '<p>New Body</p>'
WHERE sequence_id = 'your-sequence-id';
```

## 🎯 Lead Scoring

Leads are scored based on:
- Email present: +30 points
- Name present: +20 points
- Organization present: +15 points
- Title present: +10 points
- Website present: +10 points
- Phone present: +10 points
- Location data: +5 points

**Total**: 0-100 points

- **85+**: Auto-approve, start sequence immediately
- **65-84**: QA review queue
- **<65**: Hold for manual review

## 🔍 Monitoring

### Logs
- **Combined**: `logs/combined.log`
- **Errors**: `logs/error.log`

### Database Queries
```sql
-- Check import status
SELECT * FROM import_batches ORDER BY created_at DESC LIMIT 10;

-- View recent leads
SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;

-- Check email status
SELECT * FROM email_logs WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 10;

-- View active sequences
SELECT * FROM lead_sequences WHERE status = 'active';
```

## 🛠️ Troubleshooting

### Google Drive Access Issues
1. Verify OAuth credentials in `config/api_keys.js`
2. Check scopes include Drive and Sheets access
3. Ensure folder is shared with authorized account

### HubSpot Sync Failures
1. Verify API key is valid
2. Check HubSpot API rate limits
3. Review HubSpot API logs in developer portal

### Email Sending Issues
1. Verify Anymail API key
2. Check email templates are valid HTML
3. Review suppression lists for blocked emails

## 📚 API Reference

See `README.md` for complete API documentation.

## 🔒 Security

- API keys stored in config file (add to `.gitignore`)
- Use environment variables in production
- Implement HMAC verification for webhooks
- Use HTTPS in production
- Rotate API keys regularly

## 📝 License

MIT License

---

**Built for HingeCraft Global** - Complete ML Automation System
