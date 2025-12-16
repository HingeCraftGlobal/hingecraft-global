#!/bin/bash

# Setup Wix CLI Development Environment
# This script sets up Wix CLI and prepares the code for wix dev

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Setting Up Wix CLI Development Environment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Install Wix CLI globally
echo -e "${YELLOW}Step 1: Installing Wix CLI globally...${NC}"
if command -v wix &> /dev/null; then
    echo -e "${GREEN}✅ Wix CLI already installed${NC}"
    wix --version
else
    echo "Installing @wix/cli..."
    npm install -g @wix/cli
    if command -v wix &> /dev/null; then
        echo -e "${GREEN}✅ Wix CLI installed successfully${NC}"
        wix --version
    else
        echo -e "${RED}❌ Failed to install Wix CLI${NC}"
        exit 1
    fi
fi

# Step 2: Clone repository
echo ""
echo -e "${YELLOW}Step 2: Cloning hingecraft-global repository...${NC}"
cd [PROJECT_ROOT]

if [ -d "hingecraft-global" ]; then
    echo -e "${GREEN}✅ Repository already exists${NC}"
    cd hingecraft-global
    git pull || echo "Could not pull latest changes"
else
    echo "Cloning repository..."
    git clone git@github.com:departments-commits/hingecraft-global.git
    if [ -d "hingecraft-global" ]; then
        echo -e "${GREEN}✅ Repository cloned successfully${NC}"
        cd hingecraft-global
    else
        echo -e "${RED}❌ Failed to clone repository${NC}"
        exit 1
    fi
fi

# Step 3: Install dependencies
echo ""
echo -e "${YELLOW}Step 3: Installing npm dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️ No package.json found, creating one...${NC}"
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
    npm install
    echo -e "${GREEN}✅ package.json created and dependencies installed${NC}"
fi

# Step 4: Create Wix project structure
echo ""
echo -e "${YELLOW}Step 4: Setting up Wix project structure...${NC}"

# Create directories
mkdir -p public/pages
mkdir -p backend/functions

# Copy payment page code
if [ -f "../HingeCraft/COPY_TO_WIX_PAYMENT_PAGE.js" ]; then
    cp ../HingeCraft/COPY_TO_WIX_PAYMENT_PAGE.js public/pages/payment-page.js
    echo -e "${GREEN}✅ Payment page code copied${NC}"
else
    echo -e "${YELLOW}⚠️ Payment page code not found${NC}"
fi

# Copy charter page code
if [ -f "../HingeCraft/COPY_TO_WIX_CHARTER_PAGE.html" ]; then
    cp ../HingeCraft/COPY_TO_WIX_CHARTER_PAGE.html public/pages/charter-page.html
    echo -e "${GREEN}✅ Charter page code copied${NC}"
else
    echo -e "${YELLOW}⚠️ Charter page code not found${NC}"
fi

# Step 5: Create wix.config.js if needed
if [ ! -f "wix.config.js" ]; then
    cat > wix.config.js << 'EOF'
// Wix CLI Configuration
export default {
  // Project configuration
  projectName: 'hingecraft-global',
  
  // Pages configuration
  pages: {
    'payment-page': {
      path: 'public/pages/payment-page.js',
      type: 'javascript'
    },
    'charter-page': {
      path: 'public/pages/charter-page.html',
      type: 'html'
    }
  }
};
EOF
    echo -e "${GREEN}✅ wix.config.js created${NC}"
fi

# Step 6: Create README
cat > README.md << 'EOF'
# HingeCraft Global - Wix CLI Development

## Setup Complete ✅

This project is set up for Wix CLI development.

## Files Structure

```
hingecraft-global/
├── public/
│   └── pages/
│       ├── payment-page.js      # Payment page integration
│       └── charter-page.html    # Charter page integration
├── backend/
│   └── functions/               # Backend functions (if needed)
├── package.json
├── wix.config.js
└── README.md
```

## Development Commands

```bash
# Start development server
wix dev

# Build for production
wix build

# Deploy to Wix
wix deploy
```

## Code Files

### Payment Page
- **File**: `public/pages/payment-page.js`
- **Wix Location**: Payment Page → Custom Code → JavaScript
- **Flow**: Payment Page → Charter Page → Checkout

### Charter Page
- **File**: `public/pages/charter-page.html`
- **Wix Location**: Charter Page → Custom Code → HTML
- **Features**: Displays donation amount, updates contributions, checkout button

## Configuration

Update these URLs in the code files if needed:
- Payment Page (line 21): `CHARTER_PAGE_URL: '/charter'`
- Charter Page (line 21): `CHECKOUT_PAGE_URL: '/checkout'`

## Next Steps

1. Run `wix dev` to start development server
2. Make changes to code files
3. Test in Wix development environment
4. Deploy when ready
EOF

echo -e "${GREEN}✅ README.md created${NC}"

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Wix CLI Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Project Structure:${NC}"
echo -e "  ✅ Wix CLI installed"
echo -e "  ✅ Repository cloned"
echo -e "  ✅ Dependencies installed"
echo -e "  ✅ Code files copied"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. cd hingecraft-global"
echo -e "  2. wix dev"
echo -e "  3. Make changes to code files"
echo -e "  4. Test in Wix development environment"
echo ""
echo -e "${GREEN}✅ Ready to run 'wix dev'!${NC}"
echo ""







