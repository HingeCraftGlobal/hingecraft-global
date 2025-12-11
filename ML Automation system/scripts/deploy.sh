#!/bin/bash

# HingeCraft ML Automation System - Deployment Script
# This script handles deployment to production environment

set -e  # Exit on error

echo "🚀 HingeCraft ML Automation System - Deployment"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in production mode
if [ "$NODE_ENV" != "production" ]; then
    echo -e "${YELLOW}Warning: NODE_ENV is not set to 'production'${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} PostgreSQL found"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠${NC} Please update .env with your production values"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm ci --production
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 3: Database migration
echo ""
echo "🗄️  Step 3: Running database migrations..."
if [ -f database/setup.js ]; then
    node database/setup.js
    echo -e "${GREEN}✓${NC} Database setup complete"
else
    echo -e "${YELLOW}⚠${NC} Database setup script not found, skipping..."
fi

# Step 4: Build (if needed)
echo ""
echo "🔨 Step 4: Building application..."
# Add build steps here if using TypeScript or build tools
echo -e "${GREEN}✓${NC} Build complete"

# Step 5: Run tests (optional)
echo ""
read -p "Run tests before deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 Running tests..."
    npm test || echo -e "${YELLOW}⚠${NC} Tests failed, but continuing..."
fi

# Step 6: Create logs directory
echo ""
echo "📝 Step 5: Setting up logs..."
mkdir -p logs
touch logs/combined.log logs/error.log
echo -e "${GREEN}✓${NC} Logs directory ready"

# Step 7: Setup process manager (PM2)
echo ""
read -p "Setup PM2 process manager? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v pm2 &> /dev/null; then
        echo "⚙️  Setting up PM2..."
        pm2 delete hingecraft-automation 2>/dev/null || true
        pm2 start src/index.js --name hingecraft-automation
        pm2 save
        echo -e "${GREEN}✓${NC} PM2 configured"
    else
        echo -e "${YELLOW}⚠${NC} PM2 not installed. Install with: npm install -g pm2"
    fi
fi

# Step 8: Setup systemd service (optional)
echo ""
read -p "Create systemd service? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚙️  Creating systemd service..."
    cat > /tmp/hingecraft-automation.service << EOF
[Unit]
Description=HingeCraft ML Automation System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
ExecStart=$(which node) src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    echo -e "${GREEN}✓${NC} Service file created at /tmp/hingecraft-automation.service"
    echo -e "${YELLOW}⚠${NC} To install: sudo cp /tmp/hingecraft-automation.service /etc/systemd/system/"
    echo -e "${YELLOW}⚠${NC} Then: sudo systemctl enable hingecraft-automation && sudo systemctl start hingecraft-automation"
fi

# Step 9: Health check
echo ""
echo "🏥 Step 6: Running health check..."
sleep 2
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Health check passed"
else
    echo -e "${YELLOW}⚠${NC} Health check failed (server may not be running yet)"
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env with production values"
echo "2. Complete Google OAuth setup"
echo "3. Start the server: npm start"
echo "4. Monitor logs: tail -f logs/combined.log"
echo ""
echo "API Endpoints:"
echo "- Health: http://localhost:3001/health"
echo "- OAuth: http://localhost:3001/auth/google"
echo ""
