#!/bin/bash
# Push All 34 Legal Pages to Wix via CLI
# Attempts multiple methods to create pages programmatically

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo -e "${BLUE}🚀 Attempting to Push All 34 Legal Pages to Wix${NC}"
echo "======================================================================"
echo ""

# Method 1: Try wix publish
echo -e "${BLUE}Method 1: Trying wix publish...${NC}"
if command -v wix &> /dev/null; then
    echo -e "${GREEN}✅ Wix CLI found${NC}"
    
    # Check if logged in
    if wix whoami &> /dev/null; then
        echo -e "${GREEN}✅ Logged in to Wix${NC}"
        echo ""
        echo -e "${YELLOW}Attempting to publish pages...${NC}"
        
        # Try publishing (this may sync pages)
        if wix publish --dry-run 2>&1 | head -20; then
            echo -e "${GREEN}✅ Publish command available${NC}"
        else
            echo -e "${YELLOW}⚠️  Publish may require manual steps${NC}"
        fi
    else
        echo -e "${RED}❌ Not logged in. Run: wix login${NC}"
    fi
else
    echo -e "${RED}❌ Wix CLI not found${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${YELLOW}Note:${NC} Wix CLI doesn't have a direct 'create page' command"
echo "Pages must be created through Wix Editor or Wix REST API"
echo ""
echo -e "${BLUE}Alternative Methods:${NC}"
echo "1. Manual creation in Wix Editor (recommended)"
echo "2. Wix REST API (requires API credentials)"
echo "3. Wix dev sync (syncs existing pages, doesn't create new ones)"
echo ""
echo "======================================================================"



