#!/bin/bash
# DevInsight MCP - Multi-Project Setup Script
# This script helps you set up DevInsight MCP across multiple projects

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧠 DevInsight MCP - Multi-Project Setup${NC}\n"

# Check if DevInsight is installed globally
echo -e "${YELLOW}Checking NodeJS...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}\n"

# Function to setup a project
setup_project() {
    local PROJECT_PATH=$1
    local PROJECT_NAME=$(basename "$PROJECT_PATH")
    
    echo -e "${BLUE}Setting up: $PROJECT_NAME${NC}"
    
    if [ ! -d "$PROJECT_PATH" ]; then
        echo -e "${RED}❌ Directory not found: $PROJECT_PATH${NC}"
        return 1
    fi
    
    # Create .vscode directory
    mkdir -p "$PROJECT_PATH/.vscode"
    
    # Create settings.json if it doesn't exist
    if [ ! -f "$PROJECT_PATH/.vscode/settings.json" ]; then
        cat > "$PROJECT_PATH/.vscode/settings.json" << 'EOF'
{
  "mcp": {
    "enabled": true,
    "servers": {
      "devinsight": {
        "command": "node",
        "args": [
          "$(npm root -g)/devinsight-mcp/dist/server.js"
        ]
      }
    }
  },
  "github.copilot.enable": {
    "*": true,
    "plaintext": false,
    "markdown": true
  }
}
EOF
        echo -e "${GREEN}✓ Created .vscode/settings.json${NC}"
    else
        echo -e "${YELLOW}⚠ .vscode/settings.json already exists${NC}"
    fi
    
    # Create or append to .copilot-instructions.md
    if [ ! -f "$PROJECT_PATH/.copilot-instructions.md" ]; then
        cat > "$PROJECT_PATH/.copilot-instructions.md" << 'EOF'
# DevInsight MCP Integration

You have access to DevInsight tools for error analysis and code quality checks.

## Available Tools

- **analyze_error** - Explain JavaScript/TypeScript errors with fixes
- **find_unused_code** - Find dead code in the project  
- **analyze_multiple_errors** - Batch analyze error logs
- **clear_cache** - Clear internal caches

## Usage

When user shows an error → Use analyze_error
When refactoring → Offer find_unused_code
When analyzing logs → Use analyze_multiple_errors

Be proactive and helpful!
EOF
        echo -e "${GREEN}✓ Created .copilot-instructions.md${NC}"
    else
        echo -e "${YELLOW}⚠ .copilot-instructions.md already exists${NC}"
    fi
    
    echo -e "${GREEN}✓ $PROJECT_NAME is set up!${NC}\n"
}

# Main menu
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <project-path> [project-path] ..."
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  # Setup single project:"
    echo "  $0 ~/my-project"
    echo ""
    echo "  # Setup multiple projects at once:"
    echo "  $0 ~/project1 ~/project2 ~/project3"
    echo ""
    echo "  # Setup all projects in a directory:"
    echo "  $0 ~/projects/*/main"
    echo ""
    echo -e "${BLUE}What this does:${NC}"
    echo "  1. Creates .vscode/settings.json with MCP configuration"
    echo "  2. Creates .copilot-instructions.md for GitHub Copilot"
    echo "  3. Enables DevInsight tools in your project"
    exit 0
fi

# Global installation check
echo -e "${YELLOW}Checking DevInsight MCP installation...${NC}"
DEVINSIGHT_PATH=$(npm root -g 2>/dev/null)/devinsight-mcp 2>/dev/null || true

if [ -z "$DEVINSIGHT_PATH" ] || [ ! -f "$DEVINSIGHT_PATH/dist/server.js" ]; then
    echo -e "${YELLOW}ℹ DevInsight MCP doesn't appear to be installed globally${NC}"
    echo -e "${BLUE}Install it first:${NC}"
    echo "  npm install -g /path/to/devinsight-mcp"
    echo ""
    echo -e "${YELLOW}Or set DEVINSIGHT_PATH:${NC}"
    echo "  export DEVINSIGHT_PATH=/path/to/devinsight-mcp"
    exit 1
fi

echo -e "${GREEN}✓ Found DevInsight at: $DEVINSIGHT_PATH${NC}\n"

# Verify server works
echo -e "${YELLOW}Verifying DevInsight server...${NC}"
if node "$DEVINSIGHT_PATH/dist/server.js" < /dev/null 2>&1 | grep -q "DevInsight MCP"; then
    echo -e "${GREEN}✓ DevInsight server works${NC}\n"
else
    echo -e "${YELLOW}⚠ Could not verify DevInsight server (continuing anyway)${NC}\n"
fi

# Setup all provided projects
SUCCESS_COUNT=0
FAIL_COUNT=0

for PROJECT_PATH in "$@"; do
    if setup_project "$PROJECT_PATH"; then
        ((SUCCESS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
done

# Summary
echo -e "${BLUE}=== Setup Complete ===${NC}"
echo -e "${GREEN}Successfully setup: $SUCCESS_COUNT projects${NC}"

if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL_COUNT projects${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Open each project in VS Code"
echo "  2. Restart VS Code to load new settings"
echo "  3. Open Copilot Chat (Ctrl+Shift+I)"
echo "  4. Try: 'Analyze this error: Cannot read property map of undefined'"
echo ""
echo -e "${GREEN}🎉 DevInsight is ready to use with Copilot!${NC}"
