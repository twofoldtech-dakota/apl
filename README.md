# APL - Autonomous Phased Looper

The ultimate autonomous coding plugin for Claude Code.

Set a goal. APL handles the rest - planning, coding, testing, reviewing, and learning for next time.

---

## Quick Start

### Install

```bash
# Add the marketplace
/plugin marketplace add https://github.com/twofoldtech-dakota/apl.git

# Install APL
/plugin install apl-autonomous-phased-looper@apl-marketplace
```

### Use

```bash
/apl Build a REST API with JWT authentication
```

### Monitor (Optional)

```bash
/apl gui
```

Opens a web dashboard at http://localhost:5173

---

## What It Does

```
You: /apl Add user authentication with OAuth

APL: ┌─────────┐     ┌─────────┐     ┌─────────┐
     │  PLAN   │ ──▶ │ EXECUTE │ ──▶ │ REVIEW  │
     └─────────┘     └─────────┘     └─────────┘
         │               │               │
         ▼               ▼               ▼
     Break into      Code each       Verify all
     tasks with      task using      criteria met,
     success         ReAct loops     extract
     criteria        + verification  learnings
```

**Then remembers what worked for next time.**

---

## Features

| Feature | Description |
|---------|-------------|
| **Autonomous Execution** | Plans, codes, tests, and reviews without hand-holding |
| **5 Specialized Agents** | Planner, Coder, Tester, Reviewer, Learner |
| **Self-Learning** | Remembers successful patterns and avoids past failures |
| **Web Dashboard** | Visual monitoring and control via `/apl gui` |
| **Error Recovery** | Automatic retry with graduated fallback strategies |
| **Checkpoints** | State saves at each phase with rollback support |

---

## GUI Dashboard

APL includes a web-based control panel for visual monitoring.

```bash
/apl gui
```

| URL | Service |
|-----|---------|
| http://localhost:5173 | Dashboard |
| http://localhost:3001 | API |

**Dashboard Features:**
- Real-time workflow monitoring
- Phase and task progress visualization
- Agent activity tracking
- ReAct loop visualization
- Token usage monitoring
- Configuration editor
- Learnings browser
- Checkpoint management

---

## Commands

| Command | Description |
|---------|-------------|
| `/apl <goal>` | Run APL with a coding goal |
| `/apl gui` | Launch web dashboard |
| `/apl status` | Show current state |
| `/apl config` | View configuration |
| `/apl reset` | Clear state, start fresh |
| `/apl rollback <id>` | Restore checkpoint |
| `/apl forget <id>` | Remove learned pattern |

---

## Examples

```bash
# Build features
/apl Build a REST API with rate limiting and JWT auth

# Refactor
/apl Refactor the data layer to use repository pattern

# Debug
/apl Fix the race condition in order processing

# Test
/apl Add unit tests for all services with 80% coverage

# Migrate
/apl Migrate from Express to Fastify, keep API compatible
```

---

## How It Works

### Phase 1: Plan

The Planner agent breaks down your goal:
- Creates atomic, verifiable tasks
- Defines success criteria
- Identifies dependencies and parallel opportunities
- Checks learned patterns from past sessions

### Phase 2: Execute

The Coder agent implements each task using ReAct:
1. **Reason** - Analyze what's needed
2. **Act** - Write/modify code
3. **Observe** - Check results, run tests
4. **Verify** - Confirm success criteria met

On failure: retry → adjust approach → backtrack → escalate to user

### Phase 3: Review

The Reviewer agent validates everything:
- Cross-task analysis
- Final success criteria check
- Learning extraction for future sessions

---

## Self-Learning

APL improves with each session. Learnings stored in `.apl/`:

| Type | What It Learns |
|------|----------------|
| **Success Patterns** | Approaches that worked |
| **Anti-Patterns** | Approaches to avoid |
| **User Preferences** | Your coding style |
| **Project Knowledge** | Codebase structure |

---

## Configuration

Customize via `.apl/config.json` in your project:

```json
{
  "max_iterations": 20,
  "auto_test": true,
  "auto_lint": true,
  "learning_enabled": true
}
```

Or use the GUI configuration panel.

---

## Requirements

- Claude Code CLI
- Node.js 18+ (for GUI only)

---

## License

MIT - See [LICENSE](plugins/apl-autonomous-phased-looper/LICENSE)

---

**APL**: Set a goal. Ship the feature.
