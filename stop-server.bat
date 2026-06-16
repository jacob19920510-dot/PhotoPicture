@echo off
setlocal

set "PORT=3000"
set "PROJECT_DIR=%~dp0"

echo Stopping PhotoPicture local server on port %PORT%...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port = %PORT%; " ^
  "$owners = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -ne 0 } | Select-Object -ExpandProperty OwningProcess -Unique; " ^
  "foreach ($owner in $owners) { try { Stop-Process -Id $owner -Force -ErrorAction Stop; Write-Host ('Stopped process ' + $owner) } catch { Write-Host ('Could not stop process ' + $owner + ': ' + $_.Exception.Message) } }; " ^
  "$project = (Resolve-Path '%PROJECT_DIR%').Path; " ^
  "$nodeProcesses = Get-CimInstance Win32_Process -Filter \"name = 'node.exe'\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*next dev*' -and $_.CommandLine -like ('*' + $project + '*') }; " ^
  "foreach ($proc in $nodeProcesses) { try { Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop; Write-Host ('Stopped Next dev process ' + $proc.ProcessId) } catch { Write-Host ('Could not stop Next dev process ' + $proc.ProcessId + ': ' + $_.Exception.Message) } }; " ^
  "if (-not $owners -and -not $nodeProcesses) { Write-Host 'No running local server was found.' }"

echo Done.
pause
