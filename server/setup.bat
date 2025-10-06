@echo off
echo Setting up Node.js Language Translation Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo npm is not installed or not in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
npm install

REM Copy environment file
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit .env file if needed
)

echo.
echo Setup complete!
echo.
echo To start the backend server, run:
echo   cd server
echo   npm start
echo.
echo For development with auto-reload:
echo   npm run dev
echo.
echo The server will be available at http://localhost:5000
echo Health check: http://localhost:5000/health
echo API documentation: http://localhost:5000/
pause
