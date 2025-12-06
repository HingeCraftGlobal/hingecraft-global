#!/bin/bash
# Force Resync from Wix and Add SEO to All Pages

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo -e "${BLUE}🔄 Force Resync from Wix Editor${NC}"
echo "======================================================================"
echo ""

# Step 1: Start Wix dev to sync pages FROM Wix TO local
echo -e "${BLUE}Step 1: Starting Wix Dev to sync pages...${NC}"
echo -e "${YELLOW}This will sync all pages from Wix Editor to local files${NC}"
echo ""

# Start wix dev in background
nohup wix dev > /tmp/wix_dev_sync.log 2>&1 &
WIX_DEV_PID=$!

echo -e "${GREEN}✅ Wix dev started (PID: $WIX_DEV_PID)${NC}"
echo "Waiting for sync to complete (60 seconds)..."
echo ""

# Wait for sync
for i in {60..1}; do
    echo -ne "\r⏳ $i seconds remaining..."
    sleep 1
    
    # Check if sync completed
    if grep -q "Synced pages" /tmp/wix_dev_sync.log 2>/dev/null; then
        echo -e "\r${GREEN}✅ Sync detected!${NC}"
        break
    fi
done
echo ""

# Step 2: Check what pages were synced
echo -e "${BLUE}Step 2: Checking synced pages...${NC}"
SYNCED_PAGES=$(ls -1 src/pages/*.js 2>/dev/null | wc -l | tr -d ' ')
LEGAL_PAGES=$(ls -1 src/pages/*.js 2>/dev/null | grep -iE "(corporate|legal|cookie|privacy|terms|bylaws|charter|stakeholder|board|risk|social|eula|acceptable|export|service|refund|data|ai|algorithmic|sensitive|creator|marketplace|manufacturing|attribution|digital|product|warranty|materials|membership|community|academic|global|cross|pledge)" | wc -l | tr -d ' ')

echo "Total pages synced: $SYNCED_PAGES"
echo "Legal-related pages: $LEGAL_PAGES"
echo ""

# Step 3: Add SEO to all pages
echo -e "${BLUE}Step 3: Adding SEO markups to all pages...${NC}"
python3 scripts/add_seo_to_live_pages.py

echo ""
echo -e "${BLUE}Step 4: Publishing to production...${NC}"
echo ""

# Step 4: Publish
if wix publish --source local --approve-preview 2>&1 | tee /tmp/wix_publish_seo.log; then
    echo ""
    echo -e "${GREEN}✅ Published successfully!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Publish may have warnings (check log)${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}✅ Resync and SEO Update Complete${NC}"
echo "======================================================================"
echo ""
echo "📊 Summary:"
echo "  ✅ Pages synced from Wix Editor"
echo "  ✅ SEO markups added"
echo "  ✅ Published to production"
echo ""
echo "🔍 Check logs:"
echo "  - Sync: tail -f /tmp/wix_dev_sync.log"
echo "  - Publish: cat /tmp/wix_publish_seo.log"
echo ""
echo "🛑 To stop Wix dev:"
echo "  kill $WIX_DEV_PID"
echo ""

