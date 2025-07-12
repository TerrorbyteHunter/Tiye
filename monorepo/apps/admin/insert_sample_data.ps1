# PowerShell script to insert sample data for analytics testing
# This script will populate the database with sample tickets, routes, and vendors

Write-Host "Inserting sample data for analytics testing..." -ForegroundColor Green

# Database connection parameters (adjust these based on your setup)
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "tiyende"
$DB_USER = "postgres"
$DB_PASSWORD = "1234"

# Function to execute SQL file
function Execute-SqlFile {
    param(
        [string]$SqlFile,
        [string]$Description
    )
    
    Write-Host "Executing: $Description" -ForegroundColor Yellow
    
    try {
        # Use psql to execute the SQL file
        $env:PGPASSWORD = $DB_PASSWORD
        psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f $SqlFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Successfully executed: $Description" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to execute: $Description" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "✗ Error executing $Description : $_" -ForegroundColor Red
    }
}

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "✓ PostgreSQL client (psql) found" -ForegroundColor Green
}
catch {
    Write-Host "✗ PostgreSQL client (psql) not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "You can download it from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Execute SQL files in order
Write-Host "`nStarting sample data insertion..." -ForegroundColor Cyan

# 1. Create sample vendors first
Execute-SqlFile -SqlFile "attached_assets/create_sample_vendor.sql" -Description "Sample vendors"

# 2. Insert routes (if not already present)
Execute-SqlFile -SqlFile "attached_assets/insert_zambian_routes_vendor1.sql" -Description "Zambian routes for vendor 1"

# 3. Insert sample tickets
Execute-SqlFile -SqlFile "attached_assets/insert_sample_tickets.sql" -Description "Sample tickets for analytics"

Write-Host "`nSample data insertion completed!" -ForegroundColor Green
Write-Host "You can now test the analytics page with real data." -ForegroundColor Cyan 