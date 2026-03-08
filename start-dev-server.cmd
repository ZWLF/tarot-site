@echo off
setlocal
cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=4173"

set "HOST=localhost"
set "PROJECT_DIR=%cd%"
set "PID_FILE=%PROJECT_DIR%\.tarot-dev-server-%PORT%.pid"
set "NO_BROWSER=%TAROT_NO_BROWSER%"

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing http://%HOST%:%PORT% -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
if %errorlevel%==0 (
  if not "%NO_BROWSER%"=="1" start "" "http://%HOST%:%PORT%"
  exit /b 0
)

if exist "%PID_FILE%" (
  del "%PID_FILE%" >nul 2>&1
)

powershell -NoProfile -Command ^
  "$port = %PORT%;" ^
  "$listener = $null;" ^
  "try {" ^
  "  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port);" ^
  "  $listener.Start();" ^
  "  $listener.Stop();" ^
  "} catch {" ^
  "  if ($listener) { try { $listener.Stop() } catch {} }" ^
  "  Write-Host ('Port {0} is not available on this machine. Try a different port, for example: start-dev-server.cmd 4173' -f $port);" ^
  "  exit 1;" ^
  "}"
if errorlevel 1 exit /b %errorlevel%

powershell -NoProfile -Command ^
  "$projectDir = '%PROJECT_DIR%';" ^
  "$pidFile = '%PID_FILE%';" ^
  "$windowTitle = 'Tarot Dev Server (%PORT%)';" ^
  "$command = 'title ' + $windowTitle + ' && npm run dev -- --host %HOST% --port %PORT% --strictPort';" ^
  "$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', $command -WorkingDirectory $projectDir -PassThru;" ^
  "Set-Content -LiteralPath $pidFile -Value $proc.Id -Encoding Ascii"

if errorlevel 1 exit /b %errorlevel%

powershell -NoProfile -Command ^
  "$hostName = '%HOST%';" ^
  "$port = %PORT%;" ^
  "$ready = $false;" ^
  "for ($attempt = 0; $attempt -lt 20; $attempt += 1) {" ^
  "  try {" ^
  "    Invoke-WebRequest -UseBasicParsing ('http://{0}:{1}' -f $hostName, $port) -TimeoutSec 1 | Out-Null;" ^
  "    $ready = $true;" ^
  "    break;" ^
  "  } catch {" ^
  "    Start-Sleep -Milliseconds 500;" ^
  "  }" ^
  "}" ^
  "if (-not $ready) {" ^
  "  Write-Host ('Dev server did not become ready on http://{0}:{1}. Check the Tarot Dev Server window for details.' -f $hostName, $port);" ^
  "  exit 1;" ^
  "}"
if errorlevel 1 exit /b %errorlevel%

if not "%NO_BROWSER%"=="1" start "" "http://%HOST%:%PORT%"
