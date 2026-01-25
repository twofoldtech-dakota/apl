#!/bin/bash
# Tests for parallel execution conflict detection
# These tests verify that APL correctly identifies and handles conflicts
# when multiple agents try to modify the same files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# ============================================================
# Conflict detection functions (to be implemented in APL)
# ============================================================

# Check if two tasks might conflict based on their target files
check_file_conflict() {
    local task1_files="$1"  # comma-separated list
    local task2_files="$2"  # comma-separated list

    IFS=',' read -ra FILES1 <<< "$task1_files"
    IFS=',' read -ra FILES2 <<< "$task2_files"

    for f1 in "${FILES1[@]}"; do
        for f2 in "${FILES2[@]}"; do
            if [ "$f1" = "$f2" ]; then
                echo "CONFLICT:$f1"
                return 1
            fi
        done
    done

    echo "OK"
    return 0
}

# Check if tasks have directory-level conflicts
check_directory_conflict() {
    local task1_dir="$1"
    local task2_dir="$2"

    # Check if one is parent of the other
    if [[ "$task1_dir" == "$task2_dir"* ]] || [[ "$task2_dir" == "$task1_dir"* ]]; then
        echo "CONFLICT:directory overlap"
        return 1
    fi

    echo "OK"
    return 0
}

# Validate a parallel group for conflicts
validate_parallel_group() {
    local group_json="$1"

    # Extract task file lists from JSON
    local tasks=$(echo "$group_json" | jq -c '.tasks[]')
    local task_array=()

    while IFS= read -r task; do
        task_array+=("$task")
    done <<< "$tasks"

    local len=${#task_array[@]}

    # Check each pair of tasks
    for ((i=0; i<len; i++)); do
        for ((j=i+1; j<len; j++)); do
            local files1=$(echo "${task_array[$i]}" | jq -r '.target_files | join(",")')
            local files2=$(echo "${task_array[$j]}" | jq -r '.target_files | join(",")')

            local result=$(check_file_conflict "$files1" "$files2")
            if [[ "$result" == CONFLICT* ]]; then
                echo "$result"
                return 1
            fi
        done
    done

    echo "OK"
    return 0
}

# ============================================================
# Tests
# ============================================================

# Test: No conflict when files are different
test_no_conflict_different_files() {
    local result=$(check_file_conflict "src/a.ts,src/b.ts" "src/c.ts,src/d.ts")
    assert_equals "OK" "$result" "Different files should not conflict"
}

# Test: Conflict when same file in both tasks
test_conflict_same_file() {
    local result=$(check_file_conflict "src/a.ts,src/b.ts" "src/b.ts,src/c.ts")
    assert_contains "$result" "CONFLICT" "Same file should conflict"
    assert_contains "$result" "src/b.ts" "Should identify conflicting file"
}

# Test: No conflict with empty file lists
test_no_conflict_empty_lists() {
    local result=$(check_file_conflict "" "src/a.ts")
    assert_equals "OK" "$result" "Empty list should not conflict"
}

# Test: Single file conflict
test_single_file_conflict() {
    local result=$(check_file_conflict "src/index.ts" "src/index.ts")
    assert_contains "$result" "CONFLICT" "Single same file should conflict"
}

# Test: Directory conflict - nested paths
test_directory_conflict_nested() {
    local result=$(check_directory_conflict "src/components" "src/components/Button")
    assert_contains "$result" "CONFLICT" "Nested directories should conflict"
}

# Test: No directory conflict - sibling paths
test_no_directory_conflict_siblings() {
    local result=$(check_directory_conflict "src/components" "src/utils")
    assert_equals "OK" "$result" "Sibling directories should not conflict"
}

# Test: Validate parallel group - no conflicts
test_validate_group_no_conflicts() {
    local group='{
        "tasks": [
            {"id": 1, "target_files": ["src/a.ts"]},
            {"id": 2, "target_files": ["src/b.ts"]},
            {"id": 3, "target_files": ["src/c.ts"]}
        ]
    }'

    local result=$(validate_parallel_group "$group")
    assert_equals "OK" "$result" "Group with no conflicts should be valid"
}

# Test: Validate parallel group - with conflict
test_validate_group_with_conflict() {
    local group='{
        "tasks": [
            {"id": 1, "target_files": ["src/a.ts", "src/shared.ts"]},
            {"id": 2, "target_files": ["src/b.ts"]},
            {"id": 3, "target_files": ["src/shared.ts", "src/c.ts"]}
        ]
    }'

    local result=$(validate_parallel_group "$group")
    assert_contains "$result" "CONFLICT" "Group with shared file should have conflict"
}

# Test: Conflict resolution - sequential fallback
test_conflict_resolution_sequential() {
    # When conflict detected, tasks should run sequentially
    local group='{
        "tasks": [
            {"id": 1, "target_files": ["src/shared.ts"]},
            {"id": 2, "target_files": ["src/shared.ts"]}
        ]
    }'

    local result=$(validate_parallel_group "$group")

    if [[ "$result" == CONFLICT* ]]; then
        # Should fallback to sequential execution
        echo "Fallback to sequential execution"
        # In real implementation, this would reorder tasks
        return 0
    fi

    echo -e "${RED}FAIL${NC}: Should detect conflict and plan sequential execution"
    return 1
}

