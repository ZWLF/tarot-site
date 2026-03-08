@echo off
setlocal
cd /d "%~dp0"

call "%~dp0start-dev-server.cmd" %*
