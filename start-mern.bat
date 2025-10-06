@echo off
echo Starting MERN Stack Language Learning App...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

echo Node.js and npm are installed.
echo.

REM Setup backend if not already done
if not exist "server\node_modules" (
    echo Setting up backend dependencies...
    cd server
    npm install
    if not exist .env (
        copy .env.example .env
        echo Created .env file for backend
    )
    cd ..
    echo Backend setup complete.
    echo.
)

REM Setup frontend if not already done
if not exist "node_modules" (
    echo Setting up frontend dependencies...
    npm install
    echo Frontend setup complete.
    echo.
)

echo Starting services...
echo.

REM Start backend server in a new window
echo Starting backend server (Node.js/Express)...
start "Language Learning Backend" cmd /k "cd server && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend development server
echo Starting frontend server (React/Vite)...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5175 (or next available port)
echo.
echo Press Ctrl+C to stop the frontend server
echo Close the backend window to stop the backend server
echo.

npm run dev

echo.
echo Frontend server stopped.
echo Backend server is still running in the other window.
pause
