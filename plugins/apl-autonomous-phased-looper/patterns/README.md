# APL Pattern Library

This directory contains starter patterns that demonstrate APL's learning system. These patterns are loaded by the orchestrator and applied during planning and execution phases.

## Overview

APL learns from every coding session, extracting:
- **Success Patterns**: Approaches that worked well
- **Anti-Patterns**: Approaches that failed

These patterns are stored in `.apl/learnings.json` and consulted during future sessions.

## Pattern Categories

```
patterns/
├── authentication/     # Auth, security, sessions
│   ├── jwt-auth.json
│   └── bcrypt-password.json
├── api/               # REST, GraphQL, endpoints
│   ├── rest-endpoint.json
│   ├── error-handling.json
│   └── input-validation.json
├── database/          # Data access, ORM
│   └── repository-pattern.json
├── testing/           # Test structure, mocking
│   └── unit-test-structure.json
├── react/             # Frontend components
│   ├── functional-component.json
│   └── form-handling.json
└── content/           # SEO, content strategy, accessibility
    ├── seo-blog-post.json
    ├── structured-data-article.json
    ├── structured-data-faq.json
    ├── brand-voice-templates.json
    ├── accessibility-content.json
    └── ai-citation-optimization.json
```

## Pattern Schema

Each pattern file follows this structure:

```json
{
  "id": "sp_category_name_001",
  "name": "Human-Readable Pattern Name",
  "version": "1.0.0",
  "type": "success_pattern",

  "task_type": "category",
  "applicable_when": [
    "Trigger phrase 1",
    "Trigger phrase 2"
  ],

  "approach": "Description of what to do",
  "rationale": "Why this approach works",

  "code_examples": {
    "basic": "// Basic usage example",
    "advanced": "// More complex example"
  },

  "success_indicators": [
    "How to know it's working"
  ],

  "anti_patterns_avoided": ["ap_related_001"],
  "related_patterns": ["sp_related_001"],

  "tags": ["searchable", "tags"],

  "metadata": {
    "author": "APL Starter Library",
    "created": "2024-01-15",
    "success_count": 0
  }
}
```

## Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier: `sp_` for success, `ap_` for anti-pattern |
| `name` | Yes | Human-readable name |
| `version` | No | Pattern version for updates |
| `type` | Yes | `success_pattern` or `anti_pattern` |
| `task_type` | Yes | Category for matching (e.g., "authentication") |
| `applicable_when` | Yes | Phrases that trigger this pattern |
| `approach` | Yes | What to do (or avoid for anti-patterns) |
| `rationale` | No | Why this works (or fails) |
| `code_examples` | No | Example code snippets |
| `success_indicators` | No | How to verify success |
| `anti_patterns_avoided` | No | Related anti-patterns this prevents |
| `related_patterns` | No | Complementary patterns |
| `tags` | No | Searchable keywords |

## How Patterns Are Used

### During Planning

The planner agent:
1. Analyzes the user's goal
2. Matches against `applicable_when` phrases
3. Suggests patterns in `suggested_approach`
4. Notes anti-patterns to avoid

### During Execution

The coder agent:
1. Checks for suggested approach from planner
2. Follows pattern's `approach` guidance
3. Uses `code_examples` as reference
4. Verifies `success_indicators`

### During Learning

The learner agent:
1. Detects successful approaches
2. Matches to existing patterns (increments `success_count`)
3. Creates new patterns if novel approach
4. Creates anti-patterns from failures

## Adding New Patterns

1. Create a new JSON file in the appropriate category
2. Follow the schema structure above
3. Include at least one code example
4. Add to `.apl/learnings.json` to activate

### Pattern ID Convention

```
sp_category_name_NNN   # Success pattern
ap_category_name_NNN   # Anti-pattern

Examples:
sp_auth_jwt_001        # JWT authentication pattern
ap_security_plaintext_001  # Plain text password anti-pattern
sp_react_hooks_001     # React hooks pattern
```

## Loading Patterns

Patterns from this directory can be imported into a project:

```bash
# Copy starter patterns to project
cp -r patterns/* .apl/patterns/

# Or merge into existing learnings
# (done automatically by learner-agent)
```

## Pattern Matching

The planner uses fuzzy matching on `applicable_when` phrases:

```javascript
// Goal: "Build user authentication with JWT"
// Matches: patterns with applicable_when containing:
//   - "authentication"
//   - "jwt"
//   - "user auth"
```

## Anti-Pattern Structure

Anti-patterns have additional fields:

```json
{
  "id": "ap_security_plaintext_001",
  "type": "anti_pattern",
  "task_type": "authentication",

  "approach": "Storing passwords in plain text",
  "reason": "Security vulnerability - passwords can be read directly",
  "consequences": [
    "Data breach exposes all user credentials",
    "No way to verify without exposing password"
  ],

  "alternative": "sp_auth_bcrypt_001",
  "detection_hints": [
    "password = user.password",
    "storing password directly"
  ]
}
```

## Starter Patterns Included

| Pattern | Type | Description |
|---------|------|-------------|
| `jwt-auth` | Success | JWT with refresh tokens |
| `bcrypt-password` | Success | Secure password hashing |
| `rest-endpoint` | Success | Express router pattern |
| `error-handling` | Success | Express error middleware |
| `input-validation` | Success | Zod schema validation |
| `repository-pattern` | Success | Data access abstraction |
| `unit-test-structure` | Success | Test organization with mocking |
| `functional-component` | Success | React hooks component |
| `form-handling` | Success | React form state management |
| `seo-blog-post` | Success | SEO-optimized blog post structure |
| `structured-data-article` | Success | JSON-LD Article schema |
| `structured-data-faq` | Success | JSON-LD FAQ schema for featured snippets |
| `brand-voice-templates` | Success | Consistent brand voice patterns |
| `accessibility-content` | Success | WCAG-compliant content patterns |
| `ai-citation-optimization` | Success | Content optimized for AI search engines |

## Best Practices

1. **Be specific**: Narrow `applicable_when` to avoid false matches
2. **Include examples**: Code examples significantly improve adoption
3. **Link related patterns**: Help discovery through relationships
4. **Document rationale**: Explain why, not just what
5. **Keep patterns focused**: One pattern per file, single responsibility
