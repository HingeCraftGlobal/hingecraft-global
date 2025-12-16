#!/bin/bash

# Verify Everything is Ready Before Connecting in Wix

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

cd "$(dirname "$0")"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Verify Everything is Ready for Wix Connection        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

# Check 1: Docker Services
echo -e "${YELLOW}[1/5]${NC} Checking Docker services..."
if docker-compose ps | grep -q "hingecraft-db-adaptor.*Up"; then
    echo -e "${GREEN}✅ Database adaptor running${NC}"
else
    echo -e "${RED}❌ Database adaptor not running${NC}"
    echo "Start with: docker-compose up -d"
    exit 1
fi

if docker-compose ps | grep -q "hingecraft-postgres.*Up"; then
    echo -e "${GREEN}✅ PostgreSQL running${NC}"
else
    echo -e "${RED}❌ PostgreSQL not running${NC}"
    exit 1
fi
echo ""

# Check 2: Local API
echo -e "${YELLOW}[2/5]${NC} Testing local API..."
LOCAL_HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/health 2>/dev/null || echo "{}")

if echo "$LOCAL_HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Local API working${NC}"
else
    echo -e "${RED}❌ Local API not working${NC}"
    echo "Response: $LOCAL_HEALTH"
    exit 1
fi
echo ""

# Check 3: ngrok Status
echo -e "${YELLOW}[3/5]${NC} Checking ngrok..."
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
else
    echo -e "${RED}❌ ngrok not running${NC}"
    echo "Start with: ngrok http 3000"
    exit 1
fi
echo ""

# Check 4: Public API
echo -e "${YELLOW}[4/5]${NC} Testing public API..."
PUBLIC_HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     "$NGROK_URL/health" 2>/dev/null || echo "{}")

if echo "$PUBLIC_HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Public API accessible${NC}"
else
    echo -e "${RED}❌ Public API not accessible${NC}"
    echo "Response: $PUBLIC_HEALTH"
    exit 1
fi
echo ""

# Check 5: Wix Fields
echo -e "${YELLOW}[5/5]${NC} Testing Wix required fields..."
LATEST_RESPONSE=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     "$NGROK_URL/donations/latest" 2>/dev/null || echo "{}")

if echo "$LATEST_RESPONSE" | grep -q "_id\|_createdDate\|_updatedDate\|_owner"; then
    echo -e "${GREEN}✅ API returns Wix required fields${NC}"
else
    echo -e "${RED}❌ API missing Wix fields${NC}"
    exit 1
fi
echo ""

# Final Summary
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ Everything is Ready!                     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Use these values in Wix:${NC}"
echo ""
echo -e "${YELLOW}Connection Name:${NC}"
echo "HingeCraftDonationsDB"
echo ""
echo -e "${YELLOW}Endpoint URL:${NC}"
echo "$NGROK_URL"
echo ""
echo -e "${YELLOW}Secret Key:${NC}"
echo "$SECRET_KEY"
echo ""
echo -e "${GREEN}✅ Ready to connect in Wix!${NC}"
echo ""














