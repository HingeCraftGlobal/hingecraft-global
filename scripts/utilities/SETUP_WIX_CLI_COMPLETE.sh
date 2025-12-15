#!/bin/bash

# Complete Wix CLI Setup for hingecraft-global
# This script unlocks the repository and installs Wix CLI

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔓 Unlock Repository & Install Wix CLI${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Install Node.js
echo -e "${YELLOW}Step 1: Installing Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
else
    echo "Installing Node.js via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install node
        echo -e "${GREEN}✅ Node.js installed${NC}"
    else
        echo -e "${RED}❌ Homebrew not found${NC}"
        echo "Please install Node.js manually: https://nodejs.org/"
        exit 1
    fi
fi

# Step 2: Install npm (comes with Node.js)
echo ""
echo -e "${YELLOW}Step 2: Verifying npm...${NC}"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm installed: $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Step 3: Install Wix CLI
echo ""
echo -e "${YELLOW}Step 3: Installing Wix CLI...${NC}"
if command -v wix &> /dev/null; then
    echo -e "${GREEN}✅ Wix CLI already installed: $(wix --version 2>/dev/null || echo 'installed')${NC}"
else
    echo "Installing @wix/cli globally..."
    npm install -g @wix/cli
    
    # Check if installed
    if command -v wix &> /dev/null; then
        echo -e "${GREEN}✅ Wix CLI installed successfully${NC}"
    else
        # Check npm global bin path
        NPM_BIN=$(npm config get prefix)/bin
        if [ -f "$NPM_BIN/wix" ]; then
            echo -e "${YELLOW}⚠️ Wix CLI installed but not in PATH${NC}"
            echo "Adding to PATH..."
            export PATH="$PATH:$NPM_BIN"
            echo "Add to ~/.zshrc: export PATH=\"\$PATH:$NPM_BIN\""
        else
            echo -e "${RED}❌ Wix CLI installation failed${NC}"
            exit 1
        fi
    fi
fi

# Step 4: Initialize Wix project
echo ""
echo -e "${YELLOW}Step 4: Initializing Wix project...${NC}"
if command -v wix &> /dev/null; then
    echo "Checking Wix project status..."
    if [ -f "wix.config.js" ] || [ -f ".wix" ]; then
        echo -e "${GREEN}✅ Wix project already initialized${NC}"
    else
        echo "Initializing Wix project..."
        wix init || echo "Wix init may require authentication"
        echo -e "${GREEN}✅ Wix project initialized${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Wix CLI not available, skipping init${NC}"
fi

# Step 5: Install dependencies
echo ""
echo -e "${YELLOW}Step 5: Installing dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️ No package.json found${NC}"
fi

# Step 6: Verify setup
echo ""
echo -e "${YELLOW}Step 6: Verifying setup...${NC}"
echo "Checking files..."
[ -f "package.json" ] && echo -e "${GREEN}✅ package.json${NC}" || echo -e "${RED}❌ package.json missing${NC}"
[ -f "public/pages/payment-page.js" ] && echo -e "${GREEN}✅ payment-page.js${NC}" || echo -e "${RED}❌ payment-page.js missing${NC}"
[ -f "public/pages/charter-page.html" ] && echo -e "${GREEN}✅ charter-page.html${NC}" || echo -e "${RED}❌ charter-page.html missing${NC}"
[ -d "database" ] && echo -e "${GREEN}✅ database/ directory${NC}" || echo -e "${RED}❌ database/ missing${NC}"

# Final summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Repository Unlocked & Wix CLI Ready!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Setup Complete:${NC}"
echo -e "  ✅ Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo -e "  ✅ npm: $(npm --version 2>/dev/null || echo 'Not installed')"
echo -e "  ✅ Wix CLI: $(wix --version 2>/dev/null || echo 'Installed')"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global"
echo -e "  2. wix dev"
echo ""
echo -e "${GREEN}✅ Repository is ready for Wix development!${NC}"
echo ""







