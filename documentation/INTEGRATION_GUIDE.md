# 🔌 Using DevInsight MCP with GitHub Copilot

GitHub Copilot can connect to your DevInsight MCP server to analyze errors and find unused code intelligently. Here's how to set it up.

---

## 📋 Prerequisites

1. **GitHub Copilot** installed in VS Code
2. **DevInsight MCP Server** (this project)
3. **Node.js** v18+ installed globally

---

## 🚀 Option 1: Global Installation (Recommended for Multi-Project Use)

### Step 1: Build and Install Globally

```bash
cd /path/to/devinsight-mcp
npm run build

# Make it globally accessible
npm link
# or manually install globally:
npm install -g /path/to/devinsight-mcp
```

### Step 2: Verify Global Installation

```bash
# Test it's available globally
devinsight-mcp --version
# Or access the server:
node $(npm root -g)/devinsight-mcp/dist/server.js
```

### Step 3: Configure GitHub Copilot

Create a `.copilot-settings.json` in your workspace root:

```json
{
  "mcp": {
    "servers": {
      "devinsight": {
        "command": "node",
        "args": [
          "$(npm root -g)/devinsight-mcp/dist/server.js"
        ],
        "env": {
          "NODE_OPTIONS": "--enable-source-maps"
        }
      }
    }
  }
}
```

Or configure in VS Code settings.json:

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "servers": {
        "devinsight": {
          "command": "node",
          "args": [
            "$(npm root -g)/devinsight-mcp/dist/server.js"
          ]
        }
      }
    }
  }
}
```

---

## 🚀 Option 2: Per-Project Installation

### Step 1: Add to Your Project

```bash
# In your project directory
npm install devinsight-mcp
# or: npm install git+https://github.com/yourusername/devinsight-mcp.git
```

### Step 2: Configure Copilot

Create `.copilot-instructions.md` in your project root:

```markdown
# DevInsight MCP Tools

You have access to the DevInsight MCP server which provides the following tools:

## analyze_error
Analyzes JavaScript/TypeScript error messages and provides:
- Root cause analysis
- Fix suggestions with code examples
- Confidence level for the analysis

Example: When the user shows an error, use this tool to explain what's wrong and how to fix it.

Usage:
- Input: Error message (string)
- Options: confidence_filter (high/medium/low/any)

## analyze_multiple_errors
Batch analyze multiple error messages from logs or stack traces.

Usage:
- Input: Array of error messages
- Returns: Analysis for each error

## find_unused_code
Scans the TypeScript/JavaScript project to find:
- Unused functions
- Potentially unused files
- Dead code that can be removed

Options:
- confidence_filter: high/medium/low/any (default: high)

When to use:
- Code cleanup and refactoring
- Performance optimization
- Dead code elimination

## clear_cache
Clears internal analysis cache to free memory after long sessions.

---

## Instructions

When a user pastes an error:
1. Use `analyze_error` tool to get intelligent explanation
2. Provide the analysis with clear fix suggestions
3. Suggest code examples from the tool output

When discussing code quality:
1. Offer to scan for unused code using `find_unused_code`
2. Help identify safe removal candidates
3. Suggest refactoring opportunities

When analyzing logs:
1. Use `analyze_multiple_errors` for batch processing
2. Group errors by type
3. Provide consolidated recommendations
```

Create `.instructions.md` for agent-specific customization:

```markdown
# DevInsight Integration Instructions

These instructions guide how Copilot uses DevInsight tools.

## Configuration

- **Error Analysis Priority**: High (always offer analysis for errors)
- **Code Quality Check**: Medium (suggest when refactoring mentioned)
- **Result Caching**: Enabled (faster repeated analysis)

## Tool Integration Points

### In Code Review
When reviewing code, check for:
- Potential error patterns the user might encounter
- Dead code that could be cleaned up
- Performance issues

