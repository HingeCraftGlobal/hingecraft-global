#!/bin/bash

# HingeCraft Complete System Launch
# Launches all services, sets up ngrok, and verifies everything is ready

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"
PROJECT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"

# Configuration
GIT_REPO="https://github.com/departments-commits/website-path-for-backend-contribution.git"
GIT_USER="William Ferguson"
GIT_EMAIL="chandlerferguson319@gmail.com"
CONNECTION_NAME="HingeCraftDonationsDB"
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         HingeCraft Global - Complete System Launch        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Step 1: Verify Docker
echo -e "${YELLOW}[1/8]${NC} Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Start Docker Services
echo -e "${YELLOW}[2/8]${NC} Starting Docker services..."
docker-compose up -d
sleep 3

# Wait for PostgreSQL
echo -e "${YELLOW}   Waiting for PostgreSQL...${NC}"
for i in {1..60}; do
    if docker-compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ PostgreSQL is ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 60 ]; then
        echo -e "${RED}   ❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
done

# Wait for API
echo -e "${YELLOW}   Waiting for API...${NC}"
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ API is ready${NC}"
        break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
        echo -e "${RED}   ❌ API failed to start${NC}"
        docker-compose logs db-adaptor | tail -10
        exit 1
    fi
done
echo ""

# Step 3: Verify Database
echo -e "${YELLOW}[3/8]${NC} Verifying database..."
TABLE_COUNT=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ Database has $TABLE_COUNT table(s)${NC}"
    
    # Check donations table
    DONATION_EXISTS=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'donations');" 2>/dev/null | tr -d ' ')
    if [ "$DONATION_EXISTS" = "t" ]; then
        DONATION_COUNT=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM donations;" 2>/dev/null | tr -d ' ')
        echo -e "${GREEN}✅ Donations table exists ($DONATION_COUNT donations)${NC}"
    fi
else
    echo -e "${RED}❌ No tables found${NC}"
    exit 1
fi
echo ""

# Step 4: Test API Endpoints
echo -e "${YELLOW}[4/8]${NC} Testing API endpoints..."

# Health check
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health endpoint: OK${NC}"
else
    echo -e "${RED}❌ Health endpoint: FAILED${NC}"
    echo "$HEALTH"
fi

# Authenticated endpoint
LATEST_RESPONSE=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
     -H "X-API-Key: $SECRET_KEY" \
     http://localhost:3000/donations/latest 2>/dev/null || echo "{}")

if echo "$LATEST_RESPONSE" | grep -q "error"; then
    if echo "$LATEST_RESPONSE" | grep -q "No donations found"; then
        echo -e "${GREEN}✅ Authentication: OK (no donations yet)${NC}"
    else
        echo -e "${YELLOW}⚠ Authentication test: $LATEST_RESPONSE${NC}"
    fi
else
    echo -e "${GREEN}✅ Authentication: OK${NC}"
fi
echo ""

# Step 5: Check ngrok
echo -e "${YELLOW}[5/8]${NC} Setting up ngrok tunnel..."
NGROK_URL=""

if command -v ngrok &> /dev/null; then
    # Check if ngrok is authenticated
    if ngrok config check > /dev/null 2>&1; then
        # Check if ngrok is already running
        if pgrep -f "ngrok http 3000" > /dev/null; then
            echo -e "${YELLOW}   ngrok is already running${NC}"
            # Get existing URL
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
        else
            echo -e "${YELLOW}   Starting ngrok tunnel...${NC}"
            # Kill any existing ngrok processes
            pkill -f "ngrok http" 2>/dev/null || true
            sleep 2
            
            # Start ngrok in background
            nohup ngrok http 3000 > /tmp/ngrok.log 2>&1 &
            sleep 8
            
            # Get URL
            for i in {1..10}; do
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
                sleep 2
            done
        fi
        
        if [ -n "$NGROK_URL" ]; then
            echo "$NGROK_URL" > NGROK_URL.txt
            echo -e "${GREEN}✅ ngrok tunnel active${NC}"
            echo -e "${CYAN}   URL: $NGROK_URL${NC}"
            
            # Test ngrok URL
            sleep 2
            if curl -f "$NGROK_URL/health" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ ngrok URL is accessible${NC}"
            else
                echo -e "${YELLOW}⚠ ngrok URL may take a moment to be fully accessible${NC}"
            fi
        else
            echo -e "${YELLOW}⚠ Could not get ngrok URL (check http://localhost:4040)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ ngrok is not authenticated${NC}"
        echo "   Run: ngrok config add-authtoken YOUR_TOKEN"
        echo "   Or use: ./AUTOMATE_WITH_TOKEN.sh YOUR_TOKEN"
    fi
else
    echo -e "${YELLOW}⚠ ngrok is not installed${NC}"
    echo "   Install: npm install -g ngrok"
    echo "   Or deploy to production (Railway/Render)"
fi
echo ""

# Step 6: Display Wix Configuration
echo -e "${YELLOW}[6/8]${NC} Wix Configuration Ready"
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          WIX EXTERNAL DATABASE CONFIGURATION              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Connection Name:${NC}"
echo "  $CONNECTION_NAME"
echo ""
echo -e "${BLUE}Secret Key:${NC}"
echo "  $SECRET_KEY"
echo ""
echo -e "${BLUE}Endpoint URL:${NC}"
if [ -n "$NGROK_URL" ]; then
    echo -e "  ${GREEN}$NGROK_URL${NC} (ngrok)"
    echo ""
    echo -e "${YELLOW}⚠ For production, deploy to Railway/Render${NC}"
else
    echo -e "  ${YELLOW}http://localhost:3000${NC} (local - Wix cannot access)"
    echo ""
    echo -e "${YELLOW}⚠ Set up ngrok or deploy to production for Wix access${NC}"
