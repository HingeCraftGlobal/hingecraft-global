# ML Automation System - Complete Directory Structure

## 📁 Full File Tree

```
ML Automation system/
│
├── 📄 Configuration Files
│   ├── .gitignore                    # Git ignore rules
│   ├── package.json                  # Node.js dependencies
│   └── config/
│       └── api_keys.js               # All API credentials (Google, HubSpot, Anymail)
│
├── 🗄️ Database
│   └── database/
│       ├── schema.sql                # Complete PostgreSQL schema (11 tables)
│       └── setup.js                  # Database setup script
│
├── 💻 Source Code
│   └── src/
│       ├── index.js                  # Express.js server (main entry point)
│       ├── orchestrator.js           # Pipeline coordinator
│       │
│       ├── services/                 # Core Services
│       │   ├── googleDrive.js        # Google Drive integration
│       │   ├── anymail.js           # Anymail API service
│       │   ├── hubspot.js           # HubSpot CRM integration
│       │   ├── gmail.js             # Gmail API service
│       │   ├── leadProcessor.js     # Lead processing engine
│       │   └── sequenceEngine.js    # Email sequence engine
│       │
│       ├── utils/                    # Utilities
│       │   ├── database.js          # Database connection & queries
│       │   ├── logger.js            # Winston logging
│       │   ├── emailTemplates.js    # Email template library
│       │   └── validators.js        # Input validation
│       │
│       └── monitoring/              # Monitoring
│           └── healthCheck.js      # Health check service
│
├── 📜 Scripts
│   └── scripts/
│       ├── quick-start.sh           # Quick setup script
│       └── deploy.sh                # Production deployment script
│
├── 📚 Examples
│   └── examples/
│       ├── test-file.csv            # Sample CSV file
│       └── example-usage.js         # Usage examples
│
├── 📝 Documentation
│   ├── README.md                    # Main documentation
│   ├── SYSTEM_OVERVIEW.md           # Architecture overview
│   ├── QUICK_START.md               # Quick start guide
│   ├── TASK_BREAKDOWN.md            # 1000 nano tasks
│   ├── IMPLEMENTATION_COMPLETE.md   # Build status
│   ├── COMPLETE_SYSTEM_SUMMARY.md   # Complete summary
│   └── DIRECTORY_STRUCTURE.md       # This file
│
└── 📊 Logs (created at runtime)
    └── logs/
        ├── combined.log             # All logs
        └── error.log                # Error logs only
```

## 📊 File Count Summary

- **Configuration**: 3 files
- **Database**: 2 files
- **Source Code**: 13 files
  - Services: 6 files
  - Utilities: 4 files
  - Monitoring: 1 file
  - Main: 2 files
- **Scripts**: 2 files
- **Examples**: 2 files
- **Documentation**: 7 files

**Total**: ~30 files (excluding logs)

## 🔑 Key Files

### Entry Point
- `src/index.js` - Express server, starts the application

### Core Services
- `src/services/googleDrive.js` - Google Drive file operations
- `src/services/leadProcessor.js` - Lead processing logic
- `src/services/hubspot.js` - HubSpot CRM integration
- `src/services/anymail.js` - Anymail email service
- `src/services/gmail.js` - Gmail email service
- `src/services/sequenceEngine.js` - Email sequence automation

### Configuration
- `config/api_keys.js` - All API keys and credentials
- `package.json` - Dependencies and scripts

### Database
- `database/schema.sql` - Complete database schema
- `database/setup.js` - Database initialization

### Documentation
- `README.md` - Setup and usage guide
- `SYSTEM_OVERVIEW.md` - Complete system architecture
- `QUICK_START.md` - 5-minute setup guide

## 🚀 Getting Started

1. **Install**: `npm install`
2. **Setup DB**: `node database/setup.js`
3. **Start**: `npm start`
4. **Authorize**: Visit `/auth/google`

## 📦 Dependencies

See `package.json` for complete list. Key dependencies:
- express - Web server
- googleapis - Google APIs
- axios - HTTP client
- pg - PostgreSQL client
- winston - Logging
- cron - Scheduled jobs

## 🔐 Security Notes

- API keys in `config/api_keys.js` (add to `.gitignore` in production)
- Use environment variables for sensitive data
- Implement webhook signature verification
- Use HTTPS in production

---

**System Location**: `hingecraft-global/ML Automation system/`  
**Status**: ✅ Complete and Operational
