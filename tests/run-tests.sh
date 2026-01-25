#!/bin/bash
# APL Test Runner
# Runs all tests or a specific category

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
VERBOSE=false
CATEGORY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        scripts|schema|state|subcommands|parallel|integration)
            CATEGORY="$1"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] [CATEGORY]"
            echo ""
            echo "Categories:"
            echo "  scripts      - Shell script tests"
            echo "  schema       - JSON schema validation tests"
            echo "  state        - State management tests"
            echo "  subcommands  - Subcommand parsing tests"
            echo "  parallel     - Parallel execution tests"
            echo "  integration  - Integration tests"
            echo ""
            echo "Options:"
            echo "  -v, --verbose  Show detailed output"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check for required dependencies
check_dependencies() {
    local missing=()

    if ! command -v jq &> /dev/null; then
        missing+=("jq")
    fi

    if ! command -v bash &> /dev/null; then
        missing+=("bash")
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${RED}Missing dependencies: ${missing[*]}${NC}"
        echo "Please install them before running tests."
        exit 1
    fi
}

# Run tests in a directory
run_test_dir() {
    local dir="$1"
    local dir_name=$(basename "$dir")

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running $dir_name tests${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    local test_files=$(find "$dir" -name "test-*.sh" -type f | sort)

    if [ -z "$test_files" ]; then
        echo -e "${YELLOW}No test files found in $dir${NC}"
        return 0
    fi

    local dir_passed=0
    local dir_failed=0

    for test_file in $test_files; do
        echo ""
        echo -e "Running: $(basename "$test_file")"
        echo "────────────────────────────────────────────"

        # Run the test file and capture output
        if $VERBOSE; then
            if bash "$test_file"; then
                dir_passed=$((dir_passed + 1))
            else
                dir_failed=$((dir_failed + 1))
            fi
        else
            # Capture output, only show on failure
            local output
            if output=$(bash "$test_file" 2>&1); then
                # Show summary line
                echo "$output" | tail -5
                dir_passed=$((dir_passed + 1))
            else
                echo "$output"
                dir_failed=$((dir_failed + 1))
            fi
        fi
    done

    echo ""
    echo -e "${BLUE}$dir_name Results:${NC} ${GREEN}$dir_passed passed${NC}, ${RED}$dir_failed failed${NC}"

    return $dir_failed
}

# Main
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       APL Test Suite                       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"

    check_dependencies

    local total_failed=0

    if [ -n "$CATEGORY" ]; then
        # Run specific category
        if [ -d "$SCRIPT_DIR/$CATEGORY" ]; then
            run_test_dir "$SCRIPT_DIR/$CATEGORY" || total_failed=$((total_failed + $?))
        else
            echo -e "${RED}Category not found: $CATEGORY${NC}"
            exit 1
        fi
    else
        # Run all categories
        local categories=(
            "scripts"
            "schema"
            "state"
            "subcommands"
            "parallel"
            "integration"
        )

        for cat in "${categories[@]}"; do
            if [ -d "$SCRIPT_DIR/$cat" ]; then
                run_test_dir "$SCRIPT_DIR/$cat" || total_failed=$((total_failed + $?))
            fi
        done
    fi

    # Final summary
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Final Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if [ $total_failed -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}$total_failed test file(s) had failures${NC}"
        exit 1
    fi
}

main
