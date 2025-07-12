# Start-Vendor.ps1
# Kill any existing processes on ports 4000 and 4001
$ports = @(4000, 4001)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process on port $port..."
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$rootDir = $PSScriptRoot | Split-Path -Parent

# Start Vendor backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\monorepo\apps\vendor'; npm install; npm run dev:server"
Start-Sleep -Seconds 3
# Start Vendor frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\monorepo\apps\vendor'; npm install; npm run dev"

Write-Host "Vendor Backend: http://localhost:4000"
Write-Host "Vendor Frontend: http://localhost:4001"
Write-Host "Default Vendor credentials: info@mazhandufamily.com / vendor123" 