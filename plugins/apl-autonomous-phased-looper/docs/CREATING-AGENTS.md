# Creating Custom Agents

This guide explains how to create custom agents for the APL framework. Agents are specialized AI personas that handle specific aspects of the autonomous coding workflow.

## Agent Architecture

Each agent in APL is defined by a markdown file with YAML frontmatter that specifies its configuration:

```markdown
---
name: agent-name
description: What this agent does
tools: Read, Write, Edit, Bash
disallowedTools:
model: sonnet
permissionMode: default
---

# Agent Instructions

Your agent's system prompt goes here...
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier for the agent |
| `description` | Yes | Human-readable description of the agent's purpose |
| `tools` | Yes | Comma-separated list of allowed tools |
| `disallowedTools` | No | Tools explicitly forbidden for this agent |
| `model` | No | Model to use (sonnet, opus, haiku). Defaults to sonnet |
| `permissionMode` | No | How permissions are handled (default, ask, auto) |

## Tool Categories

### Read-Only Tools
Best for analysis/review agents:
- `Read` - Read file contents
- `Glob` - Find files by pattern
- `Grep` - Search file contents

### Write Tools
For implementation agents:
- `Write` - Create new files
- `Edit` - Modify existing files

### Execution Tools
For testing/build agents:
- `Bash` - Execute shell commands

### Orchestration Tools
For coordinator agents:
- `Task` - Delegate to sub-agents
- `TodoWrite` - Manage task lists

## Minimal Agent Template

```markdown
---
name: my-custom-agent
description: Brief description of what this agent does
tools: Read, Glob, Grep
model: sonnet
---

# My Custom Agent

You are a specialized agent for [purpose].

## Input

You receive requests in this format:
\`\`\`json
{
  "field1": "description",
  "field2": "description"
}
\`\`\`

## Process

1. Step one of your workflow
2. Step two of your workflow
3. Step three of your workflow

## Output

Return your results in this format:
\`\`\`json
{
  "status": "success|failure",
  "results": { ... }
}
\`\`\`
```

## Integration with Orchestrator

To wire a new agent into the APL workflow, update the orchestrator to delegate to it:

### 1. Define When to Use the Agent

In the orchestrator's task routing logic, add conditions for your agent:

```markdown
## Task Routing

When the current task involves [condition]:
- Delegate to `my-custom-agent` with appropriate context
- Wait for agent response
- Process results and update state
```

### 2. Define the Contract

Create input/output contracts for your agent (see `contracts/` directory):

**Input Contract** (`contracts/orchestrator-to-myagent.schema.json`):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "OrchestratorToMyAgent",
  "type": "object",
  "required": ["field1"],
  "properties": {
    "field1": {
      "type": "string",
      "description": "What this field means"
    }
  }
}
```

**Output Contract** (`contracts/myagent-output.schema.json`):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MyAgentOutput",
  "type": "object",
  "required": ["status"],
  "properties": {
    "status": {
      "type": "string",
      "enum": ["success", "failure", "needs_input"]
    },
    "results": {
      "type": "object"
    }
  }
}
```

### 3. Add Delegation Logic

In the orchestrator, add the delegation:

```markdown
### My Custom Phase

When [trigger condition]:

1. Prepare input for my-custom-agent:
   \`\`\`json
   {
     "field1": "value from state",
     "context": { ... }
   }
   \`\`\`

2. Delegate: `Task(my-custom-agent, input)`

3. Process response:
   - On success: Update state, proceed to next phase
   - On failure: Log error, attempt recovery or escalate
```

## Agent Design Patterns

### Analyzer Pattern
Read-only agents that inspect code and provide insights:

```markdown
---
name: code-analyzer
tools: Read, Glob, Grep
disallowedTools: Write, Edit, Bash
---

# Code Analyzer

You analyze code without making changes...
```

### Implementer Pattern
Agents that write or modify code:

```markdown
---
name: implementer
tools: Read, Write, Edit, Glob, Grep
disallowedTools: Bash
---

# Implementer

You implement features based on specifications...
```

### Executor Pattern
Agents that run commands and report results:

```markdown
---
name: executor
tools: Read, Glob, Bash
disallowedTools: Write, Edit
---

# Executor

You run commands and analyze their output...
```

### Coordinator Pattern
Agents that orchestrate other agents:

```markdown
---
name: coordinator
tools: Read, Glob, Grep, Task, TodoWrite
---

# Coordinator

You coordinate work across multiple specialized agents...
```

## Best Practices

### 1. Single Responsibility
Each agent should have one clear purpose. If an agent is doing too many things, split it.

### 2. Explicit Contracts
Define clear input/output formats. Use JSON schemas for validation.

### 3. Minimal Tool Access
Only grant tools the agent actually needs. Read-only agents shouldn't have write access.

### 4. Structured Output
Always return structured (JSON) output for machine processing.

### 5. Error Handling
Define how the agent should handle errors and edge cases.

### 6. Idempotency
Where possible, make agent operations idempotent (safe to retry).

## Example: Adding a Security Scanner Agent

See [examples/security-scanner-agent.md](examples/security-scanner-agent.md) for a complete example of adding a custom agent that scans code for security vulnerabilities.

## Testing Your Agent

### Manual Testing
```bash
# Invoke the agent directly
claude --agent my-custom-agent "test input"
```

### Integration Testing
Create test scenarios in your test suite:

```javascript
describe('My Custom Agent', () => {
  it('should handle valid input', async () => {
    const input = { field1: 'test value' };
    const result = await invokeAgent('my-custom-agent', input);
    expect(result.status).toBe('success');
  });

  it('should handle edge cases', async () => {
    const input = { field1: '' };
    const result = await invokeAgent('my-custom-agent', input);
    expect(result.status).toBe('failure');
    expect(result.error).toBeDefined();
  });
});
```

## Troubleshooting

### Agent Not Found
- Verify the agent file is in the `agents/` directory
- Check that the filename matches the `name` field in frontmatter

### Tool Access Denied
- Verify the tool is listed in the `tools` field
- Check it's not in `disallowedTools`

### Unexpected Behavior
- Review the agent's system prompt for ambiguity
- Add more specific instructions or examples
- Consider adding constraints or guardrails

## Next Steps

- Review existing agents in `agents/` for patterns
- Check `contracts/` for input/output specifications
- See `patterns/` for reusable implementation patterns
