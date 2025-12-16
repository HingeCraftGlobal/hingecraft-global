# HingeCraft Master Index

## Quick Reference

### Repository
- **GitHub**: `https://github.com/departments-commits/hingecraft-global.git`
- **Clone**: `gh repo clone departments-commits/hingecraft-global`
- **Git SSH**: `git clone git@github.com:departments-commits/hingecraft-global.git`

### Setup Commands
```bash
npm install -g @wix/cli
gh repo clone departments-commits/hingecraft-global
cd hingecraft-global
npm install
wix dev
```

### Docker Setup (Offline/Serverless)
```bash
# Configure environment
cp .env.example .env
# Edit .env with secure credentials

# Start Docker services
docker-compose up -d

# Verify
curl http://localhost:3000/health
```

### Database Connection
- **Connection Name**: `HingeCraftDonationsDB`
- **Type**: Custom External Database Adaptor
- **Endpoint URL**: 
  - Local: `http://localhost:3000` (Docker)
  - Production: `https://your-deployed-api-url.com`
- **Secret Key**: From `.env` file (`ADAPTOR_SECRET_KEY`)

## File Index

### Core Implementation Files
1. **`charter-page.html`** - Main charter page with donation amount display
2. **`payment-page-integration.js`** - Payment page integration (captures donation amount)
3. **`velo-backend-api.js`** - Backend API for database operations (deploy as `backend/hingecraft-api.jsw`)

### Docker & Database Files
4. **`docker-compose.yml`** - Docker services configuration (PostgreSQL + API)
5. **`database/init.sql`** - Database schema (auto-runs in Docker)
6. **`database-schema.sql`** - SQL schema for external database
7. **`database-adaptor/`** - Database adaptor API (Express.js)
   - `server.js` - Express API server
   - `package.json` - Node.js dependencies
   - `Dockerfile` - Docker image definition
   - `README.md` - API documentation

### Configuration Files
8. **`.env.example`** - Environment variables template
9. **`package.json`** - NPM package configuration
10. **`.wixignore`** - Wix ignore patterns
11. **`.dockerignore`** - Docker ignore patterns

### Setup & Documentation
12. **`DOCKER_SETUP.md`** - Complete Docker setup guide (offline/serverless)
13. **`DATABASE_CONNECTION_SETUP.md`** - Wix database connection setup
14. **`COMPLETE_DATABASE_SETUP.md`** - Complete database setup guide
15. **`DATABASE_CONFIG.md`** - Database configuration guide
16. **`EXTERNAL_DB_SETUP.md`** - External database adaptor setup
17. **`WIX_SETUP.md`** - Wix CLI and repository setup
18. **`PROJECT_SETUP.md`** - Complete project setup guide
19. **`COMPLETE_PROJECT_DATA.md`** - All project data and configuration
20. **`README.md`** - Main documentation
21. **`COMPLETE_FILE_SET.md`** - Complete file reference
22. **`QUICK_START.md`** - Quick start guide
23. **`quick-reference.md`** - Quick reference guide

### Additional Documentation
24. **`IMPLEMENTATION_SUMMARY.md`** - Implementation summary
25. **`implementation-checklist.md`** - Implementation checklist
26. **`SYSTEM_OVERVIEW.md`** - System architecture overview

## Key Information

### Payment Flow
```
Payment Page → User enters "Other" amount → Submits → 
Amount stored (Docker DB) → Redirects to Charter → Displays amount
```

### Database Requirements
- **Type**: PostgreSQL (via Docker)
- **Table**: `donations`
- **Fields**: id, amount, currency, is_other_amount, source, payment_status, etc.
- **Schema**: See `database-schema.sql` or `database/init.sql`

### Docker Services
1. **PostgreSQL**: Port 5432, Database: `hingecraft_db`
2. **Database Adaptor API**: Port 3000, Endpoints: `/donations/*`

### API Endpoints Required
1. GET `/donations/latest` - Get latest donation
2. POST `/donations` - Create new donation
3. GET `/donations?limit={limit}` - Get all donations
4. GET `/donations/{id}` - Get donation by ID
5. PATCH `/donations/{id}` - Update donation
6. GET `/health` - Health check (no auth)

### Configuration Points
- Update `velo-backend-api.js` with endpoint URL and secret key
- Or use Wix Secrets Manager for secure storage
- Set `USE_EXTERNAL_DB = true` for external database
- Configure `.env` file for Docker services

## Quick Links

- **Docker Setup**: See `DOCKER_SETUP.md` ⭐ (Start here for offline/serverless)
- **Database Connection**: See `DATABASE_CONNECTION_SETUP.md`
- **Complete Setup**: See `COMPLETE_DATABASE_SETUP.md`
- **Wix Setup**: See `WIX_SETUP.md`
- **Project Setup**: See `PROJECT_SETUP.md`
- **Quick Start**: See `QUICK_START.md`

## All Data Saved

✅ Repository information  
✅ Setup commands  
✅ Docker configuration (offline/serverless)  
✅ Database connection configuration  
✅ SQL schema  
✅ Database adaptor API  
✅ API requirements  
✅ Project structure  
✅ Implementation files  
✅ Documentation files  

Everything is ready for deployment!

## Next Steps

1. ✅ Clone repository
2. ✅ Set up Docker (see `DOCKER_SETUP.md`)
3. ✅ Configure `.env` file
4. ✅ Start Docker services
5. ✅ Configure Wix database connection
6. ✅ Update Wix backend code
7. ✅ Test donation flow
8. ⬜ Deploy to production (if needed)
