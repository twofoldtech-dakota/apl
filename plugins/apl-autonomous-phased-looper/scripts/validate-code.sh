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
# Note: Syntax errors are ERRORS (blocking), type errors are WARNINGS (non-blocking)
case "$EXT" in
    ts|tsx)
        # TypeScript validation
        if command -v npx &> /dev/null; then
            TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
            TSC_EXIT=$?

            if [ $TSC_EXIT -ne 0 ]; then
                # Extract errors for the modified file
                FILE_ERRORS=$(echo "$TSC_OUTPUT" | grep -E "^$FILE_PATH|error TS" | head -5)
                if [ -n "$FILE_ERRORS" ]; then
                    # Distinguish syntax errors (blocking) from type errors (warning)
                    if echo "$FILE_ERRORS" | grep -qE "error TS1[0-9]{3}"; then
                        # TS1xxx = syntax errors - these are blocking
                        add_error "TypeScript syntax error in $FILE_PATH: $(echo "$FILE_ERRORS" | head -1)"
                    else
                        # TS2xxx+ = type errors - report but don't block
                        add_warning "TypeScript type issues in $FILE_PATH ($(echo "$TSC_OUTPUT" | grep -c 'error TS') errors)"
                    fi
                fi
            fi
        fi
        ;;
    js|jsx)
        # JavaScript validation - syntax check (blocking on syntax errors)
        if command -v node &> /dev/null; then
            SYNTAX_CHECK=$(node --check "$FILE_PATH" 2>&1)
            SYNTAX_EXIT=$?

            if [ $SYNTAX_EXIT -ne 0 ]; then
                add_error "JavaScript syntax error in $FILE_PATH: $(echo "$SYNTAX_CHECK" | head -1)"
            fi
        fi
        ;;
    py)
        # Python validation - syntax check (blocking on syntax errors)
        if command -v python3 &> /dev/null; then
            SYNTAX_CHECK=$(python3 -m py_compile "$FILE_PATH" 2>&1)
            SYNTAX_EXIT=$?

            if [ $SYNTAX_EXIT -ne 0 ]; then
                add_error "Python syntax error in $FILE_PATH: $(echo "$SYNTAX_CHECK" | head -1)"
            fi
        fi
        ;;
    json)
        # JSON validation (blocking - invalid JSON is always an error)
        if command -v jq &> /dev/null; then
            JQ_OUTPUT=$(jq empty "$FILE_PATH" 2>&1)
            if [ $? -ne 0 ]; then
                add_error "Invalid JSON in $FILE_PATH: $JQ_OUTPUT"
            fi
        fi
        ;;
    sh|bash)
        # Shell script validation
        if command -v bash &> /dev/null; then
            SYNTAX_CHECK=$(bash -n "$FILE_PATH" 2>&1)
            if [ $? -ne 0 ]; then
                add_error "Shell syntax error in $FILE_PATH: $(echo "$SYNTAX_CHECK" | head -1)"
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
