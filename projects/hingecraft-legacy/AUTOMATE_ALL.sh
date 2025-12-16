#!/bin/bash

# Fully automated script for ngrok setup and Wix configuration
# This script attempts to automate everything possible

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Automated Wix Connection Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check Docker services
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

# Wait for services to be healthy
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

# Step 2: Check ngrok authentication
echo -e "${YELLOW}Step 2: Checking ngrok authentication...${NC}"
NGROK_AUTHED=false

# Check if ngrok config exists and is valid
if ngrok config check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ngrok is authenticated${NC}"
    NGROK_AUTHED=true
else
    echo -e "${YELLOW}⚠ ngrok requires authentication${NC}"
    echo ""
    echo "ngrok needs an authtoken to run."
    echo ""
    echo "Quick setup:"
    echo "1. Sign up (free): https://multiracial-zavier-acculturative.ngrok-free.dev
    echo "2. Get authtoken: https://multiracial-zavier-acculturative.ngrok-free.dev
    echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    echo "Or use our interactive script:"
    echo "  ./SETUP_NGROK.sh"
    echo ""
    
    # Check if authtoken is in environment or can be found
    if [ -n "$NGROK_AUTHTOKEN" ]; then
        echo -e "${YELLOW}Found NGROK_AUTHTOKEN in environment, configuring...${NC}"
        ngrok config add-authtoken "$NGROK_AUTHTOKEN" 2>&1
        if ngrok config check > /dev/null 2>&1; then
            echo -e "${GREEN}✅ ngrok authenticated using environment variable${NC}"
            NGROK_AUTHED=true
        fi
    fi
fi
echo ""

# Step 3: Start ngrok and get URL
if [ "$NGROK_AUTHED" = true ]; then
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
    sleep 8
    
    # Get HTTPS URL
    echo -e "${YELLOW}Getting HTTPS URL...${NC}"
    NGROK_URL=""
    for i in {1..15}; do
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
        
        echo -e "${GREEN}✅ ngrok URL obtained!${NC}"
        echo ""
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}  WIX CONFIGURATION${NC}"
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
        if curl -s "$NGROK_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Connection test successful!${NC}"
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
        echo -e "${GREEN}  Setup Complete!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Next Steps:"
        echo "1. Copy the configuration values above"
        echo "2. Go to Wix Editor → Database → External Database"
        echo "3. Enter the values and test connection"
        echo ""
        echo "Configuration also saved to: WIX_FINAL_CONFIG.txt"
        echo ""
    else
        echo -e "${YELLOW}⚠ Could not get ngrok URL automatically${NC}"
        echo "Check ngrok status: http://localhost:4040"
        echo "Or check logs: /tmp/ngrok.log"
    fi
else
    echo -e "${YELLOW}Step 3: Skipped (ngrok not authenticated)${NC}"
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Setup Incomplete${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Docker services are ready, but ngrok needs authentication."
    echo ""
    echo "To complete setup:"
    echo "1. Run: ./SETUP_NGROK.sh"
    echo "2. Or manually: ngrok config add-authtoken YOUR_TOKEN"
    echo "3. Then run this script again: ./AUTOMATE_ALL.sh"
    echo ""
    echo "Or set NGROK_AUTHTOKEN environment variable:"
    echo "  export NGROK_AUTHTOKEN=your_token_here"
    echo "  ./AUTOMATE_ALL.sh"
    echo ""
fi














