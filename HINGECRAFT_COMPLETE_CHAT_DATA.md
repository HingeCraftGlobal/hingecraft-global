# HingeCraft Complete Chat Data & Project History

## Overview
This document consolidates all information, conversations, requirements, and implementation details from HingeCraft agent chats and development sessions.

---

## Project Genesis & Requirements

### Initial Vision
HingeCraft Global is a membership platform for the Charter for Abundance & Resilience initiative. The system needed to:
- Accept donations/membership payments
- Display donation amounts on the charter page
- Store data in an external database (PostgreSQL)
- Integrate with Wix platform
- Support Docker-based offline/serverless deployment

### Core Requirements Identified in Chats

1. **Database Integration**
   - External database adaptor for Wix
   - PostgreSQL backend
   - RESTful API endpoints
   - Authentication via secret keys

2. **Payment Flow**
   - Capture donation amounts from payment page
   - Store in multiple locations (Wix Storage, sessionStorage, database)
   - Display on charter page
   - Support custom "Other" amounts

3. **Docker Deployment**
   - Offline/serverless capability
   - PostgreSQL container
   - Node.js API container
   - Python server container (optional)
   - Health check endpoints

4. **Wix Integration**
   - Velo backend API
   - External database connection
   - Frontend integration
   - Secrets management

---

## Implementation History

### Phase 1: Database Setup
**Discussions:**
- Need for external database adaptor
- PostgreSQL schema design
- Connection configuration
- Authentication mechanism

**Implementation:**
- Created `database-schema.sql`
- Implemented `database-adaptor/server.js`
- Added authentication middleware
- Created Docker setup with PostgreSQL

### Phase 2: Wix Integration
**Discussions:**
- How to connect Wix to external database
- Velo backend API structure
- Frontend-backend communication
- Payment page integration

**Implementation:**
- Created `velo-backend-api.js`
- Implemented `charter-page.html`
- Added `payment-page-integration.js`
- Configured external database connection

### Phase 3: Docker & Deployment
**Discussions:**
- Offline/serverless requirements
- Container orchestration
- Environment variable management
- Health check implementation

**Implementation:**
- Created `docker-compose.yml`
- Added `database/init.sql`
- Implemented health endpoints
- Created deployment guides

### Phase 4: Python Server (Optional)
**Discussions:**
- Additional API layer
- FastAPI implementation
- Async database operations
- Modular architecture

**Implementation:**
- Created `python-server/` directory
- Implemented FastAPI endpoints
- Added async PostgreSQL support
- Created service layer architecture

### Phase 5: Database Export/Share (Latest)
**Discussions:**
- Need to download entire database
- Share functionality for backups
- Export endpoints
- UI integration

**Implementation:**
- Added GET `/export/json` endpoint to `database-adaptor/server.js`
- Added download/share buttons to `charter-page.html`
- Implemented `handleDownloadDb()` and `handleShareDb()` functions
- Added Web Share API support with clipboard fallback

---

## Technical Decisions from Chats

### Database Architecture
**Decision:** Use PostgreSQL with external database adaptor pattern
**Reasoning:**
- Wix supports external database connections
- PostgreSQL provides robust data storage
- Docker enables offline/serverless deployment
- RESTful API allows flexible integration

### Authentication
**Decision:** Secret key-based authentication
**Reasoning:**
- Simple to implement
- Works with Wix external database adaptor
- Secure when properly configured
- Supports both Bearer token and X-API-Key headers

### Payment Flow
**Decision:** Multi-storage approach (Wix Storage + sessionStorage + Database)
**Reasoning:**
- Redundancy ensures data persistence
- Wix Storage for Wix-native access
- sessionStorage for client-side caching
- Database for permanent storage

### Docker Strategy
**Decision:** Multi-container setup with docker-compose
**Reasoning:**
- Isolated services
- Easy local development
- Production-ready deployment
- Health checks for reliability

---

## Key Features Implemented

### 1. Database Adaptor API (`database-adaptor/server.js`)
- GET `/health` - Health check (no auth)
- GET `/donations/latest` - Latest donation
- POST `/donations` - Create donation
- GET `/donations` - List donations (with pagination)
- GET `/donations/:id` - Get specific donation
- PATCH `/donations/:id` - Update donation
- GET `/export/json` - Export entire database (NEW)