### In Debugging
When helping debug:
1. Parse error messages
2. Call `analyze_error` with the error
3. Explain root cause clearly
4. Provide step-by-step fix

### In Refactoring
When refactoring code:
1. Suggest running `find_unused_code`
2. Review confidence levels
3. Confirm before removal
4. Offer safe alternatives

## Best Practices

- Always explain confidence levels to the user
- Never auto-remove code without user confirmation
- Cache analysis results for performance
- Clear cache if working with many projects
```

---

## 🔧 Configuration Methods

### Method A: VS Code Settings

**File**: `.vscode/settings.json`

```json
{
  "[typescript]": {
    "editor.defaultFormatter": "ms-vscode.vscode-typescript-next"
  },
  "copilot.advanced": {
    "debug": true
  },
  "mcp": {
    "enabled": true,
    "servers": {
      "devinsight": {
        "command": "node",
        "args": ["./node_modules/devinsight-mcp/dist/server.js"],
        "disabled": false
      }
    }
  }
}
```

### Method B: Environment Variable

Set the MCP server path:

```bash
export DEVINSIGHT_MCP_PATH="/path/to/devinsight-mcp/dist/server.js"

# Then in .vscode/settings.json:
{
  "mcp.servers.devinsight.args": ["${DEVINSIGHT_MCP_PATH}"]
}
```

### Method C: GitHub Copilot Chat Commands

Create custom commands in `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+e",
    "command": "github.copilot.openSymbolFromEditor",
    "args": {
      "action": "analyzeError"
    }
  }
]
```

---

## 💡 Usage Patterns

### Pattern 1: Error Analysis in Chat

**User**: Pastes an error in Copilot Chat
**Copilot**: 
- Detects it's an error message
- Automatically calls `analyze_error`
- Returns analysis with fix suggestion
- Shows code example

### Pattern 2: Code Quality Review

**User**: "Review this code for unused functions"
**Copilot**:
- Calls `find_unused_code`
- Returns list of unused functions
- Shows confidence levels
- Suggests safe removals

### Pattern 3: Log Analysis

**User**: Pastes error log with multiple errors
**Copilot**:
- Calls `analyze_multiple_errors`
- Groups similar errors
- Suggests common patterns
- Provides consolidated fix strategy

### Pattern 4: Performance Optimization

**User**: "Optimize this project"
**Copilot**:
- Calls `find_unused_code` (find=M)
- Identifies dead code
- Suggests removal
- Offers refactoring alternatives

---

## 🔐 Multi-Project Setup

For teams using multiple projects, create a shared MCP launcher:

**File**: `~/.local/bin/devinsight-mcp`

```bash
#!/bin/bash
# Global DevInsight MCP launcher

DEVINSIGHT_PATH="${DEVINSIGHT_PATH:=$(npm root -g)/devinsight-mcp}"

if [ ! -f "$DEVINSIGHT_PATH/dist/server.js" ]; then
  echo "Error: DevInsight MCP not found at $DEVINSIGHT_PATH"
  echo "Install with: npm install -g devinsight-mcp"
  exit 1
fi

exec node "$DEVINSIGHT_PATH/dist/server.js"
```

Make it executable:
```bash
chmod +x ~/.local/bin/devinsight-mcp
```

Then reference in VS Code:
```json
{
  "mcp.servers.devinsight.command": "devinsight-mcp"
}
```

---

## 🛠️ Troubleshooting

### Issue: Copilot Can't Find MCP Server

**Solution**:
```bash
# Verify the server works standalone
node /path/to/devinsight-mcp/dist/server.js < /dev/null

