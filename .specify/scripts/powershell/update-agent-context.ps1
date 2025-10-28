# SpecKit: Update Agent Context Script
# Purpose: Update agent-specific context file (Claude, Windsurf, etc.) with plan tech stack
# Usage: ./update-agent-context.ps1 [-AgentType <type>] [-Json]

param(
    [ValidateSet("claude", "windsurf", "copilot", "auto")]
    [string]$AgentType = "auto",
    
    [switch]$Json
)

$ErrorActionPreference = "Stop"

# Detect agent type if auto
if ($AgentType -eq "auto") {
    # Try to detect from environment or use claude as default
    if ($env:WINDSURF_USER_ID) {
        $AgentType = "windsurf"
    } elseif ($env:COPILOT_ENABLED) {
        $AgentType = "copilot"
    } else {
        $AgentType = "claude"
    }
}

# Verify prerequisites
& ".specify/scripts/powershell/check-prerequisites.ps1" -Json | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Prerequisites check failed"
    exit 1
}

$prereqOutput = & ".specify/scripts/powershell/check-prerequisites.ps1" -Json
$prereq = $prereqOutput | ConvertFrom-Json

$featureDir = $prereq.FEATURE_DIR

# Map agent type to context file
$contextFileMap = @{
    "claude" = ".claude/claude-context.md"
    "windsurf" = ".windsurf/windsurf-context.md"
    "copilot" = ".github/copilot-instructions.md"
}

$contextFile = $contextFileMap[$AgentType]
if (-not $contextFile) {
    Write-Error "Unknown agent type: $AgentType"
    exit 1
}

# Check if context file exists, create if not
if (-not (Test-Path $contextFile)) {
    # Create agent-specific context template
    $contextDir = Split-Path $contextFile
    if (-not (Test-Path $contextDir)) {
        New-Item -ItemType Directory -Path $contextDir -Force | Out-Null
    }
    
    $template = @"
# $AgentType AI Context

This file provides context for $AgentType when working with this project.

## Feature: $($prereq.BRANCH)

**Feature Directory:** $featureDir

## Tech Stack & Dependencies

<!-- Agent-specific technology guidance goes here -->
<!-- Preserve manual additions between markers -->

[TECH_STACK_START]
<!-- Auto-generated tech stack will be inserted here -->
[TECH_STACK_END]

## Implementation Guidance

Review `/specs/$($prereq.BRANCH)/plan.md` for:
- Architecture decisions
- Data model
- Testing strategy
- Deployment notes
"@
    
    Set-Content -Path $contextFile -Value $template
}

# Extract tech stack from plan.md if it exists
$planFile = "$featureDir/plan.md"
$techStackSummary = ""

if (Test-Path $planFile) {
    $planContent = Get-Content $planFile -Raw
    
    # Try to extract Primary Dependencies section
    if ($planContent -match "Primary Dependencies:([^#]+)") {
        $techStackSummary = $matches[1].Trim()
    }
}

# Update context file with tech stack info
$contextContent = Get-Content $contextFile -Raw

if ($contextContent -match "\[TECH_STACK_START\].*?\[TECH_STACK_END\]" -and $techStackSummary) {
    $contextContent = $contextContent -replace `
        "\[TECH_STACK_START\].*?\[TECH_STACK_END\]", `
        "[TECH_STACK_START]`n$techStackSummary`n[TECH_STACK_END]"
    
    Set-Content -Path $contextFile -Value $contextContent
}

# Stage updated context
git add $contextFile 2>$null | Out-Null

$output = @{
    AGENT_TYPE = $AgentType
    CONTEXT_FILE = (Resolve-Path $contextFile -ErrorAction SilentlyContinue).Path
    FEATURE_BRANCH = $prereq.BRANCH
    FEATURE_DIR = $featureDir
    SUCCESS = $true
}

if ($Json) {
    Write-Output ($output | ConvertTo-Json -Compress)
} else {
    Write-Output "Updated $AgentType context: $contextFile"
    Write-Output "Feature: $($prereq.BRANCH)"
}

exit 0
