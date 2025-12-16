# Database Connection Setup for Wix

## Complete Setup Guide

This guide covers setting up the database connection for Wix, including Docker-based offline/serverless setup.

## Step-by-Step Configuration

### Step 1: Access Wix Database Settings

1. Log into Wix Editor
2. Go to **Database** → **Collections**
3. Click **"Connect External Database"** or **"External Database"** tab
4. Click **"Add Connection"**

### Step 2: Choose Custom Database

1. Select **"Custom"** option
2. You'll see three fields to fill:

### Step 3: Enter Connection Details

**Field 1: Connection Name**
```
HingeCraftDonationsDB
```

**Field 2: Endpoint URL**

**⚠️ REQUIRES HTTPS - Wix cannot access localhost!**

For **Local Development (MUST use ngrok tunnel)**:
```
https://multiracial-zavier-acculturative.ngrok-free.dev
```
*Get this by running: `ngrok http 3000`*
*Wix requires HTTPS - localhost will NOT work*

For **Production/Deployed**:
```
https://your-deployed-api-url.com
```
*Example: `https://hingecraft-api.railway.app` or `https://api.hingecraft-global.ai`*

**Field 3: Secret Key**
```
YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY
```
*This is your API authentication key/token from `.env` file*

### Step 4: Test Connection

1. Click **"Test Connection"** button
2. Wix will verify the connection
3. If successful, click **"Save"**

### Step 5: Update Backend Code

After saving, update `velo-backend-api.js`:

```javascript
// At the top of the file
const EXTERNAL_DB_ENDPOINT = 'YOUR_EXTERNAL_DB_ADAPTOR_ENDPOINT_URL';
const EXTERNAL_DB_SECRET_KEY = 'YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY';
const USE_EXTERNAL_DB = true;
```

**For Docker (Local)**:
```javascript
const EXTERNAL_DB_ENDPOINT = 'http://localhost:3000';
const EXTERNAL_DB_SECRET_KEY = 'hingecraft_secret_key_change_in_production'; // From .env
const USE_EXTERNAL_DB = true;
```

**For Production**:
```javascript
const EXTERNAL_DB_ENDPOINT = 'https://your-deployed-api-url.com';
const EXTERNAL_DB_SECRET_KEY = 'your_production_secret_key';
const USE_EXTERNAL_DB = true;
```

### Step 6: Verify Database Schema

Your external database must have a `donations` table matching the schema in `database-schema.sql`.

**If using Docker**, the schema is automatically created. See `DOCKER_SETUP.md` for details.

## Docker Setup (Recommended for Offline/Serverless)

### Quick Start with Docker

