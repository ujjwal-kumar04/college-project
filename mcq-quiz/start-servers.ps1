# MCQ Quiz Portal - Development Server Starter
Write-Host "=== MCQ Quiz Portal Development Server ===" -ForegroundColor Green
Write-Host ""

# Get current directory
$ProjectDir = "c:\Users\ar912\OneDrive\Desktop\collegeProject\mcq-quiz"
Set-Location $ProjectDir

Write-Host "Project Directory: $ProjectDir" -ForegroundColor Yellow
Write-Host ""

# Kill existing Node.js processes
Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
try {
    taskkill /f /im node.exe 2>$null
    Write-Host "Existing processes stopped." -ForegroundColor Green
} catch {
    Write-Host "No existing processes found." -ForegroundColor Yellow
}

Start-Sleep -Seconds 2
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server (Port 5001)..." -ForegroundColor Cyan
$backendPath = Join-Path $ProjectDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

# Wait for backend
Start-Sleep -Seconds 8

# Start Frontend Server  
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
$frontendPath = Join-Path $ProjectDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm start" -WindowStyle Normal

# Wait for frontend
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== SERVERS STARTED SUCCESSFULLY ===" -ForegroundColor Green
Write-Host "Backend API: http://localhost:5001" -ForegroundColor Yellow
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Two terminal windows have opened:" -ForegroundColor Cyan
Write-Host "1. Backend Terminal (Port 5001)" -ForegroundColor White
Write-Host "2. Frontend Terminal (Port 3000)" -ForegroundColor White
Write-Host ""
Write-Host "To stop servers: Close the terminal windows or press Ctrl+C in each" -ForegroundColor Red
Write-Host ""

# Auto-open browser after 10 seconds
Write-Host "Opening browser in 10 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 10
Start-Process "http://localhost:3000"

Write-Host "Development environment is ready!" -ForegroundColor Green