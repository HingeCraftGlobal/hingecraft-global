#!/bin/bash

# Automated setup with ngrok authtoken
# Usage: ./AUTOMATE_WITH_TOKEN.sh [YOUR_NGROK_AUTHTOKEN]
# Or: export NGROK_AUTHTOKEN=your_token && ./AUTOMATE_WITH_TOKEN.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Fully Automated Wix Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get authtoken from argument or environment
if [ -n "$1" ]; then
    NGROK_AUTHTOKEN="$1"
elif [ -z "$NGROK_AUTHTOKEN" ]; then
    echo -e "${YELLOW}ngrok authtoken required${NC}"
    echo ""
    echo "Usage:"
    echo "  ./AUTOMATE_WITH_TOKEN.sh YOUR_AUTHTOKEN"
    echo ""
    echo "Or:"
    echo "  export NGROK_AUTHTOKEN=your_token"
    echo "  ./AUTOMATE_WITH_TOKEN.sh"
    echo ""
    echo "Get your authtoken from:"
    echo "  https://multiracial-zavier-acculturative.ngrok-free.dev
    echo ""
    read -sp "Enter your ngrok authtoken (or press Ctrl+C to cancel): " NGROK_AUTHTOKEN
    echo ""
fi

if [ -z "$NGROK_AUTHTOKEN" ]; then
    echo -e "${RED}❌ Authtoken is required${NC}"
    exit 1
fi

# Step 1: Check Docker
echo -e "${YELLOW}Step 1: Checking Docker services...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    exit 1
fi

if ! docker-compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Starting Docker services...${NC}"
    docker-compose up -d
    sleep 5
fi

# Wait for services
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker services are healthy${NC}"
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Services failed to start${NC}"
        exit 1
    fi
done
echo ""

# Step 2: Configure ngrok
echo -e "${YELLOW}Step 2: Configuring ngrok...${NC}"
if ngrok config check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ngrok is already authenticated${NC}"
else
    echo -e "${YELLOW}Authenticating ngrok...${NC}"
    ngrok config add-authtoken "$NGROK_AUTHTOKEN" 2>&1
    
    if ngrok config check > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ngrok authenticated successfully${NC}"
    else
        echo -e "${RED}❌ ngrok authentication failed${NC}"
        exit 1
    fi
fi
echo ""

# Step 3: Start ngrok and get URL
echo -e "${YELLOW}Step 3: Starting ngrok tunnel...${NC}"

# Kill any existing ngrok processes
pkill -f "ngrok http 3000" 2>/dev/null || true
sleep 2

# Start ngrok
nohup ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "ngrok started (PID: $NGROK_PID)"

# Wait for ngrok to initialize
echo -e "${YELLOW}Waiting for ngrok to initialize...${NC}"
sleep 10

# Get HTTPS URL
echo -e "${YELLOW}Getting HTTPS URL...${NC}"
NGROK_URL=""
for i in {1..20}; do
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
" 2>/dev/null)
    
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo ""

if [ -n "$NGROK_URL" ]; then
    # Save URL
    echo "$NGROK_URL" > NGROK_URL.txt
    
    echo -e "${GREEN}✅ SUCCESS! ngrok URL obtained${NC}"
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  WIX CONFIGURATION - READY TO USE${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Connection Name:"
    echo "HingeCraftDonationsDB"
    echo ""
    echo "Endpoint URL:"
    echo "$NGROK_URL"
    echo ""
    echo "Secret Key:"
    echo "04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # Test connection
    echo -e "${YELLOW}Testing connection...${NC}"
    sleep 3
    if curl -s "$NGROK_URL/health" > /dev/null 2>&1; then
        HEALTH_RESPONSE=$(curl -s "$NGROK_URL/health")
        echo -e "${GREEN}✅ Connection test successful!${NC}"
        echo "Response: $HEALTH_RESPONSE"
    else
        echo -e "${YELLOW}⚠ Connection test pending (may take a moment)${NC}"
    fi
    echo ""
    
    # Save to configuration file
    cat > WIX_FINAL_CONFIG.txt << EOF
========================================
  WIX EXTERNAL DATABASE CONFIGURATION
  AUTOMATED SETUP - READY TO USE
========================================

Connection Name:
HingeCraftDonationsDB

Endpoint URL:
$NGROK_URL

Secret Key:
04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

========================================
  HOW TO USE IN WIX
========================================

1. Go to Wix Editor → Database → External Database
2. Click "Connect External Database"
3. Select "Custom"
4. Enter the values above
5. Click "Test Connection"
6. If successful, click "Save"

========================================
  STATUS
========================================

✅ Docker Services: Running
✅ Database Adaptor: Healthy
✅ ngrok: Running
✅ HTTPS URL: $NGROK_URL
✅ Ready for Wix Connection

========================================
Generated: $(date)
EOF
    
    echo -e "${GREEN}✅ Configuration saved to WIX_FINAL_CONFIG.txt${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  🎉 Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Copy the configuration values above"
    echo "2. Go to Wix Editor → Database → External Database"
    echo "3. Enter the values and test connection"
    echo ""
    echo "Files created:"
    echo "  • WIX_FINAL_CONFIG.txt - Complete configuration"
    echo "  • NGROK_URL.txt - Just the URL"
    echo ""
    echo "To stop ngrok: pkill -f ngrok"
    echo ""
else
    echo -e "${RED}❌ Could not get ngrok URL${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check ngrok status: http://localhost:4040"
    echo "2. Check logs: cat /tmp/ngrok.log"
    echo "3. Verify authtoken is correct"
    echo ""
    exit 1
fi














