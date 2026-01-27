#!/bin/bash
# APL GUI Control Panel Launcher
# Usage: ./start.sh [project-root]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default configuration
SERVER_PORT=${APL_GUI_PORT:-3001}
CLIENT_PORT=${APL_GUI_CLIENT_PORT:-5173}

# Parse arguments
PROJECT_ROOT="${1:-$(pwd)}"

# Make project root absolute
if [[ "$PROJECT_ROOT" != /* ]]; then
  PROJECT_ROOT="$(cd "$PROJECT_ROOT" 2>/dev/null && pwd)" || {
    echo -e "${RED}Error: Invalid project root: $1${NC}"
    exit 1
  }
fi

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           APL GUI Control Panel - Launcher                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js version
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}Error: Node.js 18+ is required (found v$NODE_VERSION)${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Build shared types if needed
if [ ! -d "shared/dist" ]; then
  echo -e "${YELLOW}Building shared types...${NC}"
  npm run build:shared
fi

echo ""
echo -e "${GREEN}Starting APL GUI Control Panel...${NC}"
echo ""
echo -e "  ${BLUE}Server:${NC}      http://localhost:$SERVER_PORT"
echo -e "  ${BLUE}Client:${NC}      http://localhost:$CLIENT_PORT"
echo -e "  ${BLUE}WebSocket:${NC}   ws://localhost:$SERVER_PORT/ws"
echo ""
echo -e "  ${YELLOW}Project:${NC}     $PROJECT_ROOT"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Export project root for server
export APL_PROJECT_ROOT="$PROJECT_ROOT"
export APL_GUI_PORT="$SERVER_PORT"
export APL_GUI_CLIENT_PORT="$CLIENT_PORT"

# Start server and client concurrently
if command -v npx &> /dev/null; then
  npx concurrently \
    --names "server,client" \
    --prefix-colors "blue,green" \
    "npm run dev:server" \
    "npm run dev:client"
else
  echo -e "${RED}Error: npx not found. Please install npm.${NC}"
  exit 1
fi
