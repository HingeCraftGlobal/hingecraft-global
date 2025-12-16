# HingeCraft Project Setup

## Repository

**GitHub**: `https://github.com/departments-commits/hingecraft-global.git`  
**Clone**: `gh repo clone departments-commits/hingecraft-global`

## Quick Start

```bash
# 1. Install Wix CLI globally
npm install -g @wix/cli

# 2. Clone repository
gh repo clone departments-commits/hingecraft-global
# OR
git clone git@github.com:departments-commits/hingecraft-global.git

# 3. Navigate to project
cd hingecraft-global

# 4. Install dependencies
npm install

# 5. Start development server
wix dev
```

## Project Files

### Frontend Files
- `charter-page.html` - Main charter page with tier selection
- `payment-page-integration.js` - Payment page integration code

### Backend Files
- `velo-backend-api.js` - Backend API (deploy as `backend/hingecraft-api.jsw`)

### Database
- `database-schema.sql` - SQL schema for external database
- `DATABASE_CONFIG.md` - Database configuration guide

### Documentation
- `README.md` - Main documentation
- `EXTERNAL_DB_SETUP.md` - External database setup
- `WIX_SETUP.md` - Wix CLI setup
- `COMPLETE_FILE_SET.md` - Complete file reference

## Database Configuration

### Connection Name
`HingeCraftDonationsDB`

### Endpoint URL
`YOUR_EXTERNAL_DB_ADAPTOR_ENDPOINT_URL`

### Secret Key
`YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY`

## Development Workflow

1. **Local Development**:
   ```bash
   wix dev
   ```

2. **Deploy Backend**:
   - Copy `velo-backend-api.js` → `backend/hingecraft-api.jsw`
   - Update database credentials
   - Deploy via Wix Editor

3. **Update Frontend**:
   - Copy `charter-page.html` to Wix page
   - Copy `payment-page-integration.js` to payment page

4. **Test**:
   - Test donation flow: Payment → Charter
   - Verify amount appears on charter page
   - Check database records

## File Locations in Wix

- **Charter Page**: `/charter` → Add `charter-page.html`
- **Payment Page**: `/payment` → Add `payment-page-integration.js`
- **Backend API**: `backend/hingecraft-api.jsw` → Copy from `velo-backend-api.js`

## Environment Variables

Set in Wix Secrets Manager (recommended):
- `EXTERNAL_DB_ENDPOINT`
- `EXTERNAL_DB_SECRET_KEY`

Or update directly in `velo-backend-api.js`:
```javascript
const EXTERNAL_DB_ENDPOINT = 'your-endpoint-url';
const EXTERNAL_DB_SECRET_KEY = 'your-secret-key';
const USE_EXTERNAL_DB = true;
```





