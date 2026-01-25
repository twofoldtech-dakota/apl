# APL Customization Guide

This guide covers all aspects of customizing the APL framework for your specific needs, from configuration options to architectural modifications.

## Table of Contents

1. [Configuration Deep-Dive](#configuration-deep-dive)
2. [Phase Flow Modification](#phase-flow-modification)
3. [Agent Customization](#agent-customization)
4. [Learning System Tuning](#learning-system-tuning)
5. [Integration Patterns](#integration-patterns)
6. [Performance Optimization](#performance-optimization)

## Configuration Deep-Dive

### Configuration File Location

APL configuration is stored in `.apl/config.json` in your project root.

### Complete Configuration Schema

```json
{
  "$schema": "./config.schema.json",
  "version": "1.0.0",

  "execution": {
    "max_iterations": 20,
    "max_retries_per_task": 3,
    "parallel_execution": true,
    "checkpoint_frequency": "per_task",
    "timeout_minutes": 60
  },

  "phases": {
    "plan": {
      "enabled": true,
      "tree_of_thoughts": true,
      "max_tasks": 15,
      "require_approval": false
    },
    "execute": {
      "enabled": true,
      "react_pattern": true,
      "chain_of_verification": true,
      "auto_fix_on_failure": true
    },
    "review": {
      "enabled": true,
      "reflexion_enabled": true,
      "quality_threshold": 0.8,
      "require_approval": false
    },
    "learn": {
      "enabled": true,
      "auto_extract_patterns": true,
      "min_success_for_pattern": 3
    }
  },

  "agents": {
    "planner": {
      "model": "sonnet",
      "temperature": 0.3,
      "custom_instructions": ""
    },
    "coder": {
      "model": "sonnet",
      "temperature": 0.2,
      "custom_instructions": "",
      "preferred_patterns": []
    },
    "tester": {
      "model": "sonnet",
      "coverage_threshold": 80,
      "custom_test_command": null
    },
    "reviewer": {
      "model": "sonnet",
      "strictness": "medium"
    },
    "learner": {
      "model": "haiku",
      "extraction_threshold": 0.7
    }
  },

  "verification": {
    "run_tests_after_each_task": true,
    "run_linter": true,
    "run_type_check": true,
    "custom_checks": []
  },

  "recovery": {
    "auto_rollback_on_failure": true,
    "checkpoint_retention": 5,
    "escalate_after_retries": 3
  },

  "output": {
    "verbose": false,
    "show_agent_thoughts": false,
    "log_to_file": true,
    "log_file": ".apl/execution.log"
  },

  "integrations": {
    "git": {
      "auto_commit": false,
      "commit_per_task": false,
      "branch_per_goal": false
    },
    "ci": {
      "run_on_complete": false,
      "ci_command": null
    }
  }
}
```

### Configuration by Use Case

#### Fast Iteration Mode
For rapid prototyping where quality gates are relaxed:

```json
{
  "execution": {
    "max_iterations": 10,
    "max_retries_per_task": 1
  },
  "phases": {
    "review": {
      "enabled": false
    },
    "learn": {
      "enabled": false
    }
  },
  "verification": {
    "run_tests_after_each_task": false,
    "run_linter": false
  }
}
```

#### High Quality Mode
For production-critical code with strict validation:

```json
{
  "execution": {
    "max_retries_per_task": 5
  },
  "phases": {
    "plan": {
      "require_approval": true
    },
    "review": {
      "quality_threshold": 0.95,
      "require_approval": true
    }
  },
  "verification": {
    "run_tests_after_each_task": true,
    "run_linter": true,
    "run_type_check": true,
    "custom_checks": [
      {
        "name": "security_scan",
        "command": "npm run security:scan",
        "fail_on_error": true
      }
    ]
  },
  "agents": {
    "reviewer": {
      "strictness": "high"
    }
  }
}
```

#### Autonomous Mode
For fully autonomous operation without human intervention:

```json
{
  "execution": {
    "max_iterations": 50,
    "timeout_minutes": 120
  },
  "phases": {
    "plan": {
      "require_approval": false
    },
    "review": {
      "require_approval": false
    }
  },
  "recovery": {
    "auto_rollback_on_failure": true,
    "escalate_after_retries": 5
  },
  "integrations": {
    "git": {
      "auto_commit": true,
      "commit_per_task": true
    }
  }
}
```

## Phase Flow Modification

### Default Phase Flow

```
PLAN → EXECUTE → REVIEW → LEARN
         ↑          |
         |          v
         +-- (retry on issues)
```

### Customizing Phase Order

In the orchestrator, modify the phase transitions:

```markdown
## Phase Transitions

AFTER PLAN:
- Default: → EXECUTE
- If plan.require_approval: → AWAIT_APPROVAL → EXECUTE
- If plan has questions: → CLARIFY → PLAN

AFTER EXECUTE (per task):
- Default: → VERIFY → next task
- If verification fails: → RETRY (up to max_retries) → ESCALATE
- If security scan enabled: → SCAN → VERIFY

AFTER ALL TASKS:
- Default: → REVIEW
- If review disabled: → LEARN (if enabled) → COMPLETE

AFTER REVIEW:
- If quality < threshold: → EXECUTE (fix issues)
- If quality >= threshold: → LEARN → COMPLETE
```

### Adding Custom Phases

Example: Adding a "Security Scan" phase:

1. Define the phase in config:
```json
{
  "phases": {
    "security_scan": {
      "enabled": true,
      "after": "execute",
      "before": "review",
      "agent": "security-scanner-agent",
      "block_on_critical": true
    }
  }
}
```

2. Update orchestrator to recognize the phase:
```markdown
## Security Scan Phase

When security_scan.enabled and all tasks complete:

1. Invoke security-scanner-agent with:
   - files_modified from execution
   - project context

2. Process results:
   - If critical findings and block_on_critical:
     Create fix tasks, return to EXECUTE
   - Else:
     Log findings, continue to REVIEW
```

### Skipping Phases

Phases can be disabled via configuration:

```json
{
  "phases": {
    "plan": { "enabled": true },
    "execute": { "enabled": true },
    "review": { "enabled": false },
    "learn": { "enabled": false }
  }
}
```

## Agent Customization

### Custom Agent Instructions

Add agent-specific instructions via config:

```json
{
  "agents": {
    "coder": {
      "custom_instructions": "Always use functional programming patterns. Prefer immutable data structures. Add JSDoc comments to all functions."
    },
    "reviewer": {
      "custom_instructions": "Pay special attention to error handling. Flag any missing error boundaries in React components."
    }
  }
}
```

### Model Selection by Phase

Different models for different needs:

```json
{
  "agents": {
    "planner": {
      "model": "opus",
      "comment": "Use best model for architectural decisions"
    },
    "coder": {
      "model": "sonnet",
      "comment": "Good balance for implementation"
    },
    "tester": {
      "model": "sonnet"
    },
    "reviewer": {
      "model": "opus",
      "comment": "Thorough review needs strong reasoning"
    },
    "learner": {
      "model": "haiku",
      "comment": "Pattern extraction is straightforward"
    }
  }
}
```

### Temperature Tuning

```json
{
  "agents": {
    "planner": {
      "temperature": 0.5,
      "comment": "Slightly creative for planning alternatives"
    },
    "coder": {
      "temperature": 0.1,
      "comment": "Deterministic for consistent code"
    },
    "reviewer": {
      "temperature": 0.2,
      "comment": "Low creativity, high consistency"
    }
  }
}
```

## Learning System Tuning

### Pattern Extraction Configuration

```json
{
  "learning": {
    "enabled": true,
    "min_success_for_pattern": 3,
    "min_failure_for_anti_pattern": 2,
    "pattern_decay_days": 90,
    "max_patterns_per_category": 20,
    "similarity_threshold": 0.8
  }
}
```

### Pattern Priority

Configure how patterns are weighted:

```json
{
  "learning": {
    "pattern_weights": {
      "success_count": 1.0,
      "recency": 0.5,
      "user_preference": 2.0,
      "project_specific": 1.5
    }
  }
}
```

### Excluding Patterns

Prevent certain patterns from being learned:

```json
{
  "learning": {
    "excluded_patterns": [
      "console.log debugging",
      "any pattern containing TODO"
    ],
    "excluded_categories": [
      "workarounds"
    ]
  }
}
```

### Manual Pattern Management

```bash
# View learned patterns
/apl patterns list

# Remove specific pattern
/apl forget sp_auth_jwt_001

# Reset all patterns
/apl forget --all

# Export patterns
/apl patterns export > patterns.json

# Import patterns
/apl patterns import < patterns.json
```

## Integration Patterns

### Git Integration

```json
{
  "integrations": {
    "git": {
      "enabled": true,
      "auto_commit": true,
      "commit_per_task": true,
      "commit_message_template": "[APL] {{task_description}}",
      "branch_per_goal": true,
      "branch_name_template": "apl/{{goal_slug}}-{{timestamp}}"
    }
  }
}
```

### CI/CD Integration

```json
{
  "integrations": {
    "ci": {
      "enabled": true,
      "run_on_complete": true,
      "ci_command": "npm run ci:full",
      "block_on_ci_failure": true,
      "notify_on_failure": true
    }
  }
}
```

### External Tool Integration

```json
{
  "integrations": {
    "external_tools": {
      "linter": {
        "command": "npm run lint",
        "run_on": ["post-task"],
        "auto_fix": true,
        "auto_fix_command": "npm run lint:fix"
      },
      "formatter": {
        "command": "npm run format",
        "run_on": ["pre-commit"]
      },
      "type_check": {
        "command": "npm run typecheck",
        "run_on": ["post-task"],
        "fail_on_error": true
      }
    }
  }
}
```

### Notification Integration

```json
{
  "integrations": {
    "notifications": {
      "enabled": true,
      "channels": {
        "slack": {
          "webhook_url": "${SLACK_WEBHOOK}",
          "on_events": ["complete", "error", "escalation"]
        },
        "email": {
          "smtp_config": "${SMTP_CONFIG}",
          "recipients": ["team@company.com"],
          "on_events": ["complete"]
        }
      }
    }
  }
}
```

## Performance Optimization

### Parallel Execution

```json
{
  "execution": {
    "parallel_execution": true,
    "max_parallel_tasks": 3,
    "parallel_strategy": "dependency_based"
  }
}
```

### Checkpoint Management

```json
{
  "recovery": {
    "checkpoint_frequency": "per_task",
    "checkpoint_retention": 5,
    "checkpoint_location": ".apl/checkpoints",
    "compress_checkpoints": true
  }
}
```

### Caching

```json
{
  "performance": {
    "cache_enabled": true,
    "cache_pattern_lookups": true,
    "cache_file_reads": true,
    "cache_ttl_minutes": 30
  }
}
```

### Resource Limits

```json
{
  "limits": {
    "max_files_per_task": 10,
    "max_file_size_kb": 500,
    "max_context_tokens": 100000,
    "max_output_tokens": 4000
  }
}
```

## Environment-Specific Configuration

### Development vs Production

Create environment-specific configs:

```
.apl/
├── config.json           # Base config
├── config.dev.json       # Development overrides
├── config.prod.json      # Production overrides
└── config.ci.json        # CI overrides
```

Select config with environment variable:
```bash
APL_ENV=prod /apl "Deploy authentication system"
```

### Configuration Merging

Configs are merged in order:
1. Default config (built-in)
2. Project config (`.apl/config.json`)
3. Environment config (`.apl/config.{env}.json`)
4. CLI overrides (`--config-override`)

## Validation

### Config Validation

APL validates config on startup:

```bash
# Validate config manually
/apl config validate

# Output:
# ✓ Config file exists
# ✓ Schema valid
# ✓ All agent references valid
# ✓ All hook scripts exist
# ⚠ Warning: high max_iterations (50) may lead to long sessions
```

### Schema Reference

Full config schema available at:
```
templates/apl-config.schema.json
```

## Troubleshooting

### Config Not Loading
- Check file path: `.apl/config.json`
- Validate JSON syntax: `jq . .apl/config.json`
- Check file permissions

### Settings Not Applied
- Check environment config override
- Verify config key spelling
- Check for CLI overrides

### Performance Issues
- Reduce `max_iterations`
- Disable unused phases
- Enable parallel execution
- Increase checkpoint frequency

## Next Steps

- Start with default config
- Tune based on project needs
- Monitor execution logs
- Iterate on patterns and preferences
