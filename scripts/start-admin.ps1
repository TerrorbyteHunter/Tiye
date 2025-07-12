# Start-Admin.ps1
# Kill any existing processes on ports 3002 and 5174
$ports = @(3002, 5174)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process on port $port..."
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$rootDir = $PSScriptRoot | Split-Path -Parent

# Start Admin backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\monorepo\apps\admin'; npm install; npm run dev:server"
Start-Sleep -Seconds 3
# Start Admin frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\monorepo\apps\admin'; npm install; npm run dev"

Write-Host "Admin Backend: http://localhost:3002"
Write-Host "Admin Frontend: http://localhost:5174"
Write-Host "Default Admin credentials: admin / admin123" 