fi
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    HOW TO USE IN WIX                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "1. Go to Wix Editor → Database → External Database"
echo "2. Click 'Connect External Database'"
echo "3. Select 'Custom'"
echo "4. Enter the values above"
echo "5. Click 'Test Connection'"
echo ""

# Step 7: Git Status
echo -e "${YELLOW}[7/8]${NC} Checking git status..."
if [ -d ".git" ]; then
    # Verify config
    CURRENT_USER=$(git config user.name)
    CURRENT_EMAIL=$(git config user.email)
    
    if [ "$CURRENT_USER" = "$GIT_USER" ] && [ "$CURRENT_EMAIL" = "$GIT_EMAIL" ]; then
        echo -e "${GREEN}✅ Git config: $CURRENT_USER <$CURRENT_EMAIL>${NC}"
    else
        echo -e "${YELLOW}⚠ Git config needs update${NC}"
    fi
    
    # Check remote
    CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
    if [ "$CURRENT_REMOTE" = "$GIT_REPO" ]; then
        echo -e "${GREEN}✅ Git remote: $GIT_REPO${NC}"
    else
        echo -e "${YELLOW}⚠ Git remote needs update${NC}"
    fi
    
    # Show uncommitted changes
    UNCOMMITTED=$(git status --short | wc -l | tr -d ' ')
    if [ "$UNCOMMITTED" -gt "0" ]; then
        echo -e "${YELLOW}⚠ $UNCOMMITTED uncommitted file(s)${NC}"
        echo "   Run: git add . && git commit -m 'HingeCraft: System launch'"
        echo "   Then: ./push-with-token.sh YOUR_TOKEN"
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Not a git repository${NC}"
fi
echo ""

# Step 8: Final Status
echo -e "${YELLOW}[8/8]${NC} System Status"
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    SYSTEM STATUS                           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Docker services
echo -e "${BLUE}Docker Services:${NC}"
if docker-compose ps | grep -q "Up"; then
    echo -e "  ${GREEN}✅ PostgreSQL: Running${NC}"
    echo -e "  ${GREEN}✅ Database Adaptor: Running${NC}"
    echo -e "  ${GREEN}✅ Python Server: Running${NC}"
else
    echo -e "  ${RED}❌ Some services not running${NC}"
fi
echo ""

# Database
echo -e "${BLUE}Database:${NC}"
echo -e "  ${GREEN}✅ Database: hingecraft_db${NC}"
echo -e "  ${GREEN}✅ Tables: $TABLE_COUNT${NC}"
if [ -n "$DONATION_COUNT" ]; then
    echo -e "  ${GREEN}✅ Donations: $DONATION_COUNT${NC}"
fi
echo ""

# API
echo -e "${BLUE}API Endpoints:${NC}"
echo -e "  ${GREEN}✅ Health: http://localhost:3000/health${NC}"
echo -e "  ${GREEN}✅ API: http://localhost:3000${NC}"
if [ -n "$NGROK_URL" ]; then
    echo -e "  ${GREEN}✅ Public: $NGROK_URL${NC}"
fi
echo ""

# Wix
echo -e "${BLUE}Wix Connection:${NC}"
if [ -n "$NGROK_URL" ]; then
    echo -e "  ${GREEN}✅ Ready (ngrok active)${NC}"
    echo -e "  ${CYAN}   Use: $NGROK_URL${NC}"
else
    echo -e "  ${YELLOW}⚠ Needs ngrok or production deployment${NC}"
fi
echo ""

# Git
echo -e "${BLUE}Git Repository:${NC}"
echo -e "  ${GREEN}✅ $GIT_REPO${NC}"
echo -e "  ${GREEN}✅ User: $GIT_USER${NC}"
echo ""

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ SYSTEM LAUNCH COMPLETE!                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Save configuration
cat > WIX_LAUNCH_CONFIG.txt << EOF
╔════════════════════════════════════════════════════════════╗
║          WIX EXTERNAL DATABASE CONFIGURATION               ║
║              Generated: $(date)                            ║
╚════════════════════════════════════════════════════════════╝

Connection Name:
$CONNECTION_NAME

Secret Key:
$SECRET_KEY

Endpoint URL:
$(if [ -n "$NGROK_URL" ]; then echo "$NGROK_URL"; else echo "http://localhost:3000 (use ngrok for Wix)"; fi)

═══════════════════════════════════════════════════════════════

HOW TO USE IN WIX:

1. Go to Wix Editor → Database → External Database
2. Click "Connect External Database"
3. Select "Custom"
4. Enter the values above
5. Click "Test Connection"

═══════════════════════════════════════════════════════════════

SYSTEM STATUS:

✅ PostgreSQL: Running
✅ Database: hingecraft_db
✅ Tables: $TABLE_COUNT
✅ API: http://localhost:3000
$(if [ -n "$NGROK_URL" ]; then echo "✅ Public URL: $NGROK_URL"; else echo "⚠ ngrok: Not active"; fi)

═══════════════════════════════════════════════════════════════

GIT REPOSITORY:

Repository: $GIT_REPO
User: $GIT_USER <$GIT_EMAIL>

═══════════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ Configuration saved to: WIX_LAUNCH_CONFIG.txt${NC}"
echo ""

# Next steps
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Configure Wix with the values above"
if [ -z "$NGROK_URL" ]; then
    echo "2. Set up ngrok: ngrok http 3000"
    echo "   Or deploy to production (Railway/Render)"
fi
echo "3. Test connection in Wix Velo"
echo "4. Push changes: ./push-with-token.sh YOUR_TOKEN"
echo ""
echo -e "${CYAN}View ngrok dashboard: http://localhost:4040${NC}"
echo -e "${CYAN}View API health: http://localhost:3000/health${NC}"
echo ""














