# ORC (Orchestrator) - Requirements Specification v2.0

> Multi-Agent Orchestration System for Autonomous Software Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Philosophy](#2-core-philosophy)
3. [Architecture Overview](#3-architecture-overview)
4. [Agent System](#4-agent-system)
5. [Plan Structure](#5-plan-structure)
6. [Execution Model](#6-execution-model)
7. [Quality Gates](#7-quality-gates)
8. [Learning System](#8-learning-system)
9. [Command Interface](#9-command-interface)
10. [State Management](#10-state-management)
11. [Plugin Structure](#11-plugin-structure)
12. [Technical Specifications](#12-technical-specifications)
13. [Documentation Requirements](#13-documentation-requirements)
14. [Success Criteria](#14-success-criteria)

---

## 1. Executive Summary

### 1.1 What is ORC?

ORC (Orchestrator) is a Claude Code marketplace plugin that provides autonomous multi-agent orchestration for software development. It transforms high-level goals into complete, tested implementations through a structured phased approach.

### 1.2 Key Differentiators from APL 1.0

| Aspect | APL 1.0 | ORC 2.0 |
|--------|---------|---------|
| GUI | Web dashboard required | CLI-only, self-validating |
| Model | Sonnet (mostly) | Opus across the board |
| Parallelism | Sequential execution | True parallel (conflict-free) |
| Plan Detail | Task list | Epic → Feature → Story hierarchy |
| Plan Approval | Optional | **Mandatory** before execution |
| Sub-Agents | Fixed 26 agents | Core agents spawn specialists on-demand |
| Pattern Matching | Keyword overlap | Embedding similarity |
| Deviation Tracking | None | Full tracking with review gates |

### 1.3 Priority Order

```
Quality > Capability > Developer Experience > Speed > Cost
```

### 1.4 Target Users

- Primary: Individual developer (personal productivity)
- Secondary: External developers (marketplace distribution)

---

## 2. Core Philosophy

### 2.1 Plan-First Execution

**The system MUST create and receive approval for a detailed plan before any implementation begins.**

```
User Goal
    ↓
Plan Phase (mandatory)
    ↓
User Approval (mandatory)
    ↓
Execute Phase
    ↓
Review Phase
    ↓
Learn Phase
```

### 2.2 Self-Validation

Without a GUI, the system must be rigorously self-validating:
- Every story has explicit acceptance criteria
- Every implementation is validated against criteria
- Every deviation is tracked and flagged
- Every phase has quality gates

### 2.3 Strict Approach Adherence

The Implementer agent follows suggested approaches **exactly**. Any deviation must be:
1. Documented with reasoning
2. Flagged for user review (if security-related)
3. Tracked in deviation history
4. Factored into confidence scoring

### 2.4 Autonomous Recovery

On failures:
1. Auto-fix loop (3 attempts with different approaches)
2. If still failing, mark as blocked
3. Continue with non-dependent stories
4. User notified of blocked items

---

## 3. Architecture Overview

### 3.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR                             │
│  (State management, phase control, contract enforcement)         │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ PLANNER │          │IMPLEMENT│          │ REVIEW  │
   │         │          │   ER    │          │   ER    │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │Architect│          │Validator│          │ Learner │
   │Product  │          │Security │          │         │
   │DevOps   │          │Database │          │         │
   │Biz Anlst│          │Frontend │          │         │
   │   ...   │          │   ...   │          │         │
   └─────────┘          └─────────┘          └─────────┘
   (Specialists)        (Specialists)
```

### 3.2 Communication Model

**Strict Orchestrator-Mediated with Typed Contracts**

- All agent communication flows through Orchestrator
- JSON Schema contracts at every boundary
- No peer-to-peer agent communication
- Full audit trail of all handoffs

### 3.3 Delegation Model

```
Core Agent (e.g., Planner)
    │
    ├── Can spawn Specialist Sub-Agents
    │       │
    │       └── Specialists can spawn their own sub-agents
    │               │
    │               └── Unlimited delegation depth
    │
    └── Returns structured result to Orchestrator
```

---

## 4. Agent System

### 4.1 Core Agents (6)

| Agent | Phase | Responsibility |
|-------|-------|----------------|
| **Orchestrator** | All | State management, phase control, contract enforcement, delegation |
| **Planner** | Plan | Goal decomposition into Epic→Feature→Story, dependency analysis, conflict prevention |
| **Implementer** | Execute | Code implementation following strict suggested_approach, ReAct pattern |
| **Validator** | Execute | Test execution, acceptance criteria verification, quality gate checks |
| **Reviewer** | Review | Final quality gate, deviation analysis, security review, Reflexion pattern |
| **Learner** | Learn | Pattern extraction, learnings persistence, embedding generation |

### 4.2 Specialist Sub-Agents (11)

| Specialist | Expertise | Spawned By |
|------------|-----------|------------|
| **Architect** | System design, patterns, scalability, microservices | Planner, Implementer |
| **Product Designer** | UX flows, user journeys, acceptance criteria refinement | Planner |
| **DevOps Engineer** | CI/CD, Docker, K8s, infrastructure, IaC | Planner, Implementer |
| **Full Stack Dev** | End-to-end implementation, unclear frontend/backend split | Implementer |
| **Security Engineer** | Auth, encryption, OWASP, sensitive data handling | Implementer, Reviewer |
| **Database Engineer** | Schema design, migrations, queries, optimization | Planner, Implementer |
| **Frontend Specialist** | React/Vue, CSS, state management, accessibility | Implementer |
| **Backend Specialist** | REST, GraphQL, API design, business logic | Implementer |
| **QA Engineer** | Test strategy, edge cases, coverage analysis | Validator, Reviewer |
| **Biz Analyst** | Requirements clarification, business logic, domain expertise | Planner |
| **Content Strategist** | SEO, content strategy, messaging, copy | Planner, Implementer |

### 4.3 Sub-Agent Spawn Triggers

Specialists are spawned based on:

1. **Keyword triggers** - Story mentions "kubernetes" → DevOps
2. **Complexity threshold** - Story marked "high" complexity
3. **Explicit plan markup** - Planner marks stories needing specialists
4. **Agent judgment** - Core agent decides mid-task it needs help

### 4.4 Agent Definition Format

```markdown
---
name: implementer
type: core
model: opus
tools: [Read, Write, Edit, Glob, Grep, Bash, Task]
can_spawn: [architect, security, database, frontend, backend, fullstack, devops]
---

# Implementer Agent

## Role
[Description]

## Input Contract
[JSON Schema reference]

## Execution Protocol
[Step-by-step algorithm]

## Reasoning Pattern
[ReAct implementation]

## Output Contract
[JSON Schema reference]

## Error Handling
[Recovery procedures]
```

---

## 5. Plan Structure

### 5.1 Hierarchy

```
Plan
└── Epic (self-contained project milestone)
    └── Feature (self-contained capability)
        └── Story (atomic task with clear acceptance criteria)
```

### 5.2 Epic Schema

```json
{
  "$schema": "epic.schema.json",
  "id": "E1",
  "name": "User Authentication System",
  "description": "Complete authentication with registration, login, and JWT",
  "priority": 1,
  "status": "pending|approved|in_progress|completed|blocked",
  "features": [],
  "created_at": "2025-01-30T10:00:00Z",
  "approved_at": null,
  "completed_at": null
}
```

### 5.3 Feature Schema

```json
{
  "$schema": "feature.schema.json",
  "id": "E1-F1",
  "epic_id": "E1",
  "name": "User Registration",
  "description": "Allow new users to create accounts",
  "acceptance_criteria": [
    "User can register with email and password",
    "Email validation is performed",
    "Password is securely hashed"
  ],
  "stories": [],
  "status": "pending|in_progress|completed|blocked"
}
```

### 5.4 Story Schema

```json
{
  "$schema": "story.schema.json",
  "id": "E1-F1-S1",
  "feature_id": "E1-F1",
  "description": "Create User model with password hashing",
  "acceptance_criteria": [
    "User model has email, passwordHash, createdAt fields",
    "Password hashed with bcrypt cost 10",
    "Model exported with TypeScript interface",
    "Unit tests cover password hashing"
  ],
  "suggested_approach": {
    "pattern_id": "sp_bcrypt_001",
    "description": "Use bcrypt with async methods, cost factor 10",
    "source": "learnings"
  },
  "files_to_create": ["src/models/User.ts", "src/models/User.test.ts"],
  "files_to_modify": ["src/models/index.ts"],
  "dependencies": [],
  "estimated_complexity": "low|medium|high",
  "specialists_needed": [],
  "status": "pending|in_progress|completed|blocked",
  "attempts": 0,
  "max_attempts": 3,
  "result": null,
  "deviations": []
}
```

### 5.5 Dependency Rules

- **Epics are self-contained** - No cross-epic dependencies
- **Features are self-contained** - No cross-feature dependencies within epic
- **Stories can depend on stories** - Within same feature only
- **Dependency analysis at plan time** - Prevents conflicts before execution

---

## 6. Execution Model

### 6.1 Phase Flow

```
PLAN PHASE
    │
    ├── Planner decomposes goal into Epic→Feature→Story
    ├── Specialists consulted as needed (Architect, Biz Analyst, etc.)
    ├── Patterns matched from learnings via embeddings
    ├── Dependencies analyzed, conflicts prevented
    ├── Plan saved to .orc/plan/
    │
    ▼
USER APPROVAL (mandatory)
    │
    ├── User reviews plan summary
    ├── User can: approve all, approve specific epic, request changes
    │
    ▼
EXECUTE PHASE
    │
    ├── For each approved epic (in priority order):
    │   ├── For each feature:
    │   │   ├── For each story (respecting dependencies):
    │   │   │   ├── Implementer executes with ReAct pattern
    │   │   │   ├── Follows suggested_approach strictly
    │   │   │   ├── Tracks any deviations
    │   │   │   ├── Validator checks acceptance criteria
    │   │   │   ├── On failure: auto-fix loop (3 attempts)
    │   │   │   └── On success: mark complete
    │   │   └── Feature checkpoint saved
    │   └── Epic checkpoint saved
    │
    ▼
REVIEW PHASE
    │
    ├── Reviewer performs final validation
    ├── Deviation analysis and flagging
    ├── Security review
    ├── Cross-story consistency check
    │
    ▼
LEARN PHASE
    │
    ├── Learner extracts patterns from session
    ├── Updates success/anti patterns
    ├── Generates/updates embeddings
    └── Persists to learnings.json
```

### 6.2 Parallel Execution

**True parallel execution for independent stories:**

```
Feature with 4 stories:
  S1 (no deps)     ──────────►
  S2 (no deps)     ──────────►     (parallel)
  S3 (depends S1)       wait... ──────────►
  S4 (depends S2)       wait... ──────────►
```

- Dependencies analyzed at plan time
- No conflicts possible (enforced by Planner)
- Parallel stories execute concurrently

### 6.3 Auto-Fix Loop

```
Story Execution Fails
    │
    ▼
Attempt < 3?
    │
    ├── YES: Retry with:
    │   ├── Previous failure reason added to context
    │   ├── Alternative approach from patterns (if available)
    │   ├── Story can be split into smaller stories (not add features)
    │   └── Return to execution
    │
    └── NO: Mark as BLOCKED
        ├── Continue with non-dependent stories
        ├── Log to blocked_stories in learnings
        └── Notify user
```

### 6.4 ReAct Pattern (Implementer)

```
REASON
├── Parse story requirements
├── Load suggested_approach
├── Analyze current codebase context
├── Plan implementation steps
└── Identify if specialists needed

ACT
├── Create/modify files per plan
├── Follow suggested_approach exactly
├── Document any necessary deviations
└── Write tests alongside implementation

OBSERVE
├── Check file operations succeeded
├── Run type checking (tsc --noEmit)
├── Verify imports resolve
└── Check pattern compliance

VERIFY (via Validator)
├── Run unit tests
├── Check each acceptance criterion
├── Run lint checks
├── Security scan if applicable
├── Document evidence
└── Return pass/fail with details
```

---

## 7. Quality Gates

### 7.1 Story Completion Gates

A story is complete ONLY when ALL pass:

| Gate | Check | Blocking |
|------|-------|----------|
| Acceptance Criteria | All criteria verified with evidence | Yes |
| Unit Tests | All tests pass | Yes |
| Type Checking | `tsc --noEmit` passes | Yes |
| Linting | No lint errors | Yes |
| Security Scan | No new vulnerabilities | Yes |
| Approach Compliance | Matches suggested_approach OR deviation documented | Yes |
| File Compliance | Changes match `files_to_create`/`files_to_modify` | Yes |

### 7.2 Feature Completion Gates

| Gate | Check | Blocking |
|------|-------|----------|
| Stories Complete | All stories in feature completed or explicitly blocked | Yes |
| Integration Tests | All integration tests pass | Yes |
| Feature Acceptance | Feature-level acceptance criteria verified | Yes |

### 7.3 Epic Completion Gates

| Gate | Check | Blocking |
|------|-------|----------|
| Features Complete | All features in epic completed | Yes |
| E2E Tests | End-to-end tests pass (if applicable) | Yes |
| Epic Review | Reviewer agent completes final review | Yes |
| Performance | Benchmarks met (if defined) | Configurable |
| Security Scan | Full security scan passes | Yes |

### 7.4 Deviation Handling

```json
{
  "story_id": "E1-F1-S1",
  "suggested_approach": "Use bcrypt with cost 10",
  "actual_approach": "Used argon2 instead",
  "reason": "Project already has argon2 as dependency, maintaining consistency",
  "category": "library_choice|pattern_change|security|architecture",
  "impact": "low|medium|high",
  "requires_review": true,
  "reviewed": false,
  "approved_by": null
}
```

**Auto-require review for:**
- Security-related deviations
- Architecture changes
- High impact deviations

**Deviation impact on confidence:**
- Each unreviewed deviation reduces confidence by 5%
- Too many deviations (>5) blocks completion until reviewed

---

## 8. Learning System

### 8.1 Learning Categories

```json
{
  "success_patterns": [],
  "anti_patterns": [],
  "user_preferences": {},
  "project_knowledge": {},
  "technique_stats": {},
  "deviation_history": [],
  "blocked_stories": []
}
```

### 8.2 Pattern Schema

```json
{
  "id": "sp_bcrypt_001",
  "task_type": "password-hashing",
  "approach": "Use bcrypt.hash with cost 10, async methods only",
  "applicable_when": ["password", "user model", "authentication", "hashing"],
  "code_example": "const hash = await bcrypt.hash(password, 10);",
  "success_count": 12,
  "failure_count": 1,
  "last_used": "2025-01-30T10:00:00Z",
  "confidence": 0.92,
  "tags": ["auth", "security", "bcrypt"]
}
```

### 8.3 Pattern Matching

**Embedding-based similarity matching:**

1. Generate embedding for story description
2. Compare against all pattern embeddings
3. Return patterns with >0.8 cosine similarity
4. Rank by confidence score
5. Inject top match as `suggested_approach`

**Embedding storage:** `.orc/plan/embeddings.json`

```json
{
  "model": "text-embedding-3-small",
  "version": "1.0",
  "patterns": {
    "sp_bcrypt_001": [0.021, -0.034, ...]
  },
  "stories": {
    "E1-F1-S1": [0.033, -0.018, ...]
  }
}
```

### 8.4 Learning Trigger

**After each feature completion:**
1. Learner agent invoked
2. Extracts patterns from completed stories
3. Updates success/failure counts
4. Logs deviations to deviation_history
5. Updates blocked_stories if applicable
6. Regenerates embeddings for new patterns
7. Persists to learnings.json

### 8.5 Pattern Confidence Decay

**Usage-weighted decay formula:**

```
confidence = base_confidence * recency_factor * success_factor

recency_factor = 0.95 ^ months_since_last_use
success_factor = success_count / (success_count + failure_count)
```

**Rules:**
- Patterns below 30% confidence flagged for review/deletion
- Anti-patterns never decay
- Users can pin patterns to prevent decay

---

## 9. Command Interface

### 9.1 Command Overview

Main command: `/orc`

```bash
# Planning
/orc plan <goal>              # Create/append epic to plan
                              # If plan exists: asks "Append or replace?"
/orc show                     # Display plan summary
/orc show <epic-id>           # Display epic details
/orc show deviations          # Show all deviations for review
/orc approve                  # Approve all pending epics
/orc approve <epic-id>        # Approve specific epic

# Execution
/orc run                      # Execute all approved epics (starts immediately)
/orc run <epic-id>            # Execute specific epic
/orc next                     # Execute next priority epic only
/orc stop                     # Stop execution gracefully
/orc resume                   # Resume from last checkpoint
/orc retry <story-id>         # Retry a blocked story

# Learning & Patterns
/orc patterns                 # Show learned patterns
/orc learn                    # Force pattern extraction now

# Utility
/orc status                   # Show current state summary
/orc clear                    # Clear plan and state (with confirmation)
```

### 9.2 Plan Approval Flow

```
User: /orc plan "Build REST API with JWT auth"

System:
📋 Plan Created: Build REST API with JWT auth

Epics (2):
  E1: User Authentication [3 features, 8 stories]
  E2: API Endpoints [4 features, 12 stories]

Total: 7 features, 20 stories

Run /orc show for full details
Run /orc approve to proceed
Run /orc show E1 for epic details
```

### 9.3 Append/Replace Dialog

```
User: /orc plan "Add payment processing"

System:
⚠️  Existing plan detected (2 epics, 20 stories)

[A]ppend as new epic
[R]eplace entire plan
[C]ancel

Choice:
```

### 9.4 Progress Output (Verbose)

```
[E1-F1-S1] Creating User model with password hashing
  ├─ REASON: Analyzing existing models directory...
  ├─ REASON: Loading pattern sp_bcrypt_001
  ├─ ACT: Creating src/models/User.ts
  ├─ ACT: Creating src/models/User.test.ts
  ├─ OBSERVE: Files created successfully
  ├─ OBSERVE: Type checking passed
  ├─ VERIFY: ✓ Tests pass (3/3)
  ├─ VERIFY: ✓ Criteria met (4/4)
  ├─ VERIFY: ✓ No deviations
  └─ COMPLETE ✓ [12.3s]

[E1-F1-S2] Creating registration endpoint
  ├─ REASON: Reading User model for integration...
  ...
```

### 9.5 Failure Output

```
[E1-F1-S3] Creating password reset flow (attempt 2/3)
  ├─ PREVIOUS FAILURE: Missing email service dependency
  ├─ REASON: Adding email service mock for now...
  ├─ DEVIATION: Using mock email service instead of real integration
  │   └─ Reason: Email service not configured in project
  │   └─ Impact: low
  │   └─ Requires review: No
  ├─ ACT: Creating src/services/email.mock.ts
  ...
```

---

## 10. State Management

### 10.1 Runtime Directory Structure

```
project/
└── .orc/
    ├── plan/
    │   ├── state.json           # Current execution state
    │   ├── plan.json            # Master plan metadata
    │   ├── learnings.json       # Accumulated patterns
    │   ├── embeddings.json      # Vector embeddings
    │   ├── deviations.json      # Deviation log
    │   ├── scratchpad.json      # Working memory
    │   │
    │   └── epics/
    │       ├── E1.json          # Epic 1 full definition
    │       ├── E2.json          # Epic 2 full definition
    │       └── ...
    │
    └── checkpoints/
        ├── E1-created.json      # Epic creation checkpoint
        ├── E1-F1-complete.json  # Feature completion checkpoint
        ├── E1-complete.json     # Epic completion checkpoint
        └── ...
```

### 10.2 State Schema

```json
{
  "session_id": "uuid",
  "goal": "Build REST API with JWT auth",
  "phase": "plan|execute|review|learn",
  "current_epic": "E1",
  "current_feature": "E1-F1",
  "current_story": "E1-F1-S2",
  "started_at": "2025-01-30T10:00:00Z",
  "last_activity": "2025-01-30T10:15:00Z",
  "epics_summary": {
    "total": 2,
    "approved": 2,
    "completed": 0,
    "in_progress": 1,
    "blocked": 0
  },
  "stories_summary": {
    "total": 20,
    "completed": 5,
    "in_progress": 1,
    "blocked": 0,
    "pending": 14
  },
  "deviations_pending_review": 0,
  "confidence": 0.95
}
```

### 10.3 Checkpoint Triggers

Checkpoints are created on:
- **Epic creation** - After planner creates new epic
- **Feature completion** - After all stories in feature complete

### 10.4 Interruption Recovery

On `/orc resume`:
1. Load latest checkpoint
2. Identify incomplete stories
3. Resume execution from last incomplete story
4. No re-planning required

---

## 11. Plugin Structure

```
orc/
├── plugin.json                    # Plugin manifest
├── SKILL.md                       # Command routing (/orc)
│
├── agents/
│   ├── core/
│   │   ├── orchestrator.md
│   │   ├── planner.md
│   │   ├── implementer.md
│   │   ├── validator.md
│   │   ├── reviewer.md
│   │   └── learner.md
│   │
│   └── specialists/
│       ├── architect.md
│       ├── product-designer.md
│       ├── devops.md
│       ├── security.md
│       ├── database.md
│       ├── frontend.md
│       ├── backend.md
│       ├── fullstack.md
│       ├── qa.md
│       ├── biz-analyst.md
│       └── content-strategist.md
│
├── commands/
│   ├── plan.md
│   ├── show.md
│   ├── approve.md
│   ├── run.md
│   ├── next.md
│   ├── stop.md
│   ├── resume.md
│   ├── retry.md
│   ├── patterns.md
│   ├── learn.md
│   ├── status.md
│   └── clear.md
│
├── contracts/
│   ├── epic.schema.json
│   ├── feature.schema.json
│   ├── story.schema.json
│   ├── plan.schema.json
│   ├── task-result.schema.json
│   ├── deviation.schema.json
│   ├── pattern.schema.json
│   ├── learnings.schema.json
│   └── _definitions.schema.json
│
├── patterns/
│   ├── auth/
│   │   ├── bcrypt-password.md
│   │   ├── jwt-tokens.md
│   │   └── session-management.md
│   ├── api/
│   │   ├── rest-endpoint.md
│   │   ├── error-handling.md
│   │   └── validation.md
│   ├── database/
│   │   ├── repository-pattern.md
│   │   └── migrations.md
│   └── testing/
│       ├── unit-test-structure.md
│       └── integration-test.md
│
├── hooks/
│   ├── hooks.json
│   └── scripts/
│       ├── validate-story.sh
│       ├── run-tests.sh
│       └── extract-learnings.sh
│
├── tests/
│   ├── agents/
│   ├── contracts/
│   ├── commands/
│   └── integration/
│
└── docs/
    ├── README.md
    ├── COMMANDS.md
    ├── CREATING-SPECIALISTS.md
    ├── PATTERN-LIBRARY.md
    └── ARCHITECTURE.md
```

---

## 12. Technical Specifications

### 12.1 Model Configuration

| Component | Model | Rationale |
|-----------|-------|-----------|
| All Core Agents | Opus | Quality is top priority |
| All Specialists | Opus | Quality is top priority |
| Embedding Generation | text-embedding-3-small | Cost-effective for similarity |

### 12.2 Context Management

**Hierarchical context with sub-agent delegation:**

| Component | Context Budget |
|-----------|---------------|
| System prompt + agent definition | 10% |
| Current plan (summarized) | 15% |
| Active epic/feature details | 20% |
| Current story + patterns | 30% |
| Scratchpad | 10% |
| Response buffer | 15% |

**Key principles:**
- Orchestrator holds summaries only, never full code
- Sub-agents receive fresh context per task
- Structured JSON handoffs keep responses compact
- Scratchpad persists critical context

### 12.3 Error Handling

| Error Type | Handling |
|------------|----------|
| Transient (rate limit, network) | Retry with exponential backoff (3 attempts) |
| Persistent (invalid key, permissions) | Checkpoint and exit with clear message |
| Task failure | Auto-fix loop (3 attempts), then mark blocked |

### 12.4 Execution Limits

**No limits** - System runs until completion.

User can manually stop with `/orc stop`.

---

## 13. Documentation Requirements

The following documentation MUST ship with v1:

| Document | Content |
|----------|---------|
| README.md | Quick start, installation, basic usage |
| COMMANDS.md | Full command reference with examples |
| CREATING-SPECIALISTS.md | Guide for users to create custom specialists |
| PATTERN-LIBRARY.md | How to use and extend the pattern library |
| ARCHITECTURE.md | System architecture overview |

---

## 14. Success Criteria

### 14.1 Quality Metrics

| Metric | Target |
|--------|--------|
| Stories requiring no human fix | >90% |
| Acceptance criteria pass rate | >95% |
| Test coverage of generated code | >80% |
| Security scan pass rate | 100% |

### 14.2 Capability Requirements

- Handle projects with 50+ stories
- Support any programming language/framework
- Parallel execution of independent stories
- Full checkpoint/recovery support
- Pattern learning across sessions

### 14.3 Developer Experience

- Single command to start: `/orc plan <goal>`
- Clear, verbose progress output
- Actionable error messages
- Easy plan modification before approval

---

## Appendix A: Comparison Matrix

| Feature | APL 1.0 | ORC 2.0 |
|---------|---------|---------|
| Command | `/apl` | `/orc` |
| GUI | Required | None |
| Plan Approval | Optional | Mandatory |
| Plan Structure | Task list | Epic→Feature→Story |
| Model | Sonnet | Opus |
| Parallel Execution | Sequential | True parallel |
| Sub-Agents | Fixed 26 | Dynamic spawning |
| Specialist Count | 26 total | 6 core + 11 specialists |
| Pattern Matching | Keywords | Embeddings |
| Deviation Tracking | No | Yes |
| Deviation Review Gates | No | Yes |
| Confidence Scoring | Basic | Advanced with decay |
| Learning Trigger | Session end | Feature completion |
| Blocked Story Tracking | No | Yes |
| Checkpoint Trigger | Phase transition | Feature + Epic |

---

## Appendix B: Example Session

```bash
$ claude

> /orc plan "Build a REST API with user authentication and CRUD endpoints for a blog"

📋 Plan Created: Build a REST API with user authentication and CRUD endpoints

Epics (2):
  E1: User Authentication [3 features, 9 stories]
      ├─ F1: User Registration (3 stories)
      ├─ F2: User Login (3 stories)
      └─ F3: Password Reset (3 stories)

  E2: Blog CRUD API [4 features, 14 stories]
      ├─ F1: Post Management (4 stories)
      ├─ F2: Comment System (4 stories)
      ├─ F3: Category/Tags (3 stories)
      └─ F4: Search & Filtering (3 stories)

Total: 7 features, 23 stories
Estimated patterns matched: 8

Run /orc show for full details
Run /orc approve to proceed

> /orc approve

✓ Plan approved. Ready for execution.

Run /orc run to execute all epics
Run /orc next to execute next epic only

> /orc run

Starting execution of 2 epics...

[E1-F1-S1] Creating User model with password hashing
  ├─ REASON: Loading pattern sp_bcrypt_001 (confidence: 94%)
  ├─ REASON: Analyzing src/models/ directory structure
  ├─ ACT: Creating src/models/User.ts
  ├─ ACT: Creating src/models/User.test.ts
  ├─ OBSERVE: Files created, checking types...
  ├─ VERIFY: ✓ Tests pass (4/4)
  ├─ VERIFY: ✓ Criteria met (4/4)
  └─ COMPLETE ✓ [8.2s]

[E1-F1-S2] Creating registration endpoint
  ├─ REASON: Reading User model for integration
  ...

... (execution continues) ...

[FEATURE COMPLETE] E1-F1: User Registration
  ├─ Stories: 3/3 completed
  ├─ Deviations: 0
  ├─ Checkpoint saved: E1-F1-complete.json
  └─ Learning extraction triggered

... (execution continues) ...

[EPIC COMPLETE] E1: User Authentication
  ├─ Features: 3/3 completed
  ├─ Stories: 9/9 completed
  ├─ Deviations: 1 (reviewed: 0)
  ├─ Checkpoint saved: E1-complete.json
  └─ Starting E2...

... (execution continues) ...

[EXECUTION COMPLETE]
  ├─ Epics: 2/2 completed
  ├─ Features: 7/7 completed
  ├─ Stories: 23/23 completed
  ├─ Deviations: 2 (requires review: 1)
  ├─ Patterns learned: 5 new, 3 updated
  └─ Total time: 4m 32s

Run /orc show deviations to review pending deviations
```

---

*Document Version: 1.0*
*Created: 2025-01-30*
*Status: Requirements Complete - Ready for Implementation*
