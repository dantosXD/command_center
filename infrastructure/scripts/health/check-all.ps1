# Health check script for Command Center infrastructure
# Phase 2: T015 - Health check scripts (PowerShell variant)
# Run: .\infrastructure\scripts\health\check-all.ps1

param(
    [switch]$Verbose = $false
)

Write-Host "=== Command Center Infrastructure Health Check ===" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date)" -ForegroundColor DarkGray
Write-Host ""

$passed = 0
$failed = 0
$warnings = 0

function Test-Port {
    param(
        [string]$Server,
        [int]$Port,
        [int]$Timeout = 2000
    )

    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $asyncResult = $tcpClient.BeginConnect($Server, $Port, $null, $null)
    $wait = $asyncResult.AsyncWaitHandle.WaitOne($Timeout, $false)

    if ($wait) {
        try {
            $tcpClient.EndConnect($asyncResult)
            $tcpClient.Close()
            return $true
        }
        catch {
            return $false
        }
    }
    else {
        $tcpClient.Close()
        return $false
    }
}

function Test-HttpEndpoint {
    param(
        [string]$Url,
        [int]$ExpectedStatus = 200
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        return ($response.StatusCode -eq $ExpectedStatus)
    }
    catch {
        return $false
    }
}

function Check-Service {
    param(
        [string]$Name,
        [string]$Server = "localhost",
        [int]$Port,
        [string]$Url = $null
    )

    Write-Host -NoNewline "Checking $Name... "

    if ($Url) {
        if (Test-HttpEndpoint -Url $Url) {
            Write-Host "✓ OK" -ForegroundColor Green
            $script:passed++
        }
        else {
            Write-Host "✗ FAILED" -ForegroundColor Red
            $script:failed++
        }
    }
    else {
        if (Test-Port -Server $Server -Port $Port) {
            Write-Host "✓ OPEN" -ForegroundColor Green
            $script:passed++
        }
        else {
            Write-Host "✗ CLOSED" -ForegroundColor Red
            $script:failed++
        }
    }
}

Write-Host "=== Service Connectivity ===" -ForegroundColor Cyan
Check-Service "PostgreSQL" -Port 5432
Check-Service "PostgREST" -Port 3001
Check-Service "Supabase Auth" -Port 9999
Check-Service "Realtime" -Port 4000
Check-Service "SeaweedFS Master" -Port 9333
Check-Service "SeaweedFS Volume" -Port 8080
Check-Service "SeaweedFS S3" -Port 8333
Check-Service "Postal" -Port 25
Check-Service "Postal API" -Port 5000
Check-Service "Redis" -Port 6379
Check-Service "Prometheus" -Port 9090
Write-Host ""

Write-Host "=== Service Endpoints ===" -ForegroundColor Cyan
Check-Service "PostgREST health" -Url "http://localhost:3001/"
Check-Service "Supabase Auth health" -Url "http://localhost:9999/health"
Check-Service "Realtime health" -Url "http://localhost:4000/health"
Check-Service "Prometheus health" -Url "http://localhost:9090/-/healthy"
Write-Host ""

Write-Host "=== Docker Container Status ===" -ForegroundColor Cyan
try {
    $containers = docker ps --filter "name=command_center" --format "{{.Names}}`t{{.Status}}" 2>$null
    if ($containers) {
        Write-Host "Running containers:"
        $containers | ForEach-Object { Write-Host "  $_" }
    }
    else {
        Write-Host "No running Command Center containers found" -ForegroundColor Yellow
        $script:warnings++
    }
}
catch {
    Write-Host "Docker not available or not running" -ForegroundColor Yellow
    $script:warnings++
}
Write-Host ""

Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed:   $passed" -ForegroundColor Green
Write-Host "Failed:   $failed" -ForegroundColor $(if ($failed -gt 0) { 'Red' } else { 'Green' })
Write-Host "Warnings: $warnings" -ForegroundColor Yellow
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "✗ Some checks failed" -ForegroundColor Red
    exit 1
}
