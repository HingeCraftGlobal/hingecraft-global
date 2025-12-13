# Database Extraction Scripts - Complete Guide

## 🎯 Purpose
Extract payment URLs and wallet addresses from your database to populate the currency router's `payment-currency-map.json`.

---

## ⚠️ IMPORTANT: Choose the Right Script

### **If payment data is ONLY in Wix:**
→ Use **`extract_from_wix.js`** (Wix Velo function)
- Deploy as Wix backend function
- Call from frontend: `/_functions/extract-payment-urls`
- Returns JSON with all payment URLs

### **If payment data is in Docker PostgreSQL:**
→ Use **`extract_database_urls_docker_postgres.sh`** (Bash script)
- Runs locally, connects to Docker container
- Exports to CSV files
- Works with both Docker databases (chat & automation)

### **If payment data is in MongoDB:**
→ Use **`extract_database_urls_mongo.js`** (Node.js script)
- Connects to MongoDB (local or cloud)
- Exports to JSON files
- Requires MongoDB connection string

### **If payment data is in direct PostgreSQL:**
→ Use **`extract_database_urls.sql`** (SQL script)
- Run with `psql` command
- Exports to CSV files
- Works with any PostgreSQL database

---

## 📋 Quick Decision Tree

```
Do you have payment data in Wix?
├─ YES → Use extract_from_wix.js (Wix Velo function)
└─ NO
   ├─ Do you have Docker PostgreSQL?
   │  ├─ YES → Use extract_database_urls_docker_postgres.sh
   │  └─ NO
   │     ├─ Do you have MongoDB?
   │     │  ├─ YES → Use extract_database_urls_mongo.js
   │     │  └─ NO → Use extract_database_urls.sql (direct PostgreSQL)
   │     └─ Direct PostgreSQL → Use extract_database_urls.sql
```

---

## 🚀 Usage Instructions

### Option 1: Wix Database (Recommended for Wix Sites)

**Step 1:** Deploy `extract_from_wix.js` as a Wix Velo backend function:
- Copy code to Wix Editor → Backend → New File → `extract-payment-urls.jsw`
- Deploy to site

**Step 2:** Call from frontend or test:
```javascript
// In browser console or frontend code
fetch('/_functions/extract-payment-urls/extractPaymentUrls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('Payment URLs:', data);
  // Use data.data to populate payment-currency-map.json
});
```

**Step 3:** Get URL mapping:
```javascript
fetch('/_functions/extract-payment-urls/getPaymentUrlMapping', {
  method: 'POST'
})
.then(r => r.json())
.then(data => {
  console.log('URL Mapping:', data.mapping);
  // This is ready to use in payment-currency-map.json
});
```

---

### Option 2: Docker PostgreSQL

**Step 1:** Check which Docker database has payment tables:
```bash
# Check automation database
docker exec hingecraft-postgres psql -U hingecraft_user -d hingecraft_automation -c "\dt"

# Check chat database
docker exec hingecraft-chat-db psql -U hingecraft -d hingecraft_chat -c "\dt"
```

**Step 2:** Update script with correct container name:
```bash
# Edit extract_database_urls_docker_postgres.sh
# Change DB_CONTAINER, DB_NAME, DB_USER if needed
```

**Step 3:** Run extraction:
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
./scripts/extract_database_urls_docker_postgres.sh
```

**Step 4:** Review CSV files in `/tmp/hingecraft_extraction_*/`

---

### Option 3: MongoDB

**Step 1:** Set connection string:
```bash
export MONGODB_URI="mongodb://localhost:27017/hingecraft"
export MONGODB_DB_NAME="hingecraft"
```

**Step 2:** Run extraction:
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
node scripts/extract_database_urls_mongo.js
```

**Step 3:** Review JSON files in `/tmp/`

---

### Option 4: Direct PostgreSQL

**Step 1:** Connect to database:
```bash
psql -h localhost -U your_user -d your_database
```

**Step 2:** Run SQL script:
```sql
\i scripts/extract_database_urls.sql
```

**Step 3:** Review CSV files in `/tmp/`

---

## 📊 Output Files

All scripts create similar output files:

- `hingecraft_payments.csv` or `.json` - Payment records with URLs
- `hingecraft_wallets.csv` or `.json` - Wallet addresses
- `hingecraft_external_payments.csv` or `.json` - Stripe/NOWPayments records
- `hingecraft_crypto_payments.csv` or `.json` - Crypto payment invoices
- `hingecraft_stripe_payments.csv` or `.json` - Stripe checkout sessions
- `hingecraft_payment_url_mapping.json` - Normalized mapping by currency

---

## 🔧 Next Steps After Extraction

1. **Review extracted files** - Check for valid URLs
2. **Update `payment-currency-map.json`** - Use extracted URLs
3. **Update `PAYMENT_ROUTES`** in `charter-page-wix-ready.html`
4. **Test currency router** - Verify button URLs update correctly

---

## ❓ Still Not Sure Which to Use?

**Answer these questions:**

1. **Where is your payment data?**
   - [ ] Wix Editor → Database → Collections (use `extract_from_wix.js`)
   - [ ] Docker container (use `extract_database_urls_docker_postgres.sh`)
   - [ ] MongoDB (use `extract_database_urls_mongo.js`)
   - [ ] Direct PostgreSQL (use `extract_database_urls.sql`)

2. **Can you access Wix Editor?**
   - [ ] Yes → Use Wix extraction (easiest)
   - [ ] No → Use local database extraction

3. **Do you have Docker running?**
   - [ ] Yes → Check which database has payment tables
   - [ ] No → Use direct database connection scripts

---

## 🐛 Troubleshooting

### "Container not found"
→ Check container name: `docker ps -a`

### "Table does not exist"
→ Payment data might be in Wix, not Docker

### "Connection refused"
→ Check database is running: `docker ps`

### "Permission denied"
→ Make script executable: `chmod +x script.sh`

---

## ✅ Verification

After extraction, verify:
- [ ] Files created in `/tmp/` or output directory
- [ ] Files contain payment URLs (not empty)
- [ ] URLs are valid (start with `https://`)
- [ ] Currency mapping makes sense

---

**Need help?** Check `DATABASE_SETUP_QUESTIONS.md` for detailed questions to determine your setup.
