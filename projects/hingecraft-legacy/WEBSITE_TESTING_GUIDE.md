# Website Testing Guide - HingeCraft

Complete guide for testing the HingeCraft website integration with the Docker database setup.

## 🚀 Quick Start

### 1. Start Docker Services

```bash
# Make scripts executable
chmod +x start-docker.sh test-docker-setup.sh

# Start all services
./start-docker.sh

# Or manually
docker-compose up -d
```

### 2. Verify Services Are Running

```bash
# Run test script
./test-docker-setup.sh

# Or check manually
docker-compose ps
curl http://localhost:3000/health
curl http://localhost:8000/api/v1/health
```

## 📋 Pre-Testing Checklist

- [ ] Docker Desktop is running
- [ ] `.env` file is configured with your credentials
- [ ] All services are running (`docker-compose ps`)
- [ ] Health checks are passing
- [ ] Database is initialized (donations table exists)

## 🔧 Configuration for Wix

### Step 1: Get Your Credentials

From your `.env` file:
```bash
# View your secret key
grep ADAPTOR_SECRET_KEY .env
```

### Step 2: Configure Wix External Database

1. **Go to Wix Editor** → Database → External Database
2. **Click "Connect External Database"** → Select **"Custom"**
3. **Enter Connection Details**:

   **Connection Name:**
   ```
   HingeCraftDonationsDB
   ```

   **Endpoint URL:**
   ```
   http://localhost:3000
   ```
   *Note: For production, use your deployed URL (e.g., Railway, Render)*

   **Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
   ```
   [Your ADAPTOR_SECRET_KEY from .env file]
   ```

4. **Click "Test Connection"**
5. **If successful, click "Save"**

### Step 3: Update Wix Backend Code

In your Wix site, update `velo-backend-api.js`:

```javascript
// Configuration for External Database Adaptor
const USE_EXTERNAL_DB = true;
const EXTERNAL_DB_ENDPOINT = 'http://localhost:3000'; // Local Docker
// For production: 'https://your-deployed-api-url.com'
const EXTERNAL_DB_SECRET_KEY = 'your_secret_key_from_env';
```

## 🧪 Testing the Integration

### Test 1: Health Check

```bash
# Node.js API
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

### Test 2: Create Test Donation

```bash
# Get your secret key
SECRET_KEY=$(grep ADAPTOR_SECRET_KEY .env | cut -d '=' -f2 | tr -d ' ')

# Create donation via Node.js API
curl -X POST http://localhost:3000/donations \
     -H "Authorization: Bearer $SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 50.00,
       "is_other_amount": true,
       "source": "payment_page",
       "payment_status": "completed"
     }'

# Create donation via Python Server
curl -X POST http://localhost:8000/api/v1/donations \
     -H "Authorization: Bearer $SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 75.00,
       "is_other_amount": true,
       "source": "payment_page"
     }'
```

### Test 3: Retrieve Latest Donation

```bash
# Node.js API
curl -H "Authorization: Bearer $SECRET_KEY" \
     http://localhost:3000/donations/latest

# Python Server
curl -H "Authorization: Bearer $SECRET_KEY" \
     http://localhost:8000/api/v1/donations/latest
```

### Test 4: Verify in Database

```bash
# Connect to database
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db

# Query donations
SELECT * FROM donations ORDER BY created_at DESC LIMIT 5;

# Exit
\q
```

## 🌐 Testing with Wix Website

### For Local Development (Using Tunnel)

Since Wix runs in the cloud, you need a tunnel to access localhost:

#### Option 1: ngrok (Recommended)

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://multiracial-zavier-acculturative.ngrok-free.dev)
# Use this URL in Wix configuration instead of localhost:3000
```

#### Option 2: localtunnel

```bash
# Install
npm install -g localtunnel

# Start tunnel
lt --port 3000

# Use the provided URL in Wix
```

### Update Wix Configuration with Tunnel

1. **Get tunnel URL** (from ngrok or localtunnel)
2. **Update Wix External Database**:
   - Endpoint URL: `https://multiracial-zavier-acculturative.ngrok-free.dev`
   - Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b
3. **Update `velo-backend-api.js`**:
   ```javascript
   const EXTERNAL_DB_ENDPOINT = 'https://multiracial-zavier-acculturative.ngrok-free.dev';
   ```

## 📊 Testing Flow

### Complete Test Scenario

1. **Start Docker Services**
   ```bash
   ./start-docker.sh
   ```

2. **Verify Services**
   ```bash
   ./test-docker-setup.sh
   ```

3. **Create Test Donation** (via API)
   ```bash
   # Use the create donation command above
   ```

4. **Test on Wix Payment Page**
   - Go to payment page
   - Enter custom "Other" amount (e.g., $50)
   - Submit payment
   - Verify donation is saved

5. **Verify on Charter Page**
   - Go to charter page
   - Check that donation amount appears below "Contribution"
   - Verify amount matches what was entered

6. **Check Database**
   ```bash
   docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT * FROM donations ORDER BY created_at DESC LIMIT 1;"
   ```

## 🔍 Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U hingecraft_user
```

### API Not Responding

```bash
# Check API logs
docker-compose logs db-adaptor
docker-compose logs python-server

# Verify ports
lsof -i :3000
lsof -i :8000

# Restart services
docker-compose restart db-adaptor python-server
```

### Wix Connection Failed

1. **Verify endpoint URL** is correct
2. **Check secret key** matches `.env` file
3. **Test API directly** with curl first
4. **Check tunnel** is running (if using localhost)
5. **Verify CORS** is enabled (should be `*` by default)

### Authentication Errors

- Verify `ADAPTOR_SECRET_KEY` in `.env` matches Wix configuration
- Check header format: `Authorization: Bearer YOUR_KEY`
- Ensure secret key is set in both `.env` and Wix

## 📝 Test Checklist

- [ ] Docker services running
- [ ] Health checks passing
- [ ] Database initialized
- [ ] API authentication working
- [ ] Can create donation via API
- [ ] Can retrieve donation via API
- [ ] Wix connection configured
- [ ] Payment page captures amount
- [ ] Charter page displays amount
- [ ] Database stores donation correctly

## 🚀 Production Testing

For production testing:

1. **Deploy to Railway/Render** (see `RAILWAY_DEPLOY.md`)
2. **Get production URL** (e.g., `https://hingecraft-api.railway.app`)
3. **Update Wix configuration** with production URL
4. **Test end-to-end** on production site

## 📚 Additional Resources

- **Docker Setup**: `DOCKER_OPERATIONAL_GUIDE.md`
- **Deployment**: `RAILWAY_DEPLOY.md`
- **Database Schema**: `database/init.sql`
- **API Documentation**: `database-adaptor/README.md` and `python-server/README.md`

---

**Status**: Ready for testing! 🎉



