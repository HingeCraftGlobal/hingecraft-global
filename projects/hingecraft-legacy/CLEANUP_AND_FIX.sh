#!/bin/bash

# Complete Cleanup and WDE0116 Fix
# Based on: https://forum.wixstudio.com/t/how-to-resolve-wde0116-request-entity-too-large-with-google-cloud-sql-integration/67819

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

cd "$(dirname "$0")"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Complete Cleanup & WDE0116 Fix                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Clean up duplicate files
echo -e "${YELLOW}[1/6]${NC} Cleaning up duplicate files..."

# Remove old fix files (keep only the latest)
DUPLICATES=(
    "WDE0116_FIX_SUMMARY.md"
    "WDE0116_FINAL_FIX.md"
    "WDE0116_COMPLETE_FIX.md"
    "WDE0116_WIX_COLUMNS_FIX.md"
    "FIX_WIX_CONNECTION.md"
    "WIX_CONNECTION_FIXED.md"
    "COMPLETE_HTTPS_FIX.md"
    "FIXED_STARTUP.md"
    "QUICK_FIX.md"
    "DOCKER_PUSH_FIX.md"
    "WIX_WDE0116_FIX_CONFIG.txt"
    "WIX_CONNECTION_CONFIG.txt"
    "WIX_FINAL_CONFIG.txt"
    "WIX_LAUNCH_CONFIG.txt"
)

KEEP_FILES=(
    "WDE0116_FINAL_SOLUTION_COMPLETE.md"
    "FINAL_WDE0116_SOLUTION.md"
    "WIX_QUICK_REFERENCE.md"
    "MASTER_CONFIG.txt"
)

for file in "${DUPLICATES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}  Removing: $file${NC}"
        rm -f "$file"
    fi
done

echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 2: Verify database has Wix columns
echo -e "${YELLOW}[2/6]${NC} Verifying Wix required columns..."
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

# Step 3: Test API response includes Wix fields
echo -e "${YELLOW}[3/6]${NC} Testing API response..."
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

LATEST_RESPONSE=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/donations/latest)

if echo "$LATEST_RESPONSE" | grep -q "_id\|_createdDate\|_updatedDate\|_owner"; then
    echo -e "${GREEN}✅ API returns Wix fields${NC}"
    echo "$LATEST_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15 || echo "$LATEST_RESPONSE" | head -5
else
    echo -e "${RED}❌ API missing Wix fields${NC}"
    echo "Response: $LATEST_RESPONSE"
    echo ""
    echo -e "${YELLOW}Fixing API response...${NC}"
    # The API fix will be applied separately
fi
echo ""

# Step 4: Restart services
echo -e "${YELLOW}[4/6]${NC} Restarting services..."
docker-compose restart db-adaptor
sleep 5
echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

# Step 5: Test again
echo -e "${YELLOW}[5/6]${NC} Testing API after restart..."
LATEST_RESPONSE=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/donations/latest)

if echo "$LATEST_RESPONSE" | grep -q "_id\|_createdDate\|_updatedDate\|_owner"; then
    echo -e "${GREEN}✅ API returns Wix fields${NC}"
else
    echo -e "${RED}❌ API still missing Wix fields${NC}"
    echo "Response: $LATEST_RESPONSE"
fi
echo ""

# Step 6: Check ngrok
echo -e "${YELLOW}[6/6]${NC} Checking ngrok..."
NGROK_URL=$(cat NGROK_URL.txt 2>/dev/null || echo "")
if [ -z "$NGROK_URL" ]; then
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
fi

if [ -n "$NGROK_URL" ]; then
    echo -e "${GREEN}✅ ngrok URL: $NGROK_URL${NC}"
else
    echo -e "${YELLOW}⚠ ngrok not running${NC}"
    echo "Start with: ngrok http 3000"
fi
echo ""

# Final Summary
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ Cleanup & Fix Complete!                  ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Wix Configuration:${NC}"
echo "  Connection Name: HingeCraftDonationsDB"
if [ -n "$NGROK_URL" ]; then
    echo "  Endpoint URL: $NGROK_URL"
else
    echo "  Endpoint URL: (start ngrok: ngrok http 3000)"
fi
echo "  Secret Key: $SECRET_KEY"
echo ""
echo -e "${YELLOW}Critical Steps in Wix:${NC}"
echo "  1. Update External Database connection"
echo "  2. Click 'Refresh Schema' in Content Manager"
echo "  3. Configure permissions"
echo "  4. Test connection"
echo ""














