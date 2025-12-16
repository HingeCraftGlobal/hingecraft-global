# HingeCraft Wix Setup Guide

## Repository Information

**Repository**: `https://github.com/departments-commits/hingecraft-global.git`  
**Clone Command**: `gh repo clone departments-commits/hingecraft-global`

## Initial Setup

### Step 1: Install Wix CLI

```bash
npm install -g @wix/cli
```

### Step 2: Clone Repository

```bash
# Option 1: Using GitHub CLI
gh repo clone departments-commits/hingecraft-global

# Option 2: Using Git
git clone git@github.com:departments-commits/hingecraft-global.git

# Navigate to project
cd hingecraft-global
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start Development Server

```bash
wix dev
```

## External Database Adaptor Configuration

### Database Connection Setup

1. **Go to Wix Editor** → **Database** → **External Database**
2. **Choose**: Custom
3. **Enter Configuration**:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev` (use ngrok HTTPS URL, NOT localhost)
   - **Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`
   
   **⚠️ IMPORTANT**: Wix requires HTTPS. Use ngrok tunnel or production URL. Localhost will NOT work.

### Configuration Values

Update these in `velo-backend-api.js`:

```javascript
const EXTERNAL_DB_ENDPOINT = 'YOUR_EXTERNAL_DB_ADAPTOR_ENDPOINT_URL';
const EXTERNAL_DB_SECRET_KEY = 'YOUR_EXTERNAL_DB_ADAPTOR_SECRET_KEY';
const USE_EXTERNAL_DB = true;
```

## Project Structure

```
hingecraft-global/
├── backend/
│   └── hingecraft-api.jsw          # Backend API (velo-backend-api.js)
├── public/
│   ├── charter-page.html            # Charter page
│   └── payment-page-integration.js  # Payment page code
├── database/
│   └── schema.sql                   # SQL database schema
└── package.json
```





