# Start-User.ps1
# Kill any existing process on port 5173
$ports = @(5173)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process on port $port..."
        Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$rootDir = $PSScriptRoot | Split-Path -Parent

# Start User Backend (User Server)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\monorepo\apps\user'; npm install; npm run dev:server"
Write-Host "User Backend API: http://localhost:4001 (or as configured)"

# Start User Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\monorepo\apps\user'; npm install; npm run dev"
Write-Host "User Frontend: http://localhost:5173" 