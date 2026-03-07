@echo off
setlocal
cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=5173"

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
  "$projectDir = '%PROJECT_DIR%';" ^
  "$pidFile = '%PID_FILE%';" ^
  "$command = 'title Tarot Dev Server (%PORT%) && npm run dev -- --host %HOST% --port %PORT% --strictPort';" ^
  "$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', $command -WorkingDirectory $projectDir -PassThru;" ^
  "Set-Content -LiteralPath $pidFile -Value $proc.Id -Encoding Ascii"

if errorlevel 1 exit /b %errorlevel%

powershell -NoProfile -Command "Start-Sleep -Seconds 4"

if not "%NO_BROWSER%"=="1" start "" "http://%HOST%:%PORT%"