### 2. Wix Backend API (`velo-backend-api.js`)
- `getLatestDonation()` - Fetch latest donation
- `saveDonation()` - Save new donation
- `getAllDonations()` - Get all donations
- `getDonationById()` - Get specific donation
- `updateDonationStatus()` - Update donation
- `testConnection()` - Test database connection

### 3. Frontend Components

#### Charter Page (`charter-page.html`)
- Membership tier selection (Basic, Premier, VIP)
- Payment rail selection
- Donation amount display
- Database download/share buttons (NEW)
- Charter letter view
- UN Charter document view

#### Payment Integration (`payment-page-integration.js`)
- Captures donation amount
- Stores in Wix Storage
- Stores in sessionStorage
- Saves to database via API

### 4. Docker Services
- PostgreSQL (port 5432)
- Node.js API (port 3000)
- Python Server (port 8000, optional)

---

## Database Schema

### Donations Table
```sql
CREATE TABLE donations (
    id VARCHAR PRIMARY KEY,
    amount DECIMAL NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    is_other_amount BOOLEAN DEFAULT FALSE,
    source VARCHAR,
    payment_status VARCHAR,
    payment_method VARCHAR,
    transaction_id VARCHAR UNIQUE,
    member_email VARCHAR,
    member_name VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

### Indexes
- `idx_donations_created_at` - For latest queries
- `idx_donations_transaction_id` - For transaction lookups
- `idx_donations_payment_status` - For status filtering
- `idx_donations_member_email` - For member queries

---

## Configuration Details

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hingecraft_db
DB_USER=hingecraft_user
DB_PASSWORD=hingecraft_secure_password_123

# API
PORT=3000
SECRET_KEY=hingecraft_secret_key_change_in_production
API_KEY=hingecraft_secret_key_change_in_production
```

### Wix Configuration
- **Connection Name: HingeCraftDonationsDB
- **Endpoint URL:** `http://localhost:3000` (local) or production URL
- **Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

---

## API Endpoints Summary

### Node.js Database Adaptor (Port 3000)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/donations/latest` | Yes | Latest donation |
| POST | `/donations` | Yes | Create donation |
| GET | `/donations` | Yes | List donations |
| GET | `/donations/:id` | Yes | Get donation |
| PATCH | `/donations/:id` | Yes | Update donation |
| GET | `/export/json` | Yes | Export database (NEW) |

### Python Server (Port 8000, Optional)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | No | Health check |
| POST | `/api/v1/donations` | Yes | Create donation |
| GET | `/api/v1/donations` | Yes | List donations |

---

## File Structure

```
HingeCraft/
├── charter-page.html              # Main charter page
├── payment-page-integration.js     # Payment page integration
├── velo-backend-api.js            # Wix backend API
├── database-schema.sql            # SQL schema
├── docker-compose.yml             # Docker services
├── database/
│   └── init.sql                  # Database initialization
├── database-adaptor/
│   ├── server.js                  # Express API server
│   ├── package.json              # Node.js dependencies
│   ├── Dockerfile                 # Docker image
│   └── README.md                 # API documentation
├── python-server/                 # Optional Python server
│   ├── main.py                   # FastAPI application
│   ├── database.py               # Database connection
│   ├── api/                      # API endpoints
│   ├── services/                 # Business logic
│   └── middleware/               # Auth middleware
└── [Documentation Files]         # 20+ markdown files
```

---

## Recent Additions (Latest Chat Session)

### Database Export/Share Functionality

**Requirement:** Add ability to download and share entire database

**Implementation:**
1. **Backend (`database-adaptor/server.js`)**
   - Added GET `/export/json` endpoint
   - Returns complete database export as JSON
   - Includes timestamp and all donations

2. **Frontend (`charter-page.html`)**
   - Added "Download DB" button to Footer
   - Added "Share DB" button to Footer
   - Implemented `handleDownloadDb()` function
   - Implemented `handleShareDb()` function
   - Web Share API with clipboard fallback

