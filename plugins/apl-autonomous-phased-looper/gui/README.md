# APL GUI Control Panel

A web-based graphical interface for **controlling** and **monitoring** APL (Autonomous Phased Looper) - Claude Code's flagship autonomous coding plugin.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features Overview](#features-overview)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Pages Reference](#pages-reference)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Step 1: Launch the GUI

```bash
# From your project directory
cd /path/to/your/project

# Run the launcher
/path/to/apl/plugins/apl-autonomous-phased-looper/gui/start.sh
```

### Step 2: Open Your Browser

The GUI opens automatically at:
| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API Server** | http://localhost:3001 |
| **WebSocket** | ws://localhost:3001/ws |

### Step 3: Start a Workflow

1. Type a goal: `"Build a REST API with JWT authentication"`
2. Press **Enter** or click **Start APL**
3. Watch the progress in real-time!

---

## Features Overview

### 🎮 Workflow Control

| Feature | Description | How to Access |
|---------|-------------|---------------|
| **Start APL** | Launch autonomous coding | Dashboard → Enter goal → Start |
| **Stop APL** | Halt running workflow | Dashboard → Stop button |
| **Goal History** | Reuse previous goals | Click 🕒 icon in input |
| **Goal Templates** | Pre-built goal library | Click ✨ icon in input |
| **Quick Actions** | One-click common tasks | Dashboard → Quick buttons |
| **Meta Commands** | Enterprise orchestration | Commands → /meta tab |
| **Project Switching** | Change target project | Commands → Project panel |

### 📊 Real-Time Monitoring

| Feature | Description |
|---------|-------------|
| **Phase Indicator** | Shows Plan → Execute → Review progress |
| **Task List** | Live task status with parallel group colors |
| **Metrics Panel** | Confidence level, success rate, timing |
| **Activity Feed** | Real-time event stream |
| **Scratchpad** | Agent's working memory (learnings, questions) |
| **Verification** | Chain-of-Verification evidence |

### 🤖 Agentic View

| Feature | Description |
|---------|-------------|
| **Agent Monitor** | See which of 8 agents is active |
| **ReAct Loop** | Visualize Reason → Act → Observe → Verify |
| **Tool Log** | Track Read/Write/Bash invocations |
| **Token Usage** | Context window with warnings |

### ⚙️ Configuration & Data

| Feature | Description |
|---------|-------------|
| **Config Panel** | Toggle agents, hooks, safety settings |
| **Learnings** | Browse success & anti-patterns |
| **Pattern Library** | Built-in code patterns by category |
| **Checkpoints** | Timeline with one-click rollback |

---

## Installation

### Prerequisites

```
Node.js 18+
npm 9+
```

### Setup Commands

```bash
# 1. Go to GUI directory
cd /path/to/apl/plugins/apl-autonomous-phased-looper/gui

# 2. Install dependencies
npm install

# 3. Build shared types
npm run build:shared

# 4. Start development servers
npm run dev
```

### Directory Structure

```
gui/
├── start.sh              # 🚀 One-command launcher
├── package.json          # Monorepo config
│
├── client/               # React frontend
│   └── src/
│       ├── components/   # UI components
│       │   ├── dashboard/    # Main view
│       │   ├── agentic/      # Agent monitoring
│       │   ├── control/      # Commands & project
│       │   ├── config/       # Settings
│       │   ├── learnings/    # Pattern browser
│       │   ├── patterns/     # Pattern library
│       │   └── checkpoints/  # Recovery
│       ├── hooks/        # WebSocket, etc.
│       ├── store/        # Zustand state
│       └── api/          # REST client
│
├── server/               # Express backend
│   └── src/
│       ├── routes/       # API endpoints
│       ├── services/     # Business logic
│       ├── watchers/     # File monitoring
│       └── websocket/    # Real-time server
│
└── shared/               # Shared TypeScript types
```

---

## Usage Guide

### Starting Workflows

#### Option 1: Type a Goal
```
1. Enter goal in text box
2. Press Enter or click "Start APL"
```

#### Option 2: Use Templates (✨ button)
```
1. Click ✨ icon
2. Choose category (API, Testing, Database, etc.)
3. Select template
4. Modify if needed
5. Click "Start APL"
```

**Available Categories:**
- API Development
- Testing
- Database
- Frontend
- Refactoring
- DevOps

#### Option 3: Quick Actions
Click any button in the Quick Actions bar:

| Button | Goal |
|--------|------|
| Run Tests | Run test suite and fix failures |
| Lint & Fix | Run linter and fix errors |
| Type Check | Fix TypeScript errors |
| Build | Run build and fix errors |
| Add Tests | Add comprehensive tests |
| Refactor | Improve recent code quality |

#### Option 4: Goal History (🕒 button)
```
1. Click 🕒 icon
2. Select from up to 10 recent goals
3. Click "Start APL"
```

---

### Using Commands

Navigate to **Commands** page in the sidebar.

#### /apl Commands

| Command | Description |
|---------|-------------|
| `status` | View current APL state |
| `reset` | Clear state and start fresh |
| `rollback` | Go to Checkpoints page |
| `forget` | Clear all learned patterns |

#### /meta Commands (Enterprise)

| Command | Description |
|---------|-------------|
| `meta <goal>` | Start enterprise project planning |
| `meta loop` | Execute the next Epic |
| `meta status` | View Epic/Feature/Story progress |
| `meta export` | Generate project documentation |

---

### Switching Projects

1. Go to **Commands** page
2. In the **Project** panel on the right:
   - Click a **recent project** to switch instantly
   - Or click **Add Project** and enter path
