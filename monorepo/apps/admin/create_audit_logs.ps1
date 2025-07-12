# PowerShell script to create audit_logs table
# This script will create the missing audit_logs table and add sample data

Write-Host "Creating audit_logs table..." -ForegroundColor Green

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

# Execute the audit logs table creation
Write-Host "`nCreating audit_logs table..." -ForegroundColor Cyan

Execute-SqlFile -SqlFile "attached_assets/create_audit_logs_table.sql" -Description "Audit logs table creation"

Write-Host "`nAudit logs table creation completed!" -ForegroundColor Green
Write-Host "You can now test the audit logs page." -ForegroundColor Cyan 