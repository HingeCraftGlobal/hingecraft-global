#!/bin/bash

# Script to help set up ngrok authentication

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ngrok Authentication Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok is not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  brew install ngrok/ngrok/ngrok"
    exit 1
fi

echo -e "${GREEN}✅ ngrok is installed${NC}"
echo ""

# Check if already authenticated
if ngrok config check &> /dev/null; then
    echo -e "${GREEN}✅ ngrok is already authenticated!${NC}"
    echo ""
    echo "You can now start ngrok with:"
    echo "  ngrok http 3000"
    echo ""
    echo "Or use our automated script:"
    echo "  ./START_NGROK_AND_GET_URL.sh"
    exit 0
fi

echo -e "${YELLOW}⚠ ngrok requires authentication${NC}"
echo ""
echo "To set up ngrok:"
echo ""
echo "1. Sign up for a free account:"
echo -e "   ${BLUE}https://multiracial-zavier-acculturative.ngrok-free.dev
echo ""
echo "2. Get your authtoken:"
echo -e "   ${BLUE}https://multiracial-zavier-acculturative.ngrok-free.dev
echo ""
echo "3. Run this command with your authtoken:"
echo -e "   ${YELLOW}ngrok config add-authtoken YOUR_AUTHTOKEN_HERE${NC}"
echo ""
echo "4. Then start ngrok:"
echo -e "   ${YELLOW}ngrok http 3000${NC}"
echo ""
echo "5. Get the HTTPS URL from: http://localhost:4040"
echo ""

# Ask if user wants to enter authtoken now
read -p "Do you have your authtoken ready? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -sp "Enter your ngrok authtoken: " AUTHTOKEN
    echo ""
    if [ -n "$AUTHTOKEN" ]; then
        echo ""
        echo -e "${YELLOW}Configuring ngrok...${NC}"
        ngrok config add-authtoken "$AUTHTOKEN"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ ngrok authenticated successfully!${NC}"
            echo ""
            echo "You can now start ngrok with:"
            echo "  ngrok http 3000"
            echo ""
            echo "Or use our automated script:"
            echo "  ./START_NGROK_AND_GET_URL.sh"
        else
            echo -e "${RED}❌ Authentication failed. Please check your authtoken.${NC}"
        fi
    else
        echo -e "${RED}❌ No authtoken provided${NC}"
    fi
else
    echo ""
    echo "Please follow the steps above to set up ngrok authentication."
fi