3. Page reloads with new project context

---

### Dashboard Views

Toggle between views using the buttons below the phase indicator:

#### Overview Mode
- Task list with parallel group visualization
- Metrics panel (confidence gauge)
- Verification evidence panel
- Scratchpad (agent's working memory)
- Activity feed

#### Agentic View
- Agent Activity Monitor (which agent is active)
- ReAct Loop Indicator (current reasoning step)
- Token Usage Tracker (context window)
- Tool Invocation Log (Read, Write, Bash, etc.)

---

## Pages Reference

### Dashboard (`/`)
**Purpose:** Main monitoring and control hub

**Components:**
- Control Bar (goal input, start/stop)
- Phase Indicator (Plan/Execute/Review)
- Task List with parallel groups
- Metrics Panel
- Verification Panel
- Scratchpad Panel
- Activity Feed

### Commands (`/commands`)
**Purpose:** Advanced workflow control

**Components:**
- Control Bar
- Command Panel (/apl and /meta)
- Project Selector
- Quick Reference Guide

### Configuration (`/config`)
**Purpose:** APL settings management

**Sections:**
- Agents (toggle on/off)
- Execution (iterations, retries)
- Learning (pattern persistence)
- Safety (blocked paths, limits)
- Hooks (automation triggers)

### Learnings (`/learnings`)
**Purpose:** Pattern management

**Features:**
- Browse success patterns
- Browse anti-patterns
- View pattern statistics
- Delete individual patterns
- Clear all patterns

### Patterns (`/patterns`)
**Purpose:** Built-in pattern library

**Features:**
- Browse by category
- Search patterns
- View code examples
- See success indicators

### Checkpoints (`/checkpoints`)
**Purpose:** Recovery management

**Features:**
- Timeline visualization
- Checkpoint details
- One-click rollback

---

## API Reference

### State Endpoints
```http
GET  /api/state              # Full APL state
GET  /api/state/tasks        # Task list
GET  /api/state/metrics      # Execution metrics
DEL  /api/state              # Clear state
```

### Config Endpoints
```http
GET   /api/config            # Merged config
GET   /api/config/master     # Master config
PATCH /api/config/master     # Update config
PATCH /api/config/agents/:name/toggle  # Toggle agent
```

### Learnings Endpoints
```http
GET  /api/learnings                  # All learnings
GET  /api/learnings/success-patterns # Success only
GET  /api/learnings/anti-patterns    # Anti only
DEL  /api/learnings/pattern/:id      # Delete one
DEL  /api/learnings/patterns         # Delete all
```

### Pattern Endpoints
```http
GET  /api/patterns                     # Index
GET  /api/patterns/category/:category  # By category
GET  /api/patterns/search?q=query      # Search
```

### Checkpoint Endpoints
```http
GET  /api/checkpoints              # All checkpoints
GET  /api/checkpoints/timeline     # Timeline view
POST /api/checkpoints/:id/rollback # Rollback
```

### Control Endpoints
```http
GET  /api/control/status   # APL process status
POST /api/control/start    # Start APL {goal: "..."}
POST /api/control/stop     # Stop APL
GET  /api/control/project  # Current project
POST /api/control/project  # Set project {projectRoot: "..."}
```

### WebSocket Events

Connect to `ws://localhost:3001/ws`

| Event | Payload |
|-------|---------|
| `state:update` | `{state: AplState}` |
| `state:phase_change` | `{previousPhase, newPhase}` |
| `task:update` | `{task: Task}` |
| `checkpoint:created` | `{checkpoint: Checkpoint}` |
| `config:update` | `{config: MasterConfig}` |
| `learnings:update` | `{learnings: Learnings}` |
| `apl:started` | `{goal, sessionId}` |
| `apl:stopped` | `{reason}` |
| `agent:activity` | `{activeAgent, reactStep}` |
| `tool:invocation` | `{tool, timestamp, summary}` |
| `token:usage` | `{inputTokens, outputTokens}` |

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APL_PROJECT_ROOT` | Current dir | Project to monitor |
| `APL_GUI_PORT` | `3001` | Backend port |
| `APL_GUI_CLIENT_PORT` | `5173` | Frontend port |

### Custom Ports

```bash
APL_GUI_PORT=3002 APL_GUI_CLIENT_PORT=5174 ./start.sh
```

### Files Monitored

| File | Purpose |
|------|---------|
| `.apl/state.json` | Execution state |
| `.apl/learnings.json` | Learned patterns |
| `.apl/config.json` | Project overrides |
| `master-config.json` | Plugin defaults |
| `.meta/` | Enterprise state |

---

## Troubleshooting

### GUI Won't Start

```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3001

# Use different ports
APL_GUI_PORT=3002 ./start.sh
```

### WebSocket Won't Connect

1. Verify server is running (`npm run dev:server`)
2. Check browser console for errors
3. Ensure ports aren't blocked by firewall

### State Not Updating

1. Check `.apl/state.json` exists in project
2. Verify file permissions
3. Check server terminal for watcher errors

### APL Won't Start

1. Ensure `claude` CLI is installed and in PATH
2. Verify project path is correct
3. Check terminal for error messages

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Start APL (when goal entered) |
| `Escape` | Close dropdowns |

---

## Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Lucide Icons

**Backend:** Node.js, Express, WebSocket (ws), Chokidar

**Shared:** TypeScript types, Zod validation

---

## Support

Issues: https://github.com/anthropics/claude-code/issues

---

## License

MIT License
