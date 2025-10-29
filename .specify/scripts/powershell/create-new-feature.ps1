# SpecKit: Create New Feature Script
# Purpose: Create new feature branch and initialize spec files
# Usage: ./create-new-feature.ps1 -Number <N> -ShortName <name> [description...]

param(
    [Parameter(Mandatory=$true)]
    [int]$Number,
    
    [Parameter(Mandatory=$true)]
    [string]$ShortName,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Description,
    
    [switch]$Json
)

$ErrorActionPreference = "Stop"

# Format branch name
$branchName = "{0:D3}-{1}" -f $Number, $ShortName
$featureDir = "specs/$branchName"

# Check if branch already exists
$existingBranch = git rev-parse --verify $branchName 2>$null
if ($existingBranch) {
    Write-Error "Branch already exists: $branchName"
    exit 1
}

# Check if feature directory already exists
if (Test-Path $featureDir) {
    Write-Error "Feature directory already exists: $featureDir"
    exit 1
}

# Create feature directory
New-Item -ItemType Directory -Path $featureDir -Force | Out-Null

# Create spec.md from template
$specTemplate = ".specify/templates/spec-template.md"
if (-not (Test-Path $specTemplate)) {
    Write-Error "Spec template not found: $specTemplate"
    exit 1
}

$specContent = Get-Content $specTemplate -Raw
$specFile = "$featureDir/spec.md"
$descriptionText = $Description -join " "

# Basic template filling (simplified)
$specContent = $specContent -replace "\[FEATURE_NAME\]", $ShortName
$specContent = $specContent -replace "\[FEATURE_DESCRIPTION\]", $descriptionText
$specContent = $specContent -replace "\[BRANCH\]", $branchName
$specContent = $specContent -replace "\[DATE\]", (Get-Date -Format "yyyy-MM-dd")

Set-Content -Path $specFile -Value $specContent

# Create feature branch
git checkout -b $branchName | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create branch: $branchName"
    exit 1
}

# Stage and commit initial files
git add $featureDir | Out-Null
git commit -m "feat: initialize feature $branchName" | Out-Null

# Build JSON output
$output = @{
    BRANCH_NAME = $branchName
    FEATURE_DIR = (Resolve-Path $featureDir).Path
    SPEC_FILE = (Resolve-Path $specFile).Path
    SUCCESS = $true
}

if ($Json) {
    Write-Output ($output | ConvertTo-Json -Compress)
} else {
    Write-Output "Created feature branch: $branchName"
    Write-Output "Feature directory: $($output.FEATURE_DIR)"
    Write-Output "Spec file: $($output.SPEC_FILE)"
    Write-Output "Ready for specification with /speckit.specify"
}

exit 0
