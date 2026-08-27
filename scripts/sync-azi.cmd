@echo off
REM Dublu-click = commit-urile de azi ajung in daily note, cu commit local.
REM Vaultul ARE un remote (tewtzu-ctrl/brain, privat) - vezi sync-daily.ps1,
REM .DESCRIPTION. Scriptul asta doar comite local; push-ul spre remote e manual.
REM Fereastra ramane deschisa ca sa vezi ce s-a intamplat.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-daily.ps1" %*

echo.
echo ---
pause
