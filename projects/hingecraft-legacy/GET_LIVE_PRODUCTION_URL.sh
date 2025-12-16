#!/bin/bash

# Get Live Production URL from ngrok
# Automatically retrieves the current ngrok URL

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Getting Live Production URL${NC}"
echo "================================"
echo ""

# Check if ngrok is running
if ! curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  ngrok not running. Starting production deployment...${NC}"
    if [ -f "PRODUCTION_DEPLOY.sh" ]; then
        ./PRODUCTION_DEPLOY.sh
    else
        echo -e "${RED}❌ PRODUCTION_DEPLOY.sh not found${NC}"
        exit 1
    fi
fi

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | \
    grep -o '"public_url":"https://[^"]*"' | \
    head -1 | \
    cut -d'"' -f4)

# Alternative method using Python if available
if [ -z "$NGROK_URL" ]; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | \
        python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null || echo "")
fi

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Could not get ngrok URL${NC}"
    echo "Check ngrok status: http://localhost:4040"
    exit 1
fi

echo -e "${GREEN}✅ Live Production URL: ${NGROK_URL}${NC}"

# Update PRODUCTION_CONFIG.txt
if [ -f "PRODUCTION_CONFIG.txt" ]; then
    # Backup old config
    cp PRODUCTION_CONFIG.txt PRODUCTION_CONFIG.txt.bak
    
    # Update with new URL
    sed -i.bak "s|Production URL:.*|Production URL: ${NGROK_URL}|g" PRODUCTION_CONFIG.txt
    echo -e "${GREEN}✅ Updated PRODUCTION_CONFIG.txt${NC}"
fi

# Export URL
echo "$NGROK_URL" > LIVE_PRODUCTION_URL.txt
echo -e "${GREEN}✅ Saved to LIVE_PRODUCTION_URL.txt${NC}"

echo ""
echo -e "${BLUE}📡 Production URL:${NC} ${NGROK_URL}"
echo ""

# Test the URL
SECRET_KEY=$(grep "Secret Key:" PRODUCTION_CONFIG.txt 2>/dev/null | cut -d' ' -f3 | head -1 || echo "04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b")

HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "${NGROK_URL}/health" 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Production URL is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Production URL may need a moment to propagate${NC}"
fi

echo "$NGROK_URL"








