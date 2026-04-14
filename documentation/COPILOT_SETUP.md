# Quick Start: DevInsight with GitHub Copilot

**5-minute setup for any project**

---

## Step 1: Install DevInsight MCP

```bash
# Option A: Global installation (recommended)
npm install -g /path/to/devinsight-mcp

# Option B: Per-project installation
npm install devinsight-mcp
```

Verify:
```bash
npm list -g devinsight-mcp
# Should show: devinsight-mcp@1.0.0
```

---

## Step 2: Configure Your VS Code Workspace

Go to your project root and create `.vscode/settings.json`:

```json
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
  }
}
```

**For local installation** (if you used Option B):
```json
{
  "mcp": {
    "enabled": true,
    "servers": {
      "devinsight": {
        "command": "node",
        "args": [
          "${workspaceFolder}/node_modules/devinsight-mcp/dist/server.js"
        ]
      }
    }
  }
}
```

---

## Step 3: Create Instructions File (Optional but Recommended)

Create `.copilot-instructions.md` in your project root:

```markdown
# DevInsight MCP Integration

You have access to DevInsight tools for:

1. **analyze_error** - Explain JavaScript/TypeScript errors
   - Root cause analysis
   - Fix suggestions with code examples

2. **find_unused_code** - Find dead code in the project
   - Unused functions
   - Unused files
   - Safe removal candidates

3. **analyze_multiple_errors** - Batch error analysis
   - Process multiple errors at once
   - Find patterns

## When to use

- **When user shows an error**: Automatically use analyze_error
- **When refactoring**: Offer to run find_unused_code
- **When analyzing logs**: Use analyze_multiple_errors

Be helpful and proactive!
```

---

## Step 4: Test It!

1. Open **Copilot Chat** in VS Code (Ctrl+Shift+I)
2. Paste an error:
   ```
   Cannot read property 'map' of undefined
   ```
3. Copilot will automatically analyze it using DevInsight!

---

## Multi-Project Example

If you have multiple projects and installed DevInsight globally:

**Project A** - `.vscode/settings.json`:
```json
{
  "mcp": {
    "servers": {
      "devinsight": {
        "command": "node",
        "args": ["$(npm root -g)/devinsight-mcp/dist/server.js"]
      }
    }
  }
}
```

**Project B** - Same file, same setup works!

Just copy `.vscode/settings.json` to any project.

---

## If It Doesn't Work

### Check 1: Is DevInsight installed?
```bash
npm list -g devinsight-mcp
```

### Check 2: Can you run the server?
```bash
node $(npm root -g)/devinsight-mcp/dist/server.js
# Press Ctrl+C to stop
```

### Check 3: Restart VS Code
Some Copilot features need a restart after config changes:
- Close VS Code completely
- Reopen it
- Open Copilot Chat again

### Check 4: Enable debug mode
In `.vscode/settings.json`:
```json
{
  "mcp": {
    "debug": true
  }
}
```
Look for logs in VS Code Output (View > Output > MCP)

---

## What You Can Now Do

✅ **Show Copilot an error** → It explains it with fix suggestions
✅ **Ask to review code** → It finds dead code
✅ **Paste error logs** → It analyzes multiple errors at once
✅ **Works in all projects** → No per-project setup needed (global install)

---

## Example: Error Analysis

**You**: 
> I'm getting this error: TypeError: Cannot read property 'users' of undefined

**Copilot** (using DevInsight):
> The error indicates you're trying to access the `users` property on an `undefined` object.
>
> **Root cause**: The object isn't being initialized before use
> 
> **Fix**: Use optional chaining or add a null check
> 
> ```javascript
> // Before ❌
> const users = data.users.map(u => u.name);
> 
> // After ✅
> const users = data?.users?.map(u => u.name) || [];
> ```
>
> **Confidence**: HIGH

---

## Next: Explore Advanced Features

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for:
- Team setup
- Custom commands
- Monitoring
- Troubleshooting

---

That's it! 🎉 You now have intelligent error analysis and code quality tools in every Copilot Chat.
