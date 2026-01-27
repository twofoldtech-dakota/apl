# APL - Autonomous Phased Looper

The ultimate autonomous coding plugin for Claude Code. APL transforms Claude into a fully autonomous development agent that plans, executes, reviews, and learns from every coding session.

---

## Quick Start

```bash
# Run APL with a goal
/apl Build a REST API with JWT authentication

# Launch the visual dashboard
/apl gui
```

That's it. APL handles the rest.

---

## Table of Contents

- [Features](#features)
- [Commands](#commands)
- [GUI Dashboard](#gui-dashboard)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
- [Self-Learning](#self-learning)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## Features

| Feature | Description |
|---------|-------------|
| **Autonomous Execution** | Set a goal and let APL handle planning, coding, testing, and review |
| **Multi-Agent System** | 5 specialized agents collaborate: Planner, Coder, Tester, Reviewer, Learner |
| **Self-Learning** | Learns from every session - remembers what works and what doesn't |
| **Visual Dashboard** | Web-based GUI for real-time monitoring and control |
| **Error Recovery** | Automatic retry with graduated fallback strategies |
| **Checkpoints** | Automatic state saves with one-click rollback |

---

## Commands

### Main Command

```bash
/apl <your coding goal>
```

### Examples

```bash
/apl Build a REST API with JWT authentication and rate limiting
/apl Refactor the data access layer to use the repository pattern
/apl Debug and fix the race condition in the order processing system
/apl Add unit tests for all service classes with 80% coverage
/apl Migrate the application from Express to Fastify
```

### Subcommands

| Command | Description |
|---------|-------------|
| `/apl gui` | Launch web-based dashboard |
| `/apl status` | Show current workflow state |
| `/apl config` | Display configuration |
| `/apl reset` | Clear state and start fresh |
| `/apl rollback <id>` | Restore a checkpoint |
| `/apl forget <id>` | Remove a learned pattern |
| `/apl forget --all` | Reset all learnings |

---

## GUI Dashboard

APL includes a powerful web-based control panel for visual monitoring and control.

### Launch

```bash
/apl gui
```

### Access

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:5173 |
| **API** | http://localhost:3001 |
| **WebSocket** | ws://localhost:3001/ws |

### Features

- **Real-time Monitoring** - Watch workflow progress live
- **Phase Indicators** - See Plan → Execute → Review status
- **Task Tracking** - Visual task list with parallel group colors
- **Agent Monitor** - See which agent is currently active
- **ReAct Visualization** - Watch Reason → Act → Observe → Verify loops
- **Token Usage** - Context window tracking with warnings
- **Configuration UI** - Edit settings without touching files
- **Learnings Browser** - View and manage learned patterns
- **Checkpoint Timeline** - One-click rollback to any point

See [gui/README.md](gui/README.md) for detailed documentation.

---

## How It Works

APL operates in three phases:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    PLAN      │ ──▶ │   EXECUTE    │ ──▶ │    REVIEW    │
│              │     │              │     │              │
│ Break down   │     │ ReAct loops  │     │ Self-critique│
│ into tasks   │     │ with verify  │     │ & learning   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Phase 1: Plan

The Planner agent analyzes your goal and creates a structured plan:

- Breaks goal into atomic, verifiable tasks
- Defines success criteria for each task
- Identifies dependencies and parallel opportunities
- Consults learned patterns from previous sessions

### Phase 2: Execute

For each task, the Coder agent runs a ReAct loop:

1. **Reason** - Analyze requirements, check patterns, consider past failures
2. **Act** - Generate/modify code, run commands
3. **Observe** - Check results, run tests, look for regressions
4. **Verify** - Confirm success criteria met, no side effects

**Error Recovery:**
- Retry 1: Adjust approach slightly
- Retry 2: Deeper analysis, different method
- Retry 3: Backtrack, try alternative
- Escalate: Ask user with full context

### Phase 3: Review

The Reviewer agent performs self-critique:

- Cross-task analysis for spanning issues
- Final verification of all success criteria
- Diff summary of all changes
- Learning extraction for future sessions

### Specialized Agents

| Agent | Role |
|-------|------|
| **Planner** | Task decomposition with Tree-of-Thoughts |
| **Coder** | Code generation and modification |
| **Tester** | Test execution and analysis |
| **Reviewer** | Quality assurance and critique |
| **Learner** | Knowledge extraction and persistence |

---

## Configuration

APL uses a centralized configuration in `master-config.json`. Override per-project with `.apl/config.json`:

```json
{
  "max_iterations": 20,
  "max_retry_attempts": 3,
  "confidence_threshold": "medium",
  "auto_test": true,
  "auto_lint": true,
  "learning_enabled": true,
  "model_selection": {
    "simple_tasks": "haiku",
    "complex_tasks": "sonnet",
    "review": "sonnet"
  }
}
```

### Key Options

| Option | Default | Description |
|--------|---------|-------------|
| `max_iterations` | 20 | Maximum workflow iterations |
| `max_retry_attempts` | 3 | Retries before escalating |
| `confidence_threshold` | medium | When to ask for help (low/medium/high) |
| `auto_test` | true | Run tests after changes |
| `auto_lint` | true | Run linters after changes |
| `learning_enabled` | true | Persist learnings between sessions |

---

## Self-Learning

APL remembers what works. Knowledge is stored in `.apl/` in your project:

```
.apl/
├── learnings.json        # Main learning database
├── state.json            # Current workflow state
└── config.json           # Project-specific overrides
```

### What APL Learns

| Type | Description |
|------|-------------|
| **Success Patterns** | Approaches that worked well |
| **Anti-Patterns** | Approaches to avoid |
| **User Preferences** | Your coding style and conventions |
| **Project Knowledge** | Codebase structure, test commands |

### Managing Learnings

```bash
/apl forget <pattern_id>   # Remove specific pattern
/apl forget --all          # Reset all learnings
```

Or use the GUI's Learnings Browser for visual management.

---

## Troubleshooting

### APL is stuck

```bash
/apl status   # Check current state
/apl reset    # Start fresh
```

### Bad learned pattern

```bash
/apl forget <pattern_id>
```

Or browse and delete via the GUI dashboard.

### Need to rollback

```bash
/apl rollback <checkpoint_id>
```

Checkpoints are created automatically at phase boundaries.

---

## Architecture

```
apl-autonomous-phased-looper/
├── skills/apl/SKILL.md      # Main /apl command
├── agents/                   # Specialized agents
│   ├── apl-orchestrator.md   #   Main coordinator
│   ├── planner-agent.md      #   Planning
│   ├── coder-agent.md        #   Code generation
│   ├── tester-agent.md       #   Testing
│   ├── reviewer-agent.md     #   Review
│   └── learner-agent.md      #   Learning
├── gui/                      # Web dashboard
│   ├── client/               #   React frontend
│   ├── server/               #   Express backend
│   └── start.sh              #   Launcher
├── master-config.json        # Central configuration
├── contracts/                # JSON schemas
├── scripts/                  # Automation scripts
└── templates/                # Default configs
```

---

## License

MIT License - See [LICENSE](LICENSE)
