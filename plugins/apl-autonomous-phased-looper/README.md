# APL - Autonomous Phased Looper

The complete digital experience agent for Claude Code. APL replaces an entire digital team with specialized AI agents that handle coding, content, design, testing, analytics, research, documentation, performance, and deployment.

---

## Quick Start

```bash
# Simple task - direct execution
/apl Fix the login validation bug

# Complex project - structured decomposition
/apl Build a healthcare patient portal with scheduling

# Specialized commands
/apl content blog "TypeScript Best Practices"
/apl deploy preview
/apl design component Button
/apl test e2e checkout
```

That's it. APL detects complexity and adapts automatically.

---

## Table of Contents

- [Features](#features)
- [Commands](#commands)
- [Agent Flow](#agent-flow)
- [Agents](#agents)
- [Execution Modes](#execution-modes)
- [GUI Dashboard](#gui-dashboard)
- [Configuration](#configuration)
- [Architecture](#architecture)

---

## Features

| Feature | Description |
|---------|-------------|
| **Adaptive Complexity** | Auto-detects simple vs complex tasks, adjusts execution mode |
| **26 Specialized Agents** | Full digital team: coding, design, content, QA, analytics, research, docs, perf |
| **Multi-Phase Workflow** | Plan → Execute → Review → Learn with ReAct loops |
| **Enterprise Support** | Healthcare, fintech, e-commerce domain awareness |
| **Self-Learning** | Learns patterns from every session |
| **Visual Dashboard** | Web-based GUI for monitoring and control |
| **MCP Integrations** | Vercel deployment, Pencil.dev design |

---

## Commands

### Main Command

```bash
/apl <your goal>              # Auto-detect mode and execute
/apl --fresh <goal>           # Force fresh start
```

### Specialized Subcommands

| Command | Description |
|---------|-------------|
| `/apl content <type> <topic>` | Generate SEO content (blog, landing, docs) |
| `/apl deploy [preview\|rollback]` | Deploy via Vercel MCP |
| `/apl design component <name>` | Design UI component |
| `/apl docs api` | Generate API documentation |
| `/apl research user <topic>` | User/competitive research |
| `/apl analytics track <events>` | Implement tracking |
| `/apl test e2e <feature>` | Generate E2E tests |
| `/apl perf audit` | Performance audit |
| `/apl roadmap` | Generate product roadmap |

### Session Management

| Command | Description |
|---------|-------------|
| `/apl loop` | Execute next Epic (structured mode) |
| `/apl autopilot` | Continuous execution |
| `/apl status` | Show current progress |
| `/apl answer <id> <text>` | Answer clarifying question |
| `/apl gui` | Launch web dashboard |
| `/apl reset` | Clear all state |

---

## Agent Flow

APL uses a hierarchical agent architecture where the orchestrator coordinates specialized agents based on task type and phase.

### Flow Diagram

```
                            ┌─────────────────────────┐
                            │     User Request        │
                            │    /apl <goal>          │
                            └───────────┬─────────────┘
                                        │
                                        ▼
                            ┌─────────────────────────┐
                            │   APL Orchestrator      │
                            │  (Complexity Detection) │
                            └───────────┬─────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   │                   ▼
            ┌───────────────┐           │           ┌───────────────┐
            │  DIRECT MODE  │           │           │STRUCTURED MODE│
            │ (Simple Tasks)│           │           │(Complex Goals)│
            └───────┬───────┘           │           └───────┬───────┘
                    │                   │                   │
                    ▼                   │                   ▼
    ┌───────────────────────────┐       │    ┌───────────────────────────┐
    │        PHASE: PLAN        │       │    │   PHASE: REQUIREMENTS     │
    │     (planner-agent)       │       │    │  (requirements-analyst)   │
    └───────────┬───────────────┘       │    └───────────┬───────────────┘
                │                       │                │
                ▼                       │                ▼
    ┌───────────────────────────┐       │    ┌───────────────────────────┐
    │      PHASE: EXECUTE       │       │    │    PHASE: DECOMPOSE       │
    │  ┌─────────────────────┐  │       │    │  (Epics → Features →      │
    │  │   ReAct Loop        │  │       │    │         Stories)          │
    │  │ ┌────────────────┐  │  │       │    └───────────┬───────────────┘
    │  │ │ coder-agent    │  │  │       │                │
    │  │ │ tester-agent   │  │  │       │                ▼
    │  │ └────────────────┘  │  │       │    ┌───────────────────────────┐
    │  └─────────────────────┘  │       │    │      PHASE: LOOP          │
    └───────────┬───────────────┘       │    │  (Execute each Epic)      │
                │                       │    │  → Back to EXECUTE        │
                ▼                       │    └───────────────────────────┘
    ┌───────────────────────────┐       │
    │      PHASE: REVIEW        │       │
    │    (reviewer-agent)       │       │
    └───────────┬───────────────┘       │
                │                       │
                ▼                       │
    ┌───────────────────────────┐       │
    │      PHASE: LEARN         │       │
    │     (learner-agent)       │       │
    └───────────────────────────┘       │
                                        │
                                        │
    HORIZONTAL AGENTS ──────────────────┘
    (Run during Execute/Review phases based on file changes)

    ┌────────────┬──────────────┬──────────────┬───────────────┐
    │  content-  │   design-    │ accessibility│   security-   │
    │  strategy  │   agent      │    agent     │    agent      │
    └────────────┴──────────────┴──────────────┴───────────────┘
```

### How Agents Get Used

**1. Orchestrator Receives Goal**
The `apl-orchestrator` receives the user's goal and analyzes it for complexity signals.

**2. Mode Selection**
- **Direct Mode**: Keywords like "fix", "add", "update" → single-session execution
- **Structured Mode**: Keywords like "build", "platform", "system" → multi-session with Epic breakdown

**3. Core Workflow Agents**
| Phase | Agent | Purpose |
|-------|-------|---------|
| Plan | `planner-agent` | Breaks goal into tasks with success criteria |
| Execute | `coder-agent` | Generates code via ReAct loops |
| Execute | `tester-agent` | Runs tests, validates changes |
| Review | `reviewer-agent` | Cross-task analysis, quality checks |
| Learn | `learner-agent` | Extracts patterns for future sessions |

**4. Horizontal Agents (Quality Layer)**
The `horizontal-coordinator` invokes these based on file patterns:

| Agent | Triggers | Purpose |
|-------|----------|---------|
| `content-strategy-agent` | `.md`, `.mdx`, copy changes | Content quality, SEO |
| `design-agent` | UI components, styles | Design consistency |
| `accessibility-agent` | React/Vue components | WCAG compliance |
| `brand-voice-agent` | Marketing content | Tone consistency |
| `security-agent` | Auth, API routes | Security review |

**5. Specialized Agents (On-Demand)**
Invoked via subcommands:

| Subcommand | Agent | Purpose |
|------------|-------|---------|
| `/apl content` | `content-strategy-agent` | Generate blog, landing, docs |
| `/apl deploy` | `deployer-agent` | Vercel deployment |
| `/apl design` | `design-agent` | UI design specs |
| `/apl docs` | `documentation-agent` | API docs, guides, changelogs |
| `/apl research` | `research-agent` | User/market research |
| `/apl analytics` | `analytics-agent` | Tracking, A/B tests |
| `/apl test` | `qa-automation-agent` | E2E, visual, load tests |
| `/apl perf` | `performance-agent` | Core Web Vitals, optimization |
| `/apl roadmap` | `product-agent` | Roadmaps, prioritization |

---

## Agents

APL includes 26 specialized agents organized into categories:

### Core Workflow (6 agents)
| Agent | Role |
|-------|------|
| `apl-orchestrator` | Central coordinator, complexity detection, mode switching |
| `planner-agent` | Task decomposition with Tree-of-Thoughts |
| `coder-agent` | Code generation and modification |
| `tester-agent` | Test execution and validation |
| `reviewer-agent` | Code review and quality assurance |
| `learner-agent` | Pattern extraction and persistence |

### Requirements & Architecture (2 agents)
| Agent | Role |
|-------|------|
| `requirements-analyst` | Domain-aware requirements gathering |
| `architecture-agent` | System design and technical decisions |

### Quality Assurance (4 agents)
| Agent | Role |
|-------|------|
| `qa-automation-agent` | E2E tests, visual regression, load testing |
| `security-agent` | Security audits, vulnerability detection |
| `accessibility-agent` | WCAG compliance, a11y testing |
| `performance-agent` | Core Web Vitals, bundle analysis, optimization |

### Content & Design (4 agents)
| Agent | Role |
|-------|------|
| `content-strategy-agent` | SEO content, blog, landing pages |
| `brand-voice-agent` | Tone consistency, style guide adherence |
| `design-agent` | UI components, design systems, Pencil.dev MCP |
| `documentation-agent` | API docs, user guides, changelogs |

### Infrastructure & DevOps (4 agents)
| Agent | Role |
|-------|------|
| `deployer-agent` | Vercel deployment, environment management |
| `infrastructure-agent` | Cloud resources, IaC |
| `cicd-agent` | Pipeline configuration |
| `observability-agent` | Logging, monitoring, alerting |

### Data & Integration (3 agents)
| Agent | Role |
|-------|------|
| `database-migration-agent` | Schema changes, migrations |
| `api-evolution-agent` | API versioning, backwards compatibility |
| `analytics-agent` | Event tracking, A/B testing, dashboards |

### Product & Research (2 agents)
| Agent | Role |
|-------|------|
| `product-agent` | Roadmaps, RICE scoring, user stories |
| `research-agent` | User research, competitive analysis |

### Coordination (1 agent)
| Agent | Role |
|-------|------|
| `horizontal-coordinator` | Routes files to quality agents |

---

## Execution Modes

### Direct Mode (Simple Tasks)

Triggered by: "fix", "add", "update", "refactor", <10 estimated tasks

```
/apl Fix the login validation bug
```

**Flow:**
```
PLAN → EXECUTE (ReAct loops) → REVIEW → LEARN
```

Single-session execution. Completes in one conversation.

### Structured Mode (Complex Projects)

Triggered by: "build", "platform", "system", "enterprise", domain keywords, 10+ tasks

```
/apl Build a healthcare patient portal with HIPAA compliance
```

**Flow:**
```
REQUIREMENTS → DECOMPOSE → LOOP (per Epic) → REVIEW → LEARN
```

**Hierarchy:**
- **Epic**: Business capability (1-10 features)
- **Feature**: User-facing functionality (1-8 stories)
- **Story**: Single APL session (1-3 hours work)

**Session Management:**
```bash
/apl answer q_001 "Use PostgreSQL"  # Answer questions
/apl loop                            # Execute next Epic
/apl loop epic_002                   # Execute specific Epic
/apl autopilot                       # Run all Epics continuously
```

---

## GUI Dashboard

```bash
/apl gui
```

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:5173 |
| **API** | http://localhost:3001 |
| **WebSocket** | ws://localhost:3001/ws |

### Features

- Real-time workflow monitoring
- Phase and task tracking
- Agent activity visualization
- Token usage and context warnings
- Checkpoint timeline with rollback
- Learnings browser
- Configuration UI

---

## Configuration

Central config in `master-config.json`. Project overrides in `.apl/config.json`:

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

---

## Architecture

```
apl-autonomous-phased-looper/
├── skills/apl/SKILL.md           # Unified /apl command
├── agents/                        # 26 specialized agents
│   ├── apl-orchestrator.md        #   Central coordinator
│   ├── planner-agent.md           #   Planning
│   ├── coder-agent.md             #   Code generation
│   ├── tester-agent.md            #   Testing
│   ├── reviewer-agent.md          #   Review
│   ├── learner-agent.md           #   Learning
│   ├── horizontal-coordinator.md  #   Quality routing
│   ├── content-strategy-agent.md  #   Content
│   ├── design-agent.md            #   Design
│   ├── documentation-agent.md     #   Docs
│   ├── qa-automation-agent.md     #   QA
│   ├── performance-agent.md       #   Performance
│   ├── analytics-agent.md         #   Analytics
│   ├── research-agent.md          #   Research
│   ├── product-agent.md           #   Product
│   └── ...                        #   (11 more)
├── gui/                           # Web dashboard
│   ├── client/                    #   React frontend
│   ├── server/                    #   Express backend
│   └── start.sh                   #   Launcher
├── master-config.json             # Central configuration
├── contracts/                     # JSON schemas
├── scripts/                       # Automation scripts
└── templates/                     # Default configs
```

### State Directory

```
.apl/
├── state.json           # Current session state
├── learnings.json       # Accumulated learnings
├── config.json          # Project overrides
├── plan.json            # Project plan (structured mode)
├── epics/               # Epic definitions
├── checkpoints/         # Recovery points
└── archive/             # Completed work
```

---

## License

MIT License - See [LICENSE](LICENSE)
