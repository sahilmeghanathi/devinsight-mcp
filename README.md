# 🧠 DevInsight MCP

> 🚀 Developer Intelligence Tool for Error Debugging & Code Health Analysis
> 
> **Now with full Model Context Protocol (MCP) support!**
>
> **Use with GitHub Copilot in any project** ✨

DevInsight MCP is a powerful developer-focused tool that helps you:

* 🧠 Understand and fix errors instantly
* 🔍 Detect unused code in your project
* ⚡ Improve code quality and maintainability
* 🔌 Integrate with AI assistants via MCP
* 💬 **Use with GitHub Copilot Chat across all projects**

---

## ⚡ Quick Setup (5 minutes)

### Install DevInsight Globally
```bash
npm install -g /path/to/devinsight-mcp
# or if published: npm install -g devinsight-mcp
```

### Configure Your Project
```bash
# Linux/macOS - Automated setup
chmod +x examples/setup-projects.sh
./examples/setup-projects.sh ~/my-project

# Windows - Manual copy
# Copy examples/vs-code-config/.vscode-settings.json to .vscode/settings.json
# Copy examples/vs-code-config/.copilot-instructions.md to your project root
```

### Start Using with Copilot
1. Open VS Code
2. Open Copilot Chat (Ctrl+Shift+I)
3. Paste an error: `Cannot read property 'map' of undefined`
4. Copilot will automatically analyze it! ✨

**See [COPILOT_SETUP.md](COPILOT_SETUP.md) for complete instructions**

---

## 🧠 Features

### 🔧 Error Intelligence
* Detects and explains 100+ error patterns
* Covers JavaScript, React, TypeScript, Network, SSR errors
* Provides:
  - Root cause analysis
  - Fix suggestions
  - Code examples
  - Confidence levels
* LRU caching for repeated errors (~99% faster)
* Regex pattern caching for ~67% speedup

### 🔍 Code Health Analysis
* Detects unused functions
* Identifies potentially unused files
* Helps reduce dead code
* Improves project maintainability

### 🔗 MCP Integration
The server exposes these tools via the Model Context Protocol:

- **`analyze_error`** - Analyzes single error message
- **`analyze_multiple_errors`** - Batch analyze errors
- **`find_unused_code`** - Scan project for dead code
- **`clear_cache`** - Clear internal caches

**Use with GitHub Copilot, Claude, or any MCP-compatible client!**

---

## 🧩 Extensible Architecture

* Add new error rules easily in `errorEngine.ts`
* Expand analysis capabilities
* MCP-ready design with proper schemas
* Optimized caching layer

---

## 📊 Performance

- **First error**: ~5ms (was 15ms)
- **Cached error**: <1ms (was 15ms)  
- **Improvement**: 67% faster, 99% faster for repeated
- **Memory**: ~50KB overhead for regex cache

See [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) for details.

---

## � Documentation & Guides

| Guide | Purpose |
|-------|---------|
| [COPILOT_SETUP.md](COPILOT_SETUP.md) | **🎯 Start here!** 5-minute GitHub Copilot setup |
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | Complete integration guide for all projects |
| [examples/README.md](examples/README.md) | Setup scripts & configuration examples |
| [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) | Performance details & technical info |

---

## 🧩 Extensible Architecture

* Add new error rules easily in `errorEngine.ts`
* Expand analysis capabilities
* MCP-ready design with proper schemas
* Optimized caching layer

---

## �📦 Installation

```bash
git clone https://github.com/your-username/devinsight-mcp.git
cd devinsight-mcp
npm install
```

---

## 🛠 Usage

### 🔍 Analyze Error

```bash
npx ts-node src/index.ts analyze-error "Cannot read properties of undefined (reading 'map')"
```

---

### 🔍 Find Unused Code

```bash
npx ts-node src/index.ts find-unused
```

---

### 🔥 Analyze Full Project

```bash
npx ts-node src/index.ts analyze-project "map is not a function"
```

---

## 📤 Example Output

### Error Analysis

```json
{
  "error": "Cannot read properties of undefined",
  "type": "TypeError",
  "cause": "Accessing property on undefined/null",
  "fix": "Use optional chaining",
  "example": "obj?.prop",
  "confidence": "high"
}
```

---

### Unused Code Detection

```json
{
  "unusedFunctions": [
    {
      "name": "oldHelper",
      "file": "utils.ts",
      "confidence": "high",
      "suggestion": "Safe to remove if not dynamically used"
    }
  ],
  "unusedFiles": [
    "temp.ts"
  ]
}
```

---

## 🧠 How It Works

### Error Engine

* Pattern-based rule matching
* Covers common real-world scenarios
* Returns structured insights

### Code Analyzer

* Uses AST parsing via `ts-morph`
* Tracks function references
* Detects unused functions and files

---

## 📚 Supported Error Categories

* 🟡 JavaScript (TypeError, ReferenceError, NaN, etc.)
* 🔵 React (hooks, re-renders, lifecycle issues)
* 🟢 TypeScript (type mismatches, null safety)
* 🌐 Network/API (fetch, axios, CORS, timeout)
* 🟣 SSR (Next.js hydration, window/document issues)
* ⚙️ Build tools (Vite, Webpack errors)

---

## ➕ Adding New Error Rules

```ts
{
  match: (e) => e.includes("your error"),
  insight: {
    type: "CustomError",
    cause: "Explain the issue",
    fix: "Provide a fix",
    example: "Optional example",
    confidence: "medium"
  }
}
```

---

## ⚠️ Limitations

* Rule-based system (no AI yet)
* Dynamic imports may affect unused detection
* Unknown errors fallback to generic response

---

## 🔮 Future Improvements

* 🤖 AI-powered error analysis fallback
* 📍 Stack trace parsing (file + line detection)
* 📊 Code health metrics dashboard
* 🔗 Full MCP server integration
* 🧪 Auto-fix suggestions

---

## 🧩 Use Cases

* Debugging production errors quickly
* Cleaning large codebases
* Improving code quality
* Assisting junior developers
* Integrating into CI/CD pipelines

---

## 👨‍💻 Author

Built to solve real-world developer problems and improve debugging workflows.

---

## ⭐ Why DevInsight MCP?

Debugging and maintaining code is time-consuming.

DevInsight helps you:

* ⚡ Debug faster
* 🧹 Keep code clean
* 📈 Improve productivity

---

## 📄 License

MIT
