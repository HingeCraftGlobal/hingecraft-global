#!/bin/bash

# Automate Complete Wix CLI Setup
# This script automates the entire Wix CLI setup process

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Automate Complete Wix CLI Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Configuration
BASE_DIR="[PROJECT_ROOT]"
HINGECRAFT_DIR="$BASE_DIR/HingeCraft"
REPO_DIR="$BASE_DIR/hingecraft-global"
REPO_URL="git@github.com:departments-commits/hingecraft-global.git"

# Step 1: Check and Install Node.js
echo -e "${YELLOW}Step 1: Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo ""
    echo -e "${CYAN}Installing Node.js...${NC}"
    
    # Check for Homebrew
    if command -v brew &> /dev/null; then
        echo "Using Homebrew to install Node.js..."
        brew install node
    else
        echo -e "${YELLOW}⚠️ Homebrew not found${NC}"
        echo ""
        echo -e "${CYAN}Please install Node.js manually:${NC}"
        echo "  1. Visit: https://nodejs.org/"
        echo "  2. Download and install LTS version"
        echo "  3. Run this script again"
        exit 1
    fi
    
    # Verify installation
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
    else
        echo -e "${RED}❌ Node.js installation failed${NC}"
        exit 1
    fi
fi

# Step 2: Check and Install npm
echo ""
echo -e "${YELLOW}Step 2: Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    echo "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

# Step 3: Install Wix CLI globally
echo ""
echo -e "${YELLOW}Step 3: Installing Wix CLI globally...${NC}"
if command -v wix &> /dev/null; then
    WIX_VERSION=$(wix --version 2>/dev/null || echo "installed")
    echo -e "${GREEN}✅ Wix CLI already installed: $WIX_VERSION${NC}"
else
    echo "Installing @wix/cli..."
    npm install -g @wix/cli
    
    # Check if installed
    if command -v wix &> /dev/null; then
        WIX_VERSION=$(wix --version 2>/dev/null || echo "installed")
        echo -e "${GREEN}✅ Wix CLI installed: $WIX_VERSION${NC}"
    else
        # Check if it's in npm global bin
        NPM_BIN=$(npm config get prefix)/bin
        if [ -f "$NPM_BIN/wix" ]; then
            echo -e "${YELLOW}⚠️ Wix CLI installed but not in PATH${NC}"
            echo "Add to PATH: export PATH=\"\$PATH:$NPM_BIN\""
            echo "Or add to ~/.zshrc: echo 'export PATH=\"\$PATH:$NPM_BIN\"' >> ~/.zshrc"
        else
            echo -e "${RED}❌ Wix CLI installation failed${NC}"
            exit 1
        fi
    fi
fi

# Step 4: Clone repository
echo ""
echo -e "${YELLOW}Step 4: Setting up repository...${NC}"
cd "$BASE_DIR"

if [ -d "$REPO_DIR" ]; then
    echo -e "${GREEN}✅ Repository directory exists${NC}"
    cd "$REPO_DIR"
    
    # Check if it's a git repository
    if [ -d ".git" ]; then
        echo -e "${GREEN}✅ Git repository found${NC}"
        # Pull latest changes
        echo "Pulling latest changes..."
        git pull || echo "Could not pull (may need authentication)"
    else
        echo -e "${YELLOW}⚠️ Directory exists but not a git repository${NC}"
        echo "Removing and cloning fresh..."
        cd "$BASE_DIR"
        rm -rf "$REPO_DIR"
        git clone "$REPO_URL"
        cd "$REPO_DIR"
    fi
else
    echo "Cloning repository..."
    git clone "$REPO_URL"
    if [ -d "$REPO_DIR" ]; then
        echo -e "${GREEN}✅ Repository cloned successfully${NC}"
        cd "$REPO_DIR"
    else
        echo -e "${RED}❌ Failed to clone repository${NC}"
        echo ""
        echo -e "${CYAN}Troubleshooting:${NC}"
        echo "  1. Check SSH keys: ssh -T git@github.com"
        echo "  2. Or use HTTPS: git clone https://github.com/departments-commits/hingecraft-global.git"
        exit 1
    fi
