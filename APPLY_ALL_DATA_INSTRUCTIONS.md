# Apply ALL HingeCraft Database Data

## Quick Start

Run the master automation script:

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
./scripts/APPLY_ALL_DATABASE.sh
```

This script will:
1. ✅ Start Docker database (if not running)
2. ✅ Wait for database health check
3. ✅ Load ALL donations from `COMPLETE_DATABASE_EXPORT.json` and `donations_wix_import.csv`
4. ✅ Load ALL members from `registry_import.csv` (202 records)
5. ✅ Create members table if it doesn't exist
6. ✅ Restart database adaptor
7. ✅ Show summary of loaded data

## What Gets Loaded

### Donations
- From `database/COMPLETE_DATABASE_EXPORT.json` (existing donations)
- From `database/donations_wix_import.csv` (Wix-formatted donations)
- All donations include Wix required fields: `_id`, `_createdDate`, `_updatedDate`, `_owner`

### Members
- From `database/registry_import.csv` (202 member records)
- Includes: first_name, last_name, twin_name, membership_id, city, region, country, registry_date
- All members include Wix required fields: `_id`, `_createdDate`, `_updatedDate`, `_owner`

## Database Connection

The script uses these defaults (from docker-compose.yml):
- **Host**: localhost
- **Port**: 5432
- **Database**: hingecraft_db
- **User**: hingecraft_user
- **Password**: hingecraft_secure_password_123

To override, set environment variables:
```bash
export DB_HOST=your_host
export DB_PORT=your_port
export DB_NAME=your_db
export DB_USER=your_user
export DB_PASSWORD=your_password
```

## Manual Steps (if needed)

### 1. Start Docker Database
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft
docker compose up -d
```

### 2. Load Data Manually
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=hingecraft_db
export DB_USER=hingecraft_user
export DB_PASSWORD=hingecraft_secure_password_123
python3 scripts/load_all_hingecraft_data.py
```

### 3. Verify Data
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft
docker compose exec postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT COUNT(*) FROM donations;"
docker compose exec postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT COUNT(*) FROM members;"
```

### 4. Restart Adaptor
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft
docker compose restart db-adaptor
```

### 5. Test Members SPI Endpoints
```bash
# Test schema
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
     http://localhost:3000/v1/collections/members/schema

# Test items
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
     "http://localhost:3000/v1/collections/members/items?limit=5"
```

### 6. Sync to Wix
```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
NODE_TLS_REJECT_UNAUTHORIZED=0 wix dev
```

Then refresh Wix Editor - members collection should be available via external DB SPI.

## Files Created

- `scripts/load_all_hingecraft_data.py` - Master Python loader
- `scripts/APPLY_ALL_DATABASE.sh` - Automation script
- `database/registry_import.csv` - 202 member records
- `database/registry_wix_import.csv` - Wix CMS import format

## Status

✅ All code pushed to `main` branch
✅ Members table schema ready
✅ Members SPI endpoints ready (in HingeCraft/database-adaptor/server.js)
✅ Loader scripts ready
⏳ **Run `./scripts/APPLY_ALL_DATABASE.sh` to load all data**

