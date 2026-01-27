---
name: design
description: Design command for UI/UX work through Pencil.dev MCP integration. Creates polished designs that export directly to code. Supports component design, page layouts, and design system management.
argument-hint: "<design goal or subcommand>"
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Task, TodoWrite
model: sonnet
context: fork
agent: designer-agent
---

# /apl design - Design Command

Create polished UI designs through Pencil.dev MCP integration, with graceful fallback to manual specification generation.

## Invocation

The user has invoked: `/apl design $ARGUMENTS`

Parse the arguments to determine the design type and target.

## Prerequisites

For full design canvas capabilities, Pencil.dev MCP server should be installed:

1. Install Pencil.dev desktop app from https://pencil.dev
2. Run the application (MCP server auto-configures)
3. Design data lives in `.pencil/` directory (Git-manageable)

**Note:** The design command works without Pencil.dev by generating manual specifications, but the visual canvas features require the MCP connection.

## Commands

### Initialize Design System

```
/apl design system init
```

Creates initial design tokens file at `.pencil/tokens.json`:
- Color palette (primary, neutral, semantic)
- Typography scale
- Spacing system
- Border radius values
- Shadow definitions

Interactive prompts for:
- Brand colors
- Font preferences
- Design style (minimal, bold, playful, etc.)

### Design Component

```
/apl design component <component_name>
```

Creates a new component design with variants and specifications.

**Examples:**
```
/apl design component Button
/apl design component Card
/apl design component NavigationMenu
/apl design component DataTable
```

Generates:
- Component specification with variants
- TypeScript interface
- Tailwind/CSS styles
- Accessibility requirements

### Design Page

```
/apl design page <page_name>
```

Creates a full page layout design.

**Examples:**
```
/apl design page Dashboard
/apl design page LandingPage
/apl design page Settings
/apl design page Pricing
```

Generates:
- Page layout structure
- Component composition
- Responsive breakpoints
- Section specifications

### Design Layout

```
/apl design layout <layout_name>
```

Creates a reusable layout template.

**Examples:**
```
/apl design layout AppShell
/apl design layout MarketingLayout
/apl design layout AuthLayout
```

### Export to Code

```
/apl design export <format>
```

Exports current designs to code format.

**Formats:**
- `tailwind` - Tailwind CSS config and classes
- `css` - Raw CSS files
- `styled` - styled-components
- `tokens` - Design tokens JSON

**Examples:**
```
/apl design export tailwind
/apl design export css --output src/styles
```

### Check MCP Status

```
/apl design status
```

Verifies Pencil.dev MCP connection and shows:
- MCP connection status
- Available design tools
- Current design files
- Design token summary

### List Designs

```
/apl design list
```

Lists all designs in `.pencil/` directory:
- Components
- Pages
- Layouts
- Token files

## Initialization

1. **Check MCP Status**:
   - Verify if Pencil.dev MCP tools are available
   - If not, prepare for fallback mode

2. **Load Design Tokens**:
   - Check for existing `.pencil/tokens.json`
   - If not found, prompt for design system init

3. **Load Existing Designs**:
   - Scan `.pencil/` for existing design files
   - Build component inventory

## Design Workflow

### With Pencil.dev MCP

1. Open design canvas via MCP
2. Create/edit design visually
3. AI assists with layout and styling
4. Export code artifacts
5. Save design data to `.pencil/`

### Without Pencil.dev MCP (Fallback)

1. Generate design specifications in JSON
2. Create component documentation
3. Output Tailwind/CSS code
4. Suggest component library alternatives

## Output Format

### Design System Init

```
[APL Design] Initializing design system...

Design tokens created at .pencil/tokens.json

Colors:
  Primary: #3b82f6 (blue-500)
  Secondary: #6366f1 (indigo-500)
  Success: #22c55e
  Warning: #f59e0b
  Error: #ef4444

Typography:
  Font Family: Inter, system-ui, sans-serif
  Base Size: 16px
  Scale: 0.75rem → 3rem

Spacing: 4px base unit (0.25rem)

Run `/apl design component <name>` to create your first component.
```

### Component Design

```
[APL Design] Creating Button component...

Component: Button
Variants:
  - variant: solid | outline | ghost | link
  - size: sm | md | lg
  - colorScheme: primary | secondary | danger

States: default, hover, focus, active, disabled, loading

Files Created:
  - .pencil/components/Button.json
  - Generated: src/components/Button.tsx (spec)

Accessibility:
  ✓ Focus ring defined
  ✓ Disabled state styled
  ✓ Color contrast: 4.5:1

Next: Implement component following the specification.
```

### Page Design

```
[APL Design] Creating Dashboard page...

Layout: AppShell (sidebar + main content)

Sections:
  1. Header - Logo, navigation, user menu
  2. Sidebar - Navigation links, collapsed state
  3. Main Content - Stats cards, data table, charts
  4. Footer - Links, copyright

Components Used:
  - Card (3x stat cards)
  - DataTable (1x)
  - Chart (2x)
  - Button (various)

Files Created:
  - .pencil/pages/Dashboard.json
  - .pencil/layouts/AppShell.json (if new)

Responsive Breakpoints:
  - Mobile: Single column, collapsed sidebar
  - Tablet: Sidebar overlay
  - Desktop: Full layout
```

## Design-Before-Code Integration

When APL detects a new project with UI:

1. Planner identifies UI-related tasks
2. Prompts: "Would you like to set up design system first?"
3. If yes, triggers `/apl design system init`
4. Design tasks added before coding tasks
5. Coder uses design specs during implementation

## Error Handling

- **MCP not available**: Switch to fallback mode with manual specs
- **No design system**: Prompt for `/apl design system init`
- **Component exists**: Ask to overwrite or create variant
- **Invalid design type**: List valid design types

## Configuration

In `.apl/config.json`:

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