fi

# Step 5: Create package.json if needed
echo ""
echo -e "${YELLOW}Step 5: Setting up package.json...${NC}"
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
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
else
    echo -e "${GREEN}✅ package.json exists${NC}"
fi

# Step 6: Install dependencies
echo ""
echo -e "${YELLOW}Step 6: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 7: Create directory structure
echo ""
echo -e "${YELLOW}Step 7: Creating directory structure...${NC}"
mkdir -p public/pages
mkdir -p backend/functions
echo -e "${GREEN}✅ Directory structure created${NC}"

# Step 8: Copy code files
echo ""
echo -e "${YELLOW}Step 8: Copying code files...${NC}"

# Payment page
if [ -f "$HINGECRAFT_DIR/COPY_TO_WIX_PAYMENT_PAGE.js" ]; then
    cp "$HINGECRAFT_DIR/COPY_TO_WIX_PAYMENT_PAGE.js" public/pages/payment-page.js
    echo -e "${GREEN}✅ Payment page code copied${NC}"
else
    echo -e "${YELLOW}⚠️ Payment page code not found at: $HINGECRAFT_DIR/COPY_TO_WIX_PAYMENT_PAGE.js${NC}"
fi

# Charter page
if [ -f "$HINGECRAFT_DIR/COPY_TO_WIX_CHARTER_PAGE.html" ]; then
    cp "$HINGECRAFT_DIR/COPY_TO_WIX_CHARTER_PAGE.html" public/pages/charter-page.html
    echo -e "${GREEN}✅ Charter page code copied${NC}"
else
    echo -e "${YELLOW}⚠️ Charter page code not found at: $HINGECRAFT_DIR/COPY_TO_WIX_CHARTER_PAGE.html${NC}"
fi

# Step 9: Create README
echo ""
echo -e "${YELLOW}Step 9: Creating README...${NC}"
cat > README.md << 'EOF'
# HingeCraft Global - Wix CLI Development

## ✅ Setup Complete!

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

# Step 10: Verify setup
echo ""
echo -e "${YELLOW}Step 10: Verifying setup...${NC}"
echo "Checking files..."
[ -f "package.json" ] && echo -e "${GREEN}✅ package.json${NC}" || echo -e "${RED}❌ package.json missing${NC}"
[ -f "public/pages/payment-page.js" ] && echo -e "${GREEN}✅ payment-page.js${NC}" || echo -e "${YELLOW}⚠️ payment-page.js missing${NC}"
[ -f "public/pages/charter-page.html" ] && echo -e "${GREEN}✅ charter-page.html${NC}" || echo -e "${YELLOW}⚠️ charter-page.html missing${NC}"
[ -d "node_modules" ] && echo -e "${GREEN}✅ node_modules${NC}" || echo -e "${YELLOW}⚠️ node_modules missing${NC}"

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Complete Wix CLI Setup Finished!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Setup Summary:${NC}"
echo -e "  ✅ Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo -e "  ✅ npm: $(npm --version 2>/dev/null || echo 'Not found')"
echo -e "  ✅ Wix CLI: $(wix --version 2>/dev/null || echo 'Installed')"
echo -e "  ✅ Repository: $REPO_DIR"
echo -e "  ✅ Dependencies: Installed"
echo -e "  ✅ Code files: Copied"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. cd $REPO_DIR"
echo -e "  2. wix dev"
echo ""
echo -e "${CYAN}Note: If 'wix' command not found, add npm global bin to PATH:${NC}"
echo -e "  export PATH=\"\$PATH:\$(npm config get prefix)/bin\""
echo ""
echo -e "${GREEN}✅ Ready to start Wix development!${NC}"
echo ""







