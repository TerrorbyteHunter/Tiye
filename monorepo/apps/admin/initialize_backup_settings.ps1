# Initialize Backup Settings for Tiyende Admin System
# This script runs the SQL initialization for backup-related settings

Write-Host "Initializing backup settings for Tiyende Admin System..." -ForegroundColor Green

# Check if DATABASE_URL environment variable is set
if (-not $env:DATABASE_URL) {
    Write-Host "Error: DATABASE_URL environment variable is not set." -ForegroundColor Red
    Write-Host "Please set the DATABASE_URL environment variable before running this script." -ForegroundColor Yellow
    exit 1
}

# Parse DATABASE_URL to extract connection details
$dbUrl = [System.Uri]$env:DATABASE_URL
$dbHost = $dbUrl.Host
$dbPort = if ($dbUrl.Port) { $dbUrl.Port } else { 5432 }
$dbName = $dbUrl.AbsolutePath.TrimStart('/')
$dbUser = $dbUrl.UserInfo.Split(':')[0]
$dbPassword = $dbUrl.UserInfo.Split(':')[1]

Write-Host "Database connection details:" -ForegroundColor Cyan
Write-Host "  Host: $dbHost" -ForegroundColor White
Write-Host "  Port: $dbPort" -ForegroundColor White
Write-Host "  Database: $dbName" -ForegroundColor White
Write-Host "  User: $dbUser" -ForegroundColor White

# Check if psql is available
try {
    $psqlVersion = & psql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "psql not found"
    }
    Write-Host "Found psql: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: psql command not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "You can download PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

# SQL file path
$sqlFile = "initialize_backup_settings.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: SQL file '$sqlFile' not found in current directory." -ForegroundColor Red
    Write-Host "Please run this script from the admin directory where the SQL file is located." -ForegroundColor Yellow
    exit 1
}

Write-Host "Running SQL initialization script..." -ForegroundColor Cyan

# Run the SQL script
try {
    $result = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backup settings initialized successfully!" -ForegroundColor Green
        Write-Host "The following backup types are now available:" -ForegroundColor Cyan
        Write-Host "  - Full System Backup" -ForegroundColor White
        Write-Host "  - Analytics & Reports Backup" -ForegroundColor White
        Write-Host "  - Audit Logs Backup" -ForegroundColor White
        Write-Host "  - Operational Data Backup" -ForegroundColor White
        Write-Host "  - User & Vendor Data Backup" -ForegroundColor White
        Write-Host "  - Settings Backup" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now configure backup settings in the admin dashboard." -ForegroundColor Green
    } else {
        Write-Host "Error running SQL script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error executing SQL script: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear PGPASSWORD for security
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Backup settings initialization completed!" -ForegroundColor Green 