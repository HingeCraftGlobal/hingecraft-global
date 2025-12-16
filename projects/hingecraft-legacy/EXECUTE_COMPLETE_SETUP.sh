#!/bin/bash

# Complete HingeCraft Setup and WDE0116 Fix
# This script executes all steps to complete the project and fix Wix connection

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"
PROJECT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HingeCraft Complete Setup${NC}"
echo -e "${BLUE}  WDE0116 Fix & Git Push${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Verify Docker
echo -e "${YELLOW}Step 1: Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Start Docker Services
echo -e "${YELLOW}Step 2: Starting Docker services...${NC}"
docker-compose up -d
sleep 5

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Services are healthy${NC}"
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Services failed to start${NC}"
        echo "Check logs: docker-compose logs"
        exit 1
    fi
done
echo ""

# Step 3: Test Health Endpoint
echo -e "${YELLOW}Step 3: Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Step 4: Check for ngrok
echo -e "${YELLOW}Step 4: Checking ngrok setup...${NC}"
if command -v ngrok &> /dev/null; then
    echo -e "${GREEN}✅ ngrok is installed${NC}"
    
    # Check if ngrok is authenticated
    if ngrok config check > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ngrok is authenticated${NC}"
        
        # Check if ngrok is already running
        if pgrep -f "ngrok http 3000" > /dev/null; then
            echo -e "${YELLOW}⚠ ngrok is already running${NC}"
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
                echo -e "${GREEN}✅ ngrok URL: $NGROK_URL${NC}"
            fi
        else
            echo -e "${YELLOW}Starting ngrok tunnel...${NC}"
            nohup ngrok http 3000 > /tmp/ngrok.log 2>&1 &
            sleep 10
            
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
                echo "$NGROK_URL" > NGROK_URL.txt
                echo -e "${GREEN}✅ ngrok started: $NGROK_URL${NC}"
            else
                echo -e "${YELLOW}⚠ Could not get ngrok URL (may take a moment)${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠ ngrok is not authenticated${NC}"
        echo "Run: ngrok config add-authtoken YOUR_TOKEN"
        echo "Or use: ./AUTOMATE_WITH_TOKEN.sh YOUR_TOKEN"
    fi
else
    echo -e "${YELLOW}⚠ ngrok is not installed${NC}"
    echo "Install: npm install -g ngrok"
    echo "Or deploy to production (Railway/Render)"
fi
echo ""

# Step 5: Display Wix Configuration
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WIX CONFIGURATION${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Connection Name:"
echo "HingeCraftDonationsDB"
echo ""
if [ -n "$NGROK_URL" ]; then
    echo "Endpoint URL (ngrok):"
    echo "$NGROK_URL"
    echo ""
    echo "⚠️  For production, deploy to Railway/Render and use production URL"
else
    echo "Endpoint URL:"
    echo "⚠️  Set up ngrok or deploy to production"
    echo "   Local: http://localhost:3000 (Wix cannot access this)"
    echo "   Production: https://hingecraft-api.railway.app"
fi
echo ""
echo "Secret Key:"
echo "04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 6: Git Status
echo -e "${YELLOW}Step 5: Checking git status...${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ Uncommitted changes detected${NC}"
        echo "Files changed:"
        git status --short | head -10
        echo ""
        read -p "Do you want to commit and push? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Staging changes...${NC}"
            git add .
            
            echo -e "${YELLOW}Committing...${NC}"
            git commit -m "HingeCraft: Complete setup and WDE0116 fix - $(date +%Y-%m-%d)" || true
            
            echo -e "${YELLOW}Ready to push...${NC}"
            echo "Run: ./push-with-token.sh YOUR_TOKEN"
            echo "Or provide token now:"
            read -sp "Enter GitHub Personal Access Token: " GITHUB_TOKEN
            echo ""
            
            if [ -n "$GITHUB_TOKEN" ]; then
                echo -e "${YELLOW}Pushing to GitHub...${NC}"
                git remote set-url origin "https://${GITHUB_TOKEN}@github.com/departments-commits/website-path-for-backend-contribution.git"
                if git push -u origin main; then
                    echo -e "${GREEN}✅ Push completed successfully!${NC}"
                    git remote set-url origin "https://github.com/departments-commits/website-path-for-backend-contribution.git"
                else
                    echo -e "${RED}❌ Push failed${NC}"
                fi
            fi
        fi
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Not a git repository${NC}"
fi
echo ""

# Step 7: Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next Steps:"
echo "1. Configure Wix External Database with values above"
echo "2. Verify field names in Wix code match database schema"
echo "3. Test connection in Wix Velo"
echo "4. Review WDE0116_COMPLETE_SOLUTION.md for detailed fixes"
echo ""
echo "Files created:"
echo "  • COMPLETE_CHAT_EXPORT_AND_SOLUTION.md - Complete project export"
echo "  • WDE0116_COMPLETE_SOLUTION.md - WDE0116 fix guide"
echo "  • NGROK_URL.txt - ngrok URL (if available)"
echo ""
echo "To stop services: docker-compose down"
echo "To stop ngrok: pkill -f ngrok"
echo ""














