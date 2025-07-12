# Initialize Settings Script
# This script populates the settings table with comprehensive default settings

Write-Host "Initializing Tiyende System Settings..." -ForegroundColor Green

# Check if DATABASE_URL environment variable is set
if (-not $env:DATABASE_URL) {
    Write-Host "Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host "Please set the DATABASE_URL environment variable and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "Using DATABASE_URL from environment" -ForegroundColor Cyan

try {
    # Read the SQL file
    $sqlFile = Join-Path $PSScriptRoot "initialize_settings.sql"
    
    if (-not (Test-Path $sqlFile)) {
        Write-Host "Error: initialize_settings.sql file not found" -ForegroundColor Red
        exit 1
    }
    
    $sqlContent = Get-Content $sqlFile -Raw
    
    Write-Host "Executing settings initialization..." -ForegroundColor Yellow
    
    # Execute the SQL using psql with DATABASE_URL
    $result = & psql $env:DATABASE_URL -c $sqlContent 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Settings initialized successfully!" -ForegroundColor Green
        Write-Host "All default settings have been added to the database." -ForegroundColor Cyan
    } else {
        Write-Host "Error executing SQL:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Settings initialization completed!" -ForegroundColor Green 