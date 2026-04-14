# 🧠 DevInsight MCP

> 🚀 Developer Intelligence Tool for Error Debugging & Code Health Analysis

DevInsight MCP is a powerful developer-focused tool that helps you:

* 🧠 Understand and fix errors instantly
* 🔍 Detect unused code in your project
* ⚡ Improve code quality and maintainability

---

## 🚀 Features

### 🧠 Error Intelligence

* Detects and explains real-world errors
* Covers JavaScript, React, TypeScript, Network, SSR
* Provides:

  * Root cause
  * Fix suggestions
  * Code examples
  * Confidence level

---

### 🔍 Code Health Analysis

* Detects unused functions
* Identifies potentially unused files
* Helps reduce dead code
* Improves project maintainability

---

### ⚡ Developer Experience

* Simple CLI usage
* Fast analysis
* Structured JSON output
* Easy to integrate into workflows

---

### 🧩 Extensible Architecture

* Add new error rules easily
* Expand analysis capabilities
* MCP-ready design

---

## 📦 Installation

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
