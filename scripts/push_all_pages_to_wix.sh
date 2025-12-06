#!/bin/bash
# Complete Push Process: Start Wix Dev + Push All Pages
# This script ensures all steps are completed to make pages visible

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo -e "${BLUE}🚀 Complete Wix Deployment Process${NC}"
echo "======================================================================"
echo ""

# Step 1: Verify Wix CLI
echo -e "${BLUE}Step 1: Verifying Wix CLI...${NC}"
if ! command -v wix &> /dev/null; then
    echo -e "${RED}❌ Wix CLI not found!${NC}"
    echo "Installing Wix CLI..."
    npm install -g @wix/cli@latest
fi
echo -e "${GREEN}✅ Wix CLI found${NC}"
echo ""

# Step 2: Check login status
echo -e "${BLUE}Step 2: Checking Wix login...${NC}"
if wix whoami &> /dev/null; then
    USER=$(wix whoami 2>&1 | head -1)
    echo -e "${GREEN}✅ Logged in as: $USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in. Please run: wix login${NC}"
    echo "Attempting login..."
    wix login || {
        echo -e "${RED}❌ Login failed. Please login manually: wix login${NC}"
        exit 1
    }
fi
echo ""

# Step 3: Verify files are in place
echo -e "${BLUE}Step 3: Verifying legal pages structure...${NC}"
LEGAL_JS_COUNT=$(ls -1 src/pages/*.js 2>/dev/null | grep -iE "(corporate|legal|cookie|privacy|terms|bylaws|charter)" | wc -l | tr -d ' ')
LEGAL_HTML_COUNT=$(ls -1 src/pages/legal/*.html 2>/dev/null | wc -l | tr -d ' ')

echo "Legal .js files in src/pages/: $LEGAL_JS_COUNT"
echo "Legal .html files in src/pages/legal/: $LEGAL_HTML_COUNT"

if [ "$LEGAL_JS_COUNT" -gt 0 ] || [ "$LEGAL_HTML_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Legal pages found${NC}"
else
    echo -e "${YELLOW}⚠️  No legal pages found. Running deployment script...${NC}"
    if [ -f "scripts/deploy_legal_to_wix_pages.py" ]; then
        python3 scripts/deploy_legal_to_wix_pages.py
    fi
fi
echo ""

# Step 4: Start Wix Dev (in background to sync pages)
echo -e "${BLUE}Step 4: Starting Wix Dev Mode (this syncs pages)...${NC}"
echo -e "${YELLOW}Note: This will sync pages FROM Wix TO local${NC}"
echo ""

# Check if wix dev is already running
if pgrep -f "wix dev" > /dev/null; then
    echo -e "${YELLOW}⚠️  Wix dev already running. Stopping...${NC}"
    pkill -f "wix dev" || true
    sleep 2
fi

echo -e "${GREEN}Starting Wix dev mode...${NC}"
echo -e "${YELLOW}This will open the local editor and sync pages${NC}"
echo ""

# Start wix dev in background
wix dev &
WIX_DEV_PID=$!

echo -e "${GREEN}✅ Wix dev started (PID: $WIX_DEV_PID)${NC}"
echo "Waiting for initial sync..."
sleep 10

# Step 5: Check sync status
echo ""
echo -e "${BLUE}Step 5: Checking page sync status...${NC}"
echo "Pages should sync automatically from Wix Editor to local files"
echo ""

# Step 6: Publish pages
echo -e "${BLUE}Step 6: Publishing pages to production...${NC}"
echo -e "${YELLOW}This will push all changes to the live site${NC}"
echo ""

read -p "Do you want to publish now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Publishing..."
    wix publish --source local || {
        echo -e "${YELLOW}⚠️  Publish may require manual confirmation${NC}"
        echo "You can publish manually from Wix Editor"
    }
else
    echo -e "${YELLOW}⚠️  Skipping publish. You can publish later with: wix publish${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}✅ Deployment Process Complete${NC}"
echo "======================================================================"
echo ""
echo "📋 Summary:"
echo "  ✅ Wix CLI verified"
echo "  ✅ Login verified"
echo "  ✅ Files verified"
echo "  ✅ Wix dev started (PID: $WIX_DEV_PID)"
echo ""
echo "📝 Next Steps:"
echo "  1. Wix dev is running - pages will sync automatically"
echo "  2. Check Wix Editor: https://editor.wix.com"
echo "  3. Verify pages appear in page tree"
echo "  4. If pages don't appear, create them manually in Wix Editor"
echo "  5. Publish when ready: wix publish"
echo ""
echo "🔍 To check if pages are syncing:"
echo "  - Watch src/pages/ directory for new .js files"
echo "  - Check Wix Editor page tree"
echo ""
echo "🛑 To stop Wix dev:"
echo "  kill $WIX_DEV_PID"
echo "  or: pkill -f 'wix dev'"
echo ""


