# 📖 How to Use DevInsight MCP with GitHub Copilot

## TL;DR - 3 Steps, 5 Minutes

```bash
# 1. Install globally (once)
npm install -g /path/to/devinsight-mcp

# 2. Setup your project
chmod +x examples/setup-projects.sh
./examples/setup-projects.sh ~/your-project

# 3. Reload VS Code and test in Copilot Chat ✨
```

---

## 🎯 For Every Use Case

### 👤 Single Developer, Multiple Projects
```
1. npm install -g devinsight-mcp
2. ./setup-projects.sh ~/project1 ~/project2 ~/project3  
3. Open any project → Copilot works with DevInsight
```

### 👥 Team Collaboration
```
1. Add to repository:
   - .vscode/settings.json
   - .copilot-instructions.md
2. Everyone clones → Everyone has it!
```

### 🏢 Enterprise/DevOps
```
1. npm install -g devinsight-mcp (on dev machines)
2. Verify: npm list -g devinsight-mcp
3. Project configs reference global install
```

### 🤖 Other AI Tools
```
npm run server
# Runs MCP server on stdio
# Connect Claude, other tools, etc.
```

---

## 📖 Documentation Files

Read in this order:

1. **[QUICK_VISUAL_GUIDE.md](QUICK_VISUAL_GUIDE.md)** ← **START HERE**
   - Flowcharts and diagrams
   - Simple visual explanations
   - 5 minutes

2. **[COPILOT_SETUP.md](COPILOT_SETUP.md)**
   - Step-by-step instructions
   - Copy-paste configuration
   - 5-10 minutes

3. **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)**
   - Complete reference guide
   - Advanced configurations
   - Team setup examples
   - Troubleshooting
   - 30 minutes

4. **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)**
   - Feature overview
   - Success checklist
   - Next steps
   - 10 minutes

---

## 🔧 Setup Scripts

### Linux/macOS
```bash
chmod +x examples/setup-projects.sh
./examples/setup-projects.sh ~/project1 ~/project2 ~/project3
```

### Windows
```powershell
.\examples\setup-projects.ps1 'C:\project1' 'C:\project2'
```

### Manual (Any OS)
```bash
# Copy two files to each project:
cp examples/vs-code-config/.vscode-settings.json YOUR_PROJECT/.vscode/settings.json
cp examples/vs-code-config/.copilot-instructions.md YOUR_PROJECT/.copilot-instructions.md
```

---

## 💡 Use in Copilot Chat

### ✨ When You Have an Error
```
You: I'm getting "Cannot read property 'map' of undefined"

Copilot (using DevInsight):
✓ Error explanation
✓ Root cause analysis
✓ Fix suggestion with code example
✓ Confidence level
```

### 🧹 When Refactoring Code
```
You: "Find unused code in my project"

Copilot (using DevInsight):
✓ Lists unused functions
✓ Identifies unused files
✓ Shows confidence levels
✓ Recommends what's safe to remove
```

### 📋 When Analyzing Logs
```
You: [pastes error log with 5 errors]

Copilot (using DevInsight):
✓ Analyzes all errors
✓ Groups by pattern
✓ Shows consolidated insights
```

---

## 🚀 What's Inside

### Documentation (8 files)
- **QUICK_VISUAL_GUIDE.md** - Visual learner guide
- **COPILOT_SETUP.md** - 5-min practical guide
- **INTEGRATION_GUIDE.md** - Complete reference
- **SETUP_COMPLETE.md** - Summary & checklist
- **OPTIMIZATION_REPORT.md** - Technical details
- **README.md** - Project overview
- **examples/README.md** - Setup script guide
- **THIS FILE** - Quick reference

### Setup Examples (3 files)
- **examples/setup-projects.sh** - Linux/Mac automation
- **examples/setup-projects.ps1** - Windows automation
- **examples/vs-code-config/** - Configuration templates

### Source Code
- MCP server: `src/server.ts`
- Error analysis: `src/core/errorEngine.ts`
- Caching layer: `src/core/errorCache.ts`
- Code analysis: `src/core/codeAnalyzer.ts`

---

## 📊 Performance

- **First error analysis**: ~5ms (optimized!)
- **Cached error**: <1ms (lightning fast!)
- **Improvement vs original**: 67% faster, 99% for repeat
- **Memory**: Minimal (~50KB cache overhead)

---

## ✅ Verify It Works

```bash
# 1. Check installation
npm list -g devinsight-mcp
# Should show: devinsight-mcp@1.0.0 ✓

# 2. Test the server
node $(npm root -g)/devinsight-mcp/dist/server.js < /dev/null
# Should respond with: [DevInsight MCP] Server started ✓

# 3. In VS Code
# - Open Copilot Chat (Ctrl+Shift+I)
# - Paste: "Cannot read property 'map' of undefined"
# - Copilot should analyze it ✓
```

---

## 🤔 Common Questions

**Q: Do I need to install DevInsight in every project?**
A: No! Install globally once with `npm install -g`. Projects just reference it.

**Q: Does this work offline?**
A: Yes! The MCP server runs locally. No cloud calls.

**Q: Can I use with other AI tools?**
A: Yes! Any MCP-compatible tool works. Run `npm run server`.

**Q: How do I customize Copilot's behavior?**
A: Edit `.copilot-instructions.md` in your project.

**Q: Will this slow down Copilot?**
A: No! Results are cached (~99% faster for repeated prompts).

---

## 🎯 What You Can Do Now

✅ **Analyze errors instantly** - Show Copilot an error, get debugged
✅ **Find dead code** - Clean up unused functions and files
✅ **Process logs** - Batch analyze multiple errors at once
✅ **Work offline** - No internet required
✅ **Multi-project** - Works across all your projects
✅ **Team-friendly** - Easy to share configuration
✅ **Extensible** - Add custom error patterns

---

## 🚀 Next Steps

### Choose Your Learning Path:

**🎨 Visual Learner?**
→ Read [QUICK_VISUAL_GUIDE.md](QUICK_VISUAL_GUIDE.md) (5 min)

**📝 Practical Learner?**
→ Read [COPILOT_SETUP.md](COPILOT_SETUP.md) (5 min)

**🔬 Technical Learner?**
→ Read [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) (30 min)

**✅ Just Want to Start?**
→ Run this:
```bash
npm install -g /path/to/devinsight-mcp
chmod +x examples/setup-projects.sh
./examples/setup-projects.sh ~/your-project
# Restart VS Code and test in Copilot Chat!
```

---

## 📞 Get Help

| Question | Answer |
|----------|--------|
| How do I set up? | [COPILOT_SETUP.md](COPILOT_SETUP.md) |
| How do I use it? | [QUICK_VISUAL_GUIDE.md](QUICK_VISUAL_GUIDE.md) |
| What if it doesn't work? | [INTEGRATION_GUIDE.md § Troubleshooting](INTEGRATION_GUIDE.md#troubleshooting) |
| Tell me everything | [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) |

---

## 🎉 You're Ready!

1. Read one of the guides above
2. Follow the setup steps
3. Test with an error message
4. Share with your team!

**Questions?** Check the docs or see Troubleshooting section in [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md).

Happy debugging! 🚀
