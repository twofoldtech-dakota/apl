#!/bin/bash
# Tests for track-progress.sh hook script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

TRACK_SCRIPT="$PLUGIN_ROOT/scripts/track-progress.sh"

# Test: Script creates .apl directory if not exists
test_creates_apl_directory() {
    cd "$TEST_DIR"
    rm -rf "$TEST_DIR/.apl"

    echo '{"agent_type": "coder-agent", "result": "completed"}' | bash "$TRACK_SCRIPT"

    assert_dir_exists "$TEST_DIR/.apl" "Should create .apl directory"
}

# Test: Script logs agent events
test_logs_agent_events() {
    cd "$TEST_DIR"

    echo '{"agent_type": "coder-agent", "result": "completed"}' | bash "$TRACK_SCRIPT"

    assert_file_exists "$TEST_DIR/.apl/session.log" "Should create session log"

    local log_content=$(cat "$TEST_DIR/.apl/session.log")
    assert_contains "$log_content" "coder-agent" "Should log agent type"
    assert_contains "$log_content" "completed" "Should log result"
}

# Test: Script updates last_activity timestamp in state
test_updates_last_activity() {
    cd "$TEST_DIR"
    create_sample_state

    echo '{"agent_type": "coder-agent", "result": "completed"}' | bash "$TRACK_SCRIPT"

    local state=$(cat "$TEST_DIR/.apl/state.json")
    assert_json_has_field "$state" '.last_activity' "Should have last_activity field"
}

# Test: Script increments iteration for orchestrator
test_increments_iteration_for_orchestrator() {
    cd "$TEST_DIR"
    create_sample_state

    local initial_iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")

    echo '{"agent_type": "apl-orchestrator", "result": "completed"}' | bash "$TRACK_SCRIPT"

    local new_iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")
    local expected=$((initial_iteration + 1))

    assert_equals "$expected" "$new_iteration" "Should increment iteration for orchestrator"
}

# Test: Script does not increment iteration for other agents
test_no_increment_for_other_agents() {
    cd "$TEST_DIR"
    create_sample_state

    local initial_iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")

    echo '{"agent_type": "coder-agent", "result": "completed"}' | bash "$TRACK_SCRIPT"

    local new_iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")

    assert_equals "$initial_iteration" "$new_iteration" "Should not increment iteration for non-orchestrator agents"
}

# Test: Script handles missing state file gracefully
test_handles_missing_state() {
    cd "$TEST_DIR"
    rm -f "$TEST_DIR/.apl/state.json"

    local result=$(echo '{"agent_type": "coder-agent", "result": "completed"}' | bash "$TRACK_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Should handle missing state file"
    assert_valid_json "$result" "Output should be valid JSON"
}

# Test: Script returns continue: true
test_returns_continue_true() {
    cd "$TEST_DIR"

    local result=$(echo '{"agent_type": "coder-agent", "result": "completed"}' | bash "$TRACK_SCRIPT")

    assert_valid_json "$result" "Output should be valid JSON"
    assert_json_field "$result" '.continue' 'true' "Should return continue: true"
}

# Test: Script handles unknown agent type
test_handles_unknown_agent_type() {
    cd "$TEST_DIR"
    create_sample_state

    local result=$(echo '{"result": "completed"}' | bash "$TRACK_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Should handle missing agent type"

    local log_content=$(cat "$TEST_DIR/.apl/session.log")
    assert_contains "$log_content" "unknown" "Should log unknown for missing agent type"
}

# Test: Script handles malformed JSON input
test_handles_malformed_json() {
    cd "$TEST_DIR"

    # jq will fail to parse, but script should still work
    local result=$(echo 'not json' | bash "$TRACK_SCRIPT" 2>&1)
    local exit_code=$?

    # Script should still exit successfully
    assert_exit_code 0 $exit_code "Should handle malformed JSON gracefully"
}

# Test: Script preserves existing state fields
test_preserves_state_fields() {
    cd "$TEST_DIR"
    create_sample_state

    local original_goal=$(jq -r '.goal' "$TEST_DIR/.apl/state.json")
    local original_phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")

    echo '{"agent_type": "coder-agent", "result": "completed"}' | bash "$TRACK_SCRIPT"

    local new_goal=$(jq -r '.goal' "$TEST_DIR/.apl/state.json")
    local new_phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")

    assert_equals "$original_goal" "$new_goal" "Should preserve goal field"
    assert_equals "$original_phase" "$new_phase" "Should preserve phase field"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
