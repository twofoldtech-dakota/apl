#!/bin/bash
# APL Code Validation Hook
# Runs after Write/Edit operations to validate code changes

# Read the tool input from stdin
INPUT=$(cat)

# Extract file path from the tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# Exit early if no file path
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Get file extension
EXT="${FILE_PATH##*.}"

# Track validation results
WARNINGS=""
ERRORS=""

# Function to add warning
add_warning() {
    if [ -n "$WARNINGS" ]; then
        WARNINGS="$WARNINGS\n"
    fi
    WARNINGS="${WARNINGS}⚠ $1"
}

# Function to add error
add_error() {
    if [ -n "$ERRORS" ]; then
        ERRORS="$ERRORS\n"
    fi
    ERRORS="${ERRORS}✗ $1"
}

# Check for common issues based on file type
case "$EXT" in
    ts|tsx)
        # TypeScript validation
        if command -v npx &> /dev/null; then
            # Check for TypeScript errors (non-blocking)
            TSC_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
            if echo "$TSC_OUTPUT" | grep -q "error TS"; then
                # Extract just the errors for the modified file
                FILE_ERRORS=$(echo "$TSC_OUTPUT" | grep "$FILE_PATH" | head -3)
                if [ -n "$FILE_ERRORS" ]; then
                    add_warning "TypeScript issues detected in $FILE_PATH"
                fi
            fi
        fi
        ;;
    js|jsx)
        # JavaScript validation - basic syntax check
        if command -v node &> /dev/null; then
            SYNTAX_CHECK=$(node --check "$FILE_PATH" 2>&1 || true)
            if [ -n "$SYNTAX_CHECK" ]; then
                add_warning "JavaScript syntax issues in $FILE_PATH"
            fi
        fi
        ;;
    py)
        # Python validation
        if command -v python3 &> /dev/null; then
            SYNTAX_CHECK=$(python3 -m py_compile "$FILE_PATH" 2>&1 || true)
            if [ -n "$SYNTAX_CHECK" ]; then
                add_warning "Python syntax issues in $FILE_PATH"
            fi
        fi
        ;;
    json)
        # JSON validation
        if command -v jq &> /dev/null; then
            if ! jq empty "$FILE_PATH" 2>/dev/null; then
                add_error "Invalid JSON in $FILE_PATH"
            fi
        fi
        ;;
esac

# Check for common security issues (all file types)
if [ -f "$FILE_PATH" ]; then
    CONTENT=$(cat "$FILE_PATH" 2>/dev/null || true)

    # Check for hardcoded secrets patterns
    if echo "$CONTENT" | grep -qiE "(password|secret|api_key|apikey|token)\s*[=:]\s*['\"][^'\"]+['\"]"; then
        add_warning "Potential hardcoded secret detected"
    fi

    # Check for TODO/FIXME comments (informational)
    TODO_COUNT=$(echo "$CONTENT" | grep -ciE "(TODO|FIXME|HACK|XXX)" || true)
    if [ "$TODO_COUNT" -gt 0 ]; then
        # Not a warning, just tracking
        :
    fi
fi

# Output results
if [ -n "$ERRORS" ]; then
    echo -e "$ERRORS" >&2
    exit 2  # Block the operation
fi

if [ -n "$WARNINGS" ]; then
    # Return warnings as JSON for verbose mode
    echo "{\"continue\": true, \"systemMessage\": \"$(echo -e "$WARNINGS" | tr '\n' ' ')\"}"
    exit 0
fi

# All good
exit 0
