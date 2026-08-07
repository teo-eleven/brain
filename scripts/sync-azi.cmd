@echo off
REM Dublu-click = commit-urile de azi ajung in daily note si se urca pe GitHub.
REM Fereastra ramane deschisa ca sa vezi ce s-a intamplat.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-daily.ps1" %*

echo.
echo ---
pause
