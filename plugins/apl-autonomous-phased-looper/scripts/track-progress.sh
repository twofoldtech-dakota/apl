#!/bin/bash
# APL Progress Tracking Hook
# Tracks APL session progress and updates state file

# Read input from stdin
INPUT=$(cat)

# Get project root (current working directory)
PROJECT_ROOT=$(pwd)
APL_DIR="$PROJECT_ROOT/.apl"
STATE_FILE="$APL_DIR/state.json"
LOG_FILE="$APL_DIR/session.log"

# Ensure .apl directory exists
mkdir -p "$APL_DIR"

# Get current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Extract agent info from input
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // "unknown"')
AGENT_RESULT=$(echo "$INPUT" | jq -r '.result // "completed"')

# Log the event
echo "[$TIMESTAMP] Agent: $AGENT_TYPE, Result: $AGENT_RESULT" >> "$LOG_FILE"

# Update state file if it exists
if [ -f "$STATE_FILE" ]; then
    # Read current state
    CURRENT_STATE=$(cat "$STATE_FILE")

    # Update last_activity timestamp
    UPDATED_STATE=$(echo "$CURRENT_STATE" | jq --arg ts "$TIMESTAMP" '.last_activity = $ts')

    # Increment iteration counter for orchestrator
    if [ "$AGENT_TYPE" = "apl-orchestrator" ]; then
        UPDATED_STATE=$(echo "$UPDATED_STATE" | jq '.iteration = (.iteration // 0) + 1')
    fi

    # Write updated state
    echo "$UPDATED_STATE" > "$STATE_FILE"
fi

# Output success
echo "{\"continue\": true}"
exit 0
