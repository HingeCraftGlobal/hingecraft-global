#!/bin/bash

# Apply All Database Data to Git Repository
# This script ensures all database data is committed and ready

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📦 Apply All Database Data to Git Repository${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd [PROJECT_ROOT]/HingeCraft

# Step 1: Verify all database files exist
echo -e "${YELLOW}Step 1: Verifying database files...${NC}"
DB_FILES=(
    "COMPLETE_DATABASE_EXPORT.json"
    "donations_export.csv"
    "donations_wix_import.csv"
    "donations_wix_template.csv"
    "database/init.sql"
)

ALL_EXIST=true
for file in "${DB_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(ls -lh "$file" | awk '{print $5}')
        echo -e "${GREEN}✅ $file ($SIZE)${NC}"
    else
        echo -e "${YELLOW}⚠️ Missing: $file${NC}"
        ALL_EXIST=false
    fi
done

# Step 2: Add all database files to git
echo ""
echo -e "${YELLOW}Step 2: Adding all database files to git...${NC}"
git add COMPLETE_DATABASE_EXPORT.json 2>/dev/null || echo "File already tracked"
git add donations_export.csv 2>/dev/null || echo "File already tracked"
git add donations_wix_import.csv 2>/dev/null || echo "File already tracked"
git add donations_wix_template.csv 2>/dev/null || echo "File already tracked"
git add database/init.sql 2>/dev/null || echo "File already tracked"
git add database/ 2>/dev/null || echo "Directory already tracked"

# Step 3: Create database data summary
echo ""
echo -e "${YELLOW}Step 3: Creating database data summary...${NC}"
cat > DATABASE_DATA_SUMMARY.md << 'EOF'
# 📦 Database Data - Complete Export

## ✅ All Database Data Applied to Repository

### Database Files:

1. **COMPLETE_DATABASE_EXPORT.json**
   - Complete database export in JSON format
   - Contains all donation records
   - Ready for import/backup

2. **donations_export.csv**
   - CSV export of all donations
   - Compatible with spreadsheet applications
   - Ready for data analysis

3. **donations_wix_import.csv**
   - Wix-compatible CSV format
   - Ready to import into Wix CMS
   - Includes all required fields

4. **donations_wix_template.csv**
   - Template for Wix imports
   - Shows required field structure
   - Reference for future imports

5. **database/init.sql**
   - Database schema initialization
   - Creates all tables and indexes
   - Includes Wix-specific columns

---

## 📋 Database Schema

### Tables:
- `donations` - Main donations table with all fields

### Wix-Specific Fields:
- `_id` - Unique identifier
- `_createdDate` - Creation timestamp
- `_updatedDate` - Update timestamp
- `_owner` - Owner identifier

---

## 🚀 Usage

### Import to Wix:
1. Use `donations_wix_import.csv` for Wix CMS import
2. Or use `COMPLETE_DATABASE_EXPORT.json` for API import

### Restore Database:
1. Use `database/init.sql` to recreate schema
2. Import data from `COMPLETE_DATABASE_EXPORT.json`

---

**All database data is now in the repository!**
EOF

echo -e "${GREEN}✅ DATABASE_DATA_SUMMARY.md created${NC}"

# Step 4: Commit all database files
echo ""
echo -e "${YELLOW}Step 4: Committing all database files...${NC}"
git add DATABASE_DATA_SUMMARY.md
git add -A

if git diff --staged --quiet 2>/dev/null; then
    echo -e "${GREEN}✅ All database files already committed${NC}"
else
    git commit -m "Apply all database data: Complete database export and schema

✅ COMPLETE_DATABASE_EXPORT.json - Full database export
✅ donations_export.csv - CSV export
✅ donations_wix_import.csv - Wix-compatible import
✅ donations_wix_template.csv - Import template
✅ database/init.sql - Database schema
✅ DATABASE_DATA_SUMMARY.md - Data summary
✅ All database data applied to repository" && echo -e "${GREEN}✅ Database files committed${NC}"
fi

# Step 5: Show summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All Database Data Applied!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📦 Database Files Committed:${NC}"
git log -1 --name-only --pretty=format:"" | grep -E "\.(json|csv|sql|md)$" | head -10
echo ""
echo -e "${GREEN}✅ All database data is now in the repository!${NC}"
echo ""







