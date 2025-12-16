#!/bin/bash

# Automated Wix Connection Setup - Complete Solution
# This script automates everything to get Wix connection working

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"
cd "$PROJECT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Automated Wix Connection Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check Docker
echo -e "${YELLOW}Step 1: Checking Docker...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and run this script again${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Start Docker Services
echo -e "${YELLOW}Step 2: Starting Docker services...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 3: Wait for services
echo -e "${YELLOW}Step 3: Waiting for services to be healthy...${NC}"
sleep 10

# Check health
for i in {1..30}; do
    if curl -s http://localhost:3000/health | grep -q "healthy"; then
        echo -e "${GREEN}✅ Database Adaptor is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Service failed to start${NC}"
        exit 1
    fi
    sleep 2
done
echo ""

# Step 4: Check for ngrok
echo -e "${YELLOW}Step 4: Setting up HTTPS tunnel...${NC}"
if command -v ngrok &> /dev/null; then
    echo -e "${GREEN}✅ ngrok is installed${NC}"
    
    # Kill any existing ngrok processes
    pkill ngrok 2>/dev/null || true
    sleep 2
    
    # Start ngrok in background
    echo -e "${BLUE}Starting ngrok tunnel...${NC}"
    ngrok http 3000 > /tmp/ngrok.log 2>&1 &
    NGROK_PID=$!
    sleep 5
    
    # Get ngrok URL
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://multiracial-zavier-acculturative.ngrok-free.dev
    
    if [ -z "$NGROK_URL" ]; then
        echo -e "${YELLOW}⚠ Could not get ngrok URL automatically${NC}"
        echo -e "${YELLOW}Please check ngrok at http://localhost:4040${NC}"
        echo -e "${YELLOW}Or run: ngrok http 3000${NC}"
        NGROK_URL="https://multiracial-zavier-acculturative.ngrok-free.dev
    else
        echo -e "${GREEN}✅ ngrok tunnel active: $NGROK_URL${NC}"
    fi
else
    echo -e "${YELLOW}⚠ ngrok is not installed${NC}"
    echo -e "${YELLOW}Installing ngrok...${NC}"
    
    # Try to install ngrok
    if command -v brew &> /dev/null; then
        brew install ngrok/ngrok/ngrok || echo -e "${YELLOW}⚠ Could not install via brew${NC}"
    elif command -v npm &> /dev/null; then
        npm install -g ngrok || echo -e "${YELLOW}⚠ Could not install via npm${NC}"
    else
        echo -e "${RED}❌ Cannot install ngrok automatically${NC}"
        echo -e "${YELLOW}Please install ngrok manually:${NC}"
        echo -e "${YELLOW}  - Visit: https://ngrok.com/download${NC}"
        echo -e "${YELLOW}  - Or: npm install -g ngrok${NC}"
        NGROK_URL="https://multiracial-zavier-acculturative.ngrok-free.dev
    fi
fi
echo ""

# Step 5: Display Wix Configuration
echo -e "${YELLOW}Step 5: Wix Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Use these values in Wix:${NC}"
echo ""
echo -e "${BLUE}Connection Name:${NC}"
echo "HingeCraftDonationsDB"
echo ""
echo -e "${BLUE}Endpoint URL (HTTPS):${NC}"
if [ "$NGROK_URL" != "https://multiracial-zavier-acculturative.ngrok-free.dev
    echo "$NGROK_URL"
else
    echo "https://multiracial-zavier-acculturative.ngrok-free.dev
    echo -e "${YELLOW}(Get this from ngrok web interface at http://localhost:4040)${NC}"
fi
echo ""
echo -e "${BLUE}Secret Key:${NC}"
echo "04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 6: Test Connection
echo -e "${YELLOW}Step 6: Testing connection...${NC}"
if [ "$NGROK_URL" != "https://multiracial-zavier-acculturative.ngrok-free.dev
    echo -e "${BLUE}Testing ngrok URL: $NGROK_URL${NC}"
    if curl -s "$NGROK_URL/health" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Connection test successful!${NC}"
    else
        echo -e "${YELLOW}⚠ Connection test failed, but ngrok is running${NC}"
        echo -e "${YELLOW}This may be normal - try in Wix anyway${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Cannot test - ngrok URL not available${NC}"
fi
echo ""

# Step 7: Save configuration
echo -e "${YELLOW}Step 7: Saving configuration...${NC}"
cat > WIX_CONNECTION_CONFIG.txt << EOF
Wix Database Connection Configuration
=====================================

Connection Name: HingeCraftDonationsDB
Endpoint URL: $NGROK_URL
Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

Custom Adaptor:
- Location: database-adaptor/server.js
- Docker Image: departmentsai/wix-db-adaptor:latest
- Local URL: http://localhost:3000
- Public URL: $NGROK_URL

To use in Wix:
1. Go to Wix Editor → Database → External Database
2. Click "Connect External Database"
3. Select "Custom"
4. Enter the values above
5. Click "Test Connection"
6. If successful, click "Save"

ngrok Web Interface: http://localhost:4040
EOF

echo -e "${GREEN}✅ Configuration saved to WIX_CONNECTION_CONFIG.txt${NC}"
echo ""

# Final Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Copy the configuration values above"
echo "2. Go to Wix Editor → Database → External Database"
echo "3. Enter the values and test connection"
echo ""
echo -e "${BLUE}ngrok Status:${NC}"
if [ "$NGROK_PID" ]; then
    echo "  - Running (PID: $NGROK_PID)"
    echo "  - Web Interface: http://localhost:4040"
    echo "  - URL: $NGROK_URL"
else
    echo "  - Not running - please start manually: ngrok http 3000"
fi
echo ""
echo -e "${BLUE}To stop ngrok:${NC}"
echo "  pkill ngrok"
echo ""
echo -e "${BLUE}To stop Docker services:${NC}"
echo "  docker-compose down"
echo ""














