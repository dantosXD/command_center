# SpecKit: Check Prerequisites Script
# Purpose: Verify feature branch and documentation prerequisites
# Usage: ./check-prerequisites.ps1 [-Json] [-PathsOnly] [-RequireTasks] [-IncludeTasks]

param(
    [switch]$Json,
    [switch]$PathsOnly,
    [switch]$RequireTasks,
    [switch]$IncludeTasks
)

$ErrorActionPreference = "Stop"

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $branch) {
    Write-Error "Not a git repository"
    exit 1
}

# Extract feature number and short name from branch
# Expected format: NNN-short-name
$matches = $branch -match "^(\d+)-(.+)$"
if (-not $matches) {
    Write-Error "Branch name must follow format: NNN-short-name (e.g., 001-user-auth)"
    exit 1
}

$featureNumber = $matches[1]
$shortName = $matches[2]
$featureDir = "specs/$branch"

# Check if feature directory exists
if (-not (Test-Path $featureDir)) {
    Write-Error "Feature directory not found: $featureDir`nRun /speckit.specify first"
    exit 1
}

# Resolve to absolute path
$featureDir = (Resolve-Path $featureDir).Path

# Check required files
$specFile = "$featureDir/spec.md"
if (-not (Test-Path $specFile)) {
    Write-Error "Specification not found: $specFile"
    exit 1
}

# Check optional/required files based on flags
$implPlan = "$featureDir/plan.md"
$tasksFile = "$featureDir/tasks.md"
$availableDocs = @()

if (Test-Path $implPlan) {
    $availableDocs += "plan.md"
}

if (Test-Path $tasksFile) {
    $availableDocs += "tasks.md"
} elseif ($RequireTasks) {
    Write-Error "Tasks file required but not found: $tasksFile`nRun /speckit.tasks first"
    exit 1
}

if ($IncludeTasks -and (Test-Path $tasksFile)) {
    $availableDocs += "tasks.md"
}

# Build output
$output = @{
    BRANCH = $branch
    FEATURE_NUMBER = $featureNumber
    SHORT_NAME = $shortName
    FEATURE_DIR = $featureDir
    FEATURE_SPEC = $specFile
    IMPL_PLAN = $implPlan
    TASKS = if (Test-Path $tasksFile) { $tasksFile } else { $null }
    AVAILABLE_DOCS = $availableDocs
}

if ($Json) {
    if ($PathsOnly) {
        # Return minimal JSON with just paths
        $minimal = @{
            FEATURE_DIR = $output.FEATURE_DIR
            FEATURE_SPEC = $output.FEATURE_SPEC
            IMPL_PLAN = $output.IMPL_PLAN
            AVAILABLE_DOCS = $output.AVAILABLE_DOCS
        }
        Write-Output ($minimal | ConvertTo-Json -Compress)
    } else {
        Write-Output ($output | ConvertTo-Json -Compress)
    }
} else {
    Write-Output "Branch: $($output.BRANCH)"
    Write-Output "Feature Dir: $($output.FEATURE_DIR)"
    Write-Output "Spec File: $($output.FEATURE_SPEC)"
    if ($output.IMPL_PLAN) {
        Write-Output "Plan File: $($output.IMPL_PLAN)"
    }
    if ($output.TASKS) {
        Write-Output "Tasks File: $($output.TASKS)"
    }
    Write-Output "Available Docs: $($output.AVAILABLE_DOCS -join ', ')"
}

exit 0
