# 🔐 NOWPayments Credentials Template

**⚠️ SECURITY WARNING: This file contains sensitive credentials. DO NOT commit actual secrets to Git.**

## Wix Secrets Manager Configuration

Add these secrets to your Wix Secrets Manager (Settings → Secrets):

### NOWPayments API Credentials
- **Secret Name:** `NOWPAYMENTS_API_KEY`
- **Value:** `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`
- **Description:** NOWPayments API key for invoice creation

### NOWPayments IPN Secret
- **Secret Name:** `NOWPAYMENTS_IPN_SECRET`
- **Value:** `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`
- **Description:** Webhook signature verification secret

### NOWPayments Base URL
- **Secret Name:** `NOWPAYMENTS_BASE_URL`
- **Value:** `https://api.nowpayments.io/v1`
- **Description:** NOWPayments API base URL

### Wallet Addresses (for reference - stored in database)
- **Solana:** `E42RZJc4e8UQ5fFi8QkPtRSuJXZ1pQmPVMX91LYAAT2H`
- **Bitcoin:** `bc1qgpe8zk87xxs90gd7jqqndxct4ttlj2mrt2rs6w`
- **Ethereum:** `0xbf907088116868986c014f9662a8efcbeb168237`

### Metamask Credentials (for admin access)
- **Email:** `finance@hingecraft-global.ai`
- **Password:** `jMdFQ*dZSA9$YGX6` (⚠️ Change in production)

### Other Required Secrets
- **Secret Name:** `BASE_URL`
- **Value:** `https://www.hingecraft-global.ai`
- **Description:** Base URL for webhook callbacks

- **Secret Name:** `KYC_THRESHOLD_USD`
- **Value:** `1000`
- **Description:** USD threshold for KYC verification

- **Secret Name:** `CRYPTO_CONFIRMATIONS_REQUIRED`
- **Value:** `3`
- **Description:** Number of blockchain confirmations required

## Environment Variables (for external Node.js server if used)

```bash
# NOWPayments
NOWPAYMENTS_API_KEY=JEH3VG9-648MJPE-HPETPZ7-QVCSBES
NOWPAYMENTS_IPN_SECRET=8TnzsveF28gelMuvXFMxgPW5YUXYkcL9
NOWPAYMENTS_BASE_URL=https://api.nowpayments.io/v1

# Application
BASE_URL=https://www.hingecraft-global.ai
KYC_THRESHOLD_USD=1000
CRYPTO_CONFIRMATIONS_REQUIRED=3

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key_here
EMAIL_FROM=no-reply@hingecraft-global.ai

# Database
EXTERNAL_DB_ENDPOINT=your_db_endpoint
EXTERNAL_DB_SECRET_KEY=your_db_secret
```

## NOWPayments Dashboard Configuration

1. **Webhook URL:** Set in NOWPayments dashboard to:
   ```
   https://www.hingecraft-global.ai/_functions/webhooks/nowpayments
   ```

2. **IPN Secret:** Use the value from `NOWPAYMENTS_IPN_SECRET`

3. **Invoice Settings:** 
   - Invoice ID: `4892470983`
   - Payment Button: Use provided HTML code

## Security Notes

- ✅ All secrets stored in Wix Secrets Manager (encrypted)
- ✅ Never commit actual secrets to Git
- ✅ Rotate API keys periodically
- ✅ Use different keys for staging/production
- ✅ Monitor API key usage in NOWPayments dashboard






