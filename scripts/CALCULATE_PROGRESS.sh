#!/bin/bash
# Calculate Progress - Percentage Till Completion
# Analyzes all 600 agent tasks and calculates completion percentage

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "📊 CALCULATING PROGRESS - PERCENTAGE TILL COMPLETION"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Count tasks from TASKS_BREAKDOWN.md
TASKS_FILE="agents/TASKS_BREAKDOWN.md"

if [ ! -f "$TASKS_FILE" ]; then
    echo "  ❌ TASKS_BREAKDOWN.md not found"
    exit 1
fi

# Count completed tasks (✅)
COMPLETED=$(grep -c "✅" "$TASKS_FILE" || echo "0")

# Count in progress tasks (⏳)
IN_PROGRESS=$(grep -c "⏳" "$TASKS_FILE" || echo "0")

# Count planned tasks (📋)
PLANNED=$(grep -c "📋" "$TASKS_FILE" || echo "0")

# Total tasks
TOTAL_TASKS=600

# Calculate percentages
COMPLETED_PCT=$((COMPLETED * 100 / TOTAL_TASKS))
IN_PROGRESS_PCT=$((IN_PROGRESS * 100 / TOTAL_TASKS))
PLANNED_PCT=$((PLANNED * 100 / TOTAL_TASKS))
REMAINING=$((TOTAL_TASKS - COMPLETED))

# Phase breakdown
PHASE1_COMPLETED=$(grep -A 20 "Phase 1: Foundation" "$TASKS_FILE" | grep -c "✅" || echo "0")
PHASE2_COMPLETED=$(grep -A 20 "Phase 2: Core Capabilities" "$TASKS_FILE" | grep -c "✅" || echo "0")
PHASE3_COMPLETED=$(grep -A 20 "Phase 3: Advanced Features" "$TASKS_FILE" | grep -c "✅" || echo "0")
PHASE4_COMPLETED=$(grep -A 20 "Phase 4: Integration" "$TASKS_FILE" | grep -c "✅" || echo "0")
PHASE5_COMPLETED=$(grep -A 20 "Phase 5: Optimization" "$TASKS_FILE" | grep -c "✅" || echo "0")

PHASE1_TOTAL=120
PHASE2_TOTAL=120
PHASE3_TOTAL=120
PHASE4_TOTAL=120
PHASE5_TOTAL=120

PHASE1_PCT=$((PHASE1_COMPLETED * 100 / PHASE1_TOTAL))
PHASE2_PCT=$((PHASE2_COMPLETED * 100 / PHASE2_TOTAL))
PHASE3_PCT=$((PHASE3_COMPLETED * 100 / PHASE3_TOTAL))
PHASE4_PCT=$((PHASE4_COMPLETED * 100 / PHASE4_TOTAL))
PHASE5_PCT=$((PHASE5_COMPLETED * 100 / PHASE5_TOTAL))

# Agent breakdown
LEGAL_COMPLETED=$(grep -A 100 "Agent 1: Legal Agent" "$TASKS_FILE" | grep -c "✅" || echo "0")
MARKETING_COMPLETED=$(grep -A 100 "Agent 2: Marketing Agent" "$TASKS_FILE" | grep -c "✅" || echo "0")
ENGINEERING_COMPLETED=$(grep -A 100 "Agent 3: Engineering Agent" "$TASKS_FILE" | grep -c "✅" || echo "0")
EDUCATION_COMPLETED=$(grep -A 100 "Agent 4: Education Agent" "$TASKS_FILE" | grep -c "✅" || echo "0")
COMMUNITY_COMPLETED=$(grep -A 100 "Agent 5: Community Agent" "$TASKS_FILE" | grep -c "✅" || echo "0")
CRYPTO_COMPLETED=$(grep -A 100 "Agent 6: Crypto/Compliance Agent" "$TASKS_FILE" | grep -c "✅" || echo "0")

AGENT_TOTAL=100

LEGAL_PCT=$((LEGAL_COMPLETED * 100 / AGENT_TOTAL))
MARKETING_PCT=$((MARKETING_COMPLETED * 100 / AGENT_TOTAL))
ENGINEERING_PCT=$((ENGINEERING_COMPLETED * 100 / AGENT_TOTAL))
EDUCATION_PCT=$((EDUCATION_COMPLETED * 100 / AGENT_TOTAL))
COMMUNITY_PCT=$((COMMUNITY_COMPLETED * 100 / AGENT_TOTAL))
CRYPTO_PCT=$((CRYPTO_COMPLETED * 100 / AGENT_TOTAL))

