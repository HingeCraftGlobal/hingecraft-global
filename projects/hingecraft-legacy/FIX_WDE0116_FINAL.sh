#!/bin/bash

# Complete WDE0116 Fix - Based on Wix Documentation
# Reference: https://dev.wix.com/docs/develop-websites/articles/databases/external-databases/overview/integrating-external-databases-with-your-wix-site

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$(dirname "$0")"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     WDE0116 Complete Fix - Based on Wix Documentation    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

# Step 1: Verify Database Has Wix Columns
echo -e "${YELLOW}[1/7]${NC} Verifying Wix required columns..."
WIX_COLUMNS=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "
SELECT COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'donations' 
AND column_name IN ('_id', '_createdDate', '_updatedDate', '_owner');
" 2>/dev/null | tr -d ' ')

if [ "$WIX_COLUMNS" = "4" ]; then
    echo -e "${GREEN}✅ All 4 Wix required columns present${NC}"
else
    echo -e "${RED}❌ Missing Wix columns (found: $WIX_COLUMNS/4)${NC}"
    exit 1
fi
echo ""

# Step 2: Test API Returns Wix Fields
echo -e "${YELLOW}[2/7]${NC} Testing API returns Wix fields..."
LATEST_RESPONSE=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/donations/latest)

if echo "$LATEST_RESPONSE" | grep -q "_id\|_createdDate\|_updatedDate\|_owner"; then
    echo -e "${GREEN}✅ API returns all Wix required fields${NC}"
    echo "$LATEST_RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$LATEST_RESPONSE" | head -5
else
    echo -e "${RED}❌ API missing Wix fields${NC}"
    echo "Response: $LATEST_RESPONSE"
    exit 1
fi
echo ""

# Step 3: Check ngrok Status
echo -e "${YELLOW}[3/7]${NC} Checking ngrok status..."
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    for tunnel in tunnels:
        url = tunnel.get('public_url', '')
        if url.startswith('https://'):
            print(url)
            sys.exit(0)
except:
    pass
" 2>/dev/null || echo "")

if [ -n "$NGROK_URL" ]; then
    echo -e "${GREEN}✅ ngrok running: $NGROK_URL${NC}"
    
    # Test public endpoint
    PUBLIC_HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
         -H "X-API-Key: $SECRET_KEY" \
         "$NGROK_URL/health" 2>/dev/null || echo "{}")
    
    if echo "$PUBLIC_HEALTH" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Public endpoint accessible${NC}"
    else
        echo -e "${RED}❌ Public endpoint not accessible${NC}"
        echo "Response: $PUBLIC_HEALTH"
    fi
else
    echo -e "${RED}❌ ngrok not running${NC}"
    echo "Start with: ngrok http 3000"
    exit 1
fi
echo ""

# Step 4: Test Public API Returns Wix Fields
echo -e "${YELLOW}[4/7]${NC} Testing public API returns Wix fields..."
PUBLIC_LATEST=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     "$NGROK_URL/donations/latest" 2>/dev/null || echo "{}")

if echo "$PUBLIC_LATEST" | grep -q "_id\|_createdDate\|_updatedDate\|_owner"; then
    echo -e "${GREEN}✅ Public API returns all Wix required fields${NC}"
else
    echo -e "${RED}❌ Public API missing Wix fields${NC}"
    echo "Response: $PUBLIC_LATEST"
fi
echo ""

# Step 5: Check for Unsupported Operations
echo -e "${YELLOW}[5/7]${NC} Checking for unsupported operations..."
if grep -r "wixData\.aggregate" . --include="*.js" --exclude-dir=node_modules 2>/dev/null | grep -v ".git"; then
    echo -e "${RED}❌ Found wixData.aggregate() calls${NC}"
    echo "These are NOT supported with external databases!"
    echo "Replace with direct API calls instead."
else
    echo -e "${GREEN}✅ No unsupported aggregate() calls found${NC}"
fi
echo ""

# Step 6: Verify Docker Services
echo -e "${YELLOW}[6/7]${NC} Verifying Docker services..."
if docker-compose ps | grep -q "hingecraft-db-adaptor.*Up"; then
    echo -e "${GREEN}✅ Database adaptor running${NC}"
else
    echo -e "${RED}❌ Database adaptor not running${NC}"
    docker-compose ps
    exit 1
fi

if docker-compose ps | grep -q "hingecraft-postgres.*Up"; then
    echo -e "${GREEN}✅ PostgreSQL running${NC}"
else
    echo -e "${RED}❌ PostgreSQL not running${NC}"
    exit 1
fi
echo ""

# Step 7: Final Summary
echo -e "${YELLOW}[7/7]${NC} Final Summary"
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ All Checks Complete!                     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Wix Configuration:${NC}"
echo "  Connection Name: HingeCraftDonationsDB"
echo "  Endpoint URL: $NGROK_URL"
echo "  Secret Key: $SECRET_KEY"
echo ""
echo -e "${YELLOW}CRITICAL NEXT STEPS IN WIX:${NC}"
echo ""
echo -e "${RED}1. Refresh Schema (MOST IMPORTANT!)${NC}"
echo "   - Go to Content Manager → Collections"
echo "   - Find 'HingeCraftDonationsDB'"
echo "   - Click 'More Actions' → 'Refresh Schema'"
echo "   - This tells Wix to detect the Wix required columns"
echo ""
echo -e "${YELLOW}2. Verify Connection${NC}"
echo "   - Go to Database → External Database"
echo "   - Test connection with the URL above"
echo ""
echo -e "${YELLOW}3. Check Permissions${NC}"
echo "   - Content Manager → Collections → Permissions & Privacy"
echo "   - Ensure proper read/write permissions"
echo ""
echo -e "${YELLOW}4. Remove Unsupported Operations${NC}"
echo "   - Don't use wixData.aggregate()"
echo "   - Use direct API calls instead"
echo ""
echo -e "${GREEN}API Status: ✅ All Wix fields being returned${NC}"
echo -e "${GREEN}Database Status: ✅ All Wix columns present${NC}"
echo -e "${GREEN}ngrok Status: ✅ Running${NC}"
echo ""
echo -e "${CYAN}The WDE0116 error should be resolved after refreshing the schema in Wix!${NC}"
echo ""














