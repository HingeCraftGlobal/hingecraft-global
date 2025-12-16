#!/bin/bash

# Update All Files with Consistent Configuration
# Ensures all files share the same connection information

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")"

# Configuration Values (SINGLE SOURCE OF TRUTH)
CONNECTION_NAME="HingeCraftDonationsDB"
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
NGROK_URL="https://multiracial-zavier-acculturative.ngrok-free.dev
GIT_REPO="https://github.com/departments-commits/website-path-for-backend-contribution.git"
GIT_USER="William Ferguson"
GIT_EMAIL="chandlerferguson319@gmail.com"

echo -e "${BLUE}Updating all files with consistent configuration...${NC}"
echo ""

# Update velo-backend-api.js
echo -e "${YELLOW}Updating velo-backend-api.js...${NC}"
sed -i.bak "s|EXTERNAL_DB_ENDPOINT = '.*'|EXTERNAL_DB_ENDPOINT = '${NGROK_URL}'|g" velo-backend-api.js
sed -i.bak "s|EXTERNAL_DB_SECRET_KEY = '.*'|EXTERNAL_DB_SECRET_KEY = '${SECRET_KEY}'|g" velo-backend-api.js
sed -i.bak "s|Connection Name:.*|Connection Name: ${CONNECTION_NAME}|g" velo-backend-api.js 2>/dev/null || true
echo -e "${GREEN}✅ Updated${NC}"

# Update velo-backend-api-FIXED.js
if [ -f "velo-backend-api-FIXED.js" ]; then
    echo -e "${YELLOW}Updating velo-backend-api-FIXED.js...${NC}"
    sed -i.bak "s|EXTERNAL_DB_ENDPOINT = '.*'|EXTERNAL_DB_ENDPOINT = '${NGROK_URL}'|g" velo-backend-api-FIXED.js
    sed -i.bak "s|EXTERNAL_DB_SECRET_KEY = '.*'|EXTERNAL_DB_SECRET_KEY = '${SECRET_KEY}'|g" velo-backend-api-FIXED.js
    echo -e "${GREEN}✅ Updated${NC}"
fi

# Update all .md files with configuration
echo -e "${YELLOW}Updating documentation files...${NC}"
find . -name "*.md" -type f ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
    # Update connection name
    sed -i.bak "s|Connection Name:.*HingeCraft.*|Connection Name: ${CONNECTION_NAME}|g" "$file" 2>/dev/null || true
    sed -i.bak "s|HingeCraft_Donations_DB|${CONNECTION_NAME}|g" "$file" 2>/dev/null || true
    
    # Update secret key
    sed -i.bak "s|Secret Key:.*|Secret Key: ${SECRET_KEY}|g" "$file" 2>/dev/null || true
    sed -i.bak "s|04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b|${SECRET_KEY}|g" "$file" 2>/dev/null || true
    
    # Update ngrok URL (if present)
    sed -i.bak "s|https://multiracial-zavier-acculturative.ngrok-free.dev
    sed -i.bak "s|https://multiracial-zavier-acculturative.ngrok-free.dev
done
echo -e "${GREEN}✅ Updated documentation files${NC}"

# Update .txt configuration files
echo -e "${YELLOW}Updating configuration files...${NC}"
find . -name "*.txt" -type f ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
    sed -i.bak "s|Connection Name:.*|Connection Name: ${CONNECTION_NAME}|g" "$file" 2>/dev/null || true
    sed -i.bak "s|Secret Key:.*|Secret Key: ${SECRET_KEY}|g" "$file" 2>/dev/null || true
    sed -i.bak "s|https://multiracial-zavier-acculturative.ngrok-free.dev
done
echo -e "${GREEN}✅ Updated configuration files${NC}"

# Update .sh scripts
echo -e "${YELLOW}Updating shell scripts...${NC}"
find . -name "*.sh" -type f ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
    sed -i.bak "s|CONNECTION_NAME="HingeCraftDonationsDB"
    sed -i.bak "s|SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
    sed -i.bak "s|https://multiracial-zavier-acculturative.ngrok-free.dev
done
echo -e "${GREEN}✅ Updated shell scripts${NC}"

# Create master configuration file
echo -e "${YELLOW}Creating master configuration file...${NC}"
cat > MASTER_CONFIG.txt << EOF
╔════════════════════════════════════════════════════════════╗
║         HINGECRAFT MASTER CONFIGURATION                    ║
║         Single Source of Truth - Updated: $(date)          ║
╚════════════════════════════════════════════════════════════╝

WIX EXTERNAL DATABASE CONFIGURATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Connection Name:
${CONNECTION_NAME}

Endpoint URL:
${NGROK_URL}

Secret Key:
${SECRET_KEY}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GIT REPOSITORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository: ${GIT_REPO}
User: ${GIT_USER}
Email: ${GIT_EMAIL}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE SCHEMA (Field Names - Use These):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

id
amount
currency
is_other_amount
source
payment_status
payment_method
transaction_id
member_email
member_name
created_at
updated_at
metadata

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API ENDPOINTS (All Require Authentication):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET  /health              (requires auth - API is private)
GET  /donations/latest    (requires auth)
POST /donations           (requires auth)
GET  /donations           (requires auth)
GET  /export/json         (requires auth)

Authentication Headers:
  Authorization: Bearer ${SECRET_KEY}
  X-API-Key: ${SECRET_KEY}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ API is PRIVATE - All endpoints require authentication
✅ Health endpoint now requires authentication
✅ Use exact field names (snake_case) to avoid WDE0116
✅ Don't use wixData.aggregate() - use direct API calls
✅ All files have been updated with these values

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo -e "${GREEN}✅ Master configuration created: MASTER_CONFIG.txt${NC}"

# Clean up backup files
echo -e "${YELLOW}Cleaning up backup files...${NC}"
find . -name "*.bak" -type f -delete 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ All files updated with consistent configuration!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Configuration Values:${NC}"
echo "  Connection Name: ${CONNECTION_NAME}"
echo "  Endpoint URL: ${NGROK_URL}"
echo "  Secret Key: ${SECRET_KEY}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Restart Docker services: docker-compose restart"
echo "  2. Test connection: curl -H \"Authorization: Bearer ${SECRET_KEY}\" ${NGROK_URL}/health"
echo "  3. Update Wix with configuration from MASTER_CONFIG.txt"
echo ""














