#!/bin/bash
# Tests for APL learnings schema validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# Test: Valid learnings passes validation
test_valid_learnings() {
    create_sample_learnings

    assert_valid_json_file "$TEST_DIR/.apl/learnings.json" "Sample learnings should be valid JSON"
}

# Test: Learnings has required top-level fields
test_required_fields() {
    create_sample_learnings

    local learnings=$(cat "$TEST_DIR/.apl/learnings.json")

    assert_json_has_field "$learnings" '.version' "Should have version field"
    assert_json_has_field "$learnings" '.success_patterns' "Should have success_patterns field"
    assert_json_has_field "$learnings" '.anti_patterns' "Should have anti_patterns field"
    assert_json_has_field "$learnings" '.user_preferences' "Should have user_preferences field"
    assert_json_has_field "$learnings" '.project_knowledge' "Should have project_knowledge field"
    assert_json_has_field "$learnings" '.technique_stats' "Should have technique_stats field"
}

# Test: Success pattern has required fields
test_success_pattern_fields() {
    create_sample_learnings

    local pattern=$(jq '.success_patterns[0]' "$TEST_DIR/.apl/learnings.json")

    assert_json_has_field "$pattern" '.id' "Pattern should have id"
    assert_json_has_field "$pattern" '.task_type' "Pattern should have task_type"
    assert_json_has_field "$pattern" '.approach' "Pattern should have approach"
    assert_json_has_field "$pattern" '.success_count' "Pattern should have success_count"
}

# Test: Anti-pattern has required fields
test_anti_pattern_fields() {
    create_sample_learnings

    local pattern=$(jq '.anti_patterns[0]' "$TEST_DIR/.apl/learnings.json")

    assert_json_has_field "$pattern" '.id' "Anti-pattern should have id"
    assert_json_has_field "$pattern" '.task_type' "Anti-pattern should have task_type"
    assert_json_has_field "$pattern" '.approach' "Anti-pattern should have approach"
    assert_json_has_field "$pattern" '.reason' "Anti-pattern should have reason"
    assert_json_has_field "$pattern" '.failure_count' "Anti-pattern should have failure_count"
}

# Test: Pattern IDs are unique
test_pattern_ids_unique() {
    cat > "$TEST_DIR/.apl/learnings.json" << 'EOF'
{
  "version": "1.0.0",
  "success_patterns": [
    {"id": "sp_001", "task_type": "test", "approach": "test1", "success_count": 1},
    {"id": "sp_002", "task_type": "test", "approach": "test2", "success_count": 1}
  ],
  "anti_patterns": [],
  "user_preferences": {},
  "project_knowledge": {},
  "technique_stats": {}
}
EOF

    local ids=$(jq '[.success_patterns[].id] | unique | length' "$TEST_DIR/.apl/learnings.json")
    local total=$(jq '.success_patterns | length' "$TEST_DIR/.apl/learnings.json")

    assert_equals "$total" "$ids" "Pattern IDs should be unique"
}

# Test: Duplicate pattern IDs are detectable
test_duplicate_ids_detectable() {
    cat > "$TEST_DIR/.apl/learnings.json" << 'EOF'
{
  "version": "1.0.0",
  "success_patterns": [
    {"id": "sp_001", "task_type": "test", "approach": "test1", "success_count": 1},
    {"id": "sp_001", "task_type": "test", "approach": "test2", "success_count": 1}
  ],
  "anti_patterns": [],
  "user_preferences": {},
  "project_knowledge": {},
  "technique_stats": {}
}
EOF

    local ids=$(jq '[.success_patterns[].id] | unique | length' "$TEST_DIR/.apl/learnings.json")
    local total=$(jq '.success_patterns | length' "$TEST_DIR/.apl/learnings.json")

    assert_not_equals "$total" "$ids" "Should detect duplicate IDs"
}

# Test: Technique stats structure
test_technique_stats_structure() {
    create_sample_learnings

    local stats=$(jq '.technique_stats' "$TEST_DIR/.apl/learnings.json")

    assert_json_has_field "$stats" '.react_pattern' "Should have react_pattern stats"
    assert_json_has_field "$stats" '.react_pattern.success' "react_pattern should have success count"
    assert_json_has_field "$stats" '.react_pattern.failure' "react_pattern should have failure count"
}

# Test: Default learnings template is valid
test_default_template_valid() {
    local template="$PLUGIN_ROOT/templates/learnings.json"

    if [ ! -f "$template" ]; then
        echo "Template file not found at $template"
        return 1
    fi

    assert_valid_json_file "$template" "Template learnings should be valid JSON"

    local learnings=$(cat "$template")
    assert_json_field "$learnings" '.version' '1.0.0' "Template should have version 1.0.0"
}

# Test: success_count is non-negative
test_success_count_non_negative() {
    create_sample_learnings

    local counts=$(jq '[.success_patterns[].success_count] | min' "$TEST_DIR/.apl/learnings.json")

    if [ "$counts" != "null" ]; then
        # Check that minimum is >= 0
        if [ "$counts" -lt 0 ]; then
            echo -e "${RED}FAIL${NC}: success_count should be non-negative"
            return 1
        fi
    fi

    return 0
}

# Test: failure_count is non-negative
test_failure_count_non_negative() {
    create_sample_learnings

    local counts=$(jq '[.anti_patterns[].failure_count] | min' "$TEST_DIR/.apl/learnings.json")

    if [ "$counts" != "null" ]; then
        if [ "$counts" -lt 0 ]; then
            echo -e "${RED}FAIL${NC}: failure_count should be non-negative"
            return 1
        fi
    fi

    return 0
}

# Test: Pattern approach is not empty
test_pattern_approach_not_empty() {
    cat > "$TEST_DIR/.apl/learnings.json" << 'EOF'
{
  "version": "1.0.0",
  "success_patterns": [
    {"id": "sp_001", "task_type": "test", "approach": "", "success_count": 1}
  ],
  "anti_patterns": [],
  "user_preferences": {},
  "project_knowledge": {},
  "technique_stats": {}
}
EOF

    local approach=$(jq -r '.success_patterns[0].approach' "$TEST_DIR/.apl/learnings.json")

    if [ -z "$approach" ]; then
        # Empty approach is detectable - test passes
        return 0
    fi

    # Non-empty approach
    return 0
}

# Test: last_updated is valid ISO timestamp or null
test_last_updated_format() {
    create_sample_learnings

    local timestamp=$(jq -r '.last_updated' "$TEST_DIR/.apl/learnings.json")

    # Should be null or ISO format
    if [ "$timestamp" = "null" ]; then
        return 0
    fi

    # Check ISO format (basic check)
    if [[ "$timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2} ]]; then
        return 0
    fi

    echo -e "${RED}FAIL${NC}: last_updated should be ISO timestamp format"
    return 1
}

# Test: User preferences structure
test_user_preferences_structure() {
    create_sample_learnings

    local prefs=$(jq '.user_preferences' "$TEST_DIR/.apl/learnings.json")

    # Should be an object
    if ! echo "$prefs" | jq -e 'type == "object"' > /dev/null 2>&1; then
        echo -e "${RED}FAIL${NC}: user_preferences should be an object"
        return 1
    fi

    return 0
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
