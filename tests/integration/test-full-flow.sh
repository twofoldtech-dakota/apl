#!/bin/bash
# Integration tests for APL full flow
# These tests simulate a complete APL cycle

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# ============================================================
# Flow simulation functions
# ============================================================

# Initialize APL session
init_apl_session() {
    local goal="$1"

    mkdir -p "$TEST_DIR/.apl/checkpoints"

    cat > "$TEST_DIR/.apl/state.json" << EOF
{
  "goal": "$goal",
  "phase": "plan",
  "iteration": 0,
  "confidence": "unknown",
  "tasks": [],
  "files_modified": [],
  "checkpoints": [],
  "scratchpad": {
    "learnings": [],
    "failed_approaches": [],
    "open_questions": []
  },
  "errors": [],
  "verification_log": []
}
EOF

    # Initialize learnings if not exists
    if [ ! -f "$TEST_DIR/.apl/learnings.json" ]; then
        cat > "$TEST_DIR/.apl/learnings.json" << 'EOF'
{
  "version": "1.0.0",
  "success_patterns": [],
  "anti_patterns": [],
  "user_preferences": {},
  "project_knowledge": {},
  "technique_stats": {
    "react_pattern": {"success": 0, "failure": 0}
  }
}
EOF
    fi

    echo "Session initialized for: $goal"
}

# Simulate plan phase
simulate_plan_phase() {
    local state_file="$TEST_DIR/.apl/state.json"

    # Add tasks to state
    local tasks='[
        {"id": 1, "description": "Task 1", "status": "pending", "success_criteria": ["Criterion 1"], "dependencies": []},
        {"id": 2, "description": "Task 2", "status": "pending", "success_criteria": ["Criterion 2"], "dependencies": [1]}
    ]'

    jq --argjson tasks "$tasks" '.tasks = $tasks | .phase = "execute" | .iteration = 1' "$state_file" > "${state_file}.tmp"
    mv "${state_file}.tmp" "$state_file"

    # Create checkpoint
    cat > "$TEST_DIR/.apl/checkpoints/cp_001.json" << 'EOF'
{
  "id": "cp_001",
  "phase": "plan",
  "iteration": 1,
  "timestamp": "2024-01-15T10:00:00Z",
  "state_snapshot": {}
}
EOF

    echo "Plan phase complete"
}

# Simulate execute phase
simulate_execute_phase() {
    local state_file="$TEST_DIR/.apl/state.json"

    # Mark first task as completed
    jq '.tasks[0].status = "completed" | .iteration = 2' "$state_file" > "${state_file}.tmp"
    mv "${state_file}.tmp" "$state_file"

    # Mark second task as completed
    jq '.tasks[1].status = "completed" | .iteration = 3' "$state_file" > "${state_file}.tmp"
    mv "${state_file}.tmp" "$state_file"

    # Update phase
    jq '.phase = "review"' "$state_file" > "${state_file}.tmp"
    mv "${state_file}.tmp" "$state_file"

    echo "Execute phase complete"
}

# Simulate review phase
simulate_review_phase() {
    local state_file="$TEST_DIR/.apl/state.json"

    # Mark as complete
    jq '.phase = "complete" | .confidence = "high"' "$state_file" > "${state_file}.tmp"
    mv "${state_file}.tmp" "$state_file"

    echo "Review phase complete"
}

# Simulate learning extraction
simulate_learning() {
    local learnings_file="$TEST_DIR/.apl/learnings.json"

    # Add a success pattern
    jq '.success_patterns += [{"id": "sp_test", "task_type": "test", "approach": "Test approach", "success_count": 1}]' "$learnings_file" > "${learnings_file}.tmp"
    mv "${learnings_file}.tmp" "$learnings_file"

    # Update stats
    jq '.technique_stats.react_pattern.success += 1' "$learnings_file" > "${learnings_file}.tmp"
    mv "${learnings_file}.tmp" "$learnings_file"

    echo "Learning complete"
}

# ============================================================
# Tests
# ============================================================

# Test: Full flow from init to complete
test_full_flow_success() {
    init_apl_session "Build test feature"

    # Verify initial state
    local phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")
    assert_equals "plan" "$phase" "Should start in plan phase"

    # Run plan phase
    simulate_plan_phase

    phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")
    assert_equals "execute" "$phase" "Should be in execute phase after planning"

    local task_count=$(jq '.tasks | length' "$TEST_DIR/.apl/state.json")
    assert_equals "2" "$task_count" "Should have 2 tasks after planning"

    # Run execute phase
    simulate_execute_phase

    phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")
    assert_equals "review" "$phase" "Should be in review phase after execution"

    local completed=$(jq '[.tasks[] | select(.status == "completed")] | length' "$TEST_DIR/.apl/state.json")
    assert_equals "2" "$completed" "All tasks should be completed"

    # Run review phase
    simulate_review_phase

    phase=$(jq -r '.phase' "$TEST_DIR/.apl/state.json")
    assert_equals "complete" "$phase" "Should be in complete phase after review"

    # Run learning
    simulate_learning

    local pattern_count=$(jq '.success_patterns | length' "$TEST_DIR/.apl/learnings.json")
    assert_greater_than "$pattern_count" 0 "Should have learned patterns"
}

