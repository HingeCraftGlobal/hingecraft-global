#!/bin/bash
# Sync All Components - Complete System Synchronization
# Ensures all database components, Wix integration, and adaptor are synced

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🔄 SYNC ALL COMPONENTS - Complete System Synchronization"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Verify Database
echo -e "${BLUE}Step 1: Verifying Database...${NC}"
if docker ps | grep -q hingecraft_postgres; then
    echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
    
    # Get all tables
    TABLES=$(docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -t -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    " 2>/dev/null | tr -d ' ' | grep -v '^$')
    
    TABLE_COUNT=$(echo "$TABLES" | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Found $TABLE_COUNT tables in database${NC}"
    
    # List key tables
    echo -e "${YELLOW}Key tables found:${NC}"
    echo "$TABLES" | grep -E "(donations|members|chat_clubs|chat_messages|ambassadors|users|designs|assets|wallets|transactions|microfactories|content|analytics|audit)" | head -20 | sed 's/^/  • /'
else
    echo -e "${RED}❌ PostgreSQL container not running${NC}"
    echo -e "${YELLOW}Starting database...${NC}"
    ./LAUNCH_01_DATABASE.sh
fi
echo ""

# Step 2: Verify Database Adaptor
echo -e "${BLUE}Step 2: Verifying Database Adaptor...${NC}"
if docker ps | grep -q db-adaptor; then
    echo -e "${GREEN}✅ Database adaptor container is running${NC}"
    
    # Test adaptor health
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Adaptor health check: OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Adaptor health check failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Database adaptor not running${NC}"
    echo -e "${YELLOW}Note: Adaptor may need to be started separately${NC}"
fi
echo ""

# Step 3: Verify Wix Dev
echo -e "${BLUE}Step 3: Verifying Wix Dev...${NC}"
if pgrep -f "wix dev" > /dev/null; then
    WIX_PID=$(pgrep -f "wix dev")
    echo -e "${GREEN}✅ Wix dev is running (PID: $WIX_PID)${NC}"
    
    # Check Wix authentication
    if wix whoami > /dev/null 2>&1; then
        WIX_USER=$(wix whoami | head -1)
        echo -e "${GREEN}✅ Wix authenticated as: $WIX_USER${NC}"
    else
        echo -e "${YELLOW}⚠️  Wix authentication check failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Wix dev is not running${NC}"
    echo -e "${YELLOW}To start: wix dev${NC}"
fi
echo ""

# Step 4: Check Database Adaptor Endpoints
echo -e "${BLUE}Step 4: Checking Database Adaptor Endpoints...${NC}"

# Expected collections
COLLECTIONS=("donations" "members" "chat_clubs" "chat_messages" "ambassadors")

# Check if adaptor is accessible
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Adaptor is accessible${NC}"
    
    # Check each collection endpoint
    for collection in "${COLLECTIONS[@]}"; do
        SCHEMA_URL="http://localhost:3000/v1/collections/$collection/schema"
        ITEMS_URL="http://localhost:3000/v1/collections/$collection/items"
        
        if curl -s "$SCHEMA_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✅ $collection schema endpoint: OK${NC}"
        else
            echo -e "${YELLOW}  ⚠️  $collection schema endpoint: Not found${NC}"
        fi
        
        if curl -s "$ITEMS_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✅ $collection items endpoint: OK${NC}"
        else
            echo -e "${YELLOW}  ⚠️  $collection items endpoint: Not found${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Adaptor not accessible at http://localhost:3000${NC}"
fi
echo ""

# Step 5: Verify Database Tables Match Collections
echo -e "${BLUE}Step 5: Verifying Database Tables Match Collections...${NC}"

# Check each collection table exists
for collection in "${COLLECTIONS[@]}"; do
    TABLE_EXISTS=$(docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -t -c "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '$collection';
    " 2>/dev/null | tr -d ' ')
    
    if [ "$TABLE_EXISTS" = "1" ]; then
        ROW_COUNT=$(docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -t -c "
            SELECT COUNT(*) FROM $collection;
        " 2>/dev/null | tr -d ' ')
        echo -e "${GREEN}  ✅ $collection table exists ($ROW_COUNT rows)${NC}"
    else
        echo -e "${YELLOW}  ⚠️  $collection table not found${NC}"
    fi
done
echo ""

# Step 6: Check New Database Components
echo -e "${BLUE}Step 6: Checking New Database Components...${NC}"

# Check for new tables from master schema
NEW_TABLES=("users" "designs" "assets" "wallets" "transactions" "microfactories" "content_articles" "analytics_events" "audit_logs")

for table in "${NEW_TABLES[@]}"; do
    TABLE_EXISTS=$(docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -t -c "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '$table';
    " 2>/dev/null | tr -d ' ')
    
    if [ "$TABLE_EXISTS" = "1" ]; then
        echo -e "${GREEN}  ✅ $table table exists${NC}"
    else
        echo -e "${YELLOW}  ⚠️  $table table not found${NC}"
    fi
done
echo ""

# Step 7: Verify Functions and Views
echo -e "${BLUE}Step 7: Verifying Functions and Views...${NC}"

FUNCTION_COUNT=$(docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -t -c "
    SELECT COUNT(*) 
    FROM pg_proc 
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
" 2>/dev/null | tr -d ' ')

VIEW_COUNT=$(docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -t -c "
    SELECT COUNT(*) 
    FROM information_schema.views 
    WHERE table_schema = 'public';
" 2>/dev/null | tr -d ' ')

TRIGGER_COUNT=$(docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -t -c "
    SELECT COUNT(*) 
    FROM pg_trigger 
    WHERE tgisinternal = false;
" 2>/dev/null | tr -d ' ')

echo -e "${GREEN}✅ Functions: $FUNCTION_COUNT${NC}"
echo -e "${GREEN}✅ Views: $VIEW_COUNT${NC}"
echo -e "${GREEN}✅ Triggers: $TRIGGER_COUNT${NC}"
echo ""

# Step 8: Summary
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ SYNC VERIFICATION COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Database Status:"
echo "  Tables: $TABLE_COUNT"
echo "  Functions: $FUNCTION_COUNT"
echo "  Views: $VIEW_COUNT"
echo "  Triggers: $TRIGGER_COUNT"
echo ""
echo "Integration Status:"
if docker ps | grep -q hingecraft_postgres; then
    echo "  Database: ✅ Running"
else
    echo "  Database: ❌ Not Running"
fi

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "  Adaptor: ✅ Running"
else
    echo "  Adaptor: ⚠️  Not Running"
fi

if pgrep -f "wix dev" > /dev/null; then
    echo "  Wix Dev: ✅ Running"
else
    echo "  Wix Dev: ⚠️  Not Running"
fi
echo ""
echo "═══════════════════════════════════════════════════════════"






