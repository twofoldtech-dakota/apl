# Vercel MCP Setup Guide

This guide explains how to set up Vercel MCP integration for APL's deployment capabilities.

## Overview

Vercel MCP is Vercel's official Model Context Protocol server that provides secure access to your Vercel projects and deployments. It enables AI assistants like Claude to deploy, manage, and monitor your applications.

## Prerequisites

- A Vercel account ([sign up free](https://vercel.com/signup))
- Claude Code installed
- A project ready for deployment

## Quick Setup

### Step 1: Add Vercel MCP

Run this command in Claude Code:

```bash
claude mcp add --transport http vercel https://mcp.vercel.com
```

### Step 2: Authenticate

1. After running the command, your browser will open
2. Sign in to your Vercel account
3. Authorize Claude to access your Vercel projects
4. Return to Claude Code

### Step 3: Verify Connection

```
/apl deploy status
```

You should see your Vercel projects and recent deployments.

## Project-Specific Setup (Recommended)

For better context and fewer parameters needed, use project-specific URLs:

```bash
claude mcp add --transport http vercel https://mcp.vercel.com/<teamSlug>/<projectSlug>
```

**Example:**
```bash
claude mcp add --transport http vercel https://mcp.vercel.com/my-team/my-app
```

### Finding Your Slugs

**Team Slug:**
1. Go to Vercel Dashboard → Team Settings → General
2. Your team slug is in the URL: `vercel.com/[team-slug]`

**Project Slug:**
1. Go to your project in Vercel Dashboard
2. Your project slug is in the URL: `vercel.com/[team]/[project-slug]`

Or use the Vercel CLI:
```bash
vercel projects ls
```

## Available Capabilities

Once connected, APL can:

| Capability | Description |
|------------|-------------|
| Deploy | Create production and preview deployments |
| Rollback | Revert to previous deployments |
| Environment Variables | Manage env vars across environments |
| Domains | Add and configure custom domains |
| Logs | View build and runtime logs |
| Status | Check deployment state and history |

## Usage

### Deploy to Production

```
/apl deploy
/apl deploy production
```

### Create Preview Deployment

```
/apl deploy preview
```

### Rollback

```
/apl deploy rollback
/apl deploy rollback dpl_abc123
```

### Environment Variables

```
/apl deploy env list
/apl deploy env set API_KEY=secret123
/apl deploy env remove OLD_VAR
```

### Custom Domains

```
/apl deploy domain list
/apl deploy domain add example.com
```

### View Logs

```
/apl deploy logs
```

## Configuration

Configure Vercel settings in `.apl/config.json`:

```json
{
  "integrations": {
    "vercel": {
      "enabled": true,
      "team_slug": "my-team",
      "project_slug": "my-project",
      "production_branch": "main",
      "preview_on_pr": true,
      "auto_deploy_after_review": false,
      "smoke_test_url": "/api/health"
    }
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable Vercel integration |
| `team_slug` | string | null | Your Vercel team slug |
| `project_slug` | string | null | Your Vercel project slug |
| `production_branch` | string | "main" | Branch that triggers production deploys |
| `preview_on_pr` | boolean | true | Create preview deploys for PRs |
| `auto_deploy_after_review` | boolean | false | Auto-deploy after APL review passes |
| `smoke_test_url` | string | null | URL path to hit after deploy |

## Security

### OAuth Scope

When you authorize Claude, it receives access to:
- Read project information
- Create deployments
- Manage environment variables
- Configure domains
- Read deployment logs

### Best Practices

1. **Use project-specific URLs** to limit scope
2. **Review deployments** before promoting to production
3. **Use environment variables** for secrets (never hardcode)
4. **Enable preview deployments** to test before production

### Token Security

- Tokens are managed by the MCP client
- Never share or expose tokens
- Re-authenticate if you suspect compromise

## Workflow Integration

### Manual Deployment

After APL completes work:
```
/apl deploy
```

### Auto-Deploy After Review

Enable in config:
```json
{
  "integrations": {
    "vercel": {
      "auto_deploy_after_review": true
    }
  }
}
```

APL will automatically deploy when review phase passes.

### PR Preview Flow

1. APL creates/updates code
2. Commit and push to feature branch
3. Create PR
4. APL can deploy preview: `/apl deploy preview`
5. Review on preview URL
6. Merge and deploy to production

## Troubleshooting

### "MCP not connected"

1. Run the setup command again:
   ```bash
   claude mcp add --transport http vercel https://mcp.vercel.com
   ```
2. Complete OAuth flow
3. Restart Claude Code session

### "Authentication expired"

Re-authenticate by running the setup command again.

### "Project not found"

1. Verify team_slug and project_slug in config
2. Check you have access to the project in Vercel
3. Try using project-specific MCP URL

### "Build failed"

1. Check build logs: `/apl deploy logs`
2. Verify all dependencies are in package.json
3. Run build locally: `npm run build`
4. Check environment variables are set

### "Domain verification failed"

1. Add the DNS records shown in Vercel
2. Wait for DNS propagation (up to 48 hours)
3. Check domain status: `/apl deploy domain list`

## Multiple Projects

You can add multiple Vercel MCP connections:

```bash
# Main app
claude mcp add --transport http vercel-app https://mcp.vercel.com/team/main-app

# Marketing site
claude mcp add --transport http vercel-marketing https://mcp.vercel.com/team/marketing

# API service
claude mcp add --transport http vercel-api https://mcp.vercel.com/team/api-service
```

Then specify which to use in your config or commands.

## Resources

- [Vercel MCP Documentation](https://vercel.com/docs/mcp/vercel-mcp)
- [Vercel MCP Blog Announcement](https://vercel.com/blog/introducing-vercel-mcp-connect-vercel-to-your-ai-tools)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Vercel CLI](https://vercel.com/docs/cli)

## Support

For issues with:
- **APL Deploy Integration**: Open an issue in the APL repository
- **Vercel MCP**: Check [Vercel Docs](https://vercel.com/docs/mcp)
- **Vercel Platform**: Contact [Vercel Support](https://vercel.com/support)
