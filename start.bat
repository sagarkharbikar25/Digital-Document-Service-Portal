@echo off
title JDCOEM College Portal - Launcher
color 0B

echo ============================================================
echo   JDCOEM College Portal - V2 Full-Stack Development Server
echo ============================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js (v18 or higher) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
npm -v
echo.

:: 2. Ensure environment configuration (.env) exists in backend
if not exist "%~dp0backend\.env" (
    if exist "%~dp0backend\.env.example" (
        echo [INFO] Generating backend\.env from .env.example...
        copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    )
)

:: 3. Ensure dependencies are installed in Backend
if not exist "%~dp0backend\node_modules" (
    echo [INFO] Backend node_modules not found. Installing backend dependencies...
    cd /d "%~dp0backend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend npm install failed!
        pause
        exit /b 1
    )
)

:: 4. Ensure dependencies are installed in Frontend
if not exist "%~dp0frontend\node_modules" (
    echo [INFO] Frontend node_modules not found. Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend npm install failed!
        pause
        exit /b 1
    )
)

echo.
echo ============================================================
echo   Starting Backend and Frontend Services...
echo ============================================================
echo.

:: 5. Start Backend API in a separate Command Prompt window
echo [1/2] Launching Backend API on http://localhost:4000 ...
start "JDCOEM V2 - Backend API (Port 4000)" cmd /k "cd /d \"%~dp0backend\" && npm run dev"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

:: 6. Start Frontend Vite in a separate Command Prompt window
echo [2/2] Launching Frontend UI on http://localhost:5173 ...
start "JDCOEM V2 - Frontend UI (Port 5173)" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

:: Wait 3 seconds then launch default browser
timeout /t 3 /nobreak >nul
echo.
echo [INFO] Opening http://localhost:5173 in your default browser...
start http://localhost:5173

echo.
echo ============================================================
echo   All services are up and running!
echo ============================================================
echo   - Frontend Portal:  http://localhost:5173
echo   - Backend API:      http://localhost:4000
echo   - Health Check:     http://localhost:4000/health
echo.
echo   [Demo Credentials for Testing]
echo   - Student:   aarav.sharma@jdcoem.ac.in (or BT240076CS) | OTP: 123456
echo   - Clerk:     http://localhost:5173/admin/clerk
echo   - HOD:       http://localhost:5173/admin/hod
echo   - Principal: http://localhost:5173/admin/principal
echo   - Verify:    http://localhost:5173/verify
echo.
echo   To stop the servers, simply close the respective terminal windows.
echo ============================================================
echo.
pause