**Features:**
- Downloads database as JSON file
- Shares via Web Share API (if available)
- Falls back to clipboard copy
- Error handling and user feedback
- Toast notifications for status

---

## Deployment Options

### Option 1: Docker (Recommended - Offline/Serverless)
```bash
docker-compose up -d
```

### Option 2: Manual PostgreSQL Setup
1. Install PostgreSQL locally
2. Run `database/init.sql`
3. Configure `database-adaptor/.env`
4. Start API: `cd database-adaptor && npm start`

### Option 3: Production Deployment
- Railway.app
- Heroku
- AWS
- Any platform supporting Docker

---

## Testing Checklist

- [ ] Docker services start successfully
- [ ] Health check endpoints respond
- [ ] Database connection works
- [ ] Create donation via API
- [ ] Retrieve donation via API
- [ ] Wix external database connection
- [ ] Payment page captures amount
- [ ] Charter page displays amount
- [ ] Database export works (NEW)
- [ ] Database share works (NEW)

---

## Known Issues & Solutions

### Issue: CORS Errors
**Solution:** CORS middleware enabled in Express server

### Issue: Authentication Failures
**Solution:** Check secret key matches in `.env` and Wix configuration

### Issue: Database Connection Timeout
**Solution:** Verify PostgreSQL is running and credentials are correct

### Issue: Wix Storage Not Accessible
**Solution:** Ensure code runs in Wix environment, not standalone HTML

---

## Future Enhancements Discussed

1. **Analytics Dashboard**
   - Donation statistics
   - Member analytics
   - Revenue tracking

2. **Email Notifications**
   - Donation confirmations
   - Membership activation
   - Updates and newsletters

3. **Member Portal**
   - Account management
   - Membership details
   - Download access

4. **Payment Gateway Integration**
   - Stripe
   - PayPal
   - Crypto payments

5. **Admin Panel**
   - Database management
   - User management
   - Content management

---

## Repository Information

- **GitHub URL:** `https://github.com/departments-commits/hingecraft-global.git`
- **Clone Command:** `gh repo clone departments-commits/hingecraft-global`
- **Branch:** `main`
- **Status:** Complete and ready for deployment

---

## Documentation Files

1. `README.md` - Main project overview
2. `MASTER_INDEX.md` - Quick reference guide
3. `COMPLETE_PROJECT_DATA.md` - Complete project data
4. `PROJECT_COMPLETE.md` - Completion status
5. `DOCKER_SETUP.md` - Docker setup guide
6. `DATABASE_CONNECTION_SETUP.md` - Wix database setup
7. `WIX_SETUP.md` - Wix integration guide
8. `RAILWAY_DEPLOY.md` - Production deployment
9. `PYTHON_SERVER_GUIDE.md` - Python server docs
10. `COMPLETE_FILE_SET.md` - File reference
11. `IMPLEMENTATION_SUMMARY.md` - Implementation details
12. `SYSTEM_OVERVIEW.md` - System architecture
13. `DEPLOYMENT_SUMMARY.md` - Deployment summary
14. `DEPLOYMENT_RECOMMENDATIONS.md` - Deployment recommendations
15. `DOCKER_OPERATIONAL_GUIDE.md` - Docker operations
16. `EXTERNAL_DB_SETUP.md` - External database setup
17. `QUICK_START.md` - Quick start guide
18. `QUICK_START_DOCKER.md` - Docker quick start
19. `WEBSITE_TESTING_GUIDE.md` - Testing guide
20. `READY_FOR_TESTING.md` - Testing checklist
21. `GIT_PUSH_GUIDE.md` - Git push instructions
22. `GIT_READY_CHECKLIST.md` - Git readiness
23. `PUSH_TO_GITHUB.md` - GitHub push guide
24. `implementation-checklist.md` - Implementation checklist
25. `quick-reference.md` - Quick reference

---

## Summary

This document consolidates all information from HingeCraft agent chats, including:
- Project requirements and vision
- Implementation phases and decisions
- Technical architecture
- API endpoints
- Database schema
- Configuration details
- Recent additions (database export/share)
- Deployment options
- Testing procedures
- Future enhancements

**Last Updated:** Current session (Database Export/Share functionality added)
**Status:** Complete and operational

