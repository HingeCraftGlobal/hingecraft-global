#!/bin/bash

# Push to All CLIs - Complete Deployment Script
# Pushes to Google Apps Script (clasp) and HubSpot CLI

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  PUSH TO ALL CLIs - DEPLOYMENT${NC}"
echo -e "${CYAN}========================================${NC}\n"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GAS_DIR="$PROJECT_DIR/google-apps-script"

# 1. Push to Google Apps Script (clasp)
echo -e "${CYAN}[1/2] Pushing to Google Apps Script...${NC}"
cd "$GAS_DIR"

if command -v clasp &> /dev/null; then
    echo -e "${YELLOW}Checking clasp authentication...${NC}"
    if clasp login --status &> /dev/null; then
        echo -e "${GREEN}✓ clasp authenticated${NC}"
    else
        echo -e "${YELLOW}⚠ clasp not authenticated. Run: clasp login${NC}"
        read -p "Do you want to login now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            clasp login
        fi
    fi
    
    echo -e "${YELLOW}Pushing files to Google Apps Script...${NC}"
    if clasp push --force; then
        echo -e "${GREEN}✓ Google Apps Script push successful${NC}"
    else
        echo -e "${RED}✗ Google Apps Script push failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ clasp not installed. Install with: npm install -g @google/clasp${NC}"
    exit 1
fi

echo ""

# 2. Sync with HubSpot CLI
echo -e "${CYAN}[2/2] Syncing with HubSpot CLI...${NC}"
cd "$PROJECT_DIR"

if command -v hs &> /dev/null; then
    echo -e "${YELLOW}Checking HubSpot CLI authentication...${NC}"
    if hs accounts list &> /dev/null; then
        echo -e "${GREEN}✓ HubSpot CLI authenticated${NC}"
        
        # Run HubSpot sync script if it exists
        if [ -f "$PROJECT_DIR/scripts/automate-hubspot-setup.js" ]; then
            echo -e "${YELLOW}Running HubSpot property sync...${NC}"
            node scripts/automate-hubspot-setup.js
            echo -e "${GREEN}✓ HubSpot sync complete${NC}"
        else
            echo -e "${YELLOW}⚠ HubSpot sync script not found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ HubSpot CLI not authenticated. Run: hs init && hs accounts add${NC}"
    fi
else
    echo -e "${YELLOW}⚠ HubSpot CLI not installed. Install with: npm install -g @hubspot/cli${NC}"
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${CYAN}========================================${NC}\n"