1. **Install Docker Desktop**: [Download](https://www.docker.com/products/docker-desktop)

2. **Clone Repository**:
   ```bash
   gh repo clone departments-commits/hingecraft-global
   cd hingecraft-global
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your secure credentials
   ```

4. **Start Services**:
   ```bash
   docker-compose up -d
   ```

5. **Verify Setup**:
   ```bash
   curl http://localhost:3000/health
   ```

6. **Use in Wix**:
   - Endpoint URL: `http://localhost:3000` (or use tunnel for external access)
   - Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

See `DOCKER_SETUP.md` for complete Docker setup guide.

## Using Wix Secrets Manager (Recommended for Production)

Instead of hardcoding credentials:

1. Go to **Settings** → **Secrets Manager**
2. Add secrets:
   - `EXTERNAL_DB_ENDPOINT` = Your endpoint URL
   - `EXTERNAL_DB_SECRET_KEY` = Your secret key

3. Update `velo-backend-api.js`:

```javascript
import { secrets } from 'wix-secrets-backend';

let EXTERNAL_DB_ENDPOINT;
let EXTERNAL_DB_SECRET_KEY;

async function initConfig() {
    EXTERNAL_DB_ENDPOINT = await secrets.getSecret('EXTERNAL_DB_ENDPOINT');
    EXTERNAL_DB_SECRET_KEY = await secrets.getSecret('EXTERNAL_DB_SECRET_KEY');
}

// Call on module load
initConfig();
```

## Database Schema

The database uses PostgreSQL with the following schema:

**Table**: `donations`

**Fields**:
- `id` (VARCHAR) - Primary key
- `amount` (DECIMAL) - Donation amount
- `currency` (VARCHAR) - Currency code (default: USD)
- `is_other_amount` (BOOLEAN) - True if custom amount
- `source` (VARCHAR) - Source of donation
- `payment_status` (VARCHAR) - Payment status
- `payment_method` (VARCHAR) - Payment method
- `transaction_id` (VARCHAR) - Unique transaction ID
- `member_email` (VARCHAR) - Member email
- `member_name` (VARCHAR) - Member name
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp
- `metadata` (JSONB) - Additional data

See `database-schema.sql` for complete SQL schema.

## API Endpoints Required

Your external database adaptor must implement:

1. **GET** `/donations/latest` - Get latest donation
2. **POST** `/donations` - Create new donation
3. **GET** `/donations?limit={limit}` - Get all donations
4. **GET** `/donations/{id}` - Get donation by ID
5. **PATCH** `/donations/{id}` - Update donation

**All endpoints require authentication**:
- Header: `Authorization: Bearer {SECRET_KEY}`
- OR Header: `X-API-Key: {SECRET_KEY}`

## Connection Testing

### Test from Wix Backend Console

```javascript
// In Wix backend console
import { getLatestDonation } from 'backend/hingecraft-api';
const result = await getLatestDonation();
console.log('Connection test:', result);
```

### Test from Command Line

```bash
# Health check (no auth required)
curl http://localhost:3000/health

# Get latest donation (requires auth)
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
     http://localhost:3000/donations/latest

# Create donation
curl -X POST http://localhost:3000/donations \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 50.00,
       "currency": "USD",
       "is_other_amount": true,
       "source": "payment_page"
     }'
```

## Troubleshooting

### Connection Failed

**Local Development**:
- Verify Docker is running: `docker-compose ps`
- Check API is accessible: `curl http://localhost:3000/health`
- Verify secret key matches in `.env` and Wix

**Production**:
- Verify endpoint URL is correct and accessible
- Check API is deployed and running
- Verify CORS is configured (if needed)
- Check firewall/security groups allow connections

### Authentication Error

- Verify secret key format matches API requirements
- Check if API uses Bearer token or API key
- Ensure secret key in Wix matches `.env` file
- Update headers in `velo-backend-api.js` if needed

### Database Not Found

- Verify database/table exists
- Check table name matches (`donations`)
- Verify schema matches `database-schema.sql`
- For Docker: Check logs: `docker-compose logs postgres`

### Local Development with Wix

Since Wix runs in the cloud, `localhost` won't work directly. Options:

1. **Use Tunnel Service**:
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Expose local API
   ngrok http 3000
   
   # Use ngrok URL in Wix: https://multiracial-zavier-acculturative.ngrok-free.dev
   ```

2. **Deploy to Cloud**: Deploy API to Railway, Render, or similar service

3. **Use Wix Dev Mode**: If available, test locally with Wix dev tools

## API Requirements

Your external database adaptor must:
1. Accept HTTPS requests (HTTP for local dev)
2. Support CORS (if needed for browser requests)
3. Authenticate using provided secret key
4. Implement all 5 required endpoints
5. Return JSON responses
6. Handle errors gracefully
7. Use PostgreSQL database (or compatible SQL database)

## Next Steps

1. ✅ Set up Docker (see `DOCKER_SETUP.md`)
2. ✅ Configure Wix database connection
3. ✅ Update `velo-backend-api.js` with credentials
4. ✅ Test connection from Wix backend
5. ✅ Test donation flow end-to-end
6. ⬜ Deploy to production (if needed)

## Additional Resources

- **Docker Setup**: See `DOCKER_SETUP.md` for complete Docker guide
- **Database Schema**: See `database-schema.sql` for SQL schema
- **API Implementation**: See `database-adaptor/server.js` for API code
- **Project Setup**: See `PROJECT_SETUP.md` for overall project guide
