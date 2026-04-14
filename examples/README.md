# 📦 DevInsight MCP Examples

This directory contains example configurations and setup scripts for using DevInsight MCP with GitHub Copilot.

## 📁 Contents

### `vs-code-config/`
Example VS Code configuration files for DevInsight integration.

- **`.vscode-settings.json`** - Copy to `.vscode/settings.json` in your project
- **`.copilot-instructions.md`** - Copy to project root as `.copilot-instructions.md`

### `setup-projects.sh`
**Linux/macOS** - Automated setup script for multiple projects.

```bash
# Executable
chmod +x setup-projects.sh

# Setup single project
./setup-projects.sh ~/my-project

# Setup multiple projects
./setup-projects.sh ~/project1 ~/project2 ~/project3

# Setup all projects in a directory
./setup-projects.sh ~/projects/*/
```

### `setup-projects.ps1`
**Windows** - PowerShell setup script for multiple projects.

```powershell
# In PowerShell:
.\setup-projects.ps1 -ProjectPaths 'C:\my-project', 'C:\another-project'
```

## 🚀 Quick Start

### Option 1: Manual Setup (Any OS)

1. In your project, create `.vscode/settings.json`:
```json
{
  "mcp": {
    "enabled": true,
    "servers": {
      "devinsight": {
        "command": "node",
        "args": ["$(npm root -g)/devinsight-mcp/dist/server.js"]
      }
    }
  }
}
```

2. Create `.copilot-instructions.md` - Copy from `vs-code-config/.copilot-instructions.md`

3. Restart VS Code and test!

### Option 2: Automated Setup

**Linux/macOS:**
```bash
chmod +x examples/setup-projects.sh
./examples/setup-projects.sh ~/project1 ~/project2
```

**Windows (PowerShell):**
```powershell
.\examples\setup-projects.ps1 'C:\project1' 'C:\project2'
```

## 📖 Documentation

- **[COPILOT_SETUP.md](../COPILOT_SETUP.md)** - 5-minute quick start
- **[INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)** - Complete integration guide
- **[README.md](../README.md)** - Project overview

## 🔗 Typical Project Structure After Setup

```
my-project/
├── .vscode/
│   └── settings.json           ← MCP configuration
├── .copilot-instructions.md    ← Copilot behaviors
├── src/
│   └── ...
└── package.json
```

## ✓ Verification

After setup, verify everything works:

1. Open project in VS Code
2. Open Copilot Chat (Ctrl+Shift+I or Cmd+Shift+I)
3. Try: `Analyze this error: Cannot read property 'map' of undefined`
4. Copilot should use DevInsight to explain the error

## 🆘 Troubleshooting

### Setup script permission denied
```bash
chmod +x examples/setup-projects.sh
```

### DevInsight not found
```bash
# Verify global installation
npm list -g devinsight-mcp

# If not installed:
npm install -g /path/to/devinsight-mcp
```

### Copilot can't find MCP  
1. Check `.vscode/settings.json` exists
2. Verify path is correct: `npm root -g`
3. Restart VS Code completely
4. Check MCP debug output: Check `"mcp": { "debug": true }` in settings

## 📝 Customization

Edit `.copilot-instructions.md` to customize Copilot's behavior:
- Add project-specific rules
- Define code standards
- Specify tool preferences
- Add team guidelines

## 🤝 Contributing

Have improvements? Open an issue or PR!

## 📚 More Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [GitHub Copilot Docs](https://github.com/features/copilot)
- [DevInsight GitHub](https://github.com/yourusername/devinsight-mcp)
