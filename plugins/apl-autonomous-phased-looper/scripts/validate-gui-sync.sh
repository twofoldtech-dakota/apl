#!/bin/bash
# =============================================================================
# APL GUI Sync Validation Script
# =============================================================================
# Validates that GUI types are in sync with master-config.json
# Run before commits to catch missing agent/integration updates
# =============================================================================

set -e

# Get script directory and plugin root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# File paths
MASTER_CONFIG="$PLUGIN_ROOT/master-config.json"
AGENTIC_TYPES="$PLUGIN_ROOT/gui/shared/src/types/agentic.ts"
CONFIG_TYPES="$PLUGIN_ROOT/gui/shared/src/types/config.ts"
AGENT_MONITOR="$PLUGIN_ROOT/gui/client/src/components/agentic/AgentActivityMonitor.tsx"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

echo "=========================================="
echo "APL GUI Sync Validation"
echo "=========================================="
echo ""

# Check if required files exist
if [[ ! -f "$MASTER_CONFIG" ]]; then
    echo -e "${RED}ERROR: master-config.json not found at $MASTER_CONFIG${NC}"
    exit 1
fi

if [[ ! -f "$AGENTIC_TYPES" ]]; then
    echo -e "${RED}ERROR: agentic.ts not found at $AGENTIC_TYPES${NC}"
    exit 1
fi

if [[ ! -f "$CONFIG_TYPES" ]]; then
    echo -e "${RED}ERROR: config.ts not found at $CONFIG_TYPES${NC}"
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}WARNING: jq is not installed. Skipping validation.${NC}"
    echo "Install jq to enable GUI sync validation."
    exit 0
fi

echo "Checking agents..."
echo "------------------------------------------"

# Extract agent keys from master-config.json
config_agents=$(jq -r '.agents | keys[]' "$MASTER_CONFIG" 2>/dev/null)

# Map config agent keys to agent IDs
for agent in $config_agents; do
    # Convert config key to agent id format
    # orchestrator -> apl-orchestrator
    # planner -> planner-agent
    # meta_orchestrator -> meta-orchestrator
    # requirements_analyst -> requirements-analyst
    # content_strategist -> content-strategist-agent
    # designer -> designer-agent
    # deployer -> deployer-agent

    agent_id=""
    case "$agent" in
        "orchestrator")
            agent_id="apl-orchestrator"
            ;;
        "meta_orchestrator")
            agent_id="meta-orchestrator"
            ;;
        "requirements_analyst")
            agent_id="requirements-analyst"
            ;;
        "content_strategist")
            agent_id="content-strategist-agent"
            ;;
        "designer")
            agent_id="designer-agent"
            ;;
        "deployer")
            agent_id="deployer-agent"
            ;;
        *)
            # Default: add -agent suffix if not already present
            agent_id=$(echo "$agent" | sed 's/_/-/g')
            if [[ "$agent_id" != *"-agent"* && "$agent_id" != *"-orchestrator"* && "$agent_id" != *"-analyst"* ]]; then
                agent_id="${agent_id}-agent"
            fi
            ;;
    esac

    # Check if agent exists in AgentId type
    if ! grep -q "'$agent_id'" "$AGENTIC_TYPES" 2>/dev/null; then
        echo -e "${RED}ERROR: Agent '$agent_id' missing from AgentId type in:${NC}"
        echo "       gui/shared/src/types/agentic.ts"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}  ✓ $agent_id${NC} found in AgentId type"
    fi

    # Check if agent exists in AGENTS array (warning only)
    if [[ -f "$AGENT_MONITOR" ]]; then
        if ! grep -q "id: '$agent_id'" "$AGENT_MONITOR" 2>/dev/null; then
            echo -e "${YELLOW}  ⚠ $agent_id missing from AGENTS array in AgentActivityMonitor.tsx${NC}"
            warnings=$((warnings + 1))
        fi
    fi
done

echo ""
echo "Checking integrations..."
echo "------------------------------------------"

# Extract integration keys from master-config.json
config_integrations=$(jq -r '.integrations | keys[]' "$MASTER_CONFIG" 2>/dev/null)

# Check each integration exists in IntegrationsConfig type
for integration in $config_integrations; do
    if ! grep -q "${integration}:" "$CONFIG_TYPES" 2>/dev/null; then
        echo -e "${RED}ERROR: Integration '$integration' missing from IntegrationsConfig in:${NC}"
        echo "       gui/shared/src/types/config.ts"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}  ✓ $integration${NC} found in IntegrationsConfig"
    fi
done

echo ""
echo "Checking content_strategy..."
echo "------------------------------------------"

# Check if content_strategy exists in config and types
if jq -e '.content_strategy' "$MASTER_CONFIG" > /dev/null 2>&1; then
    if ! grep -q "content_strategy:" "$CONFIG_TYPES" 2>/dev/null && ! grep -q "ContentStrategyConfig" "$CONFIG_TYPES" 2>/dev/null; then
        echo -e "${RED}ERROR: content_strategy section exists in master-config.json but ContentStrategyConfig missing from config.ts${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}  ✓ content_strategy${NC} found in types"
    fi
fi

echo ""
echo "=========================================="

# Summary
if [ $errors -gt 0 ]; then
    echo -e "${RED}FAILED: $errors error(s) found${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}Plus $warnings warning(s)${NC}"
    fi
    echo ""
    echo "Please update GUI types to match master-config.json before committing."
    echo ""
    echo "Files to update:"
    echo "  - gui/shared/src/types/agentic.ts (AgentId type)"
    echo "  - gui/shared/src/types/config.ts (IntegrationsConfig, AgentRole)"
    echo "  - gui/client/src/components/agentic/AgentActivityMonitor.tsx (AGENTS array)"
    exit 1
elif [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}PASSED with $warnings warning(s)${NC}"
    echo "Consider updating AgentActivityMonitor.tsx AGENTS array."
    exit 0
else
    echo -e "${GREEN}SUCCESS: GUI types are in sync with master-config.json${NC}"
    exit 0
fi
