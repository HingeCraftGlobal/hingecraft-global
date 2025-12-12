# Live Simulation Guide - Complete Automation Flow

**Date**: January 27, 2025  
**Status**: ✅ Simulation Script Ready

---

## 🚀 Quick Start

Run the live simulation to see the complete automation flow from file drop to email sequence:

```bash
cd "ML Automation system"
node scripts/live-simulation.js
```

---

## 📋 What the Simulation Shows

The simulation demonstrates the **complete end-to-end flow** when a file is dropped into the Google Drive folder:

### Step 1: File Detection 📁
- Google Drive webhook triggered
- File metadata retrieved
- File type identified (CSV/Google Sheet)
- Row count detected

### Step 2: File Processing 📄
- File downloaded from Google Drive
- CSV/Sheet parsed
- Lead data extracted

### Step 3: Lead Normalization 🔧
- Data normalized (email, names, phone, etc.)
- Email validation
- Lead scoring (0-100 points)
- Quality assessment

### Step 4: Deduplication 🔍
- Fingerprint computation
- Database check for duplicates
- New leads identified

### Step 5: Email Enrichment 📧
- Missing emails found via Anymail API
- Data enrichment
- Quality improvement

### Step 6: HubSpot CRM Sync 🔗
- Contacts created/updated in HubSpot
- Companies created/updated
- Sync records stored
- Engagement tracking setup

### Step 7: Sequence Initialization 🔄
- Email sequences initialized for qualified leads (score ≥ 65)
- Sequence steps configured
- Next action scheduled

### Step 8: First Email Send 📨
- Welcome emails sent via Anymail
- Personalized content
- Email logged
- HubSpot engagement created

### Step 9: Event Tracking 📊
- Webhook tracking configured
- Opens, clicks, replies tracked
- Bounce handling

### Step 10: Scheduled Automation ⏰
- Sequence processor (runs hourly)
- Folder scanner (runs daily at 2 AM)
- Ongoing automation activated

---

## 📊 Sample Output

The simulation processes 3 sample leads:

1. **John Doe** (john.doe@example.com)
   - Organization: Tech Corp
   - Score: 100/100
   - Status: ✅ Sequence Active
   - HubSpot ID: contact_xxx

2. **Jane Smith** (jane.smith@startup.io)
   - Organization: Startup Inc
   - Score: 100/100
   - Status: ✅ Sequence Active
   - HubSpot ID: contact_xxx

3. **Bob Wilson** (bob.wilson@enterprise.com)
   - Organization: Enterprise Solutions
   - Score: 100/100
   - Status: ✅ Sequence Active
   - HubSpot ID: contact_xxx

---

## 🔄 Real-World Flow

When you actually drop a file in Google Drive:

1. **Webhook triggers** → `POST /webhook/drive`
2. **Orchestrator processes** → `orchestrator.processDriveFile()`
3. **File read** → Google Drive API
4. **Leads processed** → Lead processor service
5. **HubSpot sync** → HubSpot API
6. **Sequences start** → Sequence engine
7. **Emails sent** → Anymail/Gmail API
8. **Events tracked** → Webhook handlers

---

## 🎯 Key Features Demonstrated

✅ **Automatic File Detection** - Webhook-based  
✅ **Intelligent Lead Processing** - Normalization & validation  
✅ **Smart Deduplication** - Fingerprint-based  
✅ **CRM Integration** - HubSpot sync  
✅ **Email Automation** - Multi-step sequences  
✅ **Personalization** - Dynamic content  
✅ **Event Tracking** - Opens, clicks, replies  
✅ **Scheduled Jobs** - Ongoing automation  

---

## 📝 Customization

To simulate with your own data, edit `scripts/live-simulation.js`:

```javascript
const sampleFileData = {
  id: 'your_file_id',
  name: 'your_file.csv',
  rows: [
    {
      rowNumber: 2,
      data: {
        'Email': 'your@email.com',
        'First Name': 'Your',
        'Last Name': 'Name',
        // ... more fields
      }
    }
  ]
};
```

---

## 🚀 Next Steps

1. **Install PostgreSQL** (if not already installed)
2. **Set up database** using `database/schema.sql`
3. **Start the server**: `npm start`
4. **Complete OAuth**: Visit `http://localhost:3001/auth/google`
5. **Drop a real file** in Google Drive folder
6. **Watch it process** automatically!

---

## 📞 API Endpoints

Once the server is running:

- **Health Check**: `GET http://localhost:3001/health`
- **Process File**: `POST http://localhost:3001/api/process-file`
- **Scan Folder**: `POST http://localhost:3001/api/scan-folder`
- **OAuth Setup**: `GET http://localhost:3001/auth/google`

---

**Status**: ✅ **Simulation Ready**  
**Run**: `node scripts/live-simulation.js`




