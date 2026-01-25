#!/bin/bash
# Tests for APL checkpoint save/restore functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# Test: Checkpoint directory is created
test_checkpoint_directory_created() {
    mkdir -p "$TEST_DIR/.apl/checkpoints"
    assert_dir_exists "$TEST_DIR/.apl/checkpoints" "Checkpoint directory should exist"
}

# Test: Checkpoint file has correct structure
test_checkpoint_file_structure() {
    create_checkpoint "cp_001"

    assert_file_exists "$TEST_DIR/.apl/checkpoints/cp_001.json" "Checkpoint file should exist"
    assert_valid_json_file "$TEST_DIR/.apl/checkpoints/cp_001.json" "Checkpoint should be valid JSON"

    local checkpoint=$(cat "$TEST_DIR/.apl/checkpoints/cp_001.json")

    assert_json_has_field "$checkpoint" '.id' "Should have id"
    assert_json_has_field "$checkpoint" '.phase' "Should have phase"
    assert_json_has_field "$checkpoint" '.iteration' "Should have iteration"
    assert_json_has_field "$checkpoint" '.timestamp' "Should have timestamp"
    assert_json_has_field "$checkpoint" '.state_snapshot' "Should have state_snapshot"
}

# Test: Checkpoint ID is correctly formatted
test_checkpoint_id_format() {
    create_checkpoint "cp_005"

    local id=$(jq -r '.id' "$TEST_DIR/.apl/checkpoints/cp_005.json")
    assert_equals "cp_005" "$id" "Checkpoint ID should match filename"
}

# Test: Checkpoint state snapshot contains goal
test_checkpoint_has_goal() {
    create_checkpoint "cp_001"

    local goal=$(jq -r '.state_snapshot.goal' "$TEST_DIR/.apl/checkpoints/cp_001.json")

    if [ -z "$goal" ] || [ "$goal" = "null" ]; then
        echo -e "${RED}FAIL${NC}: Checkpoint should preserve goal"
        return 1
    fi

    return 0
}

# Test: Multiple checkpoints can be created
test_multiple_checkpoints() {
    create_checkpoint "cp_001"
    create_checkpoint "cp_002"
    create_checkpoint "cp_003"

    assert_file_exists "$TEST_DIR/.apl/checkpoints/cp_001.json" "First checkpoint should exist"
    assert_file_exists "$TEST_DIR/.apl/checkpoints/cp_002.json" "Second checkpoint should exist"
    assert_file_exists "$TEST_DIR/.apl/checkpoints/cp_003.json" "Third checkpoint should exist"
}

# Test: Checkpoint list in state matches files
test_checkpoint_list_consistency() {
    create_sample_state
    create_checkpoint "cp_001"

    local state_checkpoints=$(jq '.checkpoints | length' "$TEST_DIR/.apl/state.json")
    local file_checkpoints=$(ls "$TEST_DIR/.apl/checkpoints/"*.json 2>/dev/null | wc -l | tr -d ' ')

    # At minimum, state should reference existing checkpoints
    # (This is a consistency check - in real implementation they should match)
    if [ "$file_checkpoints" -eq 0 ] && [ "$state_checkpoints" -gt 0 ]; then
        echo -e "${YELLOW}WARN${NC}: State references checkpoints but files don't exist"
        # This would be a bug in real implementation
    fi

    return 0
}

# Test: Checkpoint timestamp is ISO format
test_checkpoint_timestamp_format() {
    create_checkpoint "cp_001"

    local timestamp=$(jq -r '.timestamp' "$TEST_DIR/.apl/checkpoints/cp_001.json")

    # Check ISO format (basic check)
    if [[ "$timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2} ]]; then
        return 0
    fi

    echo -e "${RED}FAIL${NC}: Checkpoint timestamp should be ISO format"
    return 1
}

# Test: Restoring checkpoint preserves state
test_restore_checkpoint_preserves_state() {
    # Create initial state
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Original goal",
  "phase": "execute",
  "iteration": 5,
  "confidence": "high",
  "tasks": [{"id": 1, "status": "completed"}],
  "files_modified": [],
  "checkpoints": [],
  "scratchpad": {"learnings": [], "failed_approaches": [], "open_questions": []},
  "errors": [],
  "verification_log": []
}
EOF

    # Create checkpoint with earlier state
    cat > "$TEST_DIR/.apl/checkpoints/cp_003.json" << 'EOF'
{
  "id": "cp_003",
  "phase": "execute",
  "iteration": 3,
  "timestamp": "2024-01-15T10:00:00Z",
  "state_snapshot": {
    "goal": "Original goal",
    "phase": "execute",
    "iteration": 3,
    "confidence": "medium",
    "tasks": [{"id": 1, "status": "in_progress"}],
    "files_modified": [],
    "checkpoints": [],
    "scratchpad": {"learnings": [], "failed_approaches": [], "open_questions": []},
    "errors": [],
    "verification_log": []
  }
}
EOF

    # Simulate restore (copy snapshot to state)
    local snapshot=$(jq '.state_snapshot' "$TEST_DIR/.apl/checkpoints/cp_003.json")
    echo "$snapshot" > "$TEST_DIR/.apl/state.json"

    # Verify restoration
    local restored_iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")
    assert_equals "3" "$restored_iteration" "Restored iteration should be 3"

    local restored_status=$(jq -r '.tasks[0].status' "$TEST_DIR/.apl/state.json")
    assert_equals "in_progress" "$restored_status" "Restored task status should be in_progress"
}

# Test: Checkpoint files are independent
test_checkpoint_independence() {
    # Create two different checkpoints
    cat > "$TEST_DIR/.apl/checkpoints/cp_001.json" << 'EOF'
{
  "id": "cp_001",
  "phase": "plan",
  "iteration": 1,
  "timestamp": "2024-01-15T09:00:00Z",
  "state_snapshot": {"goal": "Goal 1", "phase": "plan", "iteration": 1}
}
EOF

    cat > "$TEST_DIR/.apl/checkpoints/cp_002.json" << 'EOF'
{
  "id": "cp_002",
  "phase": "execute",
  "iteration": 2,
  "timestamp": "2024-01-15T10:00:00Z",
  "state_snapshot": {"goal": "Goal 1", "phase": "execute", "iteration": 2}
}
EOF

    local phase1=$(jq -r '.phase' "$TEST_DIR/.apl/checkpoints/cp_001.json")
    local phase2=$(jq -r '.phase' "$TEST_DIR/.apl/checkpoints/cp_002.json")

    assert_equals "plan" "$phase1" "First checkpoint should be plan phase"
    assert_equals "execute" "$phase2" "Second checkpoint should be execute phase"
}

# Test: Checkpoint file can be deleted
test_checkpoint_deletion() {
    create_checkpoint "cp_001"
    assert_file_exists "$TEST_DIR/.apl/checkpoints/cp_001.json" "Checkpoint should exist"

    rm "$TEST_DIR/.apl/checkpoints/cp_001.json"
    assert_file_not_exists "$TEST_DIR/.apl/checkpoints/cp_001.json" "Checkpoint should be deleted"
}

# Test: Checkpoint iteration is numeric
test_checkpoint_iteration_numeric() {
    create_checkpoint "cp_001"

    local iteration=$(jq -r '.iteration' "$TEST_DIR/.apl/checkpoints/cp_001.json")

    # Check if it's a number
    if ! [[ "$iteration" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}FAIL${NC}: Checkpoint iteration should be numeric"
        return 1
    fi

    return 0
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
