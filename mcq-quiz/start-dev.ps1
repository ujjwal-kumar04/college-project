# McqQuiz Development Server Startup Script
Write-Host "Starting McqQuiz Development Servers..." -ForegroundColor Green
Write-Host ""

# Start MongoDB if not running
Write-Host "Checking MongoDB service..." -ForegroundColor Yellow
try {
    Get-Service MongoDB -ErrorAction Stop | Start-Service -ErrorAction SilentlyContinue
    Write-Host "MongoDB service started" -ForegroundColor Green
} catch {
    Write-Host "MongoDB service not found - please ensure MongoDB is installed" -ForegroundColor Red
}

Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")