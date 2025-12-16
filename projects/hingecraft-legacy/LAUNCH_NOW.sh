#!/bin/bash

# Quick launch script - tries all methods to get ngrok running

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$(dirname "$0")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Quick Launch - Wix Connection${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Docker
echo -e "${YELLOW}Checking Docker services...${NC}"
if ! docker-compose ps | grep -q "Up"; then
    echo "Starting Docker services..."
    docker-compose up -d
    sleep 5
fi

# Check if ngrok is authenticated
if ngrok config check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ngrok is authenticated${NC}"
    echo ""
    echo "Starting ngrok and getting URL..."
    ./START_NGROK_AND_GET_URL.sh
else
    echo -e "${YELLOW}⚠ ngrok needs authentication${NC}"
    echo ""
    echo "Choose an option:"
    echo ""
    echo "1. If you have your authtoken, run:"
    echo -e "   ${BLUE}./AUTOMATE_WITH_TOKEN.sh YOUR_AUTHTOKEN${NC}"
    echo ""
    echo "2. For interactive setup, run:"
    echo -e "   ${BLUE}./SETUP_NGROK.sh${NC}"
    echo ""
    echo "3. Get your authtoken from:"
    echo -e "   ${BLUE}https://multiracial-zavier-acculturative.ngrok-free.dev
    echo ""
    echo "After authentication, run:"
    echo -e "   ${BLUE}./AUTOMATE_ALL.sh${NC}"
fi














