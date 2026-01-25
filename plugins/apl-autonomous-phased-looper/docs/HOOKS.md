# APL Hook System

This guide explains the APL hook system, which allows you to extend and customize agent behavior at key points in the workflow.

## Overview

Hooks are scripts that execute at specific points in the APL lifecycle. They enable:
- Custom validation before/after phases
- External integrations (CI/CD, notifications)
- Logging and auditing
- Custom quality gates

## Hook Types

| Hook | Trigger Point | Use Case |
|------|---------------|----------|
| `pre-plan` | Before planning phase | Validate goal, check prerequisites |
| `post-plan` | After plan created | Review plan, send for approval |
| `pre-task` | Before each task | Check dependencies, acquire resources |
| `post-task` | After each task | Validate output, update tracking |
| `pre-test` | Before running tests | Setup test environment |
| `post-test` | After tests complete | Process results, coverage gates |
| `pre-review` | Before review phase | Gather metrics |
| `post-review` | After review complete | Quality gates |
| `on-error` | When error occurs | Custom error handling, notifications |
| `on-complete` | When goal achieved | Cleanup, notifications, deployment |

## Hook Configuration

Hooks are defined in `hooks/hooks.json`:

```json
{
  "hooks": {
    "pre-plan": {
      "enabled": true,
      "script": "./hooks/pre-plan.sh",
      "timeout_seconds": 30,
      "fail_on_error": true
    },
    "post-task": {
      "enabled": true,
      "script": "./hooks/post-task.sh",
      "timeout_seconds": 60,
      "fail_on_error": false,
      "pass_context": true
    },
    "on-complete": {
      "enabled": true,
      "script": "./hooks/on-complete.sh",
      "timeout_seconds": 120,
      "environment": {
        "NOTIFY_WEBHOOK": "${SLACK_WEBHOOK_URL}"
      }
    }
  },
  "global_settings": {
    "hooks_directory": "./hooks",
    "default_timeout_seconds": 60,
    "log_output": true,
    "fail_workflow_on_hook_error": false
  }
}
```

## Hook Input/Output

### Input Format

Hooks receive context as JSON via stdin:

```json
{
  "hook_type": "post-task",
  "timestamp": "2024-01-22T10:30:00Z",
  "session_id": "apl_session_12345",

  "state": {
    "goal": "Build REST API with authentication",
    "phase": "execute",
    "iteration": 3,
    "confidence": "high"
  },

  "context": {
    "task_id": 2,
    "task_description": "Implement user model",
    "task_status": "completed",
    "files_modified": ["src/models/User.ts"],
    "duration_seconds": 45
  },

  "project": {
    "root": "/path/to/project",
    "language": "typescript",
    "framework": "express"
  }
}
```

### Output Format

Hooks return status as JSON via stdout:

```json
{
  "status": "success",
  "message": "Task validated successfully",
  "data": {
    "custom_metric": 42
  },
  "warnings": [],
  "block_workflow": false
}
```

### Status Values

| Status | Effect |
|--------|--------|
| `success` | Continue workflow normally |
| `warning` | Log warning, continue workflow |
| `error` | Log error, check `fail_on_error` setting |
| `block` | Stop workflow, require intervention |

## Creating Custom Hooks

### Bash Hook Example

`hooks/post-task.sh`:
```bash
#!/bin/bash

# Read input from stdin
INPUT=$(cat)

# Parse with jq
TASK_ID=$(echo "$INPUT" | jq -r '.context.task_id')
TASK_STATUS=$(echo "$INPUT" | jq -r '.context.task_status')
FILES=$(echo "$INPUT" | jq -r '.context.files_modified[]')

# Custom validation
if [[ "$TASK_STATUS" == "completed" ]]; then
    # Check file sizes
    for file in $FILES; do
        SIZE=$(wc -c < "$file")
        if [[ $SIZE -gt 10000 ]]; then
            echo '{"status": "warning", "message": "Large file detected: '$file'"}'
            exit 0
        fi
    done
fi

# Success response
echo '{"status": "success", "message": "Task validated"}'
```

### Node.js Hook Example

`hooks/on-complete.js`:
```javascript
#!/usr/bin/env node

const https = require('https');

// Read stdin
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
    const data = JSON.parse(input);

    // Send Slack notification
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (webhook) {
        const message = {
            text: `APL Complete: ${data.state.goal}`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Goal Achieved*\n${data.state.goal}`
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `Session: ${data.session_id} | Iterations: ${data.state.iteration}`
                        }
                    ]
                }
            ]
        };

        // Send webhook (simplified)
        try {
            await sendWebhook(webhook, message);
            console.log(JSON.stringify({
                status: 'success',
                message: 'Notification sent'
            }));
        } catch (err) {
            console.log(JSON.stringify({
                status: 'error',
                message: `Webhook failed: ${err.message}`
            }));
        }
    } else {
        console.log(JSON.stringify({
            status: 'success',
            message: 'No webhook configured'
        }));
    }
});

function sendWebhook(url, payload) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 200) resolve();
            else reject(new Error(`Status ${res.statusCode}`));
        });

        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
    });
}
```

### Python Hook Example

`hooks/pre-plan.py`:
```python
#!/usr/bin/env python3

import sys
import json
import subprocess

