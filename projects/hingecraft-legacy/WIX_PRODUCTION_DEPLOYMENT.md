# Wix Production Deployment

## ✅ Production URL Ready

**Production API URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`

**Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## 🚀 Quick Deployment Steps

### 1. Backend (Wix Velo) - 2 minutes

1. Open Wix Editor → Dev Mode → Backend → Functions
2. Create new function: `backend/hingecraft-api.jsw`
3. Copy content from: `velo-backend-api.js`
4. Save and Publish

### 2. Wix Secrets Manager - 1 minute

1. Settings → Secrets Manager
2. Add Secret:
   - **Name**: `EXTERNAL_DB_ENDPOINT`
   - **Value**: `https://multiracial-zavier-acculturative.ngrok-free.dev`
3. Add Secret:
   - **Name**: `EXTERNAL_DB_SECRET_KEY`
   - **Value**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

### 3. External Database Connection - 2 minutes

1. Database → External Database → Connect
2. **Connection Name**: `HingeCraftDonationsDB`
3. **Endpoint URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev`
4. **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
5. Click **Connect**
6. Wait for schema to load
7. Verify collection `donations` appears
8. Verify fields: `_id`, `_createdDate`, `_updatedDate`, `_owner`

### 4. Payment Page - 1 minute

1. Payment Page → Settings → Custom Code → JavaScript
2. Copy content from: `payment-page-integration-FIXED.js`
3. Update `CHARTER_PAGE_URL` if needed
4. Save

### 5. Charter Page - 1 minute

1. Charter Page → Settings → Custom Code → HTML
2. Copy content from: `CHARTER_PAGE_LATEST_READY_TO_IMPLEMENT.html`
3. Save

### 6. Test - 2 minutes

1. Go to payment page
2. Enter "Other" amount (e.g., $50)
3. Submit payment
4. Verify redirect to charter page
5. Verify donation amount displays: "Donation Amount: $50.00"
6. Check browser console for errors (should be none)

---

## ✅ Verification Checklist

- [ ] Backend function deployed
- [ ] Wix Secrets configured
- [ ] External database connected
- [ ] Schema loaded with all fields
- [ ] Payment page code deployed
- [ ] Charter page code deployed
- [ ] Test payment flow works
- [ ] Donation amount displays correctly
- [ ] No console errors

---

## 🔧 Troubleshooting

### Schema endpoint not working

1. Verify ngrok is running: `curl http://localhost:4040/api/tunnels`
2. Test locally: `curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" http://localhost:3000/v1/collections/donations/schema`
3. Test production: `curl -H "Authorization: Bearer 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" https://multiracial-zavier-acculturative.ngrok-free.dev/v1/collections/donations/schema`
4. Check Docker logs: `docker-compose logs db-adaptor`

### Database connection fails

1. Verify Docker is running: `docker-compose ps`
2. Check database logs: `docker-compose logs postgres`
3. Restart services: `docker-compose restart`

### ngrok URL changed

If ngrok restarts, the URL will change. Run `./PRODUCTION_DEPLOY.sh` again to get new URL.

---

## 📊 Production Status

**Status**: ✅ **PRODUCTION READY**

**Last Updated**: Thu Dec  4 13:02:34 MST 2025

**Production URL**: https://multiracial-zavier-acculturative.ngrok-free.dev
