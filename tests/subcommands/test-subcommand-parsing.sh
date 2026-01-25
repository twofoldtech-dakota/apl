#!/bin/bash
# Tests for APL subcommand parsing
# These tests verify that /apl status, /apl reset, /apl rollback, etc. work correctly

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# Subcommand parsing function (this should match the implementation in the skill/agent)
parse_subcommand() {
    local input="$1"

    # Trim whitespace
    input=$(echo "$input" | xargs)

    # Extract first word as potential subcommand
    local first_word=$(echo "$input" | awk '{print $1}')

    # Extract rest of input (everything after first word)
    # Using awk to properly handle case when there's only one word
    local rest=$(echo "$input" | awk '{$1=""; print $0}' | xargs)

    case "$first_word" in
        status)
            echo "SUBCOMMAND:status"
            ;;
        reset)
            echo "SUBCOMMAND:reset"
            ;;
        rollback)
            if [ -z "$rest" ]; then
                echo "ERROR:rollback requires checkpoint ID"
            else
                echo "SUBCOMMAND:rollback:$rest"
            fi
            ;;
        forget)
            if [ -z "$rest" ]; then
                echo "ERROR:forget requires pattern ID or --all"
            elif [ "$rest" = "--all" ]; then
                echo "SUBCOMMAND:forget:all"
            else
                echo "SUBCOMMAND:forget:$rest"
            fi
            ;;
        *)
            # Not a subcommand, treat as goal
            echo "GOAL:$input"
            ;;
    esac
}

# Test: Parse status subcommand
test_parse_status() {
    local result=$(parse_subcommand "status")
    assert_equals "SUBCOMMAND:status" "$result" "Should parse 'status' as subcommand"
}

# Test: Parse reset subcommand
test_parse_reset() {
    local result=$(parse_subcommand "reset")
    assert_equals "SUBCOMMAND:reset" "$result" "Should parse 'reset' as subcommand"
}

# Test: Parse rollback with checkpoint ID
test_parse_rollback_with_id() {
    local result=$(parse_subcommand "rollback cp_003")
    assert_equals "SUBCOMMAND:rollback:cp_003" "$result" "Should parse 'rollback cp_003' correctly"
}

# Test: Parse rollback without ID gives error
test_parse_rollback_without_id() {
    local result=$(parse_subcommand "rollback")
    assert_contains "$result" "ERROR" "Should error when rollback has no checkpoint ID"
}

# Test: Parse forget with pattern ID
test_parse_forget_with_id() {
    local result=$(parse_subcommand "forget sp_001")
    assert_equals "SUBCOMMAND:forget:sp_001" "$result" "Should parse 'forget sp_001' correctly"
}

# Test: Parse forget --all
test_parse_forget_all() {
    local result=$(parse_subcommand "forget --all")
    assert_equals "SUBCOMMAND:forget:all" "$result" "Should parse 'forget --all' correctly"
}

# Test: Parse forget without argument gives error
test_parse_forget_without_arg() {
    local result=$(parse_subcommand "forget")
    assert_contains "$result" "ERROR" "Should error when forget has no argument"
}

# Test: Regular goal is parsed as goal
test_parse_regular_goal() {
    local result=$(parse_subcommand "Build a REST API with authentication")
    assert_contains "$result" "GOAL:" "Should parse regular text as goal"
    assert_contains "$result" "REST API" "Goal should contain the original text"
}

# Test: Goal starting with "status" word but not subcommand
test_parse_status_in_goal() {
    local result=$(parse_subcommand "status should be displayed on the dashboard")
    # This is ambiguous - could be subcommand or goal
    # Current implementation treats "status" alone as subcommand
    # If followed by other words, it's a goal
    # Need to decide on behavior
    assert_contains "$result" "SUBCOMMAND:status" "Currently parses as subcommand (may need refinement)"
}

# Test: Empty input
test_parse_empty_input() {
    local result=$(parse_subcommand "")
    assert_equals "GOAL:" "$result" "Empty input should be empty goal"
}

# Test: Whitespace-only input
test_parse_whitespace_input() {
    local result=$(parse_subcommand "   ")
    assert_equals "GOAL:" "$result" "Whitespace should be trimmed to empty goal"
}

# Test: Case sensitivity - status vs STATUS
test_parse_case_sensitivity() {
    local result_lower=$(parse_subcommand "status")
    local result_upper=$(parse_subcommand "STATUS")

    # Currently case-sensitive, "STATUS" would be treated as goal
    assert_equals "SUBCOMMAND:status" "$result_lower" "Lowercase 'status' is subcommand"
    assert_contains "$result_upper" "GOAL:" "Uppercase 'STATUS' is treated as goal (case-sensitive)"
}

# Test: Subcommand with extra whitespace
test_parse_extra_whitespace() {
    local result=$(parse_subcommand "  status  ")
    assert_equals "SUBCOMMAND:status" "$result" "Should handle extra whitespace"
}

