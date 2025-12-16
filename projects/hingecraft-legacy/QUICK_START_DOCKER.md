# Quick Start - Docker Setup (5 Minutes)

## Prerequisites
- Docker Desktop installed
- Git installed

## Steps

### 1. Clone Repository
```bash
gh repo clone departments-commits/hingecraft-global
cd hingecraft-global
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and change:
- `DB_PASSWORD` - Strong password for database
- `ADAPTOR_SECRET_KEY` - Secret key for API authentication

### 3. Start Docker Services
```bash
docker-compose up -d
```

### 4. Verify Setup
```bash
# Check services are running
docker-compose ps

# Test API health
curl http://localhost:3000/health

# Test with authentication (use your secret key from .env)
curl -H "Authorization: Bearer YOUR_SECRET_KEY" http://localhost:3000/donations/latest
```

### 5. Configure Wix

**In Wix Editor**:
1. Go to Database → External Database
2. Click "Connect External Database"
3. Select "Custom"
4. Enter:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: `http://localhost:3000` (or use ngrok for external access)
   - **Secret Key**: Your `ADAPTOR_SECRET_KEY` from `.env`

**Update Backend Code**:
- Copy `velo-backend-api.js` to `backend/hingecraft-api.jsw` in Wix
- Or use Wix Secrets Manager (recommended):
  - Add `EXTERNAL_DB_ENDPOINT` = `http://localhost:3000`
  - Add `EXTERNAL_DB_SECRET_KEY` = Your secret key

### 6. Test End-to-End

1. Go to payment page
2. Enter custom "Other" amount
3. Submit payment
4. Should redirect to charter page
5. Donation amount should display below "Contribution"

## Troubleshooting

**Services not starting?**
```bash
docker-compose logs -f
```

**Port already in use?**
Edit `docker-compose.yml` and change ports

**Can't connect from Wix?**
- Use ngrok: `ngrok http 3000`
- Use ngrok URL in Wix instead of localhost

## Next Steps

- See `DOCKER_SETUP.md` for detailed guide
- See `DATABASE_CONNECTION_SETUP.md` for Wix configuration
- See `COMPLETE_DATABASE_SETUP.md` for complete documentation





