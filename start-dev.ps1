$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "my-app"

Write-Host "Starting backend on http://127.0.0.1:5000 ..."

$backendIsRunning = $false
try {
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -TimeoutSec 2 | Out-Null
  $backendIsRunning = $true
} catch {
  $backendIsRunning = $false
}

if (-not $backendIsRunning) {
  $backendCommand = "Set-Location -LiteralPath '$($backend.Replace("'", "''"))'; npm.cmd start"
  Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $backendCommand) -WindowStyle Hidden
}

Start-Sleep -Seconds 2

try {
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -TimeoutSec 5 | Out-Null
  Write-Host "Backend is running."
} catch {
  Write-Host "Backend did not respond on http://127.0.0.1:5000."
  Write-Host "Run this in another terminal to see the backend error:"
  Write-Host "  cd backend; npm start"
  exit 1
}

Write-Host "Starting frontend on http://127.0.0.1:3000 ..."
Set-Location $frontend
npm.cmd run dev:next -- --hostname 127.0.0.1 --port 3000
