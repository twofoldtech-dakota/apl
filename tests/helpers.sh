#!/bin/bash
# APL Test Helpers
# Common utilities for all test files

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Get the directory of this script
HELPERS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$HELPERS_DIR/.." && pwd)"
PLUGIN_ROOT="$PROJECT_ROOT/plugins/apl-autonomous-phased-looper"

# Create a temporary test directory
setup_test_env() {
    TEST_DIR=$(mktemp -d)
    mkdir -p "$TEST_DIR/.apl"
    mkdir -p "$TEST_DIR/.apl/checkpoints"
    cd "$TEST_DIR"
    export TEST_DIR
}

# Clean up test directory
teardown_test_env() {
    if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
        rm -rf "$TEST_DIR"
    fi
}

# Assertion: Check equality
assert_equals() {
    local expected="$1"
    local actual="$2"
    local message="${3:-Values should be equal}"

    if [ "$expected" = "$actual" ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        echo "  Expected: $expected"
        echo "  Actual:   $actual"
        return 1
    fi
}

# Assertion: Check not equal
assert_not_equals() {
    local unexpected="$1"
    local actual="$2"
    local message="${3:-Values should not be equal}"

    if [ "$unexpected" != "$actual" ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        echo "  Should not be: $unexpected"
        return 1
    fi
}

# Assertion: Check file exists
assert_file_exists() {
    local file="$1"
    local message="${2:-File should exist: $file}"

    if [ -f "$file" ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Assertion: Check file does not exist
assert_file_not_exists() {
    local file="$1"
    local message="${2:-File should not exist: $file}"

    if [ ! -f "$file" ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Assertion: Check directory exists
assert_dir_exists() {
    local dir="$1"
    local message="${2:-Directory should exist: $dir}"

    if [ -d "$dir" ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Assertion: Check string contains substring
assert_contains() {
    local haystack="$1"
    local needle="$2"
    local message="${3:-String should contain substring}"

    if [[ "$haystack" == *"$needle"* ]]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        echo "  Looking for: $needle"
        echo "  In: $haystack"
        return 1
    fi
}

# Assertion: Check string does not contain substring
assert_not_contains() {
    local haystack="$1"
    local needle="$2"
    local message="${3:-String should not contain substring}"

    if [[ "$haystack" != *"$needle"* ]]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        echo "  Should not contain: $needle"
        return 1
    fi
}

# Assertion: Check exit code
assert_exit_code() {
    local expected="$1"
    local actual="$2"
    local message="${3:-Exit code should be $expected}"

    assert_equals "$expected" "$actual" "$message"
}

# Assertion: Check JSON field value
assert_json_field() {
    local json="$1"
    local field="$2"
    local expected="$3"
    local message="${4:-JSON field $field should equal $expected}"

    local actual=$(echo "$json" | jq -r "$field")
    assert_equals "$expected" "$actual" "$message"
}

# Assertion: Check JSON field exists
assert_json_has_field() {
    local json="$1"
    local field="$2"
    local message="${3:-JSON should have field $field}"

    local result=$(echo "$json" | jq -e "$field" 2>/dev/null)
    if [ $? -eq 0 ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Assertion: Check JSON is valid
assert_valid_json() {
    local json="$1"
    local message="${2:-Should be valid JSON}"

    if echo "$json" | jq empty 2>/dev/null; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Assertion: Check JSON file is valid
assert_valid_json_file() {
    local file="$1"
    local message="${2:-File should contain valid JSON: $file}"

    if jq empty "$file" 2>/dev/null; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Assertion: Check numeric comparison
assert_greater_than() {
    local value="$1"
    local threshold="$2"
    local message="${3:-$value should be greater than $threshold}"

    if [ "$value" -gt "$threshold" ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Assertion: Check numeric comparison
assert_less_than() {
    local value="$1"
    local threshold="$2"
    local message="${3:-$value should be less than $threshold}"

    if [ "$value" -lt "$threshold" ]; then
        return 0
    else
        echo -e "${RED}FAIL${NC}: $message"
        return 1
    fi
}

# Run a single test function
run_test() {
    local test_name="$1"
    local test_func="$2"

    TESTS_RUN=$((TESTS_RUN + 1))

    # Run the test
    setup_test_env

    if $test_func; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $test_name"
        teardown_test_env
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $test_name"
        teardown_test_env
        return 1
    fi
}

# Run all tests in a file
run_all_tests() {
    local test_file="$1"
    echo ""
    echo "Running tests from: $(basename "$test_file")"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Find all functions starting with test_
    local tests=$(declare -F | grep "test_" | awk '{print $3}')

    for test in $tests; do
        run_test "$test" "$test"
    done

    echo ""
}

# Print test summary
print_summary() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Total:  $TESTS_RUN"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""

    if [ $TESTS_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Create a sample valid config for testing
create_sample_config() {
    cat > "$TEST_DIR/.apl/config.json" << 'EOF'
{
  "version": "1.0.0",
  "execution": {
    "max_iterations": 20,
    "max_phase_iterations": 5,
    "max_retry_attempts": 3,
    "timeout_minutes": 30
  },
  "parallel_execution": {
    "enabled": true,
    "max_concurrent_agents": 3,
    "min_tasks_for_parallel": 2
  },
  "learning": {
    "enabled": true,
    "persist_success_patterns": true,
    "persist_anti_patterns": true
  }
}
EOF
}

# Create a sample learnings file for testing
create_sample_learnings() {
    cat > "$TEST_DIR/.apl/learnings.json" << 'EOF'
{
  "version": "1.0.0",
  "last_updated": "2024-01-15T10:30:00Z",
  "success_patterns": [
    {
      "id": "sp_001",
      "task_type": "api-endpoint",
      "approach": "Use Express router with middleware",
      "success_count": 5,
      "last_used": "2024-01-15T10:30:00Z"
    }
  ],
  "anti_patterns": [
    {
      "id": "ap_001",
      "task_type": "database",
      "approach": "Raw SQL without parameterization",
      "reason": "SQL injection risk",
      "failure_count": 2
    }
  ],
  "user_preferences": {
    "code_style": {
      "naming": "camelCase"
    }
  },
  "project_knowledge": {},
  "technique_stats": {
    "react_pattern": {"success": 10, "failure": 2}
  }
}
EOF
}

# Create a sample state file for testing
create_sample_state() {
    cat > "$TEST_DIR/.apl/state.json" << 'EOF'
{
  "goal": "Build REST API",
  "phase": "execute",
  "iteration": 3,
  "confidence": "high",
  "tasks": [
    {
      "id": 1,
      "description": "Set up Express server",
      "status": "completed",
      "success_criteria": ["Server starts", "Health check works"]
    },
    {
      "id": 2,
      "description": "Add authentication",
      "status": "in_progress",
      "success_criteria": ["JWT tokens work", "Login endpoint works"]
    }
  ],
  "files_modified": [
    {"path": "src/index.ts", "action": "created"}
  ],
  "checkpoints": [
    {"id": "cp_001", "phase": "plan", "iteration": 1}
  ],
  "scratchpad": {
    "learnings": [],
    "failed_approaches": [],
    "open_questions": []
  },
  "errors": [],
  "verification_log": []
}
EOF
}

# Create a checkpoint file
create_checkpoint() {
    local checkpoint_id="${1:-cp_001}"
    mkdir -p "$TEST_DIR/.apl/checkpoints"
    cat > "$TEST_DIR/.apl/checkpoints/${checkpoint_id}.json" << EOF
{
  "id": "$checkpoint_id",
  "phase": "execute",
  "iteration": 2,
  "timestamp": "2024-01-15T10:00:00Z",
  "state_snapshot": {
    "goal": "Build REST API",
    "phase": "execute",
    "iteration": 2,
    "tasks": []
  }
}
EOF
}
