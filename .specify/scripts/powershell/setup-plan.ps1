# SpecKit: Setup Plan Script
# Purpose: Initialize plan.md from template and prepare for planning workflow
# Usage: ./setup-plan.ps1 [-Json]

param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

# Verify prerequisites
& ".specify/scripts/powershell/check-prerequisites.ps1" -Json | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Prerequisites check failed"
    exit 1
}

# Get feature context
$prereqOutput = & ".specify/scripts/powershell/check-prerequisites.ps1" -Json
$prereq = $prereqOutput | ConvertFrom-Json

$featureDir = $prereq.FEATURE_DIR
$specFile = $prereq.FEATURE_SPEC

# Check if plan already exists
$planFile = "$featureDir/plan.md"
if (Test-Path $planFile) {
    if ($Json) {
        $output = @{
            PLAN_EXISTS = $true
            FEATURE_DIR = $featureDir
            IMPL_PLAN = $planFile
            SPECS_DIR = (Split-Path $featureDir)
            BRANCH = $prereq.BRANCH
            WARNING = "Plan file already exists; running speckit.plan will update it"
        }
        Write-Output ($output | ConvertTo-Json -Compress)
    } else {
        Write-Output "Plan file already exists: $planFile"
        Write-Output "Running /speckit.plan will update it"
    }
    exit 0
}

# Load plan template
$planTemplate = ".specify/templates/plan-template.md"
if (-not (Test-Path $planTemplate)) {
    Write-Error "Plan template not found: $planTemplate"
    exit 1
}

$planContent = Get-Content $planTemplate -Raw

# Basic template filling
$planContent = $planContent -replace "\[FEATURE_BRANCH\]", $prereq.BRANCH
$planContent = $planContent -replace "\[DATE\]", (Get-Date -Format "yyyy-MM-dd")
$planContent = $planContent -replace "\[SPEC_LINK\]", "spec.md"

# Create plan file
Set-Content -Path $planFile -Value $planContent

# Stage new plan
git add $planFile | Out-Null

# Build output
$output = @{
    FEATURE_DIR = $featureDir
    FEATURE_SPEC = $specFile
    IMPL_PLAN = $planFile
    SPECS_DIR = (Split-Path $featureDir)
    BRANCH = $prereq.BRANCH
    AVAILABLE_DOCS = @("spec.md", "plan.md")
}

if ($Json) {
    Write-Output ($output | ConvertTo-Json -Compress)
} else {
    Write-Output "Plan initialized: $planFile"
    Write-Output "Ready for planning with /speckit.plan"
}

exit 0