echo "═══════════════════════════════════════════════════════════"
echo "OVERALL PROGRESS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Total Tasks: $TOTAL_TASKS"
echo "✅ Completed: $COMPLETED ($COMPLETED_PCT%)"
echo "⏳ In Progress: $IN_PROGRESS ($IN_PROGRESS_PCT%)"
echo "📋 Planned: $PLANNED ($PLANNED_PCT%)"
echo "Remaining: $REMAINING"
echo ""
echo "Overall Completion: $COMPLETED_PCT%"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "PROGRESS BY PHASE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Phase 1: Foundation"
echo "  Completed: $PHASE1_COMPLETED / $PHASE1_TOTAL ($PHASE1_PCT%)"
echo ""
echo "Phase 2: Core Capabilities"
echo "  Completed: $PHASE2_COMPLETED / $PHASE2_TOTAL ($PHASE2_PCT%)"
echo ""
echo "Phase 3: Advanced Features"
echo "  Completed: $PHASE3_COMPLETED / $PHASE3_TOTAL ($PHASE3_PCT%)"
echo ""
echo "Phase 4: Integration"
echo "  Completed: $PHASE4_COMPLETED / $PHASE4_TOTAL ($PHASE4_PCT%)"
echo ""
echo "Phase 5: Optimization"
echo "  Completed: $PHASE5_COMPLETED / $PHASE5_TOTAL ($PHASE5_PCT%)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "PROGRESS BY AGENT"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Legal Agent:"
echo "  Completed: $LEGAL_COMPLETED / $AGENT_TOTAL ($LEGAL_PCT%)"
echo ""
echo "Marketing Agent:"
echo "  Completed: $MARKETING_COMPLETED / $AGENT_TOTAL ($MARKETING_PCT%)"
echo ""
echo "Engineering Agent:"
echo "  Completed: $ENGINEERING_COMPLETED / $AGENT_TOTAL ($ENGINEERING_PCT%)"
echo ""
echo "Education Agent:"
echo "  Completed: $EDUCATION_COMPLETED / $AGENT_TOTAL ($EDUCATION_PCT%)"
echo ""
echo "Community Agent:"
echo "  Completed: $COMMUNITY_COMPLETED / $AGENT_TOTAL ($COMMUNITY_PCT%)"
echo ""
echo "Crypto/Compliance Agent:"
echo "  Completed: $CRYPTO_COMPLETED / $AGENT_TOTAL ($CRYPTO_PCT%)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "VISUAL PROGRESS BAR"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Create progress bar (50 chars)
BAR_LENGTH=50
FILLED=$((COMPLETED_PCT * BAR_LENGTH / 100))
EMPTY=$((BAR_LENGTH - FILLED))

printf "Overall: ["
for i in $(seq 1 $FILLED); do printf "█"; done
for i in $(seq 1 $EMPTY); do printf "░"; done
printf "] %d%%\n" $COMPLETED_PCT

echo ""
echo "Phase 1: ["
for i in $(seq 1 $((PHASE1_PCT * BAR_LENGTH / 100))); do printf "█"; done
for i in $(seq 1 $((BAR_LENGTH - PHASE1_PCT * BAR_LENGTH / 100))); do printf "░"; done
printf "] %d%%\n" $PHASE1_PCT

echo "Phase 2: ["
for i in $(seq 1 $((PHASE2_PCT * BAR_LENGTH / 100))); do printf "█"; done
for i in $(seq 1 $((BAR_LENGTH - PHASE2_PCT * BAR_LENGTH / 100))); do printf "░"; done
printf "] %d%%\n" $PHASE2_PCT

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "ESTIMATED TIME TO COMPLETION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Estimate based on current progress
if [ $COMPLETED_PCT -lt 20 ]; then
    ESTIMATED_WEEKS=40
elif [ $COMPLETED_PCT -lt 40 ]; then
    ESTIMATED_WEEKS=32
elif [ $COMPLETED_PCT -lt 60 ]; then
    ESTIMATED_WEEKS=24
elif [ $COMPLETED_PCT -lt 80 ]; then
    ESTIMATED_WEEKS=16
else
    ESTIMATED_WEEKS=8
fi

echo "Based on current progress ($COMPLETED_PCT% complete):"
echo "  Estimated weeks remaining: $ESTIMATED_WEEKS"
echo "  Estimated completion: Q$(( (ESTIMATED_WEEKS / 12) + 1 )) 2026"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "NEXT MILESTONES"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ $PHASE1_PCT -lt 100 ]; then
    echo "🎯 Milestone 1: Complete Phase 1 Foundation"
    echo "   Target: 100% (Currently: $PHASE1_PCT%)"
    echo "   Remaining: $((PHASE1_TOTAL - PHASE1_COMPLETED)) tasks"
fi

if [ $PHASE1_PCT -eq 100 ] && [ $PHASE2_PCT -lt 100 ]; then
    echo "🎯 Milestone 2: Complete Phase 2 Core Capabilities"
    echo "   Target: 100% (Currently: $PHASE2_PCT%)"
    echo "   Remaining: $((PHASE2_TOTAL - PHASE2_COMPLETED)) tasks"
fi

if [ $PHASE2_PCT -eq 100 ] && [ $PHASE3_PCT -lt 100 ]; then
    echo "🎯 Milestone 3: Complete Phase 3 Advanced Features"
    echo "   Target: 100% (Currently: $PHASE3_PCT%)"
    echo "   Remaining: $((PHASE3_TOTAL - PHASE3_COMPLETED)) tasks"
fi

echo ""
echo "✅ Progress calculation complete!"



