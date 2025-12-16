# Deploy to Railway (Recommended for Wix)

Railway is the easiest option for deploying the HingeCraft database API for Wix integration.

## Why Railway?

- ✅ One-click deploy from GitHub
- ✅ Built-in PostgreSQL database
- ✅ Automatic HTTPS
- ✅ Free tier available
- ✅ Perfect for Wix (cloud-to-cloud)

## Prerequisites

- GitHub account
- Railway account (free at [railway.app](https://railway.app))

## Step 1: Push to GitHub

```bash
# Make sure you're in the project directory
cd hingecraft-global

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: HingeCraft database setup"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/departments-commits/hingecraft-global.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Railway

1. **Go to Railway**: [railway.app](https://railway.app)
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `departments-commits/hingecraft-global`
6. **Railway will auto-detect** the Docker setup

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway creates a PostgreSQL database automatically

## Step 4: Configure Environment Variables

1. Click on your **API service** (database-adaptor)
2. Go to **"Variables"** tab
3. Add these variables:

```env
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
PORT=3000
SECRET_KEY=your_secure_secret_key_here_change_this
API_KEY=your_secure_secret_key_here_change_this
NODE_ENV=production
```

**Important**: 
- Railway automatically provides database connection variables
- Change `SECRET_KEY` to a strong random string
- Use the same value for both `SECRET_KEY` and `API_KEY`

## Step 5: Get Your API URL

1. Click on your **API service**
2. Go to **"Settings"** tab
3. Click **"Generate Domain"**
4. Copy the domain (e.g., `hingecraft-api.railway.app`)

## Step 6: Initialize Database Schema

1. Click on **PostgreSQL** service
2. Go to **"Data"** tab
3. Click **"Query"**
4. Copy and paste the contents of `database/init.sql`
5. Click **"Run"**

Or use Railway CLI:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Connect to project
railway link

# Run SQL
railway run psql -U $PGUSER -d $PGDATABASE -f database/init.sql
```

## Step 7: Configure Wix

1. **Go to Wix Editor** → Database → External Database
2. **Click "Connect External Database"**
3. **Select "Custom"**
4. **Enter**:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: `https://your-railway-domain.railway.app` (from Step 5)
   - **Secret Key**: Your `SECRET_KEY` from Step 4

5. **Update Wix Backend** (`velo-backend-api.js`):
   ```javascript
   const EXTERNAL_DB_ENDPOINT = 'https://your-railway-domain.railway.app';
   const EXTERNAL_DB_SECRET_KEY = 'your_secret_key_from_step_4';
   ```

## Step 8: Test

```bash
# Test health endpoint
curl https://your-railway-domain.railway.app/health

# Test with authentication
curl -H "Authorization: Bearer your_secret_key" \
     https://your-railway-domain.railway.app/donations/latest
```

## Troubleshooting

### API not responding?
- Check Railway logs: Click on service → "Deployments" → View logs
- Verify environment variables are set
- Check database connection variables

### Database connection failed?
- Verify PostgreSQL service is running
- Check environment variables match database credentials
- Ensure database schema is initialized

### Wix can't connect?
- Verify API URL is correct (must be HTTPS)
- Check secret key matches
- Test API directly with curl first

## Cost

- **Free tier**: $5 credit/month
- **Hobby plan**: $5/month (if needed)
- **PostgreSQL**: Included in free tier

## Next Steps

1. ✅ API deployed to Railway
2. ✅ Database configured
3. ✅ Wix connected
4. ⬜ Test donation flow
5. ⬜ Monitor usage

## Additional Resources

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway





