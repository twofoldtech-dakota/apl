#!/bin/bash
# Tests for APL file locking to prevent race conditions

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../helpers.sh"

# Simulated file locking functions (these would be implemented in the actual scripts)
# Uses mkdir for atomic lock acquisition (mkdir is atomic on POSIX systems)

acquire_lock() {
    local lockdir="$1.lock"
    local timeout="${2:-5}"
    local waited=0

    while ! mkdir "$lockdir" 2>/dev/null; do
        if [ "$waited" -ge "$timeout" ]; then
            return 1  # Timeout
        fi
        sleep 0.1
        waited=$((waited + 1))
    done

    # Store PID in lockdir for debugging/stale detection
    echo $$ > "$lockdir/pid"
    return 0
}

release_lock() {
    local lockdir="$1.lock"
    rm -rf "$lockdir"
}

# Test: Lock file is created
test_lock_file_created() {
    local target="$TEST_DIR/.apl/learnings.json"
    touch "$target"

    acquire_lock "$target"

    assert_dir_exists "${target}.lock" "Lock directory should be created"

    release_lock "$target"
}

# Test: Lock file is released
test_lock_file_released() {
    local target="$TEST_DIR/.apl/learnings.json"
    touch "$target"

    acquire_lock "$target"
    release_lock "$target"

    assert_file_not_exists "${target}.lock" "Lock directory should be removed"
}

# Test: Lock prevents concurrent access
test_lock_prevents_concurrent() {
    local target="$TEST_DIR/.apl/learnings.json"
    touch "$target"

    # Acquire first lock
    acquire_lock "$target"

    # Try to acquire second lock (should fail with timeout)
    if acquire_lock "$target" 1; then
        release_lock "$target"
        echo -e "${RED}FAIL${NC}: Second lock should not be acquired"
        return 1
    fi

    release_lock "$target"
    return 0
}

# Test: Lock contains PID
test_lock_contains_pid() {
    local target="$TEST_DIR/.apl/learnings.json"
    touch "$target"

    acquire_lock "$target"

    local lock_pid=$(cat "${target}.lock/pid")
    assert_equals "$$" "$lock_pid" "Lock should contain current PID"

    release_lock "$target"
}

# Test: Stale lock detection (lock file exists but process is dead)
test_stale_lock_detection() {
    local target="$TEST_DIR/.apl/learnings.json"
    touch "$target"

    # Create a stale lock with a non-existent PID
    mkdir -p "${target}.lock"
    echo "99999999" > "${target}.lock/pid"

    # Function to check if PID is alive
    is_pid_alive() {
        kill -0 "$1" 2>/dev/null
        return $?
    }

    local stale_pid=$(cat "${target}.lock/pid")

    if ! is_pid_alive "$stale_pid"; then
        # Stale lock detected, can clean up
        rm -rf "${target}.lock"
        assert_file_not_exists "${target}.lock" "Stale lock should be cleaned"
        return 0
    fi

    echo -e "${RED}FAIL${NC}: Stale lock detection failed"
    return 1
}

# Test: Atomic write with temp file
test_atomic_write() {
    local target="$TEST_DIR/.apl/learnings.json"

    # Simulate atomic write pattern
    local temp_file="${target}.tmp.$$"
    echo '{"version": "1.0.0"}' > "$temp_file"
    mv "$temp_file" "$target"

    assert_file_exists "$target" "Target file should exist after atomic write"
    assert_file_not_exists "$temp_file" "Temp file should not exist after mv"

    local content=$(cat "$target")
    assert_valid_json "$content" "Written content should be valid JSON"
}

# Test: Concurrent writes produce valid JSON
test_concurrent_writes_valid_json() {
    local target="$TEST_DIR/.apl/learnings.json"

    # Initialize file
    echo '{"count": 0}' > "$target"

    # Simulate multiple concurrent writes with locking
    for i in 1 2 3; do
        (
            acquire_lock "$target" 10

            # Read, modify, write
            local current=$(cat "$target")
            local count=$(echo "$current" | jq -r '.count')
            local new_count=$((count + 1))
            echo "{\"count\": $new_count}" > "$target"

            release_lock "$target"
        ) &
    done

    # Wait for all background jobs
    wait

    # Verify final state is valid JSON
    assert_valid_json_file "$target" "File should be valid JSON after concurrent writes"

    local final_count=$(jq -r '.count' "$target")

    # Due to locking, final count should be 3
    assert_equals "3" "$final_count" "Count should be 3 after 3 increments"
}

# Test: Lock timeout returns error
test_lock_timeout_error() {
    local target="$TEST_DIR/.apl/learnings.json"
    touch "$target"

    # Create a lock directory manually
    mkdir -p "${target}.lock"
    echo $$ > "${target}.lock/pid"

    # Try to acquire with short timeout
    if acquire_lock "$target" 1; then
        echo -e "${RED}FAIL${NC}: Should timeout when lock exists"
        release_lock "$target"
        return 1
    fi

    # Clean up
    rm -rf "${target}.lock"
    return 0
}

# Test: Lock works with different file types
test_lock_different_files() {
    local file1="$TEST_DIR/.apl/learnings.json"
    local file2="$TEST_DIR/.apl/state.json"

    touch "$file1" "$file2"

    # Both locks should be acquirable
    acquire_lock "$file1"
    acquire_lock "$file2"

    assert_dir_exists "${file1}.lock" "First lock should exist"
    assert_dir_exists "${file2}.lock" "Second lock should exist"

    release_lock "$file1"
    release_lock "$file2"
}

# Test: Write-then-verify pattern
test_write_then_verify() {
    local target="$TEST_DIR/.apl/learnings.json"
    local expected='{"test": "value"}'

    # Write
    echo "$expected" > "$target"

    # Verify
    local actual=$(cat "$target")
    assert_equals "$expected" "$actual" "Written content should match expected"
}

# Test: Backup before dangerous write
test_backup_before_write() {
    local target="$TEST_DIR/.apl/learnings.json"
    local backup="$TEST_DIR/.apl/learnings.json.bak"

    # Create original content
    echo '{"original": true}' > "$target"

    # Backup before write
    cp "$target" "$backup"

    # Simulate dangerous write that might fail
    echo '{"updated": true}' > "$target"

    # Verify backup exists
    assert_file_exists "$backup" "Backup should exist"

    local backup_content=$(cat "$backup")
    assert_contains "$backup_content" "original" "Backup should contain original content"
}

# Run all tests
run_all_tests "${BASH_SOURCE[0]}"
print_summary
