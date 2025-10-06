@echo off
echo Setting up Language Translation Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt

echo.
echo Setup complete!
echo.
echo To start the backend server, run:
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python app.py
echo.
echo The server will be available at http://localhost:5000
pause
