#!/bin/bash
# Windows setup script for DevInsight MCP with GitHub Copilot

Write-Host "🧠 DevInsight MCP - Windows Setup" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org" -ForegroundColor Blue
    exit 1
}
Write-Host "✓ Node.js $(node --version)" -ForegroundColor Green

# Function to setup a project
function Setup-Project {
    param(
        [string]$ProjectPath
    )
    
    $ProjectName = Split-Path -Leaf $ProjectPath
    Write-Host ""
    Write-Host "Setting up: $ProjectName" -ForegroundColor Cyan
    
    if (-not (Test-Path $ProjectPath)) {
        Write-Host "❌ Directory not found: $ProjectPath" -ForegroundColor Red
        return $false
    }
    
    # Create .vscode directory
    $vscodePath = Join-Path $ProjectPath ".vscode"
    New-Item -ItemType Directory -Path $vscodePath -Force | Out-Null
    
    # Create settings.json
    $settingsPath = Join-Path $vscodePath "settings.json"
    if (-not (Test-Path $settingsPath)) {
        $settings = @{
            mcp = @{
                enabled = $true
                servers = @{
                    devinsight = @{
                        command = "node"
                        args = @("$(npm root -g)/devinsight-mcp/dist/server.js")
                    }
                }
            }
            "github.copilot.enable" = @{
                "*" = $true
                plaintext = $false
                markdown = $true
            }
        } | ConvertTo-Json -Depth 10
        
        Set-Content -Path $settingsPath -Value $settings
        Write-Host "✓ Created .vscode/settings.json" -ForegroundColor Green
    } else {
        Write-Host "⚠ .vscode/settings.json already exists" -ForegroundColor Yellow
    }
    
    # Create .copilot-instructions.md
    $instructionsPath = Join-Path $ProjectPath ".copilot-instructions.md"
    if (-not (Test-Path $instructionsPath)) {
        $instructions = @"
# DevInsight MCP Integration

You have access to DevInsight tools:

- **analyze_error** - Explain JavaScript/TypeScript errors
- **find_unused_code** - Find dead code
- **analyze_multiple_errors** - Batch analyze errors
- **clear_cache** - Clear caches

## When to use

- Error shown → Use analyze_error
- Refactoring → Offer find_unused_code  
- Multiple errors → Use analyze_multiple_errors

Be proactive!
"@
        Set-Content -Path $instructionsPath -Value $instructions
        Write-Host "✓ Created .copilot-instructions.md" -ForegroundColor Green
    } else {
        Write-Host "⚠ .copilot-instructions.md already exists" -ForegroundColor Yellow
    }
    
    Write-Host "✓ $ProjectName is set up!" -ForegroundColor Green
    return $true
}

# Check if paths provided
if ($args.Count -eq 0) {
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-projects.ps1 -ProjectPaths 'C:\path\to\project1' 'C:\path\to\project2'"
    Write-Host ""
    Write-Host "Or in PowerShell:" -ForegroundColor Blue
    Write-Host "  Setup-Projects -ProjectPaths 'C:\my-project'"
    Write-Host ""
    Write-Host "What this does:" -ForegroundColor Cyan
    Write-Host "  1. Creates .vscode/settings.json with MCP config"
    Write-Host "  2. Creates .copilot-instructions.md for Copilot"
    Write-Host "  3. Enables DevInsight tools in your project"
    exit 0
}

# Check DevInsight installation
Write-Host ""
Write-Host "Checking DevInsight MCP installation..." -ForegroundColor Yellow

try {
    $npmRoot = npm root -g
    $devinsightPath = Join-Path $npmRoot "devinsight-mcp" "dist" "server.js"
    
    if (-not (Test-Path $devinsightPath)) {
        Write-Host "❌ DevInsight MCP not found globally" -ForegroundColor Red
        Write-Host "Install it first:" -ForegroundColor Blue
        Write-Host "  npm install -g C:\path\to\devinsight-mcp" -ForegroundColor Cyan
        exit 1
    }
    
    Write-Host "✓ Found DevInsight at: $devinsightPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking npm: $_" -ForegroundColor Red
    exit 1
}

# Setup all projects
$successCount = 0
$failCount = 0

foreach ($path in $args) {
    if (Setup-Project -ProjectPath $path) {
        $successCount++
    } else {
        $failCount++
    }
}

# Summary
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Successfully setup: $successCount projects" -ForegroundColor Green

if ($failCount -gt 0) {
    Write-Host "Failed: $failCount projects" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open each project in VS Code"
Write-Host "  2. Restart VS Code (Ctrl+Shift+P > Reload Window)"
Write-Host "  3. Open Copilot Chat (Ctrl+Shift+I)"
Write-Host "  4. Try: 'Analyze this: Cannot read property map of undefined'"
Write-Host ""
Write-Host "🎉 DevInsight is ready!" -ForegroundColor Green
