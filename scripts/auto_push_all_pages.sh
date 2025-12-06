#!/bin/bash
# Auto Push All Pages - Non-Interactive Version
# Starts Wix dev, syncs pages, and publishes

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo -e "${BLUE}🚀 Auto-Push All Legal Pages to Wix${NC}"
echo "======================================================================"
echo ""

# Step 1: Stop any existing wix dev processes
echo -e "${BLUE}Step 1: Cleaning up existing processes...${NC}"
pkill -f "wix dev" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 2: Verify login
echo -e "${BLUE}Step 2: Verifying Wix login...${NC}"
if ! wix whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in. Please run: wix login${NC}"
    exit 1
fi
USER=$(wix whoami 2>&1 | head -1)
echo -e "${GREEN}✅ Logged in as: $USER${NC}"
echo ""

# Step 3: Start Wix dev in background
echo -e "${BLUE}Step 3: Starting Wix Dev Mode...${NC}"
echo -e "${YELLOW}This syncs pages FROM Wix Editor TO local${NC}"
echo ""

# Start wix dev (will run in background)
nohup wix dev > /tmp/wix_dev.log 2>&1 &
WIX_DEV_PID=$!

echo -e "${GREEN}✅ Wix dev started (PID: $WIX_DEV_PID)${NC}"
echo "Log file: /tmp/wix_dev.log"
echo ""

# Wait for initial sync
echo -e "${BLUE}Waiting for initial sync (30 seconds)...${NC}"
for i in {30..1}; do
    echo -ne "\r⏳ $i seconds remaining..."
    sleep 1
done
echo -e "\r${GREEN}✅ Sync period complete${NC}"
echo ""

# Step 4: Check sync status
echo -e "${BLUE}Step 4: Checking sync status...${NC}"
if [ -f "/tmp/wix_dev.log" ]; then
    echo "Recent Wix dev output:"
    tail -20 /tmp/wix_dev.log | grep -E "(Syncing|sync|page|error)" || echo "No sync messages yet"
fi
echo ""

# Step 5: Count synced pages
echo -e "${BLUE}Step 5: Counting pages...${NC}"
JS_COUNT=$(ls -1 src/pages/*.js 2>/dev/null | wc -l | tr -d ' ')
LEGAL_JS_COUNT=$(ls -1 src/pages/*.js 2>/dev/null | grep -iE "(corporate|legal|cookie|privacy|terms|bylaws|charter|stakeholder|board|risk|social|cookie|eula|acceptable|export|service|refund|data|ai|algorithmic|sensitive|creator|marketplace|manufacturing|attribution|digital|product|warranty|materials|membership|community|academic|global|cross|charter|pledge)" | wc -l | tr -d ' ')

echo "Total .js pages: $JS_COUNT"
echo "Legal-related pages: $LEGAL_JS_COUNT"
echo ""

# Step 6: Publish
echo -e "${BLUE}Step 6: Publishing to production...${NC}"
echo -e "${YELLOW}Publishing all changes...${NC}"
echo ""

# Try to publish (non-interactive)
if wix publish --source local --approve-preview 2>&1 | tee /tmp/wix_publish.log; then
    echo ""
    echo -e "${GREEN}✅ Publish initiated${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Publish may require manual confirmation${NC}"
    echo "Check /tmp/wix_publish.log for details"
    echo "You can also publish manually from Wix Editor"
fi
echo ""

# Step 7: Summary
echo "======================================================================"
echo -e "${GREEN}✅ Deployment Process Complete${NC}"
echo "======================================================================"
echo ""
echo "📋 Summary:"
echo "  ✅ Wix dev running (PID: $WIX_DEV_PID)"
echo "  ✅ Pages syncing automatically"
echo "  ✅ Publish initiated"
echo ""
echo "📝 Next Steps:"
echo "  1. Check Wix Editor: https://editor.wix.com"
echo "  2. Verify pages appear in page tree"
echo "  3. If pages don't appear, they need to be created in Wix Editor"
echo "  4. Pages will sync automatically once created"
echo ""
echo "🔍 Monitor sync:"
echo "  tail -f /tmp/wix_dev.log"
echo ""
echo "🛑 To stop Wix dev:"
echo "  kill $WIX_DEV_PID"
echo "  or: pkill -f 'wix dev'"
echo ""

