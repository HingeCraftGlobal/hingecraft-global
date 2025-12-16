#!/bin/bash

# Complete script to start ngrok and get the HTTPS URL for Wix

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting ngrok and Getting URL${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Kill any existing ngrok processes
echo -e "${YELLOW}Stopping any existing ngrok processes...${NC}"
pkill -f ngrok 2>/dev/null || true
sleep 2

# Start ngrok
echo -e "${YELLOW}Starting ngrok tunnel on port 3000...${NC}"
nohup ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "ngrok started (PID: $NGROK_PID)"
echo ""

# Wait for ngrok to start
echo -e "${YELLOW}Waiting for ngrok to initialize...${NC}"
sleep 8

# Get the HTTPS URL
echo -e "${YELLOW}Getting HTTPS URL...${NC}"
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -oE 'https://[a-zA-Z0-9-]+\.(ngrok-free\.app|ngrok\.io|ngrok\.app)' | head -1)
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo ""

if [ -n "$NGROK_URL" ]; then
    # Save URL to file
    echo "$NGROK_URL" > NGROK_URL.txt
    
    echo -e "${GREEN}✅ ngrok URL found!${NC}"
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
        echo -e "${YELLOW}⚠ Connection test failed, but ngrok is running${NC}"
    fi
    echo ""
    
    echo -e "${GREEN}✅ URL saved to NGROK_URL.txt${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Copy the configuration values above"
    echo "2. Go to Wix Editor → Database → External Database"
    echo "3. Enter the values and test connection"
    echo ""
    echo -e "${BLUE}To stop ngrok:${NC}"
    echo "  pkill -f ngrok"
    echo ""
else
    echo -e "${YELLOW}⚠ Could not get ngrok URL automatically${NC}"
    echo ""
    echo "Please:"
    echo "1. Check if ngrok is running: http://localhost:4040"
    echo "2. Or start manually: ngrok http 3000"
    echo "3. Copy the HTTPS URL from the ngrok web interface"
    echo ""
fi














