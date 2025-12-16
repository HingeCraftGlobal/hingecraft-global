#!/bin/bash

# Clean up duplicate and backup files

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")"

echo -e "${YELLOW}Cleaning up duplicate and backup files...${NC}"
echo ""

# Remove backup files
echo -e "${YELLOW}Removing .bak backup files...${NC}"
find . -name "*.bak" -type f -delete 2>/dev/null || true
echo -e "${GREEN}✅ Backup files removed${NC}"
echo ""

# Remove duplicate FIXED files (keep originals)
echo -e "${YELLOW}Checking for duplicate FIXED files...${NC}"
DUPLICATES=(
    "velo-backend-api-FIXED.js"
    "wix-frontend-code-FIXED.js"
    "test-wix-connection.js"
)

for file in "${DUPLICATES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}  Keeping: $file (may be needed)${NC}"
    fi
done
echo ""

# Count files
TOTAL=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./database/*" ! -path "./database-adaptor/node_modules/*" ! -path "./python-server/*" | wc -l | tr -d ' ')
echo -e "${GREEN}Total files: $TOTAL${NC}"
echo ""

echo -e "${GREEN}✅ Cleanup complete${NC}"














