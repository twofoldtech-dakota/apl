# APL Agent Contracts

This directory contains JSON Schema definitions for all agent-to-agent communication in APL. These contracts make the implicit handoff formats explicit, enabling validation, documentation, and framework extension.

## Overview

APL uses a multi-agent architecture where specialized agents communicate through structured JSON messages. Each schema in this directory defines either:

- **Input contracts** (`orchestrator-to-*.schema.json`): What an agent receives
- **Output contracts** (`*-output.schema.json`): What an agent returns

## Contract Flow

```
                    ┌─────────────────────────────────────────┐
                    │      Unified APL Orchestrator           │
                    │   (Auto-detects direct/structured mode) │
                    └─────────────────────────────────────────┘
                           │              │              │
            ┌──────────────┼──────────────┼──────────────┼──────────────┐
            │              │              │              │              │
            ▼              ▼              ▼              ▼              ▼
       ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
       │ Planner │   │  Coder  │   │ Tester  │   │Reviewer │   │ Learner │
       └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │Requirements│ │ Horizontal│  │ Deployer  │
     │  Analyst  │  │Coordinator│  │ (Vercel)  │
     └───────────┘  └───────────┘  └───────────┘
                           │
         ┌─────────┬───────┼───────┬─────────┐
         ▼         ▼       ▼       ▼         ▼
    ┌─────────┐┌───────┐┌──────┐┌───────┐┌────────┐
    │ Content ││ Brand ││Design││Access-││Designer│
    │Strategy ││ Voice ││      ││ibility││(Pencil)│
    └─────────┘└───────┘└──────┘└───────┘└────────┘

Each arrow represents a contract-defined handoff.
```

## Contracts Reference

### Planning Phase

| Contract | From | To | Purpose |
|----------|------|-----|---------|
| `orchestrator-to-planner.schema.json` | Orchestrator | Planner | Goal decomposition request |
| `planner-output.schema.json` | Planner | Orchestrator | Task breakdown with dependencies |

### Execution Phase

| Contract | From | To | Purpose |
|----------|------|-----|---------|
| `orchestrator-to-coder.schema.json` | Orchestrator | Coder | Task implementation request |
| `coder-output.schema.json` | Coder | Orchestrator | Implementation results |
| `orchestrator-to-tester.schema.json` | Orchestrator | Tester | Test execution request |
| `tester-output.schema.json` | Tester | Orchestrator | Test results and analysis |

### Review Phase

| Contract | From | To | Purpose |
|----------|------|-----|---------|
| `orchestrator-to-reviewer.schema.json` | Orchestrator | Reviewer | Review request with all context |
| `reviewer-output.schema.json` | Reviewer | Orchestrator | Review verdict and issues |

### Learning Phase

| Contract | From | To | Purpose |
|----------|------|-----|---------|
| `orchestrator-to-learner.schema.json` | Orchestrator | Learner | Session data for learning |
| `learner-output.schema.json` | Learner | Orchestrator | Extracted learnings summary |

### Horizontal Capabilities

These agents provide specialized capabilities across all project types:

| Contract | From | To | Purpose |
|----------|------|-----|---------|
| `orchestrator-to-horizontal.schema.json` | Orchestrator | Horizontal Agents | Content, design, accessibility requests |
| `horizontal-output.schema.json` | Horizontal Agents | Orchestrator | Evaluation results and fixes |
| `orchestrator-to-designer.schema.json` | Orchestrator | Designer | UI design request (Pencil.dev MCP) |
| `designer-output.schema.json` | Designer | Orchestrator | Design tokens and component specs |
| `orchestrator-to-deployer.schema.json` | Orchestrator | Deployer | Deployment request (Vercel MCP) |
| `deployer-output.schema.json` | Deployer | Orchestrator | Deployment status and URLs |

## Schema Version

All schemas use JSON Schema draft 2020-12:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema"
}
```

## Using These Contracts

### For Framework Adopters

1. **Understand the data flow**: Read the schemas to understand what each agent expects and returns
2. **Validate your extensions**: Use these schemas to validate custom agent implementations
3. **Create new agents**: Follow these patterns when adding agents to the system

### For Validation

```javascript
import Ajv from 'ajv/dist/2020';
import plannerInputSchema from './orchestrator-to-planner.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(plannerInputSchema);

const input = { goal: "Build REST API", learned_patterns: [] };
if (!validate(input)) {
  console.error(validate.errors);
}
```

### For Documentation

These schemas serve as living documentation. The `description` fields explain the purpose of each property.

## Shared Definitions

Common types are defined in `$defs` within each schema. Key shared concepts:

### Task Definition
```json
{
  "id": 1,
  "description": "What to implement",
  "success_criteria": ["Criterion 1", "Criterion 2"],
  "complexity": "simple|medium|complex",
  "dependencies": [0],
  "suggested_approach": "Pattern-based suggestion or null",
  "estimated_files": ["path/to/file.ts"]
}
```

### Success Pattern
```json
{
  "id": "sp_auth_jwt_001",
  "task_type": "authentication",
  "approach": "Description of what works",
  "success_count": 5,
  "last_used": "2024-01-15T10:30:00Z"
}
```

### Anti-Pattern
```json
{
  "id": "ap_security_plaintext_001",
  "task_type": "authentication",
  "approach": "What to avoid",
  "reason": "Why it fails",
  "alternative": "What to do instead"
}
```

## Versioning

Contracts follow semantic versioning:

- **Major**: Breaking changes to required fields
- **Minor**: New optional fields added
- **Patch**: Documentation or description updates

Current version: `1.0.0`

## Extending Contracts

When creating a new agent:

1. Define input schema: `orchestrator-to-{agent}.schema.json`
2. Define output schema: `{agent}-output.schema.json`
3. Reference shared `$defs` for common types
4. Add to the orchestrator's delegation logic
