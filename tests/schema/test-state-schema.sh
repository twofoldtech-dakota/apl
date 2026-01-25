#!/bin/bash
# Tests for APL state schema validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# Test: Valid state passes validation
test_valid_state() {
    create_sample_state

    assert_valid_json_file "$TEST_DIR/.apl/state.json" "Sample state should be valid JSON"
}

# Test: State has required top-level fields
test_required_fields() {
    create_sample_state

    local state=$(cat "$TEST_DIR/.apl/state.json")

    assert_json_has_field "$state" '.goal' "Should have goal field"
    assert_json_has_field "$state" '.phase' "Should have phase field"
    assert_json_has_field "$state" '.iteration' "Should have iteration field"
    assert_json_has_field "$state" '.confidence' "Should have confidence field"
    assert_json_has_field "$state" '.tasks' "Should have tasks field"
    assert_json_has_field "$state" '.files_modified' "Should have files_modified field"
    assert_json_has_field "$state" '.checkpoints' "Should have checkpoints field"
    assert_json_has_field "$state" '.scratchpad' "Should have scratchpad field"
    assert_json_has_field "$state" '.errors' "Should have errors field"
    assert_json_has_field "$state" '.verification_log' "Should have verification_log field"
}

# Test: Phase is valid enum value
test_phase_valid_enum() {
    create_sample_state

    local phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")
    local valid_phases="plan execute review complete"

    local found=false
    for p in $valid_phases; do
        if [ "$phase" = "$p" ]; then
            found=true
            break
        fi
    done

    if [ "$found" = "false" ]; then
        echo -e "${RED}FAIL${NC}: Phase should be one of: $valid_phases"
        return 1
    fi

    return 0
}

# Test: Confidence is valid enum value
test_confidence_valid_enum() {
    create_sample_state

    local confidence=$(jq -r '.confidence' "$TEST_DIR/.apl/state.json")
    local valid_values="unknown low medium high"

    local found=false
    for c in $valid_values; do
        if [ "$confidence" = "$c" ]; then
            found=true
            break
        fi
    done

    if [ "$found" = "false" ]; then
        echo -e "${RED}FAIL${NC}: Confidence should be one of: $valid_values"
        return 1
    fi

    return 0
}

# Test: Iteration is non-negative integer
test_iteration_non_negative() {
    create_sample_state

    local iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")

    if [ "$iteration" -lt 0 ] 2>/dev/null; then
        echo -e "${RED}FAIL${NC}: Iteration should be non-negative"
        return 1
    fi

    return 0
}

# Test: Tasks is an array
test_tasks_is_array() {
    create_sample_state

    local is_array=$(jq 'if .tasks | type == "array" then "yes" else "no" end' "$TEST_DIR/.apl/state.json")
    assert_equals '"yes"' "$is_array" "Tasks should be an array"
}

# Test: Task has required fields
test_task_required_fields() {
    create_sample_state

    local task=$(jq '.tasks[0]' "$TEST_DIR/.apl/state.json")

    assert_json_has_field "$task" '.id' "Task should have id"
    assert_json_has_field "$task" '.description' "Task should have description"
    assert_json_has_field "$task" '.status' "Task should have status"
    assert_json_has_field "$task" '.success_criteria' "Task should have success_criteria"
}

# Test: Task status is valid enum
test_task_status_valid_enum() {
    create_sample_state

    local statuses=$(jq -r '[.tasks[].status] | unique | .[]' "$TEST_DIR/.apl/state.json")
    local valid_statuses="pending in_progress completed failed"

    for status in $statuses; do
        local found=false
        for v in $valid_statuses; do
            if [ "$status" = "$v" ]; then
                found=true
                break
            fi
        done

        if [ "$found" = "false" ]; then
            echo -e "${RED}FAIL${NC}: Task status '$status' should be one of: $valid_statuses"
            return 1
        fi
    done

    return 0
}

# Test: Files_modified has path and action
test_files_modified_structure() {
    create_sample_state

    local file_entry=$(jq '.files_modified[0]' "$TEST_DIR/.apl/state.json")

    if [ "$file_entry" != "null" ]; then
        assert_json_has_field "$file_entry" '.path' "File entry should have path"
        assert_json_has_field "$file_entry" '.action' "File entry should have action"
    fi

    return 0
}

# Test: Checkpoints have required fields
test_checkpoint_structure() {
    create_sample_state

    local checkpoint=$(jq '.checkpoints[0]' "$TEST_DIR/.apl/state.json")

    if [ "$checkpoint" != "null" ]; then
        assert_json_has_field "$checkpoint" '.id' "Checkpoint should have id"
        assert_json_has_field "$checkpoint" '.phase' "Checkpoint should have phase"
        assert_json_has_field "$checkpoint" '.iteration' "Checkpoint should have iteration"
    fi

    return 0
}

# Test: Scratchpad has expected structure
test_scratchpad_structure() {
    create_sample_state

    local scratchpad=$(jq '.scratchpad' "$TEST_DIR/.apl/state.json")

    assert_json_has_field "$scratchpad" '.learnings' "Scratchpad should have learnings"
    assert_json_has_field "$scratchpad" '.failed_approaches' "Scratchpad should have failed_approaches"
    assert_json_has_field "$scratchpad" '.open_questions' "Scratchpad should have open_questions"
}

# Test: Goal is not empty
test_goal_not_empty() {
    create_sample_state

    local goal=$(jq -r '.goal' "$TEST_DIR/.apl/state.json")

    if [ -z "$goal" ] || [ "$goal" = "null" ]; then
        echo -e "${RED}FAIL${NC}: Goal should not be empty"
        return 1
    fi

    return 0
}

# Test: Errors is an array
test_errors_is_array() {
    create_sample_state

    local is_array=$(jq 'if .errors | type == "array" then "yes" else "no" end' "$TEST_DIR/.apl/state.json")
    assert_equals '"yes"' "$is_array" "Errors should be an array"
}

# Test: Invalid phase value is detectable
test_invalid_phase_detectable() {
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Test",
  "phase": "invalid_phase",
  "iteration": 0,
  "confidence": "high",
  "tasks": [],
  "files_modified": [],
  "checkpoints": [],
  "scratchpad": {"learnings": [], "failed_approaches": [], "open_questions": []},
  "errors": [],
  "verification_log": []
}
EOF

    local phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")
    local valid_phases="plan execute review complete"

    for p in $valid_phases; do
        if [ "$phase" = "$p" ]; then
            echo -e "${RED}FAIL${NC}: Invalid phase should be detected"
            return 1
        fi
    done

    # Invalid phase detected
    return 0
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
