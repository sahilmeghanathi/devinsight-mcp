# 🎯 Visual Quick Start Guide

## For Copilot Users: 3 Steps

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: Install DevInsight Globally (Do Once)         │
├─────────────────────────────────────────────────────────┤
│  Terminal:                                              │
│  $ npm install -g devinsight-mcp                        │
│                                                         │
│  Verify:                                                │
│  $ npm list -g devinsight-mcp                           │
│  ✓ devinsight-mcp@1.0.0                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Step 2: Configure Project (5 minutes per project)     │
├─────────────────────────────────────────────────────────┤
│  Option A - Automated (Linux/macOS):                   │
│  $ chmod +x setup-projects.sh                          │
│  $ ./setup-projects.sh ~/my-project                    │
│                                                         │
│  Option B - Manual:                                    │
│  1. Create .vscode/settings.json (copy template)       │
│  2. Create .copilot-instructions.md (copy template)    │
│  3. Restart VS Code                                    │
│                                                         │
│  Files created:                                        │
│  ✓ .vscode/settings.json                              │
│  ✓ .copilot-instructions.md                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Step 3: Use with Copilot (Try it now!)               │
├─────────────────────────────────────────────────────────┤
│  In VS Code:                                           │
│  1. Open Copilot Chat (Ctrl+Shift+I)                  │
│  2. Paste an error:                                    │
│     "Cannot read property 'map' of undefined"          │
│  3. Copilot analyzes it using DevInsight! ✨           │
│                                                         │
│  Result:                                               │
│  ✅ Error explanation                                  │
│  ✅ Root cause                                         │
│  ✅ Fix suggestion with code example                   │
│  ✅ Confidence level                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Multi-Project Setup Workflow

```
Project Structure:
├── my-project-1/
│   ├── .vscode/settings.json ◄── Auto-created
│   ├── .copilot-instructions.md ◄── Auto-created
│   └── src/
│
├── my-project-2/
│   ├── .vscode/settings.json ◄── Auto-created
│   ├── .copilot-instructions.md ◄── Auto-created
│   └── src/
│
└── my-project-3/
    ├── .vscode/settings.json ◄── Auto-created
    ├── .copilot-instructions.md ◄── Auto-created
    └── src/

Setup all at once:
$ ./setup-projects.sh ~/my-project-1 ~/my-project-2 ~/my-project-3

Or one by one:
$ ./setup-projects.sh ~/my-project-1
$ ./setup-projects.sh ~/my-project-2
$ ./setup-projects.sh ~/my-project-3
```

---

## Typical Copilot Interaction

```
┌─ VS Code - Copilot Chat ────────────────────────────┐
│                                                      │
│  User: I'm getting this error:                      │
│        TypeError: Cannot read property 'forEach'    │
│        of undefined                                 │
│                                                      │
│  🤖 Copilot (using DevInsight):                    │
│  I'll analyze that error for you...                 │
│                                                      │
│  **Error Analysis:**                                │
│  - **Type**: TypeError                              │
│  - **Issue**: Calling forEach on undefined          │
│  - **Cause**: Expected array is undefined           │
│                                                      │
│  **Fix suggestion:**                                │
│  ```javascript                                      │
│  // ❌ Causes error                                 │
│  const items = data.items.forEach(...)             │
│                                                      │
│  // ✅ Fixed                                        │
│  const items = data?.items?.forEach(...) || []     │
│  ```                                                │
│                                                      │
│  **Confidence**: HIGH                               │
│  This is a very common pattern!                     │
│                                                      │
│  Would you like me to help fix it?                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## File Layout After Setup

```
your-project/
│
├── .vscode/
│   └── settings.json ◄── MCP configuration
│       {
│         "mcp": {
│           "servers": {
│             "devinsight": {
│               "command": "node",
│               "args": ["$(npm root -g)/devinsight-mcp/dist/server.js"]
│             }
│           }
│         }
│       }
│
├── .copilot-instructions.md ◄── Copilot behaviors
│   Tools available:
│   - analyze_error
│   - find_unused_code
│   - analyze_multiple_errors
│   - clear_cache
│
├── src/
│   ├── index.ts
│   └── ...
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## What Each Tool Does

```
┌─────────────────────────────────────────────────────────┐
│ 1️⃣  analyze_error                                       │
├─────────────────────────────────────────────────────────┤
│ Input:  "Cannot read property 'map' of undefined"      │
│ Output: Root cause + fix + example + confidence        │
│ When:   User shows an error                            │
│ Result: ✅ Explains what went wrong & how to fix       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2️⃣  find_unused_code                                    │
├─────────────────────────────────────────────────────────┤
│ Input:  Project scan request                           │
│ Output: Unused functions, files, confidence levels     │
│ When:   Code review or refactoring                     │
│ Result: ✅ Identify dead code to remove               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3️⃣  analyze_multiple_errors                             │
├─────────────────────────────────────────────────────────┤
│ Input:  Array of error messages                        │
│ Output: Analysis for each error + patterns             │
│ When:   Processing logs or error stacks                │
│ Result: ✅ Understand multiple issues at once          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 4️⃣  clear_cache                                         │
├─────────────────────────────────────────────────────────┤
│ Input:  None                                           │
│ Output: Cache cleared notification                     │
│ When:   After long sessions                            │
│ Result: ✅ Free memory                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting Flowchart

```
Does Copilot recognize your error?
│
├─ NO
│  ├─ Check .vscode/settings.json exists
│  ├─ Verify path: npm root -g
│  └─ Restart VS Code
│
└─ YES ✅
   └─ DevInsight is working!
```

---

## Performance Timeline

```
Error Analysis Performance:

First call:
┌─────────────────────────┐
│ Regex compilation: 2ms  │
│ Pattern matching: 2ms   │
│ Analysis: 1ms           │
└─────────────────────────┘
Total: ~5ms

Second call (same error):
┌──┐
│<1ms (cached!)
└──┘
Total: <1ms

🎉 99% speed improvement on repeated errors!
```

---

## Success Checklist

```
After setup, verify:

[ ] DevInsight installed globally
    $ npm list -g devinsight-mcp
    
[ ] Project has .vscode/settings.json
    $ ls -la .vscode/settings.json
    
[ ] Project has .copilot-instructions.md
    $ ls -la .copilot-instructions.md
    
[ ] VS Code is restarted
    (closed and reopened)
    
[ ] Copilot Chat is open
    Ctrl+Shift+I (Windows/Linux)
    Cmd+Shift+I (macOS)
    
[ ] Test with a simple error
    Try: "Analyze: undefined is not a function"

✅ All checks pass? You're ready!
```

---

## Getting Help

```
Issue                           Solution
─────────────────────────────────────────────────────
Copilot can't find tools        Check .vscode/settings.json
Server not responding           npm list -g devinsight-mcp
Settings not loading            Restart VS Code completely
Path not found                  Run: npm root -g
Permission denied (setup)       chmod +x setup-projects.sh
```

---

## Next Steps

1. ✅ Follow the 3 Steps above
2. 📖 Read [COPILOT_SETUP.md](../COPILOT_SETUP.md) for advanced options
3. 🔧 Customize [.copilot-instructions.md](examples/vs-code-config/.copilot-instructions.md)
4. 🚀 Start analyzing errors with Copilot!
5. 💡 Share setup with your team

---

**Questions? See [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) for comprehensive docs.**
