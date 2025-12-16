#!/bin/bash

# Quick Wix CLI Setup Script
# This script helps set up Wix CLI development environment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Quick Wix CLI Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Install Node.js: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git installed: $GIT_VERSION${NC}"
else
    echo -e "${RED}❌ Git not found${NC}"
    exit 1
fi

echo ""

# Step 1: Install Wix CLI
echo -e "${YELLOW}Step 1: Installing Wix CLI...${NC}"
if command -v wix &> /dev/null; then
    WIX_VERSION=$(wix --version 2>/dev/null || echo "installed")
    echo -e "${GREEN}✅ Wix CLI already installed: $WIX_VERSION${NC}"
else
    echo "Installing @wix/cli..."
    npm install -g @wix/cli
    if command -v wix &> /dev/null; then
        echo -e "${GREEN}✅ Wix CLI installed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️ Wix CLI installed but not in PATH${NC}"
        echo "   Try: export PATH=\"\$PATH:\$(npm config get prefix)/bin\""
    fi
fi

echo ""

# Step 2: Check/Create repository directory
echo -e "${YELLOW}Step 2: Setting up repository...${NC}"
cd [PROJECT_ROOT]

if [ -d "hingecraft-global" ]; then
    echo -e "${GREEN}✅ Repository directory exists${NC}"
    cd hingecraft-global
else
    echo -e "${YELLOW}⚠️ Repository not found${NC}"
    echo ""
    echo "To clone repository, run:"
    echo "  git clone git@github.com:departments-commits/hingecraft-global.git"
    echo ""
    echo "Or create directory manually:"
    read -p "Create directory now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p hingecraft-global
        cd hingecraft-global
        echo -e "${GREEN}✅ Directory created${NC}"
    else
        echo "Skipping repository setup"
        exit 0
    fi
fi

# Step 3: Create package.json if needed
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}Creating package.json...${NC}"
    cat > package.json << 'EOF'
{
  "name": "hingecraft-global",
  "version": "1.0.0",
  "description": "HingeCraft Wix Website",
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

# Step 4: Install dependencies
echo ""
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Create directory structure
echo ""
echo -e "${YELLOW}Step 4: Creating directory structure...${NC}"
mkdir -p public/pages
mkdir -p backend/functions
echo -e "${GREEN}✅ Directory structure created${NC}"

# Step 6: Copy code files
echo ""
echo -e "${YELLOW}Step 5: Copying code files...${NC}"
if [ -f "../HingeCraft/COPY_TO_WIX_PAYMENT_PAGE.js" ]; then
    cp ../HingeCraft/COPY_TO_WIX_PAYMENT_PAGE.js public/pages/payment-page.js
    echo -e "${GREEN}✅ Payment page code copied${NC}"
else
    echo -e "${YELLOW}⚠️ Payment page code not found${NC}"
fi

if [ -f "../HingeCraft/COPY_TO_WIX_CHARTER_PAGE.html" ]; then
    cp ../HingeCraft/COPY_TO_WIX_CHARTER_PAGE.html public/pages/charter-page.html
    echo -e "${GREEN}✅ Charter page code copied${NC}"
else
    echo -e "${YELLOW}⚠️ Charter page code not found${NC}"
fi

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Project Structure:${NC}"
ls -la public/pages/ 2>/dev/null || echo "  (files will be here)"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. cd hingecraft-global"
echo -e "  2. wix dev"
echo ""
echo -e "${GREEN}✅ Ready to run 'wix dev'!${NC}"
echo ""







