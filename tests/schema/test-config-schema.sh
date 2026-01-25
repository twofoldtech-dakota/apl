#!/bin/bash
# Tests for APL configuration schema validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# Test: Valid config passes validation
test_valid_config() {
    create_sample_config

    assert_valid_json_file "$TEST_DIR/.apl/config.json" "Sample config should be valid JSON"

    local config=$(cat "$TEST_DIR/.apl/config.json")

    # Required fields
    assert_json_has_field "$config" '.version' "Should have version field"
    assert_json_has_field "$config" '.execution' "Should have execution field"
}

# Test: Execution config has required fields
test_execution_config_fields() {
    create_sample_config

    local config=$(cat "$TEST_DIR/.apl/config.json")

    assert_json_has_field "$config" '.execution.max_iterations' "Should have max_iterations"
    assert_json_has_field "$config" '.execution.max_phase_iterations' "Should have max_phase_iterations"
    assert_json_has_field "$config" '.execution.max_retry_attempts' "Should have max_retry_attempts"
    assert_json_has_field "$config" '.execution.timeout_minutes' "Should have timeout_minutes"
}

# Test: max_iterations is positive integer
test_max_iterations_positive() {
    create_sample_config

    local max_iter=$(jq -r '.execution.max_iterations' "$TEST_DIR/.apl/config.json")

    assert_greater_than "$max_iter" 0 "max_iterations should be positive"
}

# Test: max_retry_attempts is reasonable
test_max_retry_reasonable() {
    create_sample_config

    local max_retry=$(jq -r '.execution.max_retry_attempts' "$TEST_DIR/.apl/config.json")

    assert_greater_than "$max_retry" 0 "max_retry_attempts should be positive"
    assert_less_than "$max_retry" 11 "max_retry_attempts should be <= 10"
}

# Test: parallel_execution config
test_parallel_execution_config() {
    create_sample_config

    local config=$(cat "$TEST_DIR/.apl/config.json")

    assert_json_has_field "$config" '.parallel_execution.enabled' "Should have parallel_execution.enabled"
    assert_json_has_field "$config" '.parallel_execution.max_concurrent_agents' "Should have max_concurrent_agents"
}

# Test: learning config
test_learning_config() {
    create_sample_config

    local config=$(cat "$TEST_DIR/.apl/config.json")

    assert_json_has_field "$config" '.learning.enabled' "Should have learning.enabled"
    assert_json_has_field "$config" '.learning.persist_success_patterns' "Should have persist_success_patterns"
    assert_json_has_field "$config" '.learning.persist_anti_patterns' "Should have persist_anti_patterns"
}

# Test: Invalid JSON fails
test_invalid_json_fails() {
    echo 'not valid json' > "$TEST_DIR/.apl/config.json"

    if jq empty "$TEST_DIR/.apl/config.json" 2>/dev/null; then
        echo -e "${RED}FAIL${NC}: Invalid JSON should fail validation"
        return 1
    fi

    return 0
}

# Test: Missing version field
test_missing_version_detectable() {
    cat > "$TEST_DIR/.apl/config.json" << 'EOF'
{
  "execution": {
    "max_iterations": 20
  }
}
EOF

    local config=$(cat "$TEST_DIR/.apl/config.json")

    # Check that version is null/missing
    local version=$(jq -r '.version // "missing"' "$TEST_DIR/.apl/config.json")
    assert_equals "missing" "$version" "Should detect missing version"
}

# Test: Default config from templates is valid
test_default_template_valid() {
    local template="$PLUGIN_ROOT/templates/apl-config.json"

    if [ ! -f "$template" ]; then
        echo "Template file not found at $template"
        return 1
    fi

    assert_valid_json_file "$template" "Template config should be valid JSON"

    local config=$(cat "$template")
    assert_json_field "$config" '.version' '1.0.0' "Template should have version 1.0.0"
}

# Test: Config values are within expected ranges
test_config_value_ranges() {
    local template="$PLUGIN_ROOT/templates/apl-config.json"

    if [ ! -f "$template" ]; then
        return 0  # Skip if template doesn't exist
    fi

    local max_iter=$(jq -r '.execution.max_iterations' "$template")
    local max_phase=$(jq -r '.execution.max_phase_iterations' "$template")
    local max_retry=$(jq -r '.execution.max_retry_attempts' "$template")

    # max_phase_iterations should be less than max_iterations
    assert_less_than "$max_phase" "$max_iter" "max_phase_iterations should be less than max_iterations"

    # max_retry should be reasonable
    assert_less_than "$max_retry" "$max_phase" "max_retry should be less than max_phase_iterations"
}

# Test: Blocked paths are valid patterns
test_blocked_paths_format() {
    local template="$PLUGIN_ROOT/templates/apl-config.json"

    if [ ! -f "$template" ]; then
        return 0
    fi

    local blocked_count=$(jq '.safety.blocked_paths | length' "$template")
    assert_greater_than "$blocked_count" 0 "Should have at least one blocked path"

    # Check that essential paths are blocked
    local blocked=$(jq -r '.safety.blocked_paths | join(",")' "$template")
    assert_contains "$blocked" ".git" "Should block .git"
    assert_contains "$blocked" ".env" "Should block .env"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
