@echo off
setlocal

set "PORT=3000"
set "PROJECT_DIR=%~dp0"
set "LOG_FILE=%PROJECT_DIR%dev-server.log"

cd /d "%PROJECT_DIR%"

echo Starting PhotoPicture local server on port %PORT%...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port = %PORT%; " ^
  "$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }; " ^
  "if ($existing) { Write-Host ('Server already appears to be running on http://localhost:' + $port); Start-Process ('http://localhost:' + $port); exit 2 }"

if %errorlevel%==2 goto done

if exist "%LOG_FILE%" del "%LOG_FILE%"

start "PhotoPicture Server" /min cmd /c "npm run dev -- --port %PORT% > ""%LOG_FILE%"" 2>&1"

echo Waiting for the server to become ready...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url = 'http://localhost:%PORT%'; " ^
  "$ready = $false; " ^
  "for ($i = 0; $i -lt 40; $i++) { try { $response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 2; if ($response.StatusCode -eq 200) { $ready = $true; break } } catch { Start-Sleep -Seconds 1 } }; " ^
  "if ($ready) { Write-Host ('Ready: ' + $url); Start-Process $url; exit 0 } else { Write-Host 'Server did not become ready yet. Check dev-server.log for details.'; exit 1 }"

echo.
echo Log file: %LOG_FILE%
:done
pause
