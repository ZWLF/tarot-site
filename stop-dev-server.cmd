@echo off
setlocal
cd /d "%~dp0"

set "PORT=5173"

powershell -NoProfile -Command ^
  "$port = %PORT%; " ^
  "$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; " ^
  "if (-not $connections) { Write-Host ('No dev server is listening on port ' + $port + '.'); exit 0 }; " ^
  "$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique; " ^
  "foreach ($pid in $pids) { Write-Host ('Stopping dev server on port ' + $port + ' (PID ' + $pid + ')...'); Stop-Process -Id $pid -Force -ErrorAction Stop }; " ^
  "Write-Host 'Dev server stopped.'"
