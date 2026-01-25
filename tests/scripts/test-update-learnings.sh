#!/bin/bash
# Tests for update-learnings.sh hook script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

UPDATE_SCRIPT="$PLUGIN_ROOT/scripts/update-learnings.sh"

# Test: Script exits 0 when no session state exists
test_no_session_state_exits_zero() {
    cd "$TEST_DIR"

    local result=$(bash "$UPDATE_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Should exit 0 when no session state"
}

# Test: Script exits 0 when no pending learnings
test_no_pending_learnings_exits_zero() {
    cd "$TEST_DIR"

    # Create session state with no pending learnings
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "phase": "complete",
  "learning": {
    "pending_persist": []
  }
}
EOF

    local result=$(bash "$UPDATE_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Should exit 0 when no pending learnings"
}

# Test: Script creates learnings file if not exists
test_creates_learnings_file() {
    cd "$TEST_DIR"

    # Create session state with pending learnings
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "phase": "complete",
  "learning": {
    "pending_persist": ["pattern1"]
  }
}
EOF

    # Ensure learnings file doesn't exist
    rm -f "$TEST_DIR/.apl/learnings.json"

    bash "$UPDATE_SCRIPT"

    assert_file_exists "$TEST_DIR/.apl/learnings.json" "Should create learnings file"
    assert_valid_json_file "$TEST_DIR/.apl/learnings.json" "Created file should be valid JSON"
}

# Test: Script updates last_updated timestamp
test_updates_timestamp() {
    cd "$TEST_DIR"
    create_sample_learnings

    # Create session state with pending learnings
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "learning": {
    "pending_persist": ["pattern1"]
  }
}
EOF

    local old_timestamp=$(jq -r '.last_updated' "$TEST_DIR/.apl/learnings.json")

    # Wait a second to ensure different timestamp
    sleep 1
    bash "$UPDATE_SCRIPT"

    local new_timestamp=$(jq -r '.last_updated' "$TEST_DIR/.apl/learnings.json")

    assert_not_equals "$old_timestamp" "$new_timestamp" "Timestamp should be updated"
}

# Test: Script logs session end
test_logs_session_end() {
    cd "$TEST_DIR"

    # Create session state
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "learning": {
    "pending_persist": ["pattern1"]
  }
}
EOF

    bash "$UPDATE_SCRIPT"

    assert_file_exists "$TEST_DIR/.apl/session.log" "Should create session log"

    local log_content=$(cat "$TEST_DIR/.apl/session.log")
    assert_contains "$log_content" "Session ended" "Should log session end"
}

# Test: Script cleans up session state when cleanup_on_exit is true
test_cleanup_on_exit() {
    cd "$TEST_DIR"

    # Create session state with cleanup flag
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "learning": {
    "pending_persist": []
  },
  "cleanup_on_exit": true
}
EOF

    bash "$UPDATE_SCRIPT"

    assert_file_not_exists "$TEST_DIR/.apl/state.json" "Should remove state file when cleanup_on_exit is true"
}

# Test: Script preserves session state when cleanup_on_exit is false
test_no_cleanup_preserves_state() {
    cd "$TEST_DIR"

    # Create session state without cleanup flag
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "learning": {
    "pending_persist": []
  },
  "cleanup_on_exit": false
}
EOF

    bash "$UPDATE_SCRIPT"

    assert_file_exists "$TEST_DIR/.apl/state.json" "Should preserve state file when cleanup_on_exit is false"
}

# Test: Script returns JSON with continue: true
test_returns_continue_true() {
    cd "$TEST_DIR"

    # Create session state with pending learnings
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "learning": {
    "pending_persist": ["pattern1"]
  }
}
EOF

    local result=$(bash "$UPDATE_SCRIPT")

    assert_valid_json "$result" "Output should be valid JSON"
    assert_json_field "$result" '.continue' 'true' "Should return continue: true"
}

# Test: Script handles null pending_persist
test_handles_null_pending() {
    cd "$TEST_DIR"

    # Create session state with null pending_persist
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "learning": {
    "pending_persist": null
  }
}
EOF

    local result=$(bash "$UPDATE_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Should handle null pending_persist"
}

# Test: Script creates proper default learnings structure
test_default_learnings_structure() {
    cd "$TEST_DIR"

    # Create session state with pending learnings
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test goal",
  "learning": {
    "pending_persist": ["pattern1"]
  }
}
EOF

    # Ensure learnings file doesn't exist
    rm -f "$TEST_DIR/.apl/learnings.json"

    bash "$UPDATE_SCRIPT"

    local learnings=$(cat "$TEST_DIR/.apl/learnings.json")

    assert_json_has_field "$learnings" '.version' "Should have version field"
    assert_json_has_field "$learnings" '.success_patterns' "Should have success_patterns field"
    assert_json_has_field "$learnings" '.anti_patterns' "Should have anti_patterns field"
    assert_json_has_field "$learnings" '.user_preferences' "Should have user_preferences field"
    assert_json_has_field "$learnings" '.technique_stats' "Should have technique_stats field"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