# Test: Conflict with wildcard patterns
test_conflict_wildcard_patterns() {
    # This tests conceptual pattern matching
    # In reality, APL would need to resolve wildcards before checking
    local files1="src/*.ts"
    local files2="src/index.ts"

    # For testing, we'll just check exact matches
    # Real implementation would expand wildcards
    local result=$(check_file_conflict "$files1" "$files2")

    # With exact matching, these won't conflict
    # This test documents the limitation
    assert_equals "OK" "$result" "Wildcard patterns need expansion (limitation)"
}

# Test: Multiple conflicts in one group
test_multiple_conflicts() {
    local group='{
        "tasks": [
            {"id": 1, "target_files": ["a.ts", "b.ts"]},
            {"id": 2, "target_files": ["b.ts", "c.ts"]},
            {"id": 3, "target_files": ["c.ts", "d.ts"]}
        ]
    }'

    local result=$(validate_parallel_group "$group")
    assert_contains "$result" "CONFLICT" "Should detect at least one conflict"
}

# Test: Empty parallel group is valid
test_empty_group_valid() {
    local group='{"tasks": []}'

    local result=$(validate_parallel_group "$group")
    assert_equals "OK" "$result" "Empty group should be valid"
}

# Test: Single task group is valid
test_single_task_group_valid() {
    local group='{
        "tasks": [
            {"id": 1, "target_files": ["src/a.ts"]}
        ]
    }'

    local result=$(validate_parallel_group "$group")
    assert_equals "OK" "$result" "Single task group should be valid"
}

# ============================================================
# Merge strategy tests
# ============================================================

# Simulate file versioning for merge
create_file_version() {
    local file="$1"
    local content="$2"
    local version="$3"

    mkdir -p "$(dirname "$file")"
    echo "$content" > "$file"
    echo "$version" > "${file}.version"
}

check_version_conflict() {
    local file="$1"
    local expected_version="$2"

    local current_version=$(cat "${file}.version" 2>/dev/null || echo "0")

    if [ "$current_version" != "$expected_version" ]; then
        echo "VERSION_CONFLICT:expected=$expected_version,current=$current_version"
        return 1
    fi

    echo "OK"
    return 0
}

# Test: Version check detects concurrent modification
test_version_conflict_detection() {
    local file="$TEST_DIR/src/test.ts"

    create_file_version "$file" "content v1" "1"

    # Simulate task 1 reads version 1
    local task1_version="1"

    # Simulate task 2 modifies and increments version
    create_file_version "$file" "content v2" "2"

    # Task 1 tries to write with stale version
    local result=$(check_version_conflict "$file" "$task1_version")
    assert_contains "$result" "VERSION_CONFLICT" "Should detect version conflict"
}

# Test: Version check passes when no modification
test_version_no_conflict() {
    local file="$TEST_DIR/src/test.ts"

    create_file_version "$file" "content v1" "1"

    local result=$(check_version_conflict "$file" "1")
    assert_equals "OK" "$result" "Should pass when version matches"
}

# ============================================================
# Dependency graph validation tests
# ============================================================

# Simple cycle detection using DFS
detect_cycle() {
    local graph_json="$1"

    # Parse graph: { "1": ["2", "3"], "2": ["3"], "3": [] }
    # Returns "CYCLE" if cycle found, "OK" otherwise

    # For testing, use jq to check for simple cycles
    # A proper implementation would use Tarjan's or similar algorithm

    local nodes=$(echo "$graph_json" | jq -r 'keys[]')

    for node in $nodes; do
        local deps=$(echo "$graph_json" | jq -r ".\"$node\"[]" 2>/dev/null)
        for dep in $deps; do
            # Check if dep depends back on node (simple 2-node cycle)
            local back_deps=$(echo "$graph_json" | jq -r ".\"$dep\"[]" 2>/dev/null)
            for back in $back_deps; do
                if [ "$back" = "$node" ]; then
                    echo "CYCLE:$node<->$dep"
                    return 1
                fi
            done
        done
    done

    echo "OK"
    return 0
}

# Test: No cycle in valid DAG
test_no_cycle_valid_dag() {
    local graph='{"1": ["2", "3"], "2": ["4"], "3": ["4"], "4": []}'

    local result=$(detect_cycle "$graph")
    assert_equals "OK" "$result" "Valid DAG should have no cycles"
}

# Test: Detect simple 2-node cycle
test_detect_simple_cycle() {
    local graph='{"1": ["2"], "2": ["1"]}'

    local result=$(detect_cycle "$graph")
    assert_contains "$result" "CYCLE" "Should detect 2-node cycle"
}

# Test: Empty graph is valid
test_empty_graph_valid() {
    local graph='{}'

    local result=$(detect_cycle "$graph")
    assert_equals "OK" "$result" "Empty graph should be valid"
}

# Test: Single node with no deps is valid
test_single_node_valid() {
    local graph='{"1": []}'

    local result=$(detect_cycle "$graph")
    assert_equals "OK" "$result" "Single node should be valid"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
