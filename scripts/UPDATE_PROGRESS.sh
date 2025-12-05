#!/bin/bash
# Update Progress - Mark tasks as complete
# Usage: ./UPDATE_PROGRESS.sh <agent> <task_number> <status>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

AGENT=$1
TASK_NUM=$2
STATUS=${3:-completed}

cd "$PROJECT_ROOT"

if [ -z "$AGENT" ] || [ -z "$TASK_NUM" ]; then
    echo "Usage: ./UPDATE_PROGRESS.sh <agent> <task_number> [status]"
    echo "Example: ./UPDATE_PROGRESS.sh legal 21 completed"
    exit 1
fi

TASKS_FILE="agents/TASKS_BREAKDOWN.md"

# Map agent names to patterns
case $AGENT in
    legal)
        PATTERN="Agent 1: Legal Agent"
        ;;
    marketing)
        PATTERN="Agent 2: Marketing Agent"
        ;;
    engineering)
        PATTERN="Agent 3: Engineering Agent"
        ;;
    education)
        PATTERN="Agent 4: Education Agent"
        ;;
    community)
        PATTERN="Agent 5: Community Agent"
        ;;
    crypto|compliance)
        PATTERN="Agent 6: Crypto/Compliance Agent"
        ;;
    *)
        echo "Unknown agent: $AGENT"
        exit 1
        ;;
esac

# Update task status in TASKS_BREAKDOWN.md
if [ "$STATUS" == "completed" ]; then
    # Find and replace task marker
    sed -i.bak "s/${TASK_NUM}\. ⏳/${TASK_NUM}. ✅/g" "$TASKS_FILE"
    sed -i.bak "s/${TASK_NUM}\. 📋/${TASK_NUM}. ✅/g" "$TASKS_FILE"
    echo "✅ Marked task $TASK_NUM as completed"
elif [ "$STATUS" == "in_progress" ]; then
    sed -i.bak "s/${TASK_NUM}\. 📋/${TASK_NUM}. ⏳/g" "$TASKS_FILE"
    sed -i.bak "s/${TASK_NUM}\. ✅/${TASK_NUM}. ⏳/g" "$TASKS_FILE"
    echo "⏳ Marked task $TASK_NUM as in progress"
fi

# Clean up backup
rm -f "${TASKS_FILE}.bak"

# Recalculate progress
echo ""
bash "$SCRIPT_DIR/CALCULATE_PROGRESS.sh" | tail -20

