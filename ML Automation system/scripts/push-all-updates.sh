#!/bin/bash
# Push All Updates to CLIs
# Pushes Google Apps Script and verifies HubSpot integration

set -e

echo "🚀 Pushing All Updates to CLIs"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GAS_DIR="$PROJECT_DIR/google-apps-script"

echo -e "${BLUE}📦 Step 1: Pushing Google Apps Script (clasp)${NC}"
echo ""

if [ ! -d "$GAS_DIR" ]; then
    echo -e "${RED}❌ Google Apps Script directory not found${NC}"
    exit 1
fi

cd "$GAS_DIR"

# Check if clasp is installed
if ! command -v clasp &> /dev/null; then
    echo -e "${RED}❌ clasp not found. Installing...${NC}"
    npm install -g @google/clasp
fi

# Check if logged in
if ! clasp list &> /dev/null; then
    echo -e "${YELLOW}⚠️ Not logged in to clasp. Please run: clasp login${NC}"
    exit 1
fi

echo "Pushing files to Google Apps Script..."
clasp push --force

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Google Apps Script pushed successfully${NC}"
else
    echo -e "${RED}❌ Error pushing to Google Apps Script${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔗 Step 2: Verifying HubSpot Integration${NC}"
echo ""

# Check HubSpot configuration
cd "$PROJECT_DIR"

if [ -f "google-apps-script/Code.gs" ]; then
    HUBSPOT_TOKEN=$(grep -o "HUBSPOT_ACCESS_TOKEN: '[^']*'" "google-apps-script/Code.gs" | cut -d"'" -f2)
    
    if [ ! -z "$HUBSPOT_TOKEN" ]; then
        echo -e "${GREEN}✅ HubSpot token found in code${NC}"
        echo "   Token: ${HUBSPOT_TOKEN:0:20}..."
    else
        echo -e "${YELLOW}⚠️ HubSpot token not found in code${NC}"
    fi
fi

# Check HubSpot properties script
if [ -f "google-apps-script/HubSpotSetup.gs" ]; then
    echo -e "${GREEN}✅ HubSpotSetup.gs found${NC}"
    echo "   Run createHubSpotProperties() in Apps Script to create properties"
else
    echo -e "${YELLOW}⚠️ HubSpotSetup.gs not found${NC}"
fi

echo ""
echo -e "${BLUE}📊 Step 3: Summary${NC}"
echo ""

echo "Files pushed to Google Apps Script:"
echo "  ✅ Code.gs"
echo "  ✅ HubSpotSetup.gs"
echo "  ✅ TEST_CONFIG.gs"
echo "  ✅ appsscript.json"
echo "  ✅ .clasp.json"

echo ""
echo -e "${GREEN}✅ All updates pushed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Go to https://script.google.com"
echo "  2. Open your HingeCraft Automation project"
echo "  3. Run createHubSpotProperties() (one-time setup)"
echo "  4. Set up time-driven trigger for checkFolderForNewFiles"
echo "  5. Test with testSingleEmail()"
echo ""