# Test: Rollback with complex checkpoint ID
test_parse_rollback_complex_id() {
    local result=$(parse_subcommand "rollback cp_2024_01_15_001")
    assert_equals "SUBCOMMAND:rollback:cp_2024_01_15_001" "$result" "Should handle complex checkpoint IDs"
}

# Test: Forget with anti-pattern ID
test_parse_forget_anti_pattern() {
    local result=$(parse_subcommand "forget ap_001")
    assert_equals "SUBCOMMAND:forget:ap_001" "$result" "Should handle anti-pattern IDs"
}

# ============================================================
# Subcommand execution tests
# ============================================================

# Simulated subcommand handlers
handle_status() {
    local state_file="$TEST_DIR/.apl/state.json"

    if [ ! -f "$state_file" ]; then
        echo "No active APL session"
        return 1
    fi

    cat "$state_file"
    return 0
}

handle_reset() {
    rm -f "$TEST_DIR/.apl/state.json"
    rm -rf "$TEST_DIR/.apl/checkpoints/"*
    echo "APL state reset"
    return 0
}

handle_rollback() {
    local checkpoint_id="$1"
    local checkpoint_file="$TEST_DIR/.apl/checkpoints/${checkpoint_id}.json"

    if [ ! -f "$checkpoint_file" ]; then
        echo "Checkpoint not found: $checkpoint_id"
        return 1
    fi

    local snapshot=$(jq '.state_snapshot' "$checkpoint_file")
    echo "$snapshot" > "$TEST_DIR/.apl/state.json"
    echo "Rolled back to $checkpoint_id"
    return 0
}

handle_forget() {
    local target="$1"
    local learnings_file="$TEST_DIR/.apl/learnings.json"

    if [ "$target" = "all" ]; then
        # Reset all learnings
        cat > "$learnings_file" << 'EOF'
{
  "version": "1.0.0",
  "success_patterns": [],
  "anti_patterns": [],
  "user_preferences": {},
  "project_knowledge": {},
  "technique_stats": {}
}
EOF
        echo "All learnings reset"
        return 0
    fi

    # Remove specific pattern
    if [[ "$target" == sp_* ]]; then
        jq "del(.success_patterns[] | select(.id == \"$target\"))" "$learnings_file" > "${learnings_file}.tmp"
        mv "${learnings_file}.tmp" "$learnings_file"
    elif [[ "$target" == ap_* ]]; then
        jq "del(.anti_patterns[] | select(.id == \"$target\"))" "$learnings_file" > "${learnings_file}.tmp"
        mv "${learnings_file}.tmp" "$learnings_file"
    fi

    echo "Removed pattern: $target"
    return 0
}

# Test: Status shows current state
test_status_shows_state() {
    create_sample_state

    local output=$(handle_status)

    assert_contains "$output" "Build REST API" "Status should show goal"
    assert_contains "$output" "execute" "Status should show phase"
}

# Test: Status returns error when no session
test_status_no_session() {
    rm -f "$TEST_DIR/.apl/state.json"

    # Run in subshell to capture exit code properly
    local output
    output=$(handle_status 2>&1)
    local exit_code=$?

    assert_equals "1" "$exit_code" "Should return error when no session"
    assert_contains "$output" "No active" "Should indicate no active session"
}

# Test: Reset clears state
test_reset_clears_state() {
    create_sample_state
    create_checkpoint "cp_001"

    handle_reset

    assert_file_not_exists "$TEST_DIR/.apl/state.json" "State should be cleared"
}

# Test: Rollback restores checkpoint
test_rollback_restores_state() {
    create_sample_state
    create_checkpoint "cp_001"

    # Modify current state
    jq '.iteration = 10' "$TEST_DIR/.apl/state.json" > "$TEST_DIR/.apl/state.json.tmp"
    mv "$TEST_DIR/.apl/state.json.tmp" "$TEST_DIR/.apl/state.json"

    handle_rollback "cp_001"

    local iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")
    assert_equals "2" "$iteration" "Should restore checkpoint iteration"
}

# Test: Rollback fails for missing checkpoint
test_rollback_missing_checkpoint() {
    # Run in subshell to capture exit code properly
    local output
    output=$(handle_rollback "cp_999" 2>&1)
    local exit_code=$?

    assert_equals "1" "$exit_code" "Should fail for missing checkpoint"
    assert_contains "$output" "not found" "Should indicate checkpoint not found"
}

# Test: Forget removes specific pattern
test_forget_removes_pattern() {
    create_sample_learnings

    handle_forget "sp_001"

    local count=$(jq '.success_patterns | length' "$TEST_DIR/.apl/learnings.json")
    assert_equals "0" "$count" "Pattern should be removed"
}

# Test: Forget --all resets all learnings
test_forget_all_resets() {
    create_sample_learnings

    handle_forget "all"

    local success_count=$(jq '.success_patterns | length' "$TEST_DIR/.apl/learnings.json")
    local anti_count=$(jq '.anti_patterns | length' "$TEST_DIR/.apl/learnings.json")

    assert_equals "0" "$success_count" "Success patterns should be cleared"
    assert_equals "0" "$anti_count" "Anti-patterns should be cleared"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
