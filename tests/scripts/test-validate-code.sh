#!/bin/bash
# Tests for validate-code.sh hook script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

VALIDATE_SCRIPT="$PLUGIN_ROOT/scripts/validate-code.sh"

# Test: Script exits 0 when no file path provided
test_no_file_path_exits_zero() {
    local result=$(echo '{}' | bash "$VALIDATE_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Should exit 0 when no file path"
}

# Test: Script exits 0 for valid JSON file
test_valid_json_passes() {
    # Create a valid JSON file
    echo '{"key": "value"}' > "$TEST_DIR/test.json"

    local input=$(cat << EOF
{"tool_input": {"file_path": "$TEST_DIR/test.json"}}
EOF
)

    local result=$(echo "$input" | bash "$VALIDATE_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Should exit 0 for valid JSON"
}

# Test: Script exits 2 for invalid JSON file
test_invalid_json_fails() {
    # Create an invalid JSON file
    echo '{invalid json}' > "$TEST_DIR/test.json"

    local input=$(cat << EOF
{"tool_input": {"file_path": "$TEST_DIR/test.json"}}
EOF
)

    local result=$(echo "$input" | bash "$VALIDATE_SCRIPT" 2>&1)
    local exit_code=$?

    assert_exit_code 2 $exit_code "Should exit 2 for invalid JSON"
    assert_contains "$result" "Invalid JSON" "Should report invalid JSON"
}

# Test: Script detects potential hardcoded secrets
test_detects_hardcoded_secrets() {
    # Create a file with a potential secret
    cat > "$TEST_DIR/config.ts" << 'EOF'
const config = {
    password: "super_secret_password123",
    api_key: "sk-12345"
};
EOF

    local input=$(cat << EOF
{"tool_input": {"file_path": "$TEST_DIR/config.ts"}}
EOF
)

    local result=$(echo "$input" | bash "$VALIDATE_SCRIPT")
    local exit_code=$?

    # Should warn but not block (exit 0)
    assert_exit_code 0 $exit_code "Should exit 0 with warning"
    assert_contains "$result" "hardcoded secret" "Should warn about secrets"
}

# Test: Script handles TypeScript files when tsc is available
test_typescript_validation() {
    # Skip if npx not available
    if ! command -v npx &> /dev/null; then
        echo "Skipping TypeScript test - npx not available"
        return 0
    fi

    # Create a TypeScript file with syntax error
    cat > "$TEST_DIR/broken.ts" << 'EOF'
const x: string = 123;  // Type error
EOF

    local input=$(cat << EOF
{"tool_input": {"file_path": "$TEST_DIR/broken.ts"}}
EOF
)

    # This test is informational - TypeScript errors are warnings, not blocking
    local result=$(echo "$input" | bash "$VALIDATE_SCRIPT" 2>&1)
    local exit_code=$?

    # TypeScript errors should not block (per current implementation)
    assert_exit_code 0 $exit_code "TypeScript errors should not block"
}

# Test: Script handles Python syntax check
test_python_syntax_validation() {
    # Skip if python3 not available
    if ! command -v python3 &> /dev/null; then
        echo "Skipping Python test - python3 not available"
        return 0
    fi

    # Create a Python file with syntax error
    cat > "$TEST_DIR/broken.py" << 'EOF'
def broken_function(
    print("missing closing paren"
EOF

    local input=$(cat << EOF
{"tool_input": {"file_path": "$TEST_DIR/broken.py"}}
EOF
)

    local result=$(echo "$input" | bash "$VALIDATE_SCRIPT" 2>&1)
    local exit_code=$?

    # Python errors are warnings, should still exit 0
    assert_exit_code 0 $exit_code "Python syntax errors should warn but not block"
}

# Test: Script handles JavaScript syntax check
test_javascript_syntax_validation() {
    # Skip if node not available
    if ! command -v node &> /dev/null; then
        echo "Skipping JavaScript test - node not available"
        return 0
    fi

    # Create a valid JavaScript file
    cat > "$TEST_DIR/valid.js" << 'EOF'
function hello() {
    console.log("Hello, world!");
}
EOF

    local input=$(cat << EOF
{"tool_input": {"file_path": "$TEST_DIR/valid.js"}}
EOF
)

    local result=$(echo "$input" | bash "$VALIDATE_SCRIPT")
    local exit_code=$?

    assert_exit_code 0 $exit_code "Valid JavaScript should pass"
}

# Test: Script extracts file_path from both formats
test_file_path_extraction() {
    echo '{"valid": true}' > "$TEST_DIR/test.json"

    # Test with snake_case
    local input1='{"tool_input": {"file_path": "'$TEST_DIR'/test.json"}}'
    local result1=$(echo "$input1" | bash "$VALIDATE_SCRIPT")
    local exit1=$?

    assert_exit_code 0 $exit1 "Should handle file_path (snake_case)"

    # Test with camelCase
    local input2='{"tool_input": {"filePath": "'$TEST_DIR'/test.json"}}'
    local result2=$(echo "$input2" | bash "$VALIDATE_SCRIPT")
    local exit2=$?

    assert_exit_code 0 $exit2 "Should handle filePath (camelCase)"
}

# Test: Script handles non-existent file gracefully
test_nonexistent_file() {
    local input='{"tool_input": {"file_path": "/nonexistent/file.json"}}'

    local result=$(echo "$input" | bash "$VALIDATE_SCRIPT" 2>&1)
    local exit_code=$?

    # Should exit 0 since file doesn't exist (can't validate)
    # The current implementation checks for file existence before security scan
    assert_exit_code 0 $exit_code "Should handle non-existent file gracefully"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
