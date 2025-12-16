# HingeCraft ML Automation System

Complete end-to-end lead automation pipeline that processes Google Drive files, enriches leads, syncs to HubSpot, and sends automated email sequences.

## System Overview

This system automates the entire lead processing pipeline:

1. **Google Drive** → Scans folder for new files (CSV/Sheets)
2. **Lead Processing** → Extracts, normalizes, and deduplicates leads
3. **Anymail API** → Finds missing emails and verifies addresses
4. **HubSpot CRM** → Creates/updates contacts and companies
5. **Email Sequences** → Sends automated email sequences via Anymail/Gmail
6. **Tracking** → Monitors opens, clicks, replies, and bounces

## Architecture

```
Google Drive Folder
    ↓
File Scanner (Webhook/Cron)
    ↓
Lead Processor (Normalize, Dedupe, Enrich)
    ↓
HubSpot Sync (Create/Update Contacts)
    ↓
Sequence Engine (Initialize Sequences)
    ↓
Email Sender (Anymail/Gmail)
    ↓
Webhook Handlers (Track Events)
    ↓
Database (PostgreSQL)
```

## Setup Instructions

### 1. Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- Redis (optional, for queue)
- Google Cloud Project with OAuth credentials
- HubSpot account with API access
- Anymail API key

### 2. Database Setup

```bash
# Create database
createdb hingecraft_automation

# Run schema
psql -d hingecraft_automation -f database/schema.sql
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configuration

All API keys are configured in `config/api_keys.js`. Update with your credentials:

- Google OAuth Client ID & Secret
- HubSpot API Key
- Anymail API Key
- Database connection details

### 5. OAuth Setup

1. Visit `/auth/google` to get authorization URL
2. Complete OAuth flow
3. System will store refresh tokens

### 6. Start Server

```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Process File
```
POST /api/process-file
Body: { "fileId": "google_drive_file_id" }
```

### Scan Folder
```
POST /api/scan-folder
Body: { "folderId": "optional_folder_id" }
```

### Process Sequences
```
POST /api/process-sequences
```

### Webhooks

- `POST /webhook/drive` - Google Drive file changes
- `POST /webhook/anymail` - Anymail email events

## Scheduled Jobs

- **Sequence Processing**: Every hour (processes pending email sends)
- **Folder Scanning**: Daily at 2 AM (scans for new files)

## Database Schema

Key tables:
- `leads` - Canonical lead store
- `staging_leads` - Temporary staging
- `import_batches` - Import tracking
- `sequences` - Email sequence definitions
- `lead_sequences` - Lead enrollment tracking
- `email_logs` - Email sending history
- `hubspot_sync` - HubSpot synchronization

## File Format

Google Drive files should have columns:
- Email (required)
- First Name / Last Name
- Organization / Company
- Title / Job Title
- Phone
- Website
- City / State / Country

## Sequence Configuration

Default sequences are created automatically. Customize in database:
- `sequences` table - Sequence definitions
- `sequence_steps` table - Individual email steps

## Monitoring

- Logs: `logs/combined.log` and `logs/error.log`
- Database audit trail: `audit_log` table
- Email tracking: `email_logs` table

## Security Notes

- API keys stored in `config/api_keys.js` (add to `.gitignore` in production)
- Use environment variables for production
- Implement HMAC verification for webhooks
- Use HTTPS in production

## Troubleshooting

### Google Drive Access Issues
- Verify OAuth credentials
- Check scopes are correct
- Ensure folder is shared with service account

### HubSpot Sync Failures
- Verify API key is valid
- Check rate limits
- Review HubSpot API logs

### Email Sending Issues
- Verify Anymail API key
- Check email templates
- Review suppression lists

## License

MIT