# Test: State persists across phases
test_state_persistence() {
    init_apl_session "Persistence test"

    local goal=$(jq -r '.goal' "$TEST_DIR/.apl/state.json")
    assert_equals "Persistence test" "$goal" "Goal should persist"

    simulate_plan_phase

    goal=$(jq -r '.goal' "$TEST_DIR/.apl/state.json")
    assert_equals "Persistence test" "$goal" "Goal should persist after plan"

    simulate_execute_phase

    goal=$(jq -r '.goal' "$TEST_DIR/.apl/state.json")
    assert_equals "Persistence test" "$goal" "Goal should persist after execute"
}

# Test: Checkpoint is created during flow
test_checkpoint_creation() {
    init_apl_session "Checkpoint test"

    simulate_plan_phase

    assert_file_exists "$TEST_DIR/.apl/checkpoints/cp_001.json" "Checkpoint should be created"

    local checkpoint=$(cat "$TEST_DIR/.apl/checkpoints/cp_001.json")
    assert_json_field "$checkpoint" '.phase' 'plan' "Checkpoint should record plan phase"
}

# Test: Iteration counter increments
test_iteration_increment() {
    init_apl_session "Iteration test"

    local iter=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")
    assert_equals "0" "$iter" "Should start at iteration 0"

    simulate_plan_phase

    iter=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")
    assert_equals "1" "$iter" "Should be at iteration 1 after plan"

    simulate_execute_phase

    iter=$(jq -r '.iteration' "$TEST_DIR/.apl/state.json")
    assert_equals "3" "$iter" "Should be at iteration 3 after execute"
}

# Test: Learning accumulates across sessions
test_learning_accumulation() {
    # Session 1
    init_apl_session "Session 1"
    simulate_plan_phase
    simulate_execute_phase
    simulate_review_phase
    simulate_learning

    local count1=$(jq '.technique_stats.react_pattern.success' "$TEST_DIR/.apl/learnings.json")

    # Session 2 (reuse learnings)
    rm "$TEST_DIR/.apl/state.json"
    init_apl_session "Session 2"
    simulate_plan_phase
    simulate_execute_phase
    simulate_review_phase
    simulate_learning

    local count2=$(jq '.technique_stats.react_pattern.success' "$TEST_DIR/.apl/learnings.json")

    assert_greater_than "$count2" "$count1" "Stats should accumulate across sessions"
}

# Test: Error during execution is recorded
test_error_recording() {
    init_apl_session "Error test"
    simulate_plan_phase

    # Simulate an error
    jq '.errors += [{"type": "syntax", "message": "Test error", "task_id": 1}]' "$TEST_DIR/.apl/state.json" > "${TEST_DIR}/.apl/state.json.tmp"
    mv "${TEST_DIR}/.apl/state.json.tmp" "$TEST_DIR/.apl/state.json"

    local error_count=$(jq '.errors | length' "$TEST_DIR/.apl/state.json")
    assert_equals "1" "$error_count" "Error should be recorded"
}

# Test: Failed approach is recorded in scratchpad
test_failed_approach_recording() {
    init_apl_session "Failed approach test"
    simulate_plan_phase

    # Simulate a failed approach
    jq '.scratchpad.failed_approaches += [{"task_id": 1, "approach": "Bad approach", "reason": "Did not work"}]' "$TEST_DIR/.apl/state.json" > "${TEST_DIR}/.apl/state.json.tmp"
    mv "${TEST_DIR}/.apl/state.json.tmp" "$TEST_DIR/.apl/state.json"

    local failed_count=$(jq '.scratchpad.failed_approaches | length' "$TEST_DIR/.apl/state.json")
    assert_equals "1" "$failed_count" "Failed approach should be recorded"
}

# Test: Reset clears everything
test_reset_clears_all() {
    init_apl_session "Reset test"
    simulate_plan_phase
    simulate_execute_phase

    # Reset
    rm -f "$TEST_DIR/.apl/state.json"
    rm -rf "$TEST_DIR/.apl/checkpoints/"*

    assert_file_not_exists "$TEST_DIR/.apl/state.json" "State should be cleared"

    local checkpoint_count=$(ls "$TEST_DIR/.apl/checkpoints/"*.json 2>/dev/null | wc -l | tr -d ' ')
    assert_equals "0" "$checkpoint_count" "Checkpoints should be cleared"
}

# Test: Learnings survive reset
test_learnings_survive_reset() {
    init_apl_session "Learnings survive test"
    simulate_plan_phase
    simulate_execute_phase
    simulate_review_phase
    simulate_learning

    # Reset state but keep learnings
    rm -f "$TEST_DIR/.apl/state.json"
    rm -rf "$TEST_DIR/.apl/checkpoints/"*

    assert_file_exists "$TEST_DIR/.apl/learnings.json" "Learnings should survive reset"

    local pattern_count=$(jq '.success_patterns | length' "$TEST_DIR/.apl/learnings.json")
    assert_greater_than "$pattern_count" 0 "Patterns should survive reset"
}

# Test: Confidence is updated appropriately
test_confidence_updates() {
    init_apl_session "Confidence test"

    local conf=$(jq -r '.confidence' "$TEST_DIR/.apl/state.json")
    assert_equals "unknown" "$conf" "Should start with unknown confidence"

    simulate_plan_phase
    simulate_execute_phase
    simulate_review_phase

    conf=$(jq -r '.confidence' "$TEST_DIR/.apl/state.json")
    assert_equals "high" "$conf" "Should have high confidence after successful completion"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
