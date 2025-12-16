#!/bin/bash

# HingeCraft ML Automation System - Startup Script with Checks

set -e

echo "🚀 Starting HingeCraft ML Automation System..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Dependencies not installed. Running npm install..."
    npm install
fi

# Check database connection
echo ""
echo "Checking database connection..."
if node -e "const db = require('./src/utils/database'); db.query('SELECT NOW()').then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Database connection OK"
else
    echo -e "${YELLOW}⚠${NC} Database connection failed. Make sure PostgreSQL is running."
    echo "Run: npm run setup-db"
fi

# Check OAuth tokens
echo ""
echo "Checking OAuth configuration..."
if [ -f "tokens.json" ]; then
    echo -e "${GREEN}✓${NC} OAuth tokens found"
else
    echo -e "${YELLOW}⚠${NC} No OAuth tokens found. Complete OAuth flow after startup."
    echo "Visit: http://localhost:3001/auth/google"
fi

# Start server
echo ""
echo "Starting server..."
echo ""

npm start
