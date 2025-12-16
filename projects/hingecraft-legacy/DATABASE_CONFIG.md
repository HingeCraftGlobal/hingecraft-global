# HingeCraft Database Configuration

## External Database Adaptor Setup

### Step 1: Configure in Wix

1. **Go to Wix Editor**
2. **Navigate to**: Database → External Database
3. **Click**: "Connect External Database"
4. **Select**: Custom
5. **Enter Configuration**:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: `https://your-api-endpoint.com/v1`
   - **Secret Key**: `your-secret-key-here`

### Step 2: Update Backend API

Edit `velo-backend-api.js` and update:

```javascript
const EXTERNAL_DB_ENDPOINT = 'https://your-api-endpoint.com/v1';
const EXTERNAL_DB_SECRET_KEY = 'your-secret-key-here';
const USE_EXTERNAL_DB = true;
```

### Step 3: Database Schema

Your external database needs a `donations` table with these fields:

- `id` (String/VARCHAR) - Primary key
- `amount` (Number/DECIMAL) - Donation amount
- `currency` (String/VARCHAR) - Currency code
- `is_other_amount` (Boolean) - True if custom amount
- `source` (String/VARCHAR) - Source of donation
- `payment_status` (String/VARCHAR) - Payment status
- `payment_method` (String/VARCHAR) - Payment method
- `transaction_id` (String/VARCHAR) - Transaction ID
- `member_email` (String/VARCHAR) - Member email
- `member_name` (String/VARCHAR) - Member name
- `created_at` (DateTime/TIMESTAMP) - Creation timestamp
- `updated_at` (DateTime/TIMESTAMP) - Update timestamp
- `metadata` (JSON) - Additional data

See `database-schema.sql` for complete SQL schema.

## API Endpoints Required

Your external database adaptor must implement:

1. **GET** `/donations/latest` - Get latest donation
2. **POST** `/donations` - Create new donation
3. **GET** `/donations?limit={limit}` - Get all donations
4. **GET** `/donations/{id}` - Get donation by ID
5. **PATCH** `/donations/{id}` - Update donation

## Authentication

All requests must include:

```
Authorization: Bearer {SECRET_KEY}
X-API-Key: {SECRET_KEY}
Content-Type: application/json
```

## Testing

Test your database connection:

```javascript
// In Wix backend console
import { getLatestDonation } from 'backend/hingecraft-api';
const result = await getLatestDonation();
console.log(result);
```





