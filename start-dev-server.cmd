@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:5173 -TimeoutSec 1 ^| Out-Null; exit 0 } catch { exit 1 }"
if %errorlevel%==0 (
  start "" "http://localhost:5173"
  exit /b 0
)

start "Tarot Dev Server" cmd /k "cd /d ""%~dp0"" && npm run dev -- --host localhost --port 5173 --strictPort"
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"
