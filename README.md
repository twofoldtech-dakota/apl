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
You: /apl Build a healthcare patient portal

APL: ┌──────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐
     │ DETECT   │ ─▶ │   PLAN   │ ─▶ │ EXECUTE │ ─▶ │ REVIEW  │
     └──────────┘    └──────────┘    └─────────┘    └─────────┘
          │               │               │              │
          ▼               ▼               ▼              ▼
     Auto-detect     Generate        Code each      Verify all
     complexity,     .apl/plan.md    story using    criteria,
     ask critical    with progress   ReAct loops    extract
     questions       checkboxes      + tests        learnings
```

**Zero-config.** Planning flows directly into execution. Progress tracked via checkboxes.

**Then remembers what worked for next time.**

---

## Features

| Feature | Description |
|---------|-------------|
| **Autonomous Execution** | Plans, codes, tests, and reviews without hand-holding |
| **26 Specialized Agents** | Full digital team: coding, design, content, QA, analytics, research, docs, perf |
| **Horizontal Quality Agents** | Content strategy, brand voice, design, accessibility, copy/content |
| **Enterprise Scale** | Epic/Feature/Story hierarchies with autopilot mode |
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

### Enterprise Commands

| Command | Description |
|---------|-------------|
| `/apl <goal>` | Plan enterprise-scale project (auto-detects complexity) |
| `/apl loop` | Execute next Epic |
| `/apl autopilot` | Execute ALL remaining Epics continuously |
| `/apl answer <id> <text>` | Answer clarifying question |

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
# Plan a large project (APL auto-detects complexity)
/apl Build a healthcare patient portal with appointments and medical records

# Run through all Epics automatically
/apl autopilot

# Or step through manually
/apl loop          # Epic 1
/apl loop          # Epic 2
/apl loop          # Epic 3
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

APL improves with each session. All state is **auto-managed** in `.apl/`:

```
.apl/
├── plan.md           # Human-readable: progress with checkboxes
├── state.json        # Internal: machine state
├── learnings.json    # Internal: accumulated patterns
└── checkpoints/      # Internal: recovery points
```

| Type | What It Learns |
|------|----------------|
| **Success Patterns** | Approaches that worked |
| **Anti-Patterns** | Approaches to avoid |
| **User Preferences** | Your coding style |
| **Project Knowledge** | Codebase structure |

The `plan.md` is the source of truth. View progress at a glance, track in git, resume any session.

---

## Enterprise Scale

For projects too large for a single session, APL automatically switches to structured mode:

```bash
# Start an enterprise project (auto-detects complexity)
/apl Build an e-commerce platform with user accounts, product catalog, and checkout

# APL will:
# 1. Detect enterprise complexity
# 2. Ask 5-10 critical questions (inline)
# 3. Generate .apl/plan.md with Epics/Features/Stories
# 4. Start executing Story 1 immediately

# Resume later (APL finds next incomplete task)
/apl

# Or run ALL remaining Epics automatically
/apl autopilot
```

**The plan.md tracks everything:**
```markdown
## Epic 1: User Authentication
- [x] **Story 1.1.1**: Create User model
- [x] **Story 1.1.2**: Build registration endpoint
- [ ] **Story 1.1.3**: Implement login flow  <-- Next
```

**Autopilot Features:**
- Executes all remaining Epics without stopping
- Checkpoints every 5 stories (configurable)
- Pauses on failure or low confidence
- Graceful stop: create `.apl/STOP` file
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

APL works out of the box with zero configuration. For customization, edit `.apl/config.json`:

```json
{
  "max_iterations": 20,
  "auto_test": true,
  "auto_lint": true,
  "learning_enabled": true
}
```

**Note:** The `.apl/` directory is auto-created on first run. Most files are internal and auto-managed. Only edit `config.json` if needed.

Or use the GUI configuration panel: `/apl gui`

---

## Requirements

- Claude Code CLI
- Node.js 18+ (for GUI only)

---

## License

MIT - See [LICENSE](plugins/apl-autonomous-phased-looper/LICENSE)

---

**APL**: Set a goal. Ship the feature.
