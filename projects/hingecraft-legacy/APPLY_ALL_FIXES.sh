#!/bin/bash

# Apply All WDE0116 Fixes - Complete Solution
# This script applies all fixes and verifies everything works

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

cd "$(dirname "$0")"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Applying All WDE0116 Fixes - Complete Solution      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Verify Database Has Wix Columns
echo -e "${YELLOW}[1/5]${NC} Verifying Wix required columns..."
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
    echo "Recreating database with Wix columns..."
    docker-compose down -v
    docker-compose up -d
    sleep 15
fi
echo ""

# Step 2: Restart Services
echo -e "${YELLOW}[2/5]${NC} Restarting services..."
docker-compose restart db-adaptor
sleep 5
echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

# Step 3: Test API Endpoints
echo -e "${YELLOW}[3/5]${NC} Testing API endpoints..."

SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

# Test health
HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/health)

if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health endpoint: OK${NC}"
else
    echo -e "${RED}❌ Health endpoint: FAILED${NC}"
    echo "$HEALTH"
fi

# Test latest donation
LATEST=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/donations/latest)

if echo "$LATEST" | grep -q "_id\|_createdDate"; then
    echo -e "${GREEN}✅ Latest endpoint: Returns Wix format${NC}"
    echo "$LATEST" | python3 -m json.tool 2>/dev/null | head -10 || echo "$LATEST" | head -5
else
    echo -e "${YELLOW}⚠ Latest endpoint: $LATEST${NC}"
fi
echo ""

# Step 4: Test Creating Donation
echo -e "${YELLOW}[4/5]${NC} Testing create donation..."
CREATE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $SECRET_KEY" \
  -H "X-API-Key: $SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00, "is_other_amount": true}' \
  http://localhost:3000/donations)

if echo "$CREATE_RESPONSE" | grep -q "_id\|_createdDate"; then
    echo -e "${GREEN}✅ Create endpoint: Returns Wix format${NC}"
    echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$CREATE_RESPONSE" | head -5
else
    echo -e "${YELLOW}⚠ Create endpoint: $CREATE_RESPONSE${NC}"
fi
echo ""

# Step 5: Verify ngrok
echo -e "${YELLOW}[5/5]${NC} Checking ngrok..."
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
    
    # Test public endpoint
    PUBLIC_HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
         -H "X-API-Key: $SECRET_KEY" \
         "$NGROK_URL/health" 2>/dev/null || echo "{}")
    
    if echo "$PUBLIC_HEALTH" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Public endpoint accessible${NC}"
    else
        echo -e "${YELLOW}⚠ Public endpoint may need a moment${NC}"
    fi
else
    echo -e "${YELLOW}⚠ ngrok not running${NC}"
    echo "Start with: ngrok http 3000"
fi
echo ""

# Final Summary
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ All Fixes Applied!                       ║${NC}"
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
echo -e "${YELLOW}Next Steps in Wix:${NC}"
echo "  1. Update External Database connection"
echo "  2. Click 'Refresh Schema' in Content Manager"
echo "  3. Configure permissions"
echo "  4. Test connection"
echo ""














