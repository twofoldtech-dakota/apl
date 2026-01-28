---
name: deploy
description: Deployment command for Vercel through MCP integration. Handles production deploys, previews, rollbacks, environment variables, and domain management.
argument-hint: "<deploy action or subcommand>"
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Task, TodoWrite
model: sonnet
context: fork
agent: deployer-agent
---

# /apl deploy - Deployment Command

Deploy APL-built applications to Vercel through MCP integration.

## Invocation

The user has invoked: `/apl deploy $ARGUMENTS`

Parse the arguments to determine the deployment action.

## Prerequisites

Vercel MCP must be configured:

```bash
claude mcp add --transport http vercel https://mcp.vercel.com
```

OAuth authentication will be prompted on first use. Complete the authorization flow in your browser.

### Project-Specific Access

For team/project scoping (recommended):

```bash
claude mcp add --transport http vercel https://mcp.vercel.com/<teamSlug>/<projectSlug>
```

## Commands

### Deploy to Production

```
/apl deploy
/apl deploy production
```

Deploys the current project state to production.

**Process:**
1. Verify Vercel MCP authentication
2. Run local build to catch errors
3. Trigger production deployment
4. Wait for READY state
5. Return production URL

### Deploy Preview

```
/apl deploy preview
```

Creates a preview deployment for the current branch.

**Process:**
1. Trigger preview deployment
2. Associate with current branch
3. Return preview URL

Useful for:
- Testing before production
- Sharing with stakeholders
- PR reviews

### Rollback

```
/apl deploy rollback
/apl deploy rollback <deployment_id>
```

Rollback to a previous deployment.

**Without ID:** Rolls back to the previous successful production deployment.
**With ID:** Rolls back to the specified deployment.

### Environment Variables

```
/apl deploy env list
```
Lists all environment variables.

```
/apl deploy env set KEY=value
/apl deploy env set KEY=value --environment preview
```
Sets an environment variable. Defaults to production environment.

```
/apl deploy env remove KEY
```
Removes an environment variable.

### Deployment Status

```
/apl deploy status
```

Shows:
- Current production deployment
- Recent deployments
- Build status
- Environment overview

### Domain Management

```
/apl deploy domain list
```
Lists configured domains.

```
/apl deploy domain add example.com
```
Adds a custom domain.

```
/apl deploy domain remove example.com
```
Removes a domain.

### View Logs

```
/apl deploy logs
/apl deploy logs <deployment_id>
```

Retrieves deployment logs for debugging.

## Initialization

1. **Check MCP Status**:
   - Verify Vercel MCP tools are available
   - If not authenticated, prompt for setup

2. **Load Configuration**:
   - Read `.apl/config.json` for Vercel settings
   - Check for team_slug and project_slug

3. **Verify Project**:
   - Check if project is linked to Vercel
   - Identify production branch

## Output Format

### Successful Deployment

```
[APL Deploy] Deploying to production...

Pre-flight Checks:
  ✓ Vercel MCP authenticated
  ✓ Project linked: my-app
  ✓ Local build successful

Deploying...
  → Uploading files...
  → Building application...
  → Running checks...

Deployment Complete!

Production URL: https://my-app.vercel.app
Deployment ID: dpl_abc123xyz
Build Time: 45s
Status: READY

Inspect: https://vercel.com/my-team/my-app/dpl_abc123xyz
```

### Preview Deployment

```
[APL Deploy] Creating preview deployment...

Preview URL: https://my-app-git-feature-branch.vercel.app
Deployment ID: dpl_preview123
Status: READY

This preview is associated with branch: feature/new-feature
```

### Rollback

```
[APL Deploy] Rolling back to previous deployment...

Previous Deployment: dpl_oldxyz (2024-01-14)
Current Production: dpl_abc123 (2024-01-15)

Rolling back...

Rollback Complete!
Production now serving: dpl_oldxyz
```

### Authentication Required

```
[APL Deploy] Vercel MCP authentication required

To set up Vercel deployment:

1. Run this command:
   claude mcp add --transport http vercel https://mcp.vercel.com

2. Complete OAuth authorization in your browser

3. Return here and run deployment again

Documentation: https://vercel.com/docs/mcp/vercel-mcp
```

### Environment Variables

```
[APL Deploy] Environment Variables

Production:
  NODE_ENV = production
  API_URL = https://api.example.com
  DATABASE_URL = ******* (encrypted)

Preview:
  NODE_ENV = preview
  API_URL = https://staging-api.example.com

Use '/apl deploy env set KEY=value' to add/update variables.
```

## Error Handling

### Build Failures

```
[APL Deploy] Build failed

Error: Module not found: '@/components/Button'

This error occurred during the build phase.

Suggested fixes:
1. Check import paths are correct
2. Verify all dependencies are installed
3. Run 'npm run build' locally to debug

Build logs available at:
https://vercel.com/my-team/my-app/dpl_failed123
```

### Authentication Errors

```
[APL Deploy] Authentication failed

Your Vercel session may have expired.

To re-authenticate:
1. Run: claude mcp add --transport http vercel https://mcp.vercel.com
2. Complete OAuth flow
3. Retry deployment
```

## Workflow Integration

### Auto-Deploy After Review

When configured in `.apl/config.json`:

```json
{
  "integrations": {
    "vercel": {
      "auto_deploy_after_review": true
    }
  }
}
```

APL will automatically deploy to production after a successful review phase.

### Preview on PR

When configured:

```json
{
  "integrations": {
    "vercel": {
      "preview_on_pr": true
    }
  }
}
```

APL will create preview deployments for pull requests.

## Configuration

Full configuration options in `.apl/config.json`:

```json
{
  "integrations": {
    "vercel": {
      "enabled": true,
      "mcp_url": "https://mcp.vercel.com",
      "team_slug": "my-team",
      "project_slug": "my-project",
      "production_branch": "main",
      "preview_on_pr": true,
      "auto_deploy_after_review": false,
      "smoke_test_url": "/api/health",
      "build_command": "npm run build",
      "output_directory": ".next"
    }
  }
}
```

## Safety Features

- **Branch Protection**: Warns when deploying from non-production branch
- **Uncommitted Changes**: Warns about uncommitted changes
- **Confirmation**: Can require confirmation for production deploys
- **Rollback Ready**: Always keeps previous deployment available
