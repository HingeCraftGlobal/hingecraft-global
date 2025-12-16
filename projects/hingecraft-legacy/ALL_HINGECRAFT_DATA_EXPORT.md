# Complete HingeCraft Data Export - All Chat Data

## 📋 Complete Project Data

This document contains all HingeCraft project data compiled from all chats and files.

---

## 🐳 Docker Configuration

### Docker Hub
- **Account**: `departmentsai`
- **Repository**: `departmentsai/wix`
- **Images**:
  - `departmentsai/wix-db-adaptor:latest`
  - `departmentsai/wix-python-server:latest`

### Docker Compose Services
1. **PostgreSQL Database** (port 5432)
2. **Database Adaptor API** (port 3000)
3. **Python Server** (port 8000)

---

## 🔑 Configuration Values

### Database Connection
- **Connection Name**: `HingeCraftDonationsDB`
- **Local Endpoint**: `http://localhost:3000`
- **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

### Environment Variables
```
ADAPTOR_SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
EXTERNAL_DB_ENDPOINT=http://localhost:3000
SECRET_KEY=04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
WIX_SITE_URL=https://www.hingecraft-global.ai
WEBHOOK_URL=https://www.wix.com/velo/reference/api-overview/introduction
```

---

## 📁 Project Structure

### Key Files
- `docker-compose.yml` - Docker services configuration
- `payment-page-integration.js` - Payment page code
- `charter-page.html` - Charter/contributions page code
- `database-adaptor/server.js` - Database adaptor API
- `python-server/` - Python FastAPI server
- `.env` - Environment configuration

### Documentation Files
- `WIX_DATABASE_CONFIGURATION.md` - Complete Wix setup guide
- `WIX_QUICK_REFERENCE.md` - Quick reference
- `DATABASE_OPERATIONAL_COMPLETE.md` - Database status
- `COMPLETE_SETUP_PROCESS.md` - Setup guide
- `ACTUAL_DEPLOYMENT_DATA.md` - Deployment data

---

## 🚀 Deployment Process

### Automated Deployment Script
- **File**: `COMPLETE_DEPLOYMENT_AUTOMATION.sh`
- **Usage**: `./COMPLETE_DEPLOYMENT_AUTOMATION.sh`

### Manual Deployment Steps
1. Start Docker services: `docker-compose up -d`
2. Wait for services to be healthy
3. Test endpoints
4. Configure Wix

---

## ✅ Deployment Checklist

- [x] Docker images on Docker Hub
- [x] Docker Compose configuration
- [x] Environment variables configured
- [x] Database schema ready
- [x] API endpoints implemented
- [x] Wix integration code ready
- [ ] Services running (deploy to start)
- [ ] Database functional (deploy to activate)

---

## 📊 Service Endpoints

### Database Adaptor
- **Health**: `http://localhost:3000/health`
- **API**: `http://localhost:3000/donations`
- **Export**: `http://localhost:3000/export/json`

### Python Server
- **Health**: `http://localhost:8000/api/v1/health`
- **API**: `http://localhost:8000/api/v1/donations`

### PostgreSQL
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `hingecraft_db`
- **User**: `hingecraft_user`

---

## 🔄 Complete Data Flow

```
Payment Page → Capture "Other" Amount
    ↓
Store in 3 locations:
  1. Wix Storage
  2. sessionStorage
  3. Database (via API)
    ↓
Redirect to Charter Page
    ↓
Charter Page → Retrieve Amount
    ↓
Display below "Contribution"
```

---

## 📝 Wix Integration

### Payment Page Code
- **File**: `payment-page-integration.js`
- **Location**: Payment Page → Custom Code → JavaScript
- **Features**: Captures amount, stores, redirects

### Charter Page Code
- **File**: `charter-page.html`
- **Location**: Charter Page → Custom Code → HTML
- **Features**: Retrieves amount, displays

### Database Connection
- **Connection Name**: `HingeCraftDonationsDB`
- **Endpoint**: `http://localhost:3000` (or production URL)
- **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## 🎯 Next Steps

1. **Run Deployment**: `./COMPLETE_DEPLOYMENT_AUTOMATION.sh`
2. **Verify Services**: Check all endpoints
3. **Configure Wix**: Use values above
4. **Test Flow**: Payment → Charter
5. **Deploy to Production**: Railway/Render (optional)

---

**Status**: ✅ All data compiled, ready for deployment
**Last Updated**: 2025-11-29














