# APL GUI Control Panel

A web-based graphical user interface for controlling and monitoring the **Autonomous Phased Looper (APL)** - Claude Code's flagship autonomous coding plugin.

## Features

- **Real-time Dashboard** - Live view of APL workflow progress with phase indicators, task lists, and metrics
- **Task Visualization** - See all tasks with status, dependencies, success criteria, and error history
- **Configuration Panel** - Toggle agents, hooks, and view all APL settings
- **Learnings Browser** - Browse and manage success patterns and anti-patterns learned by APL
- **Pattern Library** - Explore built-in code patterns across categories (auth, API, database, testing, React)
- **Checkpoint Recovery** - View checkpoint timeline and rollback to previous states
- **WebSocket Updates** - Real-time updates as APL executes without page refresh

## Quick Start

```bash
# From any project directory
/path/to/apl/plugins/apl-autonomous-phased-looper/gui/start.sh

# Or specify a project root
/path/to/apl/plugins/apl-autonomous-phased-looper/gui/start.sh /path/to/my-project
```

The GUI will launch at:
- **Client**: http://localhost:5173
- **Server**: http://localhost:3001
- **WebSocket**: ws://localhost:3001/ws

## Installation

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Setup

```bash
cd /path/to/apl/plugins/apl-autonomous-phased-looper/gui

# Install all dependencies
npm install

# Build shared types
npm run build:shared
```

## Development

```bash
# Start development servers (hot reload)
npm run dev

# Or start individually
npm run dev:server    # Backend on port 3001
npm run dev:client    # Frontend on port 5173
```

## Architecture

```
gui/
├── client/           # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # React hooks (WebSocket, etc.)
│   │   ├── store/        # Zustand state management
│   │   └── api/          # API client
│   └── public/
│
├── server/           # Express + WebSocket backend
│   └── src/
│       ├── routes/       # REST API endpoints
│       ├── services/     # Business logic
│       ├── watchers/     # File system watchers
│       └── websocket/    # WebSocket server
│
└── shared/           # Shared TypeScript types
    └── src/types/
```

## API Endpoints

### State
- `GET /api/state` - Current APL state
- `GET /api/state/tasks` - All tasks
- `GET /api/state/metrics` - Execution metrics
- `DELETE /api/state` - Clear state

### Configuration
- `GET /api/config` - Merged configuration
- `GET /api/config/master` - Master config
- `PATCH /api/config/master` - Update master config
- `PATCH /api/config/agents/:name/toggle` - Toggle agent

### Learnings
- `GET /api/learnings` - All learnings
- `GET /api/learnings/success-patterns` - Success patterns
- `GET /api/learnings/anti-patterns` - Anti-patterns
- `DELETE /api/learnings/pattern/:id` - Delete pattern

### Patterns
- `GET /api/patterns` - Pattern index
- `GET /api/patterns/category/:category` - By category
- `GET /api/patterns/search?q=query` - Search patterns

### Checkpoints
- `GET /api/checkpoints` - All checkpoints
- `GET /api/checkpoints/timeline` - Timeline view
- `POST /api/checkpoints/:id/rollback` - Rollback

### Control
- `GET /api/control/status` - APL process status
- `POST /api/control/start` - Start APL with goal
- `POST /api/control/stop` - Stop APL

## WebSocket Events

The GUI receives real-time updates via WebSocket:

| Event | Description |
|-------|-------------|
| `state:update` | Full state update |
| `state:phase_change` | Phase transition |
| `task:update` | Task status changed |
| `task:completed` | Task completed |
| `task:failed` | Task failed |
| `checkpoint:created` | New checkpoint |
| `config:update` | Config changed |
| `learnings:update` | Learnings changed |
| `apl:started` | APL process started |
| `apl:stopped` | APL process stopped |
| `apl:output` | APL stdout/stderr |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APL_PROJECT_ROOT` | `cwd` | Project to monitor |
| `APL_GUI_PORT` | `3001` | Server port |
| `APL_GUI_CLIENT_PORT` | `5173` | Client port |
| `APL_GUI_CORS_ORIGINS` | `localhost:5173` | CORS origins |

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Lucide Icons

### Backend
- Node.js
- Express
- WebSocket (ws)
- Chokidar (file watching)
- TypeScript

## Screenshots

### Dashboard
The main dashboard shows:
- Current goal and phase progress
- Task list with real-time status updates
- Metrics panel with confidence gauge
- Activity feed with recent events

### Configuration
Toggle agents on/off, view execution settings, manage hooks, and review safety boundaries.

### Learnings
Browse success patterns and anti-patterns learned from previous APL sessions. Delete patterns that are no longer relevant.

### Pattern Library
Explore built-in code patterns with:
- Category browsing
- Search functionality
- Code examples
- Success indicators and pitfalls

### Checkpoints
Visual timeline of checkpoints with one-click rollback capability.

## Troubleshooting

### Port already in use
```bash
# Change ports via environment variables
APL_GUI_PORT=3002 APL_GUI_CLIENT_PORT=5174 ./start.sh
```

### WebSocket not connecting
- Ensure the server is running on the expected port
- Check browser console for connection errors
- Verify CORS configuration if accessing from different origin

### State not updating
- Check if `.apl/state.json` exists in the project directory
- Verify file permissions
- Check server logs for watcher errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details.
