@echo off
echo Starting Focus Cards Application...
echo ==================================
echo.

echo Starting Backend on port 8080...
start /B cmd /c "cd backend && uvicorn main:app --reload --port 8080"

timeout /t 3 /nobreak > nul

echo Starting Frontend on port 5174...
start /B cmd /c "cd frontend && npm run start:win"

echo.
echo ==================================
echo Application started successfully!
echo Frontend: http://localhost:5174
echo Backend API: http://localhost:8080
echo API Docs: http://localhost:8080/docs
echo ==================================
echo.
echo Press Ctrl+C to stop all services
pause