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
| **10 Specialized Agents** | Planner, Coder, Tester, Reviewer, Learner + 5 horizontal quality agents |
| **Horizontal Quality Agents** | Content strategy, brand voice, design, accessibility, copy/content |
| **Enterprise Scale** | `/meta` for Epic/Feature/Story hierarchies with autopilot mode |
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

### Core APL Commands

| Command | Description |
|---------|-------------|
| `/apl <goal>` | Run APL with a coding goal |
| `/apl gui` | Launch web dashboard |
| `/apl status` | Show current state |
| `/apl config` | View configuration |
| `/apl reset` | Clear state, start fresh |
| `/apl rollback <id>` | Restore checkpoint |
| `/apl forget <id>` | Remove learned pattern |

### Enterprise Meta Commands

| Command | Description |
|---------|-------------|
| `/meta <goal>` | Plan enterprise-scale project |
| `/meta loop` | Execute next Epic |
| `/meta autopilot` | Execute ALL remaining Epics continuously |
| `/meta status` | View project progress |
| `/meta answer <id> <text>` | Answer clarifying question |

---

## Examples

### Single Session Tasks

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

### Enterprise Projects

```bash
# Plan a large project
/meta Build a healthcare patient portal with appointments and medical records

# Run through all Epics automatically
/meta autopilot

# Or step through manually
/meta loop          # Epic 1
/meta loop          # Epic 2
/meta loop          # Epic 3
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

## Enterprise Scale (/meta)

For projects too large for a single session, use the meta-orchestrator:

```bash
# Plan a large project
/meta Build an e-commerce platform with user accounts, product catalog, and checkout

# Answer expert questions
/meta answer 1 "PostgreSQL"
/meta answer 2 "Stripe for payments"

# Execute one Epic at a time
/meta loop

# Or run ALL Epics automatically
/meta autopilot
```

**Autopilot Features:**
- Executes all remaining Epics without stopping
- Checkpoints every 5 stories (configurable)
- Pauses on failure or low confidence
- Graceful stop: create `.meta/STOP` file
- Resume from where it stopped

---

## Horizontal Quality Agents

APL includes 5 horizontal agents that ensure quality across non-code dimensions:

| Agent | Purpose | Auto-Fix |
|-------|---------|----------|
| **Content Strategy** | SEO, messaging consistency | No |
| **Brand Voice** | Tone, terminology, style | Yes |
| **Design** | UI/UX patterns, design tokens | No |
| **Accessibility** | WCAG compliance, a11y testing | Yes |
| **Copy/Content** | Content writing per guidelines | Yes |

These agents are invoked automatically based on file patterns during execute and review phases.

**Configure quality gates** in `master-config.json`:
```json
{
  "horizontal_agents": {
    "quality_gates": {
      "min_scores": {
        "seo": 70,
        "voice": 80,
        "design": 75,
        "accessibility": 90
      }
    }
  }
}
```

**Project guidelines** stored in `.apl/guidelines/`:
- `brand-voice.json` - Terminology and style
- `design-system.json` - Design tokens and patterns
- `content-strategy.json` - SEO and messaging
- `accessibility.json` - WCAG level and rules

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
