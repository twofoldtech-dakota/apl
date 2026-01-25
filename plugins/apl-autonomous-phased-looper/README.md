# APL - Autonomous Phased Looper

The ultimate autonomous coding plugin for Claude Code. APL transforms Claude into a fully autonomous development agent that plans, executes, reviews, and learns from every coding session.

## Usage

```bash
/apl <your coding goal>
```

### Examples

```bash
# Build features
/apl Build a REST API with JWT authentication and rate limiting

# Refactor code
/apl Refactor the data access layer to use the repository pattern

# Fix bugs
/apl Debug and fix the race condition in the order processing system

# Add tests
/apl Add unit tests for all service classes with 80% coverage

# Complex tasks
/apl Migrate the application from Express to Fastify while maintaining API compatibility
```

## How It Works

### Phase 1: Plan

APL analyzes your goal and creates a structured execution plan:

1. **Task Decomposition**: Breaks down the goal into atomic, verifiable tasks
2. **Success Criteria**: Defines measurable criteria for each task
3. **Dependency Analysis**: Identifies task dependencies and parallel groups
4. **Pattern Matching**: Consults learned patterns from previous sessions
5. **Anti-Pattern Filtering**: Removes approaches known to fail

### Phase 2: Execute

For each task, APL runs a ReAct loop with verification:

```
┌─────────────────────────────────────────┐
│  REASON: Analyze what needs to be done  │
│  • Review task requirements             │
│  • Check learned patterns               │
│  • Consider past failures               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  ACT: Execute the implementation        │
│  • Generate/modify code                 │
│  • Run necessary commands               │
│  • Delegate to specialized agents       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  OBSERVE: Check the results             │
│  • Analyze output/errors                │
│  • Run tests                            │
│  • Check for regressions                │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  VERIFY: Chain-of-Verification          │
│  • Did this achieve the intent?         │
│  • Are success criteria met?            │
│  • Any unintended side effects?         │
└─────────────────────────────────────────┘
```

**Error Recovery**:
- Attempt 1: Simple retry with adjusted approach
- Attempt 2: Deeper analysis of failure cause
- Attempt 3: Backtrack and try alternative implementation
- Escalation: Ask user for guidance with full context

### Phase 3: Review

APL performs Reflexion-based self-critique:

1. **Cross-Task Analysis**: Identifies issues spanning multiple tasks
2. **Success Verification**: Confirms all criteria are met
3. **Diff Summary**: Shows all changes made
4. **Learning Extraction**: Captures insights for future sessions

## Specialized Agents

APL delegates to specialized sub-agents:

| Agent | Purpose |
|-------|---------|
| **Planner** | Task decomposition with Tree-of-Thoughts |
| **Coder** | Code generation and modification |
| **Tester** | Test execution and analysis |
| **Reviewer** | Quality assurance and critique |
| **Learner** | Knowledge extraction and persistence |

## Self-Learning

APL maintains persistent knowledge in `.apl/` in your project:

```
.apl/
├── learnings.json           # Main learning database
├── patterns/
│   ├── success-patterns.json  # What worked
│   └── anti-patterns.json     # What to avoid
├── preferences/
│   └── user-prefs.json        # Your coding style
└── project-knowledge/
    ├── codebase-map.json      # File relationships
    └── conventions.json       # Project conventions
```

### What APL Learns

- **Success Patterns**: Effective approaches for task types
- **Anti-Patterns**: Approaches that consistently fail
- **User Preferences**: Naming conventions, libraries, architecture
- **Project Knowledge**: Codebase structure, test patterns, build commands
- **Technique Stats**: Which agentic patterns work best

## Configuration

Create `.apl/config.json` to customize behavior:

```json
{
  "max_iterations": 20,
  "max_phase_iterations": 5,
  "max_parallel_agents": 3,
  "max_retry_attempts": 3,
  "confidence_threshold": "medium",
  "auto_test": true,
  "auto_lint": true,
  "learning_enabled": true,
  "compression_threshold": 80000,
  "model_selection": {
    "simple_tasks": "haiku",
    "complex_tasks": "sonnet",
    "review": "sonnet"
  }
}
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `max_iterations` | 20 | Maximum total loop iterations |
| `max_phase_iterations` | 5 | Max iterations per phase |
| `max_parallel_agents` | 3 | Max concurrent sub-agents |
| `max_retry_attempts` | 3 | Retries before backtracking |
| `confidence_threshold` | "medium" | When to escalate (low/medium/high) |
| `auto_test` | true | Run tests after changes |
| `auto_lint` | true | Run linters after changes |
| `learning_enabled` | true | Enable persistent learning |
| `compression_threshold` | 80000 | Token count to trigger compression |

## State Management

APL maintains structured state throughout execution:

```json
{
  "goal": "Build REST API",
  "phase": "execute",
  "iteration": 3,
  "confidence": "high",
  "tasks": [...],
  "files_modified": [...],
  "checkpoints": [...],
  "scratchpad": {...},
  "errors": [...],
  "verification_log": [...]
}
```

### Checkpoints

State is saved at phase boundaries. If something goes wrong:
- Automatic rollback to last checkpoint
- Manual rollback via `/apl rollback <checkpoint_id>`

## Hooks Integration

APL uses hooks for automation:

- **PostToolUse**: Validates code changes, runs linters
- **Stop**: Persists learnings when session ends

## Troubleshooting

### APL is stuck in a loop

Check `.apl/state.json` for current state. Use:
```bash
/apl status  # View current state
/apl reset   # Reset to clean state
```

### Learning seems incorrect

Review and edit `.apl/learnings.json`. Remove problematic patterns:
```bash
/apl forget pattern_id  # Remove specific pattern
/apl forget --all       # Reset all learnings
```

### Tasks running slowly

Check if parallel execution is enabled:
```json
{
  "parallel_execution": {
    "enabled": true,
    "max_concurrent": 3
  }
}
```

## Best Practices

1. **Be Specific**: "Add user authentication with JWT" > "Add auth"
2. **Set Context**: Run in the project root directory
3. **Review Learnings**: Periodically check `.apl/learnings.json`
4. **Trust the Process**: Let APL complete phases before intervening
5. **Provide Feedback**: Corrections help APL learn

## Architecture

```
apl-autonomous-phased-looper/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── apl/
│       └── SKILL.md         # Main /apl command
├── agents/
│   ├── apl-orchestrator.md  # Main coordinator
│   ├── planner-agent.md     # Planning specialist
│   ├── coder-agent.md       # Code generation
│   ├── tester-agent.md      # Test execution
│   ├── reviewer-agent.md    # Quality review
│   └── learner-agent.md     # Learning extraction
├── hooks/
│   └── hooks.json
├── scripts/
│   ├── validate-code.sh
│   ├── track-progress.sh
│   └── update-learnings.sh
└── templates/
    ├── apl-config.json
    └── learnings.json
```

## License

MIT License - See [LICENSE](LICENSE)
