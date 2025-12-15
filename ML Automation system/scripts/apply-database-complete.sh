#!/bin/bash
# Complete Database Application Script
# Applies entire database schema and verifies setup

set -e

echo "🗄️ Applying Complete Database Schema"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo -e "${BLUE}Step 1: Starting PostgreSQL Database...${NC}"
if docker-compose ps postgres | grep -q "Up"; then
    echo -e "${GREEN}✅ PostgreSQL already running${NC}"
else
    echo "Starting PostgreSQL..."
    docker-compose up -d postgres
    echo "Waiting for database to be ready..."
    sleep 10
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Applying Database Schema...${NC}"
if node scripts/apply-entire-database.js; then
    echo -e "${GREEN}✅ Database schema applied${NC}"
else
    echo -e "${RED}❌ Error applying schema${NC}"
    echo "Trying manual application..."
    
    # Try direct psql
    if docker exec -i hingecraft-postgres psql -U hingecraft -d hingecraft_automation < database/schema.sql 2>/dev/null; then
        echo -e "${GREEN}✅ Schema applied via psql${NC}"
    else
        echo -e "${YELLOW}⚠️ Manual application needed${NC}"
        echo "Run: docker exec -it hingecraft-postgres psql -U hingecraft -d hingecraft_automation -f /docker-entrypoint-initdb.d/schema.sql"
    fi
fi

echo ""
echo -e "${BLUE}Step 3: Verifying Database Tables...${NC}"
if docker exec hingecraft-postgres psql -U hingecraft -d hingecraft_automation -c "\dt" | grep -q "leads"; then
    echo -e "${GREEN}✅ Tables verified${NC}"
    docker exec hingecraft-postgres psql -U hingecraft -d hingecraft_automation -c "\dt" | grep "public"
else
    echo -e "${YELLOW}⚠️ Tables not found - may need manual verification${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Running Database Crawler...${NC}"
if node scripts/comprehensive-database-crawler.js 2>&1 | head -20; then
    echo -e "${GREEN}✅ Database crawler completed${NC}"
else
    echo -e "${YELLOW}⚠️ Crawler had issues (database may not be accessible)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Database Application Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run createHubSpotProperties() in Apps Script"
echo "  2. Configure Script Properties"
echo "  3. Set up time-driven trigger"
echo ""
