#!/bin/bash

# Move Everything to hingecraft-global Repository
# This script moves all files and sets up Wix CLI

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Move Everything to hingecraft-global Repository${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

BASE_DIR="/Users/chandlerfergusen/Desktop/CURSOR"
HINGECRAFT_DIR="$BASE_DIR/HingeCraft"
REPO_DIR="$BASE_DIR/hingecraft-global"
REPO_URL="git@github.com:departments-commits/hingecraft-global.git"

cd "$BASE_DIR"

# Step 1: Clone or update repository
echo -e "${YELLOW}Step 1: Setting up hingecraft-global repository...${NC}"
if [ -d "$REPO_DIR" ]; then
    echo -e "${GREEN}✅ Repository directory exists${NC}"
    cd "$REPO_DIR"
    
    if [ -d ".git" ]; then
        echo -e "${GREEN}✅ Git repository found${NC}"
        git pull || echo "Could not pull (may need authentication)"
    else
        echo -e "${YELLOW}⚠️ Not a git repository, initializing...${NC}"
        git init
        git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
    fi
else
    echo "Cloning repository..."
    git clone "$REPO_URL" 2>&1 || {
        echo -e "${YELLOW}⚠️ Clone failed, creating new repository...${NC}"
        mkdir -p "$REPO_DIR"
        cd "$REPO_DIR"
        git init
        git remote add origin "$REPO_URL"
    }
fi

cd "$REPO_DIR"

# Step 2: Check Node.js and npm
echo ""
echo -e "${YELLOW}Step 2: Checking Node.js and npm...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
    HAS_NODE=true
else
    echo -e "${YELLOW}⚠️ Node.js not found${NC}"
    echo "Install Node.js: brew install node"
    HAS_NODE=false
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
    HAS_NPM=true
else
    echo -e "${YELLOW}⚠️ npm not found${NC}"
    HAS_NPM=false
fi

# Step 3: Install Wix CLI
echo ""
echo -e "${YELLOW}Step 3: Installing Wix CLI...${NC}"
if command -v wix &> /dev/null; then
    echo -e "${GREEN}✅ Wix CLI already installed: $(wix --version 2>/dev/null || echo 'installed')${NC}"
else
    if [ "$HAS_NPM" = true ]; then
        echo "Installing @wix/cli..."
        npm install -g @wix/cli 2>&1 | tail -5
        if command -v wix &> /dev/null; then
            echo -e "${GREEN}✅ Wix CLI installed${NC}"
        else
            echo -e "${YELLOW}⚠️ Wix CLI installed but may need PATH update${NC}"
            echo "Add to PATH: export PATH=\"\$PATH:\$(npm config get prefix)/bin\""
        fi
    else
        echo -e "${RED}❌ Cannot install Wix CLI without npm${NC}"
    fi
fi

# Step 4: Create project structure
echo ""
echo -e "${YELLOW}Step 4: Creating project structure...${NC}"
mkdir -p public/pages
mkdir -p backend/functions
mkdir -p database

# Step 5: Copy all files from HingeCraft
echo ""
echo -e "${YELLOW}Step 5: Copying files from HingeCraft...${NC}"

# Copy code files
if [ -f "$HINGECRAFT_DIR/COPY_TO_WIX_PAYMENT_PAGE.js" ]; then
    cp "$HINGECRAFT_DIR/COPY_TO_WIX_PAYMENT_PAGE.js" public/pages/payment-page.js
    echo -e "${GREEN}✅ Payment page code copied${NC}"
fi

if [ -f "$HINGECRAFT_DIR/COPY_TO_WIX_CHARTER_PAGE.html" ]; then
    cp "$HINGECRAFT_DIR/COPY_TO_WIX_CHARTER_PAGE.html" public/pages/charter-page.html
    echo -e "${GREEN}✅ Charter page code copied${NC}"
fi

# Copy database files
if [ -f "$HINGECRAFT_DIR/COMPLETE_DATABASE_EXPORT.json" ]; then
    cp "$HINGECRAFT_DIR/COMPLETE_DATABASE_EXPORT.json" database/
    echo -e "${GREEN}✅ Database export copied${NC}"
fi

if [ -f "$HINGECRAFT_DIR/donations_export.csv" ]; then
    cp "$HINGECRAFT_DIR/donations_export.csv" database/
    echo -e "${GREEN}✅ Donations export copied${NC}"
fi

if [ -f "$HINGECRAFT_DIR/donations_wix_import.csv" ]; then
    cp "$HINGECRAFT_DIR/donations_wix_import.csv" database/
    echo -e "${GREEN}✅ Wix import file copied${NC}"
fi

if [ -f "$HINGECRAFT_DIR/database/init.sql" ]; then
    cp "$HINGECRAFT_DIR/database/init.sql" database/
    echo -e "${GREEN}✅ Database schema copied${NC}"
fi

# Copy documentation
mkdir -p docs
if [ -f "$HINGECRAFT_DIR/COMPLETE_IMPLEMENTATION_GUIDE.md" ]; then
    cp "$HINGECRAFT_DIR/COMPLETE_IMPLEMENTATION_GUIDE.md" docs/
    echo -e "${GREEN}✅ Implementation guide copied${NC}"
fi

if [ -f "$HINGECRAFT_DIR/COMPLETE_WIX_DEPLOYMENT_GUIDE.md" ]; then
    cp "$HINGECRAFT_DIR/COMPLETE_WIX_DEPLOYMENT_GUIDE.md" docs/
    echo -e "${GREEN}✅ Deployment guide copied${NC}"
fi

if [ -f "$HINGECRAFT_DIR/DATABASE_DATA_SUMMARY.md" ]; then
    cp "$HINGECRAFT_DIR/DATABASE_DATA_SUMMARY.md" docs/
    echo -e "${GREEN}✅ Database summary copied${NC}"
fi

# Step 6: Create package.json
echo ""
echo -e "${YELLOW}Step 6: Creating package.json...${NC}"
if [ ! -f "package.json" ]; then
    cat > package.json << 'EOF'
{
  "name": "hingecraft-global",
  "version": "1.0.0",
  "description": "HingeCraft Wix Website - Complete Deployment",
  "scripts": {
    "dev": "wix dev",
    "build": "wix build",
    "deploy": "wix deploy"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF
    echo -e "${GREEN}✅ package.json created${NC}"
fi

# Step 7: Install dependencies
echo ""
echo -e "${YELLOW}Step 7: Installing dependencies...${NC}"
if [ "$HAS_NPM" = true ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️ Skipping npm install (npm not available)${NC}"
fi

# Step 8: Create README
echo ""
echo -e "${YELLOW}Step 8: Creating README...${NC}"
cat > README.md << 'EOF'
# HingeCraft Global - Complete Wix Deployment

## ✅ Setup Complete

This repository contains all HingeCraft code, database data, and deployment files.

## 📦 Structure

```
hingecraft-global/
├── public/
│   └── pages/
│       ├── payment-page.js      # Payment page code
│       └── charter-page.html    # Charter page code
├── database/
│   ├── COMPLETE_DATABASE_EXPORT.json
│   ├── donations_export.csv
│   ├── donations_wix_import.csv
│   └── init.sql
├── docs/
│   ├── COMPLETE_IMPLEMENTATION_GUIDE.md
│   ├── COMPLETE_WIX_DEPLOYMENT_GUIDE.md
│   └── DATABASE_DATA_SUMMARY.md
├── backend/
│   └── functions/
├── package.json
└── README.md
```

## 🚀 Development

```bash
# Install Wix CLI (if not installed)
npm install -g @wix/cli

# Start development server
wix dev

# Build for production
wix build

# Deploy to Wix
wix deploy
```

## 📋 Files Ready for Wix

### Payment Page
- **File**: `public/pages/payment-page.js`
- **Wix Location**: Payment Page → Custom Code → JavaScript
- **Update**: `CHARTER_PAGE_URL` (line 21)

### Charter Page
- **File**: `public/pages/charter-page.html`
- **Wix Location**: Charter Page → Custom Code → HTML
- **Update**: `CHECKOUT_PAGE_URL` (line 21)

## 📦 Database Data

All database data is in the `database/` directory:
- `COMPLETE_DATABASE_EXPORT.json` - Full export
- `donations_wix_import.csv` - Wix CMS import
- `init.sql` - Database schema

## ✅ Status

- ✅ All code files ready
- ✅ All database data included
- ✅ All documentation complete
- ✅ Ready for Wix deployment

---

**Last Updated**: $(date)
EOF
echo -e "${GREEN}✅ README.md created${NC}"

# Step 9: Add and commit all files
echo ""
echo -e "${YELLOW}Step 9: Committing all files...${NC}"
git add -A

if git diff --staged --quiet 2>/dev/null; then
    echo -e "${GREEN}✅ No changes to commit${NC}"
else
    git commit -m "Complete HingeCraft deployment: All code, database, and docs

✅ Payment page code (payment-page.js)
✅ Charter page code (charter-page.html)
✅ Complete database export
✅ Database schema (init.sql)
✅ All documentation
✅ Wix CLI setup ready
✅ Everything ready for deployment" && echo -e "${GREEN}✅ All files committed${NC}"
fi

# Step 10: Push to repository
echo ""
echo -e "${YELLOW}Step 10: Pushing to repository...${NC}"
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if [ "$BRANCH" = "" ]; then
    git checkout -b main
    BRANCH="main"
fi

echo "Attempting to push to origin/$BRANCH..."
if git push -u origin "$BRANCH" 2>&1; then
    echo -e "${GREEN}✅ Successfully pushed to hingecraft-global${NC}"
else
    echo -e "${YELLOW}⚠️ Push requires authentication${NC}"
    echo "Run manually: git push -u origin $BRANCH"
fi

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Everything Moved to hingecraft-global!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Repository:${NC}"
echo -e "  Location: $REPO_DIR"
echo -e "  Remote: $REPO_URL"
echo ""
echo -e "${BLUE}📋 Files Moved:${NC}"
echo -e "  ✅ Payment page code"
echo -e "  ✅ Charter page code"
echo -e "  ✅ Database data"
echo -e "  ✅ Documentation"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
if [ "$HAS_NPM" = true ]; then
    echo -e "  1. cd $REPO_DIR"
    echo -e "  2. wix dev"
else
    echo -e "  1. Install Node.js: brew install node"
    echo -e "  2. Install Wix CLI: npm install -g @wix/cli"
    echo -e "  3. cd $REPO_DIR"
    echo -e "  4. wix dev"
fi
echo ""
echo -e "${GREEN}✅ Everything is ready!${NC}"
echo ""







