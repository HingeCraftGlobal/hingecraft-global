# HingeCraft Complete Project Data

## Repository Information

- **GitHub URL**: `https://github.com/departments-commits/hingecraft-global.git`
- **Clone (GitHub CLI)**: `gh repo clone departments-commits/hingecraft-global`
- **Clone (Git SSH)**: `git clone git@github.com:departments-commits/hingecraft-global.git`

## Setup Commands

```bash
# Install Wix CLI
npm install -g @wix/cli

# Clone repository
gh repo clone departments-commits/hingecraft-global
cd hingecraft-global

# Install dependencies
npm install

# Start development
wix dev
```

## Database Configuration

### External Database Adaptor (Custom)

**Connection Name**: `HingeCraftDonationsDB`

**Endpoint URL**: `YOUR_EXTERNAL_DB_ADAPTOR_ENDPOINT_URL`
- Example: `https://api.example.com/v1`
- Example: `https://your-database-api.com/database`

**Secret Key**: `YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY`
- Your API authentication key/token

### Configuration in Code

Update `velo-backend-api.js`:

```javascript
const EXTERNAL_DB_ENDPOINT = 'YOUR_EXTERNAL_DB_ADAPTOR_ENDPOINT_URL';
const EXTERNAL_DB_SECRET_KEY = 'YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY';
const USE_EXTERNAL_DB = true;
```

## Database Schema

See `database-schema.sql` for complete SQL schema.

**Required Table**: `donations`

**Required Fields**:
- `id` (Primary Key)
- `amount` (DECIMAL)
- `currency` (VARCHAR)
- `is_other_amount` (BOOLEAN)
- `source` (VARCHAR)
- `payment_status` (VARCHAR)
- `payment_method` (VARCHAR)
- `transaction_id` (VARCHAR)
- `member_email` (VARCHAR)
- `member_name` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `metadata` (JSON)

## API Endpoints Required

Your external database adaptor must provide:

1. **GET** `/donations/latest`
   - Returns latest donation record
   - Headers: `Authorization: Bearer {SECRET_KEY}`, `X-API-Key: {SECRET_KEY}`

2. **POST** `/donations`
   - Creates new donation record
   - Body: JSON with donation data
   - Headers: Same as above

3. **GET** `/donations?limit={limit}`
   - Returns list of donations
   - Headers: Same as above

4. **GET** `/donations/{id}`
   - Returns specific donation
   - Headers: Same as above

5. **PATCH** `/donations/{id}`
   - Updates donation record
   - Body: JSON with update data
   - Headers: Same as above

## Project Files Summary

### Core Files
- `charter-page.html` - Charter page with donation amount display
- `payment-page-integration.js` - Captures donation amount from payment page
- `velo-backend-api.js` - Backend API for database operations

### Database
- `database-schema.sql` - SQL schema for external database
- `DATABASE_CONFIG.md` - Database setup instructions

### Setup & Documentation
- `WIX_SETUP.md` - Wix CLI and repository setup
- `PROJECT_SETUP.md` - Complete project setup guide
- `EXTERNAL_DB_SETUP.md` - External database adaptor setup
- `README.md` - Main documentation
- `COMPLETE_FILE_SET.md` - File reference

## Flow Summary

```
Payment Page (/payment)
  ↓ User enters "Other" custom amount
  ↓ User submits payment
  ↓ Amount stored (Wix Storage + Database)
  ↓ Redirects to Charter Page
  ↓
Charter Page (/charter)
  ↓ Retrieves donation amount
  ↓ Displays below "Contribution"
```

## Implementation Checklist

- [ ] Install Wix CLI: `npm install -g @wix/cli`
- [ ] Clone repository: `gh repo clone departments-commits/hingecraft-global`
- [ ] Install dependencies: `npm install`
- [ ] Configure external database adaptor in Wix
- [ ] Set endpoint URL and secret key
- [ ] Update `velo-backend-api.js` with credentials
- [ ] Deploy backend API to Wix
- [ ] Add `charter-page.html` to charter page
- [ ] Add `payment-page-integration.js` to payment page
- [ ] Test donation flow
- [ ] Verify database connection
- [ ] Test amount display on charter page

## Support

For issues:
1. Check Wix backend logs
2. Verify database credentials
3. Test API endpoints directly
4. Check browser console for errors
5. Verify Wix Storage is accessible





