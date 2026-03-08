@echo off
setlocal
cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=4173"

set "PROJECT_DIR=%cd%"
set "PID_FILE=%PROJECT_DIR%\.tarot-dev-server-%PORT%.pid"

powershell -NoProfile -Command ^
  "$port = %PORT%;" ^
  "$pidFile = '%PID_FILE%';" ^
  "$targets = New-Object System.Collections.Generic.List[int];" ^
  "if (Test-Path -LiteralPath $pidFile) {" ^
  "  $storedPid = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1;" ^
  "  if ($storedPid -and ($storedPid -as [int])) {" ^
  "    $process = Get-Process -Id ([int]$storedPid) -ErrorAction SilentlyContinue;" ^
  "    if ($process) { [void]$targets.Add([int]$storedPid) }" ^
  "  }" ^
  "}" ^
  "$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique;" ^
  "foreach ($listenerPid in $listeners) {" ^
  "  if ($listenerPid) { [void]$targets.Add([int]$listenerPid) }" ^
  "}" ^
  "$targets = $targets | Sort-Object -Unique;" ^
  "if (-not $targets) {" ^
  "  Remove-Item -LiteralPath $pidFile -ErrorAction SilentlyContinue;" ^
  "  Write-Host ('No dev server found on port {0}.' -f $port);" ^
  "  exit 0;" ^
  "}" ^
  "foreach ($targetPid in $targets) {" ^
  "  & taskkill.exe /PID $targetPid /T /F *> $null;" ^
  "}" ^
  "Remove-Item -LiteralPath $pidFile -ErrorAction SilentlyContinue;" ^
  "Write-Host ('Stopped Tarot dev server on port {0}. PIDs: {1}' -f $port, ($targets -join ', '))"

exit /b %errorlevel%
