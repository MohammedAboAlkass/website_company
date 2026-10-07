@echo off
title Almel Association - Web & Control Panel
cd /d "%~dp0"

echo ========================================================
echo   Starting Almel Association System
echo ========================================================
echo.

echo [1/3] Checking MySQL / MariaDB...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL is already running.
) else (
    echo Starting MySQL (M:\xamp\mysql)...
    start "" /B "M:\xamp\mysql\bin\mysqld.exe" --defaults-file="M:\xamp\mysql\bin\my.ini" --standalone
    timeout /t 3 /nobreak >nul
)

echo [2/3] Configuring Environment...
set "PATH=C:\dev\php;C:\composer;%PATH%"

echo.
echo ========================================================
echo   Website URL:      http://127.0.0.1:8000
echo   Admin Dashboard:  http://127.0.0.1:8000/admin
echo.
echo   Admin Login:
echo   - Email:          admin@shamal-society.org
echo   - Password:       password
echo ========================================================
echo.

php artisan serve --host=127.0.0.1 --port=8000 --no-reload
pause
