# 🚀 Quick Start Guide - ML Automation System

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd "ML Automation system"
npm install
```

### Step 2: Setup Database
```bash
# Create database
createdb hingecraft_automation

# Run setup
node database/setup.js
```

### Step 3: Start Server
```bash
npm start
```

### Step 4: Authorize Google Drive
1. Visit: `http://localhost:3001/auth/google`
2. Complete OAuth flow
3. Grant permissions for Drive and Gmail

### Step 5: Test the System
```bash
# Process a file from Google Drive
curl -X POST http://localhost:3001/api/process-file \
  -H "Content-Type: application/json" \
  -d '{"fileId": "your_google_drive_file_id"}'
```

## 📁 File Structure

```
ML Automation system/
├── config/
│   └── api_keys.js          # All API credentials
├── database/
│   ├── schema.sql           # Database schema
│   └── setup.js             # Setup script
├── src/
│   ├── services/
│   │   ├── googleDrive.js   # Google Drive integration
│   │   ├── anymail.js       # Anymail API
│   │   ├── hubspot.js       # HubSpot CRM
│   │   ├── gmail.js         # Gmail API
│   │   ├── leadProcessor.js # Lead processing
│   │   └── sequenceEngine.js # Email sequences
│   ├── utils/
│   │   ├── database.js      # Database utilities
│   │   └── logger.js        # Logging
│   ├── orchestrator.js      # Main coordinator
│   └── index.js             # Express server
├── webhooks/                # Webhook handlers
├── logs/                    # Application logs
├── package.json             # Dependencies
├── README.md                # Full documentation
└── SYSTEM_OVERVIEW.md       # Complete overview
```

## 🔑 API Keys Configured

All keys are in `config/api_keys.js`:

- ✅ **Google OAuth**: Client ID and Secret
- ✅ **Gmail OAuth**: Client ID for personal email
- ✅ **HubSpot**: API key configured
- ✅ **Anymail**: API key configured
- ✅ **Google Drive Folder**: `1MpKKqjpabi10iDh1vWliaiLQsj8wktiz`

## 🔄 How It Works

1. **File Added to Google Drive** → Webhook triggers
2. **File Processed** → Leads extracted and normalized
3. **Deduplication** → Checks for existing leads
4. **Enrichment** → Finds missing emails via Anymail
5. **HubSpot Sync** → Creates/updates contacts
6. **Sequence Started** → Email sequence initialized
7. **Emails Sent** → Via Anymail or Gmail
8. **Events Tracked** → Opens, clicks, replies logged

## 📊 Monitor Progress

### Check Logs
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

### Check Database
```sql
-- Recent imports
SELECT * FROM import_batches ORDER BY created_at DESC LIMIT 10;

-- Recent leads
SELECT email, first_name, organization, created_at 
FROM leads 
ORDER BY created_at DESC LIMIT 10;

-- Email status
SELECT to_email, subject, status, sent_at 
FROM email_logs 
ORDER BY sent_at DESC LIMIT 10;
```

## 🎯 Next Steps

1. **Add Files to Google Drive Folder**
   - Upload CSV or Google Sheet to monitored folder
   - System will automatically process

2. **Customize Sequences**
   - Edit sequences in database
   - Adjust timing and templates

3. **Monitor Performance**
   - Check logs regularly
   - Review HubSpot sync status
   - Monitor email delivery rates

## 🆘 Troubleshooting

### Google Drive Not Working
- Verify OAuth completed
- Check folder permissions
- Review Google API quotas

### HubSpot Sync Failing
- Verify API key
- Check rate limits
- Review HubSpot logs

### Emails Not Sending
- Check Anymail API key
- Verify email templates
- Review suppression lists

## 📚 Full Documentation

- **README.md** - Complete setup guide
- **SYSTEM_OVERVIEW.md** - Architecture details
- **IMPLEMENTATION_COMPLETE.md** - Build status

---

**Ready to automate! 🚀**
