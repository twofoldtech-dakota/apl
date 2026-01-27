---
name: meta
description: Enterprise-scale project orchestrator. Decomposes massive goals into Epic/Feature/Story hierarchy, asks expert-level clarifying questions, and coordinates multi-session execution via APL. Use for projects too large for a single /apl session.
argument-hint: "<goal or subcommand>"
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Task, TodoWrite
model: sonnet
context: fork
agent: meta-orchestrator
---

# /meta - Enterprise Project Orchestrator

Meta-orchestrator for planning and executing enterprise-scale projects. Operates in two distinct phases:

1. **PLAN Phase** - Expert questioning + Epic/Feature/Story decomposition
2. **LOOP Phase** - Execute ONE Epic at a time (user-initiated)

## Commands

### Start New Project (PLAN Phase)
```
/meta <enterprise goal>
```
Analyzes goal, asks expert questions, creates Epic/Feature/Story breakdown. Does NOT auto-execute.

**Example:**
```
/meta Build a healthcare patient portal with appointment scheduling and medical records
```

### Execute Next Epic (LOOP Phase)
```
/meta loop
/meta loop <epic_id>
```
Executes stories in ONE Epic via APL orchestrator. Stops when Epic complete.

### Continuous Execution (AUTOPILOT Mode)
```
/meta autopilot
/meta loop --continuous
/meta loop --continuous --until <epic_id>
```
Executes ALL remaining Epics without stopping between them. Maintains checkpoints for recovery.

**Flags:**
- `--continuous` - Run through all Epics without stopping
- `--until <id>` - Run until specific Epic is complete
- `--confidence <level>` - Pause if confidence drops below: low|medium|high (default: low)
- `--checkpoint-interval <n>` - Force checkpoint every N stories (default: 5)
- `--pause-on-failure` - Stop if any story fails (default: true)
- `--skip-failures` - Mark failed stories and continue

**Graceful Stop:**
- Create `.meta/STOP` file to stop after current story completes
- `Ctrl+C` prompts to complete current story or stop immediately

**Examples:**
```bash
# Run all remaining Epics
/meta autopilot

# Same as autopilot
/meta loop --continuous

# Run until Epic 3 is complete
/meta loop --continuous --until epic_003

# Run but pause on medium confidence drop
/meta loop --continuous --confidence medium

# Skip failures instead of pausing
/meta loop --continuous --skip-failures
```

### View Progress
```
/meta status
```
Shows Epic/Feature/Story progress with minimal context load.

### Re-enter Planning
```
/meta plan
```
Modify or add to existing plan.

### Answer Questions
```
/meta answer <question_id> <answer>
```
Provide answer to a clarifying question during PLAN phase.

### Export Documentation
```
/meta export
```
Generate markdown summary of project plan and progress.

## State Directory

Project state is stored in `.meta/` in your project root:

```
.meta/
├── active/                  # Current context (small)
├── epics/                   # Full Epic definitions
├── archive/                 # Completed work
├── checkpoints/             # Recovery checkpoints
├── plan.json                # Project plan
├── progress.json            # Metrics
├── continuous-state.json    # Continuous mode state (when active)
└── STOP                     # Create this file to gracefully stop autopilot
```

## Key Behaviors

- **PLAN completes before execution** - No code is written until you run `/meta loop`
- **ONE Epic per loop** - Context is managed by processing one Epic at a time
- **User controls pacing** - You must explicitly call `/meta loop` between Epics
- **APL unchanged** - Stories are handed off to existing APL orchestrator

## Example Workflows

### Manual Workflow (Step by Step)

```bash
# 1. Start planning
/meta Build an e-commerce platform with user accounts, product catalog, and checkout

# 2. Answer expert questions (multiple batches)
/meta answer 1 "Stripe for payments"
/meta answer 2 "PostgreSQL"

# 3. Review the plan
/meta status

# 4. Execute first Epic
/meta loop

# 5. Review, then continue
/meta status
/meta loop

# 6. Repeat until complete
```

### Autopilot Workflow (Continuous)

```bash
# 1. Start planning
/meta Build an e-commerce platform with user accounts, product catalog, and checkout

# 2. Answer expert questions
/meta answer 1 "Stripe for payments"
/meta answer 2 "PostgreSQL"

# 3. Review the plan
/meta status

# 4. Run ALL Epics automatically
/meta autopilot

# 5. (Optional) Stop gracefully - create STOP file in another terminal
touch .meta/STOP

# 6. Check final status
/meta status
```

### Resume After Interruption

```bash
# If autopilot was interrupted, check status first
/meta status

# Resume from where it stopped
/meta autopilot

# Or continue manually
/meta loop
```
