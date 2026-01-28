# Pencil.dev MCP Setup Guide

This guide explains how to set up Pencil.dev MCP integration for APL's design capabilities.

## Overview

Pencil.dev is an AI-powered design tool that integrates directly into your development workflow through the Model Context Protocol (MCP). It enables a "design on canvas, land in code" workflow where AI can read and edit design data directly.

## Prerequisites

- Claude Code or compatible MCP client
- macOS, Windows, or Linux desktop environment

## Installation

### Step 1: Download Pencil.dev

1. Visit [https://pencil.dev](https://pencil.dev)
2. Download the desktop application for your operating system
3. Install following your OS standard procedure

### Step 2: Run Pencil.dev

1. Launch the Pencil.dev desktop application
2. The MCP server auto-configures when the app is running
3. No additional configuration is typically required

### Step 3: Verify Connection

In Claude Code, run:

```
/apl design status
```

You should see:
```
[APL Design] MCP Status

Pencil.dev MCP: Connected ✓
Design Tools Available:
  - mcp__pencil_open_canvas
  - mcp__pencil_create_component
  - mcp__pencil_update_design
  - mcp__pencil_export_tokens
  - mcp__pencil_export_code
  - mcp__pencil_get_design
```

## Design Data Storage

Design data is stored in the `.pencil/` directory in your project root:

```
.pencil/
├── tokens.json           # Design tokens (colors, typography, spacing)
├── components/           # Component designs
│   ├── Button.json
│   ├── Card.json
│   └── Input.json
├── layouts/              # Reusable layout templates
│   ├── AppShell.json
│   └── MarketingLayout.json
├── pages/                # Full page designs
│   └── Dashboard.json
└── assets/               # Design assets (icons, images)
```

### Version Control

The `.pencil/` directory is designed to be committed to Git:
- JSON files are human-readable and diffable
- Design changes can be code-reviewed
- Design history is preserved in version control

Add to `.gitignore` only if you don't want to version designs:
```
# .gitignore (only if needed)
.pencil/assets/  # Exclude large binary assets
```

## Usage

### Initialize Design System

Start a new project's design system:

```
/apl design system init
```

This creates `.pencil/tokens.json` with:
- Color palette
- Typography scale
- Spacing system
- Border radius values
- Shadow definitions

### Create Components

Design individual components:

```
/apl design component Button
/apl design component Card
/apl design component NavigationMenu
```

### Design Pages

Create full page layouts:

```
/apl design page Dashboard
/apl design page LandingPage
```

### Export to Code

Generate code from designs:

```
/apl design export tailwind
/apl design export css
```

## Configuration

Configure Pencil.dev integration in `.apl/config.json`:

```json
{
  "integrations": {
    "pencil": {
      "enabled": true,
      "design_data_path": ".pencil/",
      "auto_export_on_change": true,
      "export_format": "tailwind",
      "design_before_code": true
    }
  }
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable Pencil.dev integration |
| `design_data_path` | string | ".pencil/" | Where to store design files |
| `auto_export_on_change` | boolean | true | Auto-export code when designs change |
| `export_format` | string | "tailwind" | Default export format |
| `design_before_code` | boolean | true | Prompt for design before coding UI |

## Troubleshooting

### MCP Not Connected

If `/apl design status` shows MCP not available:

1. **Ensure Pencil.dev is running**
   - Check your system tray/dock for the Pencil icon
   - Restart the application if needed

2. **Check firewall settings**
   - MCP uses localhost connections
   - Ensure your firewall allows local connections

3. **Restart Claude Code**
   - MCP connections are established at session start
   - Restart after launching Pencil.dev

### Design Files Not Syncing

1. **Check file permissions**
   ```bash
   ls -la .pencil/
   ```

2. **Verify JSON validity**
   ```bash
   cat .pencil/tokens.json | jq .
   ```

3. **Reset design cache**
   - Close Pencil.dev
   - Delete `.pencil/.cache/` if it exists
   - Restart Pencil.dev

### Export Errors

1. **Validate design tokens**
   - Ensure colors are valid hex/rgb values
   - Check typography values are valid CSS

2. **Check output path**
   - Ensure destination directory exists
   - Verify write permissions

## Working Without MCP

If Pencil.dev is not available, APL's design command still works in fallback mode:

- Generates design specifications in JSON format
- Creates component documentation
- Outputs Tailwind/CSS code manually
- Suggests component library alternatives (shadcn/ui, Radix, Chakra)

The fallback mode is fully functional but lacks the visual canvas features.

## Resources

- [Pencil.dev Website](https://pencil.dev)
- [Pencil.dev Documentation](https://pencil-docs.notion.site)
- [MCP Specification](https://modelcontextprotocol.io)

## Support

For issues with:
- **APL Design Integration**: Open an issue in the APL repository
- **Pencil.dev Application**: Contact Pencil.dev support
