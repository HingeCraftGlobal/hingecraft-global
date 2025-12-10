#!/bin/bash

# Prepare Secrets Configuration for Wix Secrets Manager
# Generates a formatted list of secrets for easy copy-paste

echo "=== 🔐 Secrets Configuration Helper ==="
echo ""

OUTPUT_FILE="deployment-ready/SECRETS_CONFIG.md"

mkdir -p deployment-ready

cat > "$OUTPUT_FILE" << 'EOF'
# Wix Secrets Manager Configuration

**Location:** Wix Editor → Dev Mode → Secrets Manager

## Required Secrets

Copy each secret name and value below, then add to Wix Secrets Manager.

---

### 1. NOWPayments API Key
**Name:** `NOWPAYMENTS_API_KEY`  
**Value:** `JEH3VG9-648MJPE-HPETPZ7-QVCSBES`  
**Purpose:** NOWPayments API authentication  
**Status:** [ ] Configured

---

### 2. NOWPayments IPN Secret
**Name:** `NOWPAYMENTS_IPN_SECRET`  
**Value:** `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9`  
**Purpose:** Webhook signature verification  
**Status:** [ ] Configured

---

### 3. NOWPayments Base URL
**Name:** `NOWPAYMENTS_BASE_URL`  
**Value:** `https://api.nowpayments.io/v1`  
**Purpose:** NOWPayments API endpoint  
**Status:** [ ] Configured

---

### 4. Base URL
**Name:** `BASE_URL`  
**Value:** `https://www.hingecraft-global.ai`  
**Purpose:** Your website base URL  
**Status:** [ ] Configured

---

### 5. KYC Threshold USD
**Name:** `KYC_THRESHOLD_USD`  
**Value:** `1000`  
**Purpose:** KYC trigger threshold (in USD)  
**Status:** [ ] Configured

---

### 6. Crypto Confirmations Required
**Name:** `CRYPTO_CONFIRMATIONS_REQUIRED`  
**Value:** `3`  
**Purpose:** Required blockchain confirmations  
**Status:** [ ] Configured

---

### 7. External Database Endpoint
**Name:** `EXTERNAL_DB_ENDPOINT`  
**Value:** `[YOUR_DATABASE_ENDPOINT]`  
**Purpose:** External database URL  
**Status:** [ ] Configured  
**Note:** Replace `[YOUR_DATABASE_ENDPOINT]` with your actual database endpoint

---

### 8. External Database Secret Key
**Name:** `EXTERNAL_DB_SECRET_KEY`  
**Value:** `[YOUR_DATABASE_SECRET_KEY]`  
**Purpose:** Database authentication  
**Status:** [ ] Configured  
**Note:** Replace `[YOUR_DATABASE_SECRET_KEY]` with your actual secret key

---

### 9. SendGrid API Key
**Name:** `SENDGRID_API_KEY`  
**Value:** `[YOUR_SENDGRID_API_KEY]`  
**Purpose:** Email sending via SendGrid  
**Status:** [ ] Configured  
**Note:** Replace `[YOUR_SENDGRID_API_KEY]` with your actual SendGrid API key

---

### 10. Email From Address
**Name:** `EMAIL_FROM`  
**Value:** `no-reply@hingecraft-global.ai`  
**Purpose:** Email sender address  
**Status:** [ ] Configured

---

## Quick Copy-Paste Format

For quick setup, use this format:

```
NOWPAYMENTS_API_KEY=JEH3VG9-648MJPE-HPETPZ7-QVCSBES
NOWPAYMENTS_IPN_SECRET=8TnzsveF28gelMuvXFMxgPW5YUXYkcL9
NOWPAYMENTS_BASE_URL=https://api.nowpayments.io/v1
BASE_URL=https://www.hingecraft-global.ai
KYC_THRESHOLD_USD=1000
CRYPTO_CONFIRMATIONS_REQUIRED=3
EXTERNAL_DB_ENDPOINT=[YOUR_DATABASE_ENDPOINT]
EXTERNAL_DB_SECRET_KEY=[YOUR_DATABASE_SECRET_KEY]
SENDGRID_API_KEY=[YOUR_SENDGRID_API_KEY]
EMAIL_FROM=no-reply@hingecraft-global.ai
```

---

## Verification Steps

After adding all secrets:

1. [ ] Test secret access using `test-secrets-access.js`
2. [ ] Verify no errors when accessing secrets
3. [ ] Check that all secrets are accessible from backend functions

---

## Troubleshooting

**Secret not accessible?**
- Verify secret name matches exactly (case-sensitive)
- Check secret value is not empty
- Ensure secret is saved in Secrets Manager
- Test secret access in backend function

**Secret value incorrect?**
- Double-check value matches exactly
- Remove any extra spaces or characters
- Verify special characters are escaped if needed

---

**Status:** Ready for Configuration  
**Next Action:** Add secrets to Wix Secrets Manager
EOF

echo "✅ Secrets configuration file created: $OUTPUT_FILE"
echo ""
echo "📋 Next Steps:"
echo "1. Open: $OUTPUT_FILE"
echo "2. Copy each secret name and value"
echo "3. Add to Wix Editor → Dev Mode → Secrets Manager"
echo "4. Verify all secrets are accessible"
echo ""
echo "=== ✅ Preparation Complete ==="





