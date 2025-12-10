#!/bin/bash
# Complete Repository Cleanup and Organization Script

set -e

echo "=========================================="
echo "HingeCraft Repository Cleanup"
echo "=========================================="
echo ""

# Step 1: Remove Python cache files
echo "🧹 Step 1: Removing Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true
echo "✅ Python cache cleaned"

# Step 2: Remove OS files
echo ""
echo "🧹 Step 2: Removing OS files..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
echo "✅ OS files cleaned"

# Step 3: Remove temporary files
echo ""
echo "🧹 Step 3: Removing temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.bak" -delete 2>/dev/null || true
find . -name "*.backup" -delete 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
echo "✅ Temporary files cleaned"

# Step 4: Remove log files (keep important ones)
echo ""
echo "🧹 Step 4: Cleaning log files..."
find . -name "*.log" ! -path "./logs/*" -delete 2>/dev/null || true
echo "✅ Log files cleaned"

# Step 5: Organize documentation duplicates
echo ""
echo "📁 Step 5: Identifying duplicate documentation..."
# This will be handled by Python script

# Step 6: Update .gitignore
echo ""
echo "📝 Step 6: Ensuring .gitignore is complete..."
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
*.egg-info/
dist/
build/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary
*.tmp
*.bak
*.backup
*.swp
*.swo
*~

# Database
pgdata/
*.db
*.sqlite

# Node
node_modules/
npm-debug.log

# IDE
.vscode/
.idea/
*.swp

# Secrets
*.env
!*.example.env
secrets/
EOF
    echo "✅ Created .gitignore"
else
    echo "✅ .gitignore exists"
fi

echo ""
echo "=========================================="
echo "✅ Cleanup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Add cleaned files: git add -A"
echo "3. Commit: git commit -m 'Clean up repository: remove cache and temp files'"