def main():
    # Read input
    input_data = json.load(sys.stdin)
    goal = input_data.get('state', {}).get('goal', '')
    project_root = input_data.get('project', {}).get('root', '.')

    warnings = []

    # Check for uncommitted changes
    result = subprocess.run(
        ['git', 'status', '--porcelain'],
        cwd=project_root,
        capture_output=True,
        text=True
    )

    if result.stdout.strip():
        warnings.append('Uncommitted changes detected')

    # Check for required tools
    required_tools = ['node', 'npm']
    for tool in required_tools:
        result = subprocess.run(['which', tool], capture_output=True)
        if result.returncode != 0:
            print(json.dumps({
                'status': 'error',
                'message': f'Required tool not found: {tool}',
                'block_workflow': True
            }))
            return

    # Output result
    print(json.dumps({
        'status': 'success' if not warnings else 'warning',
        'message': 'Pre-plan checks complete',
        'warnings': warnings
    }))

if __name__ == '__main__':
    main()
```

## Hook Patterns

### Quality Gate Pattern

Block workflow if quality thresholds aren't met:

```bash
#!/bin/bash
# hooks/post-test.sh - Coverage gate

INPUT=$(cat)
COVERAGE=$(echo "$INPUT" | jq -r '.context.coverage.lines')

if (( $(echo "$COVERAGE < 80" | bc -l) )); then
    echo '{"status": "block", "message": "Coverage below 80%: '$COVERAGE'%", "block_workflow": true}'
    exit 0
fi

echo '{"status": "success", "message": "Coverage gate passed: '$COVERAGE'%"}'
```

### External Integration Pattern

Sync with external systems:

```javascript
#!/usr/bin/env node
// hooks/post-task.js - Update Jira

const input = require('fs').readFileSync(0, 'utf-8');
const data = JSON.parse(input);

if (data.context.task_status === 'completed') {
    // Update Jira ticket
    const jiraTicket = data.context.task_description.match(/\b[A-Z]+-\d+\b/)?.[0];
    if (jiraTicket) {
        // Call Jira API to update status
        updateJiraTicket(jiraTicket, 'In Review');
    }
}

console.log(JSON.stringify({ status: 'success' }));
```

### Audit Logging Pattern

Log all activities for compliance:

```python
#!/usr/bin/env python3
# hooks/all-events.py - Audit logger

import json
import sys
from datetime import datetime

input_data = json.load(sys.stdin)

audit_entry = {
    'timestamp': datetime.utcnow().isoformat(),
    'hook_type': input_data.get('hook_type'),
    'session_id': input_data.get('session_id'),
    'phase': input_data.get('state', {}).get('phase'),
    'goal': input_data.get('state', {}).get('goal'),
    'files_modified': input_data.get('context', {}).get('files_modified', [])
}

# Append to audit log
with open('.apl/audit.log', 'a') as f:
    f.write(json.dumps(audit_entry) + '\n')

print(json.dumps({'status': 'success', 'message': 'Audit logged'}))
```

### Notification Pattern

Send notifications on key events:

```bash
#!/bin/bash
# hooks/on-error.sh - Error notification

INPUT=$(cat)
ERROR_MSG=$(echo "$INPUT" | jq -r '.context.error_message')
GOAL=$(echo "$INPUT" | jq -r '.state.goal')

# Send to PagerDuty, Slack, etc.
curl -X POST "$PAGERDUTY_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{
        \"routing_key\": \"$PAGERDUTY_KEY\",
        \"event_action\": \"trigger\",
        \"payload\": {
            \"summary\": \"APL Error: $ERROR_MSG\",
            \"source\": \"apl-workflow\",
            \"severity\": \"error\",
            \"custom_details\": {
                \"goal\": \"$GOAL\"
            }
        }
    }"

echo '{"status": "success", "message": "Error notification sent"}'
```

## Hook Debugging

### Enable Verbose Logging

In `hooks/hooks.json`:
```json
{
  "global_settings": {
    "log_output": true,
    "log_level": "debug"
  }
}
```

### Test Hooks Manually

```bash
# Create test input
cat > /tmp/test-input.json << EOF
{
  "hook_type": "post-task",
  "session_id": "test_123",
  "state": {"goal": "Test goal", "phase": "execute"},
  "context": {"task_id": 1, "task_status": "completed"}
}
EOF

# Run hook
cat /tmp/test-input.json | ./hooks/post-task.sh
```

### Check Hook Output

```bash
# View hook execution logs
cat .apl/hooks.log

# View last hook output
jq '.' .apl/last-hook-output.json
```

## Best Practices

1. **Keep hooks fast**: Long-running hooks slow down the workflow
2. **Handle errors gracefully**: Always output valid JSON
3. **Use timeouts**: Prevent hanging hooks from blocking forever
4. **Log appropriately**: Don't flood logs, but capture important events
5. **Make hooks idempotent**: Safe to re-run on retry
6. **Use environment variables**: Don't hardcode secrets
7. **Test in isolation**: Verify hooks work before integrating

## Troubleshooting

### Hook Not Executing
- Check `enabled: true` in hooks.json
- Verify script is executable (`chmod +x`)
- Check script path is correct

### Hook Timing Out
- Increase `timeout_seconds`
- Optimize hook performance
- Consider async processing

### Invalid Output
- Ensure JSON output on stdout
- Check for stderr pollution
- Validate JSON structure

### Environment Variables Missing
- Check `environment` in hook config
- Verify variables are exported
- Check shell initialization

## Next Steps

- Review existing hooks in `hooks/` directory
- Copy a template hook as starting point
- Test with manual input before integrating
- Monitor hook logs after deployment
