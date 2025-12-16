# HingeCraft Quick Reference Card

## ✅ Current Status
- Database: Applied & Verified
- API: All endpoints working
- Wix Required Fields: Present
- Security: API is private

---

## 🔑 Connection Details

### Wix External Database Settings
```
Connection Name: HingeCraftDonationsDB
Base URL: [ngrok HTTPS URL]
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
Collection Name: donations
```

### Local URLs
```
PostgreSQL: localhost:5432
API: http://localhost:3000
ngrok: https://[your-url].ngrok-free.app
```

---

## 🚀 Quick Start

### 1. Start Services
```bash
cd [PROJECT_ROOT]/HingeCraft
docker-compose up -d
```

### 2. Start ngrok
```bash
ngrok http 3000
```

### 3. Connect in Wix
- Content Manager > External Databases
- Add Connection
- Use settings above
- **Click "Refresh Schema"** ⚠️

---

## ✅ Verification

### Run Full Check
```bash
./VERIFY_DATABASE_AND_API.sh
```

### Quick Test
```bash
curl -X GET "http://localhost:3000/donations" \
  -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
```

---

## 🔧 Troubleshooting

### WDE0116 Error?
1. ✅ Check ngrok is running
2. ✅ Verify secret key matches
3. ✅ **Refresh Schema in Wix** (most common fix)
4. ✅ Check API logs: `docker logs hingecraft-db-adaptor`

### View Logs
```bash
docker logs hingecraft-db-adaptor    # API logs
docker logs hingecraft-postgres      # Database logs
```

---

## 📋 Wix Required Fields
- ✅ `_id` (PRIMARY KEY)
- ✅ `_createdDate` (auto-set)
- ✅ `_updatedDate` (auto-updated)
- ✅ `_owner` (default: 'system')

---

## 📁 Key Files
- `COMPLETE_DATABASE_APPLICATION_SUMMARY.md` - Full documentation
- `VERIFY_DATABASE_AND_API.sh` - Verification script
- `database/init.sql` - Database schema
- `database-adaptor/server.js` - API server

---

**Last Updated**: 2025-12-01  
**Status**: ✅ Ready for Wix Connection













