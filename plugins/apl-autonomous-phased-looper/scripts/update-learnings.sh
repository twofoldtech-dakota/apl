#!/bin/bash
# APL Learning Persistence Hook
# Called on session stop to ensure learnings are persisted

# Get project root
PROJECT_ROOT=$(pwd)
APL_DIR="$PROJECT_ROOT/.apl"
LEARNINGS_FILE="$APL_DIR/learnings.json"
SESSION_FILE="$APL_DIR/state.json"
LOG_FILE="$APL_DIR/session.log"

# Get current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log session end
echo "[$TIMESTAMP] Session ended" >> "$LOG_FILE" 2>/dev/null || true

# Check if we have session state to process
if [ ! -f "$SESSION_FILE" ]; then
    # No session state, nothing to persist
    exit 0
fi

# Lock file for safe concurrent access
LOCK_FILE="$APL_DIR/.state.lock"

# Read session state (with lock to prevent race with track-progress.sh)
SESSION_STATE=$(
    flock -w 5 "$LOCK_FILE" cat "$SESSION_FILE" 2>/dev/null || echo "{}"
)

# Check if there are pending learnings to persist
PENDING_LEARNINGS=$(echo "$SESSION_STATE" | jq -r '.learning.pending_persist // []')

# Check cleanup flag early so we can handle it regardless of pending learnings
CLEANUP=$(echo "$SESSION_STATE" | jq -r '.cleanup_on_exit // false')

if [ "$PENDING_LEARNINGS" = "[]" ] || [ "$PENDING_LEARNINGS" = "null" ]; then
    # No pending learnings, but still handle cleanup
    if [ "$CLEANUP" = "true" ]; then
        rm -f "$SESSION_FILE"
    fi
    exit 0
fi

# Ensure learnings file exists with default structure
if [ ! -f "$LEARNINGS_FILE" ]; then
    mkdir -p "$APL_DIR"
    cat > "$LEARNINGS_FILE" << 'EOF'
{
  "version": "1.0.0",
  "last_updated": null,
  "success_patterns": [],
  "anti_patterns": [],
  "user_preferences": {
    "code_style": {},
    "preferred_libraries": [],
    "avoided_libraries": []
  },
  "project_knowledge": {
    "entry_points": [],
    "key_files": {},
    "conventions": {}
  },
  "technique_stats": {
    "react_pattern": {"success": 0, "failure": 0},
    "cove_verification": {"caught_issues": 0, "false_positives": 0},
    "reflexion": {"improvements_found": 0, "no_issues": 0},
    "parallel_execution": {"time_saved_percent": 0}
  }
}
EOF
fi

# Update last_updated timestamp with safe atomic write
TEMP_FILE=$(mktemp "${LEARNINGS_FILE}.XXXXXX")
if UPDATED_LEARNINGS=$(cat "$LEARNINGS_FILE" | jq --arg ts "$TIMESTAMP" '.last_updated = $ts') && \
   [ -n "$UPDATED_LEARNINGS" ] && \
   echo "$UPDATED_LEARNINGS" | jq empty 2>/dev/null; then
    echo "$UPDATED_LEARNINGS" > "$TEMP_FILE"
    mv "$TEMP_FILE" "$LEARNINGS_FILE"
else
    rm -f "$TEMP_FILE"
    echo "{\"continue\": true, \"warning\": \"Failed to update learnings timestamp\"}"
    exit 0
fi

# Note: The actual learning extraction and merging is done by the learner-agent
# This script just ensures the infrastructure is in place and timestamps are updated

# Clean up session state if requested (with lock)
CLEANUP=$(echo "$SESSION_STATE" | jq -r '.cleanup_on_exit // false')
if [ "$CLEANUP" = "true" ]; then
    (
        flock -w 5 200
        rm -f "$SESSION_FILE"
    ) 200>"$LOCK_FILE"
fi

echo "{\"continue\": true, \"message\": \"Learnings checkpoint saved\"}"
exit 0
