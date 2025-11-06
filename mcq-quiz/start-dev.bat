@echo off
echo Starting McqQuiz Development Servers...
echo.

echo Starting MongoDB (if not running)...
net start MongoDB 2>nul
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
pause