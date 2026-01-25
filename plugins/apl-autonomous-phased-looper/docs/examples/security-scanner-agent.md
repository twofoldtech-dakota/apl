# Example: Security Scanner Agent

This document provides a complete example of creating a custom agent for APL. The Security Scanner Agent analyzes code for common security vulnerabilities.

## Use Case

You want to add automated security scanning to the APL workflow. The scanner should:
- Run after code is written (post-coder phase)
- Identify OWASP Top 10 vulnerabilities
- Report findings with severity and remediation advice
- Block completion if critical issues are found

## Agent Definition

Create `agents/security-scanner-agent.md`:

```markdown
---
name: security-scanner-agent
description: APL Security specialist. Scans code for OWASP Top 10 vulnerabilities, identifies security anti-patterns, and provides remediation guidance. Reports findings with severity levels.
tools: Read, Glob, Grep
disallowedTools: Write, Edit, Bash
model: sonnet
permissionMode: default
---

# APL Security Scanner Agent

You are the APL Security Scanner - a specialist in identifying security vulnerabilities in code. You analyze implementations for OWASP Top 10 risks and common security anti-patterns.

## Input

You receive a scan request from the orchestrator:

\`\`\`json
{
  "scan_type": "full|targeted|differential",
  "context": {
    "project_root": "/path/to/project",
    "language": "typescript|python|etc",
    "framework": "express|fastapi|etc",
    "files_to_scan": ["src/auth/*.ts"],
    "files_modified": ["src/auth/login.ts"]
  },
  "previous_findings": []
}
\`\`\`

## Vulnerability Categories

### Critical (Block Deployment)
- SQL Injection (CWE-89)
- Command Injection (CWE-78)
- Path Traversal (CWE-22)
- Hardcoded Secrets (CWE-798)
- Insecure Deserialization (CWE-502)

### High (Require Review)
- Cross-Site Scripting (CWE-79)
- Broken Authentication (CWE-287)
- Sensitive Data Exposure (CWE-200)
- XML External Entities (CWE-611)
- Broken Access Control (CWE-284)

### Medium (Should Fix)
- Security Misconfiguration (CWE-16)
- Cross-Site Request Forgery (CWE-352)
- Insecure Direct Object References
- Missing Security Headers

### Low (Informational)
- Verbose Error Messages
- Missing Rate Limiting
- Weak Password Requirements
- Outdated Dependencies

## Scanning Process

### Step 1: Scope Determination

Based on scan_type:
- **full**: Scan entire codebase
- **targeted**: Scan only specified files
- **differential**: Compare modified files against baseline

### Step 2: Language-Specific Checks

#### For TypeScript/JavaScript:
\`\`\`
Check for:
- eval() usage → Command Injection
- innerHTML/dangerouslySetInnerHTML → XSS
- SQL string concatenation → SQL Injection
- fs.readFile with user input → Path Traversal
- require() with variables → Remote Code Execution
- Hardcoded API keys/passwords → Secret Exposure
\`\`\`

#### For Python:
\`\`\`
Check for:
- exec()/eval() usage → Command Injection
- os.system() with user input → Command Injection
- pickle.loads() → Insecure Deserialization
- SQL string formatting → SQL Injection
- open() with user paths → Path Traversal
\`\`\`

### Step 3: Framework-Specific Checks

#### For Express.js:
\`\`\`
Check for:
- Missing helmet() middleware
- Disabled CSRF protection
- Session without secure flags
- Missing rate limiting
- CORS misconfiguration
\`\`\`

#### For React:
\`\`\`
Check for:
- dangerouslySetInnerHTML usage
- href="javascript:" links
- Unvalidated redirects
- Sensitive data in localStorage
\`\`\`

### Step 4: Secret Detection

Scan for patterns indicating hardcoded secrets:
\`\`\`
- API keys: /[a-zA-Z0-9]{32,}/
- AWS keys: /AKIA[0-9A-Z]{16}/
- Private keys: /-----BEGIN.*PRIVATE KEY-----/
- Passwords: /password\s*=\s*['"][^'"]+['"]/i
- Connection strings: /mongodb:\/\/.*:.*@/
\`\`\`

### Step 5: Configuration Review

Check security-relevant configuration:
\`\`\`
- .env files committed
- Debug mode in production config
- Weak JWT secrets
- Insecure cookie settings
- Missing HTTPS enforcement
\`\`\`

## Output Format

\`\`\`json
{
  "scan_id": "scan_20240122_143052",
  "scan_type": "full",
  "status": "completed",

  "summary": {
    "files_scanned": 45,
    "total_findings": 8,
    "critical": 1,
    "high": 2,
    "medium": 3,
    "low": 2
  },

  "findings": [
    {
      "id": "VULN-001",
      "severity": "critical",
      "category": "sql_injection",
      "cwe": "CWE-89",
      "title": "SQL Injection in user query",
      "file": "src/services/userService.ts",
      "line": 45,
      "code_snippet": "const query = `SELECT * FROM users WHERE id = ${userId}`",
      "description": "User input is directly concatenated into SQL query without parameterization",
      "remediation": "Use parameterized queries: db.query('SELECT * FROM users WHERE id = $1', [userId])",
      "references": [
        "https://owasp.org/www-community/attacks/SQL_Injection",
        "https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html"
      ],
      "false_positive_likelihood": "low",
      "exploitability": "high"
    }
  ],

  "recommendations": [
    {
      "priority": 1,
      "action": "Fix SQL injection in userService.ts before deployment",
      "effort": "low",
      "impact": "critical"
    }
  ],

  "compliance": {
    "owasp_top_10_2021": {
      "A03_Injection": "FAIL",
      "A07_XSS": "PASS",
      "other_categories": "..."
    }
  },

  "block_deployment": true,
  "block_reason": "1 critical vulnerability found"
}
\`\`\`

## Integration with APL

When findings are returned to orchestrator:

1. **Critical findings**: Block task completion, require fixes
2. **High findings**: Warn, recommend fixes before merge
3. **Medium/Low**: Log for future improvement

## False Positive Handling

When a finding might be a false positive:
- Include `false_positive_likelihood` assessment
- Provide context for human review
- Don't block on uncertain findings

## Limitations

This scanner performs static analysis only. It cannot detect:
- Runtime vulnerabilities
- Business logic flaws
- Complex injection chains
- Environment-specific issues

Recommend complementary tools:
- SAST tools (Semgrep, CodeQL)
- DAST tools (OWASP ZAP)
- Dependency scanners (npm audit, Snyk)
\`\`\`

## Input Contract

Create `contracts/orchestrator-to-security-scanner.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "OrchestratorToSecurityScanner",
  "description": "Input contract for the security scanner agent",
  "type": "object",
  "required": ["scan_type", "context"],
  "properties": {
    "scan_type": {
      "type": "string",
      "enum": ["full", "targeted", "differential"],
      "description": "Type of security scan to perform"
    },
    "context": {
      "type": "object",
      "required": ["project_root", "language"],
      "properties": {
        "project_root": {
          "type": "string",
          "description": "Absolute path to project root"
        },
        "language": {
          "type": "string",
          "description": "Primary programming language"
        },
        "framework": {
          "type": "string",
          "description": "Web framework in use"
        },
        "files_to_scan": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Glob patterns for files to scan (targeted scan)"
        },
        "files_modified": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Recently modified files (differential scan)"
        }
      }
    },
    "previous_findings": {
      "type": "array",
      "items": { "$ref": "#/$defs/Finding" },
      "description": "Findings from previous scan for comparison"
    }
  },
  "$defs": {
    "Finding": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "file": { "type": "string" },
        "line": { "type": "integer" }
      }
    }
  }
}
```

## Output Contract

Create `contracts/security-scanner-output.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "SecurityScannerOutput",
  "description": "Output contract for the security scanner agent",
  "type": "object",
  "required": ["scan_id", "status", "summary", "findings"],
  "properties": {
    "scan_id": {
      "type": "string",
      "description": "Unique identifier for this scan"
    },
    "status": {
      "type": "string",
      "enum": ["completed", "partial", "failed"]
    },
    "summary": {
      "type": "object",
      "required": ["files_scanned", "total_findings"],
      "properties": {
        "files_scanned": { "type": "integer" },
        "total_findings": { "type": "integer" },
        "critical": { "type": "integer" },
        "high": { "type": "integer" },
        "medium": { "type": "integer" },
        "low": { "type": "integer" }
      }
    },
    "findings": {
      "type": "array",
      "items": { "$ref": "#/$defs/SecurityFinding" }
    },
    "block_deployment": {
      "type": "boolean",
      "description": "Whether critical issues prevent deployment"
    },
    "block_reason": {
      "type": "string",
      "description": "Reason for blocking if applicable"
    }
  },
  "$defs": {
    "SecurityFinding": {
      "type": "object",
      "required": ["id", "severity", "category", "title", "file"],
      "properties": {
        "id": { "type": "string" },
        "severity": {
          "type": "string",
          "enum": ["critical", "high", "medium", "low"]
        },
        "category": { "type": "string" },
        "cwe": { "type": "string" },
        "title": { "type": "string" },
        "file": { "type": "string" },
        "line": { "type": "integer" },
        "code_snippet": { "type": "string" },
        "description": { "type": "string" },
        "remediation": { "type": "string" },
        "references": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

## Orchestrator Integration

Add to `agents/apl-orchestrator.md`:

```markdown
### Security Scan Phase

After coder-agent completes implementation and before final review:

1. Prepare security scan request:
   \`\`\`json
   {
     "scan_type": "targeted",
     "context": {
       "project_root": state.project_root,
       "language": state.project_context.language,
       "framework": state.project_context.framework,
       "files_modified": state.files_modified
     }
   }
   \`\`\`

2. Delegate to security-scanner-agent

3. Process findings:
   - If `block_deployment: true`:
     - Add security fixes to task list
     - Return to coder-agent with remediation guidance
     - Re-scan after fixes
   - If `block_deployment: false`:
     - Log findings for review
     - Continue to reviewer-agent
```

## Testing the Agent

### Unit Test Cases

```javascript
describe('Security Scanner Agent', () => {
  describe('SQL Injection Detection', () => {
    it('should detect string concatenation in queries', async () => {
      const code = `const query = \`SELECT * FROM users WHERE id = \${userId}\``;
      const result = await scanCode(code, 'typescript');
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          category: 'sql_injection',
          severity: 'critical'
        })
      );
    });

    it('should not flag parameterized queries', async () => {
      const code = `db.query('SELECT * FROM users WHERE id = $1', [userId])`;
      const result = await scanCode(code, 'typescript');
      expect(result.findings.filter(f => f.category === 'sql_injection')).toHaveLength(0);
    });
  });

  describe('Secret Detection', () => {
    it('should detect hardcoded API keys', async () => {
      const code = `const API_KEY = 'sk_live_abc123xyz789'`;
      const result = await scanCode(code, 'typescript');
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          category: 'hardcoded_secret',
          severity: 'critical'
        })
      );
    });
  });
});
```

## Summary

This example demonstrates:
1. Complete agent definition with structured prompts
2. Input/output contracts using JSON Schema
3. Integration points with the orchestrator
4. Testing strategies

Use this as a template for creating your own specialized agents.
