#!/bin/bash
# Complete Database Buildout Execution Script
# Builds out all database portions: Master Schema, Enterprise, Security, Governance, RAG

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🏗️  COMPLETE DATABASE BUILDOUT EXECUTION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${YELLOW}Step 1: Checking Docker...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if PostgreSQL container exists
echo -e "${YELLOW}Step 2: Checking PostgreSQL container...${NC}"
if ! docker ps | grep -q postgres; then
    echo -e "${YELLOW}⚠️  PostgreSQL container not running. Starting...${NC}"
    if [ -f "LAUNCH_01_DATABASE.sh" ]; then
        ./LAUNCH_01_DATABASE.sh
    else
        echo -e "${RED}❌ LAUNCH_01_DATABASE.sh not found${NC}"
        exit 1
    fi
    sleep 5
fi
echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
echo ""

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Step 3: Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker exec postgres pg_isready -U hcuser > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    sleep 1
done
echo ""

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="hingecraft"
DB_USER="hcuser"
DB_PASS="hcpass"

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local description=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  File not found: $file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Executing: $description${NC}"
    if docker exec -i postgres psql -U "$DB_USER" -d "$DB_NAME" < "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $description completed${NC}"
        return 0
    else
        echo -e "${RED}❌ $description failed${NC}"
        return 1
    fi
}

# Function to execute SQL command
execute_sql() {
    local sql=$1
    local description=$2
    
    echo -e "${YELLOW}Executing: $description${NC}"
    if docker exec -i postgres psql -U "$DB_USER" -d "$DB_NAME" -c "$sql" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $description completed${NC}"
        return 0
    else
        echo -e "${RED}❌ $description failed${NC}"
        return 1
    fi
}

# Step 4: Apply Master Schema
echo -e "${YELLOW}Step 4: Applying Master Schema...${NC}"
MASTER_SCHEMA_DIR="database/master_schema"

# Apply in order
SCHEMA_FILES=(
    "00_master_schema_init.sql"
    "01_core_extensions.sql"
    "02_users_identity.sql"
    "03_design_metadata.sql"
    "04_community_activity.sql"
    "05_microfactory_integrations.sql"
    "06_content_contributions.sql"
    "07_environmental_impact.sql"
    "08_crypto_treasury.sql"
    "09_learning_skills.sql"
    "10_webhooks_assets_prompts.sql"
    "00_helper_functions.sql"
    "00_trigger_functions.sql"
    "00_views.sql"
    "00_domain_functions.sql"
    "00_additional_views.sql"
)

for file in "${SCHEMA_FILES[@]}"; do
    if [ -f "$MASTER_SCHEMA_DIR/$file" ]; then
        execute_sql_file "$MASTER_SCHEMA_DIR/$file" "Master Schema: $file"
    fi
done
echo ""

# Step 5: Apply Enterprise Components
echo -e "${YELLOW}Step 5: Applying Enterprise Components...${NC}"
ENTERPRISE_DIR="database/enterprise"

if [ -d "$ENTERPRISE_DIR" ]; then
    for file in "$ENTERPRISE_DIR"/*.sql; do
        if [ -f "$file" ]; then
            execute_sql_file "$file" "Enterprise: $(basename $file)"
        fi
    done
fi
echo ""

# Step 6: Apply Security Modules
echo -e "${YELLOW}Step 6: Applying Security Modules...${NC}"
SECURITY_DIR="database/security"

if [ -d "$SECURITY_DIR" ]; then
    # Apply main security files
    for file in "$SECURITY_DIR"/*.sql; do
        if [ -f "$file" ] && [[ ! "$file" =~ nano ]]; then
            execute_sql_file "$file" "Security: $(basename $file)"
        fi
    done
    
    # Apply nano security modules
    if [ -d "$SECURITY_DIR/nano" ]; then
        for file in "$SECURITY_DIR/nano"/*.sql; do
            if [ -f "$file" ]; then
                execute_sql_file "$file" "Security Nano: $(basename $file)"
            fi
        done
    fi
fi
echo ""

# Step 7: Apply Governance
echo -e "${YELLOW}Step 7: Applying Governance...${NC}"
GOVERNANCE_DIR="database/governance"

if [ -d "$GOVERNANCE_DIR" ]; then
    for file in "$GOVERNANCE_DIR"/*.sql; do
        if [ -f "$file" ]; then
            execute_sql_file "$file" "Governance: $(basename $file)"
        fi
    done
fi
echo ""

# Step 8: Apply RAG Knowledge Base
echo -e "${YELLOW}Step 8: Applying RAG Knowledge Base...${NC}"
RAG_DIR="database/rag_knowledge_base"

if [ -d "$RAG_DIR" ]; then
    for file in "$RAG_DIR"/*.sql; do
        if [ -f "$file" ]; then
            execute_sql_file "$file" "RAG: $(basename $file)"
        fi
    done
fi
echo ""

# Step 9: Apply Complete Schema
echo -e "${YELLOW}Step 9: Applying Complete Schema...${NC}"
if [ -f "database/complete_schema.sql" ]; then
    execute_sql_file "database/complete_schema.sql" "Complete Schema"
fi
echo ""

# Step 10: Verify Database
echo -e "${YELLOW}Step 10: Verifying Database...${NC}"

# Check tables
TABLE_COUNT=$(docker exec -i postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo -e "${GREEN}✅ Tables created: $TABLE_COUNT${NC}"

# Check functions
FUNCTION_COUNT=$(docker exec -i postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');" | tr -d ' ')
echo -e "${GREEN}✅ Functions created: $FUNCTION_COUNT${NC}"

# Check triggers
TRIGGER_COUNT=$(docker exec -i postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_trigger WHERE tgisinternal = false;" | tr -d ' ')
echo -e "${GREEN}✅ Triggers created: $TRIGGER_COUNT${NC}"

# Check views
VIEW_COUNT=$(docker exec -i postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public';" | tr -d ' ')
echo -e "${GREEN}✅ Views created: $VIEW_COUNT${NC}"

echo ""

# Step 11: Load Initial Data
echo -e "${YELLOW}Step 11: Loading Initial Data...${NC}"
if [ -f "database/init.sql" ]; then
    execute_sql_file "database/init.sql" "Initial Data"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DATABASE BUILDOUT COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Database Statistics:"
echo "  Tables: $TABLE_COUNT"
echo "  Functions: $FUNCTION_COUNT"
echo "  Triggers: $TRIGGER_COUNT"
echo "  Views: $VIEW_COUNT"
echo ""
echo "Connection Details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "═══════════════════════════════════════════════════════════"






