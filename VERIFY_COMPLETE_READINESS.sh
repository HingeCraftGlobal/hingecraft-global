#!/bin/bash
# Complete System Readiness Verification
# Verifies all components before launch

set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 COMPLETE SYSTEM READINESS VERIFICATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# 1. Check Docker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. DOCKER VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v docker &> /dev/null; then
    echo "  ✅ Docker installed: $(docker --version)"
    if docker info &>/dev/null; then
        echo "  ✅ Docker daemon running"
    else
        echo "  ❌ Docker daemon NOT running"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "  ❌ Docker not installed"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Check Configuration Files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. CONFIGURATION FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "docker-compose.yml" ]; then
    echo "  ✅ docker-compose.yml exists"
else
    echo "  ❌ docker-compose.yml missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    ENV_VARS=$(grep -c "=" .env 2>/dev/null || echo "0")
    echo "    Found $ENV_VARS environment variables"
else
    echo "  ⚠️  .env file missing (will be created)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 3. Check Database Schema Files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. DATABASE SCHEMA FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "database/master_schema" ]; then
    SCHEMA_COUNT=$(find database/master_schema -name "*.sql" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ Master schema directory exists"
    echo "    Found $SCHEMA_COUNT schema files"
    if [ "$SCHEMA_COUNT" -lt 10 ]; then
        echo "  ⚠️  Expected at least 10 schema files"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ❌ database/master_schema directory missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "database/rag_knowledge_base" ]; then
    RAG_COUNT=$(find database/rag_knowledge_base -name "*.sql" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ RAG knowledge base directory exists"
    echo "    Found $RAG_COUNT RAG schema files"
else
    echo "  ⚠️  database/rag_knowledge_base directory missing"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 4. Check API Files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. API FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "api/main.py" ]; then
    echo "  ✅ api/main.py exists"
else
    echo "  ❌ api/main.py missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "api/routers" ]; then
    ROUTER_COUNT=$(find api/routers -name "*.py" -not -name "__*" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ api/routers directory exists"
    echo "    Found $ROUTER_COUNT router files"
    
    # Check key routers
    for router in auth donations wallets compliance receipts admin webhooks wix; do
        if [ -f "api/routers/$router.py" ]; then
            echo "    ✅ $router.py exists"
        else
            echo "    ⚠️  $router.py missing"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    echo "  ❌ api/routers directory missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "api/requirements.txt" ]; then
    echo "  ✅ api/requirements.txt exists"
else
    echo "  ⚠️  api/requirements.txt missing"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "api/Dockerfile" ]; then
    echo "  ✅ api/Dockerfile exists"
else
    echo "  ⚠️  api/Dockerfile missing"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 5. Check Agents
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. AGENT FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "agents" ]; then
    AGENT_DIRS=("legal" "marketing" "engineering" "education" "community" "crypto")
    TOTAL_FILES=0
    for agent in "${AGENT_DIRS[@]}"; do
        if [ -d "agents/$agent" ]; then
            FILE_COUNT=$(find "agents/$agent" -name "*.py" -type f 2>/dev/null | wc -l | tr -d ' ')
            TOTAL_FILES=$((TOTAL_FILES + FILE_COUNT))
            echo "  ✅ $agent Agent: $FILE_COUNT files"
        else
            echo "  ⚠️  $agent Agent directory missing"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
    echo "    Total agent files: $TOTAL_FILES"
else
    echo "  ⚠️  agents directory missing"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 6. Check Launch Scripts
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. LAUNCH SCRIPTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LAUNCH_SCRIPTS=("MASTER_LAUNCH.sh" "CHECK_DOCKER.sh" "LAUNCH_BREAKDOWN.sh" "LAUNCH_ALL.sh" "LAUNCH_01_DATABASE.sh" "LAUNCH_02_AGENTS.sh" "LAUNCH_03_SERVICES.sh" "LAUNCH_04_EXPANSION.sh")
for script in "${LAUNCH_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "  ✅ $script (executable)"
        else
            echo "  ⚠️  $script (not executable)"
            chmod +x "$script" 2>/dev/null
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "  ⚠️  $script missing"
        WARNINGS=$((WARNINGS + 1))
    fi
done
echo ""

# 7. Check Wix Integration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. WIX INTEGRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "wix_integration" ]; then
    echo "  ✅ wix_integration directory exists"
    if [ -f "wix_integration/wix_velo_example.js" ]; then
        echo "  ✅ Wix Velo example code exists"
    fi
else
    echo "  ⚠️  wix_integration directory missing"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "wix.config.json" ]; then
    echo "  ✅ wix.config.json exists"
else
    echo "  ⚠️  wix.config.json missing"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -d "src/pages" ]; then
    PAGE_COUNT=$(find src/pages -name "*.js" -o -name "*.html" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ src/pages directory exists"
    echo "    Found $PAGE_COUNT page files"
else
    echo "  ⚠️  src/pages directory missing"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 8. Check Documentation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
DOC_FILES=("README.md" "FINAL_LAUNCH_READY.md" "LAUNCH_INSTRUCTIONS.md" "COMPLETE_LAUNCH_STATUS.md" "ALL_LIVE_PAGE_URLS.md")
for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc exists"
    else
        echo "  ⚠️  $doc missing"
        WARNINGS=$((WARNINGS + 1))
    fi
done
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "✅ SYSTEM READY FOR LAUNCH"
        echo ""
        echo "Next steps:"
        echo "  1. Start Docker Desktop: open -a Docker"
        echo "  2. Verify Docker: ./CHECK_DOCKER.sh"
        echo "  3. Launch system: ./MASTER_LAUNCH.sh"
        exit 0
    else
        echo "⚠️  SYSTEM READY WITH WARNINGS"
        echo ""
        echo "System can launch, but some optional components are missing."
        echo "Review warnings above and proceed if acceptable."
        exit 0
    fi
else
    echo "❌ SYSTEM NOT READY"
    echo ""
    echo "Please fix the errors above before launching."
    exit 1
fi

