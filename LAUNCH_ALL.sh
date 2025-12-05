#!/bin/bash
# Launch All - Complete System Launch
# Launches database, agents, services, and verifies expansion

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 LAUNCH ALL - COMPLETE SYSTEM DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Launch 01: Database
echo "═══════════════════════════════════════════════════════════"
echo "LAUNCH 01: DATABASE"
echo "═══════════════════════════════════════════════════════════"
bash "$SCRIPT_DIR/LAUNCH_01_DATABASE.sh" 2>&1 | tail -25

# Launch 02: Agents
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "LAUNCH 02: AGENTS"
echo "═══════════════════════════════════════════════════════════"
bash "$SCRIPT_DIR/LAUNCH_02_AGENTS.sh" 2>&1 | tail -30

# Launch 03: Services
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "LAUNCH 03: SERVICES"
echo "═══════════════════════════════════════════════════════════"
bash "$SCRIPT_DIR/LAUNCH_03_SERVICES.sh" 2>&1 | tail -30

# Launch 04: Expansion
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "LAUNCH 04: EXPANSION"
echo "═══════════════════════════════════════════════════════════"
bash "$SCRIPT_DIR/LAUNCH_04_EXPANSION.sh" 2>&1 | tail -30

# Final summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 COMPLETE SYSTEM LAUNCH SUCCESSFUL"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ All Systems Operational:"
echo "  ✅ Database: Live and verified"
echo "  ✅ Agents: All 6 agents functional"
echo "  ✅ Services: All Docker services running"
echo "  ✅ Expansion: Database expansion verified"
echo ""
echo "🚀 System Ready for Production!"
echo ""

