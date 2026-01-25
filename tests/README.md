# APL Test Suite

This test suite validates the APL (Autonomous Phased Looper) plugin implementation.

## Test Categories

### 1. Shell Script Tests (`scripts/`)
Unit tests for the hook scripts using bash assertions.

### 2. Schema Validation Tests (`schema/`)
Validates JSON configuration and state files against expected schemas.

### 3. State Management Tests (`state/`)
Tests checkpoint save/restore, file locking, and state consistency.

### 4. Subcommand Tests (`subcommands/`)
Tests parsing and handling of `/apl status`, `/apl reset`, etc.

### 5. Parallel Execution Tests (`parallel/`)
Tests conflict detection and merge strategies for concurrent operations.

### 6. Integration Tests (`integration/`)
End-to-end flow tests simulating full APL cycles.

## Running Tests

```bash
# Run all tests
./tests/run-tests.sh

# Run specific category
./tests/run-tests.sh scripts
./tests/run-tests.sh schema
./tests/run-tests.sh state

# Run with verbose output
./tests/run-tests.sh --verbose
```

## Test Fixtures

Test fixtures are in `fixtures/` directory:
- `valid-config.json` - Valid APL configuration
- `invalid-config.json` - Invalid configuration for error testing
- `sample-learnings.json` - Sample learnings file
- `sample-state.json` - Sample state file

## Adding Tests

Each test file should:
1. Source the test helpers: `source ../helpers.sh`
2. Define test functions with `test_` prefix
3. Use assertion functions: `assert_equals`, `assert_file_exists`, etc.
