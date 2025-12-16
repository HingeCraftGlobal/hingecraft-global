# Crypto Wallet Addresses Guide for HingeCraft

## 💰 Overview

This guide covers how to configure and manage crypto wallet addresses for NOWPayments integration.

---

## 🔑 NOWPayments Wallet Configuration

### Important: Wallet addresses are configured in NOWPayments Dashboard, NOT in Wix Secrets

According to NOWPayments API documentation:
- Wallet addresses are stored in your NOWPayments account settings
- You configure them once in the Dashboard
- They're automatically used for all payouts
- You don't need to pass wallet addresses in API calls

### How to Configure in NOWPayments Dashboard

1. **Go to NOWPayments Dashboard:** https://nowpayments.io
2. **Log in** to your account
3. **Settings** → **Payout Settings** or **Wallet Settings**
4. **Add Wallet Addresses** for each supported cryptocurrency:
   - **Bitcoin (BTC)** - Add your Bitcoin wallet address
   - **Ethereum (ETH)** - Add your Ethereum wallet address
   - **Solana (SOL)** - Add your Solana wallet address
   - **Stellar (XLM)** - Add your Stellar wallet address

5. **Verify addresses** are correct before saving
6. **Save** the configuration

---

## 📊 Supported Cryptocurrencies

| Currency | Code | Network | Address Format Example |
|----------|------|---------|------------------------|
| Bitcoin | BTC | Bitcoin | `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` or `bc1q...` |
| Ethereum | ETH | Ethereum | `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` |
| Solana | SOL | Solana | `DxPvzLdQYcVj3Vx1qJ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F` |
| Stellar | XLM | Stellar | `GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUV` |

---

## 🗄️ Database Storage (For Reference)

### Crypto Treasury Table

Your database has a `crypto_treasury` table that can store wallet addresses:

```sql
-- Query wallet addresses from database
SELECT 
    currency,
    wallet_address,
    wallet_type,
    network,
    is_active
FROM crypto_treasury
WHERE is_active = true
ORDER BY currency;
```

### Insert Wallet Addresses (If Storing in Database)

```sql
INSERT INTO crypto_treasury (
    currency,
    wallet_address,
    wallet_type,
    network,
    is_active
) VALUES
('BTC', 'YOUR_BITCOIN_ADDRESS', 'payout', 'bitcoin', true),
('ETH', 'YOUR_ETHEREUM_ADDRESS', 'payout', 'ethereum', true),
('SOL', 'YOUR_SOLANA_ADDRESS', 'payout', 'solana', true),
('XLM', 'YOUR_STELLAR_ADDRESS', 'payout', 'stellar', true)
ON CONFLICT DO NOTHING;
```

---

## 🔍 Extract Wallet Addresses from Database

### Method 1: Run Extraction Script

```bash
node scripts/extract-wallet-addresses.js
```

This will:
- Query `crypto_treasury` table
- Query `wallets` table
- Query `secrets` table for wallet-related keys
- Generate formatted output

### Method 2: SQL Query

```sql
-- Get all active wallet addresses
SELECT 
    currency,
    wallet_address,
    wallet_type,
    network
FROM crypto_treasury
WHERE is_active = true
ORDER BY currency;

-- Get specific currency
SELECT wallet_address 
FROM crypto_treasury 
WHERE currency = 'BTC' AND is_active = true;
```

### Method 3: Query Script

```bash
psql -h localhost -U postgres -d hingecraft -f scripts/query-wallet-addresses.sql
```

---

## 📝 NOWPayments API Usage

### Creating Invoice with Specific Currency

When creating a NOWPayments invoice, you can specify the `pay_currency`:

```javascript
const invoicePayload = {
    price_amount: 50,
    price_currency: 'usd',
    order_id: intentId,
    pay_currency: 'BTC', // Optional: specify BTC, ETH, SOL, or XLM
    // ... other parameters
};
```

**Note:** If `pay_currency` is not specified, NOWPayments will allow the user to choose from all configured currencies.

### Wallet Address in API Response

When you create an invoice, NOWPayments returns:

```json
{
    "payment_id": "...",
    "pay_address": "YOUR_WALLET_ADDRESS", // This is your configured payout address
    "pay_amount": "0.00123456",
    "pay_currency": "BTC",
    "invoice_url": "..."
}
```

The `pay_address` in the response is the wallet address where the payment should be sent. This is automatically determined by NOWPayments based on:
1. Your configured payout wallet addresses
2. The `pay_currency` specified (if any)

---

## ✅ Verification Checklist

- [ ] Wallet addresses configured in NOWPayments Dashboard
- [ ] Bitcoin (BTC) address added and verified
- [ ] Ethereum (ETH) address added and verified
- [ ] Solana (SOL) address added and verified
- [ ] Stellar (XLM) address added and verified
- [ ] Addresses verified for correct format
- [ ] Test payment received successfully
- [ ] Wallet addresses stored in database (optional, for reference)

---

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- Wallet addresses are public information (safe to share)
- Private keys should NEVER be stored in database or code
- Use hardware wallets or secure key management for private keys
- Verify wallet addresses before configuring in NOWPayments
- Test with small amounts first

---

## 📋 Wallet Address Format Validation

### Bitcoin (BTC)
- Legacy: Starts with `1` (26-35 characters)
- SegWit: Starts with `3` (26-35 characters)
- Bech32: Starts with `bc1` (42-62 characters)

### Ethereum (ETH)
- Starts with `0x` (42 characters total)
- Hexadecimal characters only

### Solana (SOL)
- Base58 encoded (32-44 characters)
- Alphanumeric (no 0, O, I, l)

### Stellar (XLM)
- Starts with `G` (56 characters)
- Base32 encoded

---

## 🚀 Quick Setup

1. **Get your wallet addresses** from your crypto wallets
2. **Configure in NOWPayments Dashboard:**
   - Settings → Payout Settings
   - Add each currency's wallet address
   - Verify and save
3. **Test with small payment** to verify addresses work
4. **Store in database** (optional, for reference):
   ```sql
   INSERT INTO crypto_treasury (currency, wallet_address, wallet_type, is_active)
   VALUES ('BTC', 'YOUR_ADDRESS', 'payout', true);
   ```

---

**Last Updated:** 2025-01-27  
**Status:** Complete Wallet Addresses Guide
