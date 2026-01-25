# APL Marketplace

**The Ultimate Autonomous Coding Plugin for Claude Code**

APL (Autonomous Phased Looper) is a flagship Claude Code plugin that transforms Claude into a fully autonomous coding agent. It implements sophisticated multi-phase orchestration with self-learning capabilities that improve over time.

## Why APL?

Traditional AI coding assistants respond to individual prompts. APL thinks bigger:

- **Phased Execution**: Automatically breaks down goals into Plan → Execute → Review cycles
- **Self-Learning**: Remembers what works (and what doesn't) across sessions
- **Reliability-First**: Chain-of-Verification, checkpoints, and graceful error recovery
- **Performance-Optimized**: Parallel task execution, smart context compression, model selection

## Installation

```bash
# Add the APL marketplace
/plugin marketplace add https://github.com/twofoldtech-dakota/apl.git

# Install the APL plugin
/plugin install apl-autonomous-phased-looper@apl-marketplace
```

## Quick Start

```bash
# Run APL with any coding goal
/apl Build a REST API with user authentication

/apl Refactor the database layer to use connection pooling

/apl Add comprehensive test coverage to the payment module
```

## Features

### Autonomous Multi-Phase Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: PLAN                                              │
│  • Tree-of-Thoughts task breakdown                          │
│  • Success criteria definition                              │
│  • Dependency analysis & parallel group identification      │
│  • Consult learned patterns from previous sessions          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: EXECUTE                                           │
│  • ReAct loop per task (Reason → Act → Observe → Verify)    │
│  • Parallel execution of independent tasks                  │
│  • Chain-of-Verification after each change                  │
│  • Graduated retry with backtracking on failure             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: REVIEW                                            │
│  • Reflexion-based self-critique                            │
│  • Cross-task issue identification                          │
│  • Success criteria verification                            │
│  • Learning extraction for future sessions                  │
└─────────────────────────────────────────────────────────────┘
```

### Reliability Features

| Feature | Description |
|---------|-------------|
| **Error Classification** | Categorizes errors (syntax, logic, dependency, environment) with targeted fixes |
| **Chain-of-Verification** | Verifies each change actually achieves its intent |
| **Checkpoints** | Saves state at phase boundaries for recovery |
| **Confidence Scoring** | Reports confidence level; escalates to user when low |
| **Backtracking** | Rolls back and tries alternative approaches after repeated failures |

### Performance Features

| Feature | Description |
|---------|-------------|
| **Parallel Execution** | Runs independent tasks concurrently |
| **Smart Model Selection** | Uses lighter models (haiku) for simple tasks |
| **Context Compression** | Summarizes completed work to preserve token budget |
| **Lazy Loading** | Loads files and dependencies only when needed |

### Self-Learning System

APL gets smarter with each use:

- **Success Patterns**: Remembers approaches that worked
- **Anti-Patterns**: Avoids approaches that failed
- **User Preferences**: Learns your coding style, preferred libraries
- **Project Knowledge**: Builds understanding of your codebase
- **Technique Stats**: Tracks which agentic patterns work best

Learnings persist in `.apl/` in your project directory.

## Architecture

```
apl/
├── plugins/
│   └── apl-autonomous-phased-looper/
│       ├── skills/apl/SKILL.md       # /apl command
│       ├── agents/
│       │   ├── apl-orchestrator.md   # Main coordinator
│       │   ├── planner-agent.md      # Task planning
│       │   ├── coder-agent.md        # Code generation
│       │   ├── tester-agent.md       # Test execution
│       │   ├── reviewer-agent.md     # Quality review
│       │   └── learner-agent.md      # Learning extraction
│       ├── hooks/hooks.json          # Automation hooks
│       └── scripts/                  # Utility scripts
```

## Configuration

APL auto-initializes with sensible defaults. Customize via `.apl/config.json`:

```json
{
  "max_iterations": 20,
  "max_parallel_agents": 3,
  "confidence_threshold": "medium",
  "auto_test": true,
  "learning_enabled": true
}
```

## Requirements

- Claude Code CLI
- Plugin system enabled

## License

MIT License - See [LICENSE](plugins/apl-autonomous-phased-looper/LICENSE)

## Contributing

Contributions welcome! Please read the contribution guidelines before submitting PRs.

---

**APL**: Because shipping features should feel like magic, not manual labor.
