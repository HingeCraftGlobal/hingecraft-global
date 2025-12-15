#!/bin/bash
# Setup Tracking System
# Configures GA4 tracking and deploys Web App

set -e

echo "📊 Setting Up Tracking System"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GAS_DIR="$PROJECT_DIR/google-apps-script"

echo -e "${BLUE}Step 1: Verifying Tracking.gs exists...${NC}"
if [ -f "$GAS_DIR/Tracking.gs" ]; then
    echo -e "${GREEN}✅ Tracking.gs found${NC}"
else
    echo -e "${YELLOW}⚠️ Tracking.gs not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Pushing tracking code to Apps Script...${NC}"
cd "$GAS_DIR"
if clasp push --force 2>&1 | grep -q "Pushed"; then
    echo -e "${GREEN}✅ Tracking code pushed${NC}"
else
    echo -e "${YELLOW}⚠️ Push had issues - check output${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Configuration Instructions${NC}"
echo ""
echo "📝 MANUAL STEPS REQUIRED:"
echo ""
echo "1. Add GA4 Properties to Script Properties:"
echo "   - Go to Apps Script → Project Settings → Script Properties"
echo "   - Add: GA4_MEASUREMENT_ID = G-QF5H2Q291T"
echo "   - Add: GA4_API_SECRET = cJH76-IHQteQx6DKaiPkGA"
echo "   - Add: GA4_STREAM_ID = 13142410458"
echo "   - Add: GA4_STREAM_URL = https://hingecraft-global.ai"
echo ""
echo "2. Deploy Web App:"
echo "   - Go to Apps Script → Deploy → New deployment"
echo "   - Type: Web app"
echo "   - Execute as: Me"
echo "   - Access: Anyone"
echo "   - Click Deploy"
echo "   - Copy Web App URL"
echo "   - Add to Script Properties: TRACKING_ENDPOINT_URL = [URL]"
echo ""
echo "3. Create HubSpot Properties:"
echo "   - Run createHubSpotProperties() in Apps Script"
echo "   - This creates: total_emails_opened, total_clicks, sequence_replied"
echo ""
echo "4. Test Tracking:"
echo "   - Send test email (testSingleEmail)"
echo "   - Open email → Check GA4 Realtime"
echo "   - Click link → Check GA4 Realtime"
echo ""

echo -e "${GREEN}✅ Setup instructions provided${NC}"
echo ""
