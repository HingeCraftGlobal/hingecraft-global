# HingeCraft Global - Automation Project

**Complete Automation Project Repository**

This repository contains ALL data for the automation project, including the Notion automation system and ML automation pipeline.

---

## 📁 Repository Structure

```
hingecraft-global/
├── notion/                # Notion Automation System
│   ├── sync/              # Notion sync scripts
│   ├── triggers/          # Automation triggers
│   ├── monitoring/        # Monitoring systems
│   ├── webhooks/          # Webhook handlers
│   └── [102 files]        # Complete Notion automation project
│
├── ml-automation/         # ML Automation Pipeline System
│   ├── src/               # Core automation services
│   │   ├── services/      # Automation services
│   │   ├── utils/         # Utility functions
│   │   └── orchestrator.js
│   ├── scripts/           # Automation scripts
│   ├── database/          # Database schemas
│   ├── config/            # Configuration files
│   ├── webhooks/          # Webhook handlers
│   ├── workers/           # Background workers
│   └── [165+ files]       # Complete ML automation system
│
└── database/              # Automation Database
    └── automation/         # Automation-specific database files
        ├── schema.sql
        ├── init-data.sql
        └── setup.js
```

---

## 🚀 Quick Start

### Notion Automation System

Complete 24/7 sync system for HingeCraft → Notion dashboard.

```bash
cd notion
pip install -r requirements.txt
python sync/hingecraft_notion_sync.py
```

See [notion/README.md](notion/README.md) for detailed setup instructions.

### ML Automation Pipeline

Complete end-to-end lead automation pipeline that processes Google Drive files, enriches leads, syncs to HubSpot, and sends automated email sequences.

```bash
cd ml-automation
npm install
npm start
```

See [ml-automation/README.md](ml-automation/README.md) for detailed setup instructions.

---

## 🔧 Automation Components

### 1. Notion Automation System
- **Project Management** → Syncs all HingeCraft data to Notion dashboard
- **Real-time Monitoring** → Cursor activity monitoring
- **Automation Triggers** → Automatic progress tracking
- **Data Synchronization** → Chat history, timeline, and deadline sync
- **10,000 nano tasks** for complete implementation

### 2. ML Automation Pipeline
- **Google Drive** → Scans folder for new files (CSV/Sheets)
- **Lead Processing** → Extracts, normalizes, and deduplicates leads
- **Anymail API** → Finds missing emails and verifies addresses
- **HubSpot CRM** → Creates/updates contacts and companies
- **Email Sequences** → Sends automated email sequences via Anymail/Gmail
- **Tracking** → Monitors opens, clicks, replies, and bounces

---

## 📊 Database

### Automation Database

All automation-related database files are in `database/automation/`:

- `schema.sql` - Database schema
- `init-data.sql` - Initial data
- `migrate-existing-data.sql` - Migration scripts
- `setup.js` - Setup script

### Database Integration

- **Notion**: Database sync scripts in `notion/sync/`
- **ML Automation**: Database utilities in `ml-automation/src/utils/database.js`

---

## 📚 Documentation

- [Notion Automation](notion/README.md) - Complete Notion integration documentation
- [ML Automation](ml-automation/README.md) - Complete ML automation pipeline documentation

---

## 🔑 Configuration

### Notion Automation
- Configuration: `notion/env.example` - Copy to `.env` and configure
- API keys: Configured in environment variables

### ML Automation
- Configuration: `ml-automation/config/api_keys.js`
- API keys: Google OAuth, HubSpot, Anymail

---

## 📊 System Status

**✅ Notion Automation:** Complete
- Project management automation
- Data synchronization
- Task automation triggers
- Database integration
- 10,000 nano tasks ready

**✅ ML Automation Pipeline:** Complete
- Lead processing pipeline
- HubSpot sync
- Email sequences
- Tracking system
- All features implemented

---

## 🧪 Testing

- **Notion**: Test scripts included in `notion/` directory
- **ML Automation**: Test suite in `ml-automation/tests/`

---

## 📦 Project Data

This repository contains **ALL** automation project data:

- ✅ Complete Notion automation system (102 files)
- ✅ Complete ML automation pipeline (165+ files)
- ✅ All database schemas and migrations
- ✅ All configuration files
- ✅ All scripts and utilities
- ✅ All documentation

**No other project data is included** - this repository is dedicated exclusively to the automation project.

---

## 📄 License

Proprietary - HingeCraft Global

---

**Last Updated:** December 15, 2025  
**Version:** 5.0.0  
**Status:** Complete Automation Project ✅