# Check the binary exists
which node
npm root -g
```

### Issue: "Server does not support tools"

**Solution**: Ensure `.vscode/settings.json` has capabilities enabled:
```json
{
  "mcp.servers.devinsight": {
    "capabilities": {
      "tools": {}
    }
  }
}
```

### Issue: Cache Taking Too Much Memory

**Solution**: Clear cache periodically:
```bash
# Ask Copilot to clear cache
# Or manually:
npx devinsight-mcp --clear-cache
```

### Issue: Slow Analysis

**Solution**:
- Cache is enabled by default (should be <1ms for repeated errors)
- If slow, rebuild: `npm run build`
- Check: `node --version` (needs v18+)

---

## 📊 Recommended VS Code Setup

Complete workspace configuration (`.vscode/settings.json`):

```json
{
  "github.copilot.enable": {
    "*": true,
    "plaintext": false,
    "markdown": true
  },
  "mcp": {
    "enabled": true,
    "debug": false,
    "servers": {
      "devinsight": {
        "command": "node",
        "args": [
          "${workspaceFolder}/node_modules/devinsight-mcp/dist/server.js"
        ],
        "disabled": false,
        "env": {
          "NODE_OPTIONS": "--enable-source-maps"
        }
      }
    }
  },
  "[typescript]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  },
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## 🚀 Advanced: Monitor MCP Server

Monitor server health and usage:

```bash
# In one terminal, start the server with verbose logging:
DEBUG=* npm run dev

# In another terminal, test it:
curl -X POST http://localhost:3000/tools/list \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list","params":{}}'
```

---

## 📚 Example Copilot Chat Interactions

### Example 1: Error Explanation

```
User: > I got this error: "Cannot read property 'map' of undefined"

Copilot: I'll analyze that error for you...

[Uses analyze_error tool]

This error occurs when you're trying to call `.map()` on a value 
that is `undefined` or `null`. 

Root cause: The array/variable isn't being initialized before use.

Fix suggestion: Add a null check or use optional chaining

Example:
  // Before (error):
  users.map(u => u.name)
  
  // After (fixed):
  users?.map(u => u.name) || []
  
Confidence: HIGH - This is a very common pattern
```

### Example 2: Code Quality Review

```
User: > Find unused code in my project

Copilot: I'll scan your project...

[Uses find_unused_code tool]

Found 3 unused functions:
1. ✅ formatLegacy() - HIGH confidence, safe to remove
2. ⚠️ helperFunction() - MEDIUM confidence, verify usages
3. ❓ calculateTax() - LOW confidence, used dynamically

Recommendations:
- Remove formatLegacy() immediately
- Check helperFunction() references in comments/strings
- Keep calculateTax() if dynamically referenced
```

### Example 3: Batch Error Analysis

```
User: > Analyze these 5 errors from my logs
[pastes error logs]

Copilot: I'll analyze all of them...

[Uses analyze_multiple_errors tool]

Error Pattern Summary:
- 3x "Cannot read property of undefined" (fixable)
- 1x "TypeError: X is not a function" (check type)
- 1x "ReferenceError: Y is not defined" (import missing)

Most Common Fix: Add null checks and type guards
```

---

## ✅ Verification Checklist

Before using in a new project:

- [ ] DevInsight MCP installed globally or locally
- [ ] Built with `npm run build`
- [ ] `.vscode/settings.json` has MCP config
- [ ] `.copilot-instructions.md` created (optional but recommended)
- [ ] Copilot Chat is open in VS Code
- [ ] Server starts without errors: `node dist/server.js`
- [ ] Test with a simple error message in Copilot Chat

---

## 🔄 Update Workflow

Keep DevInsight updated:

```bash
# If globally installed:
npm install -g devinsight-mcp@latest

# If locally installed:
npm update devinsight-mcp

# Rebuild if needed:
npm run build
```

**Restart VS Code** after updating.

---

## 🤝 Next Steps

1. **Try it**: Use Copilot Chat to analyze an error
2. **Customize**: Create `.copilot-instructions.md` for your team's needs
3. **Monitor**: Check if tools are being called (enable debug mode)
4. **Optimize**: Collect usage patterns and adjust configuration
5. **Share**: Set up global installation for team use

For more info on MCP, see: [Model Context Protocol Documentation](https://modelcontextprotocol.io)
