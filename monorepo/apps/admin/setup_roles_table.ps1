# Setup roles table
Write-Host "Setting up roles table..." -ForegroundColor Green

# Read the SQL file
$sqlContent = Get-Content "create_roles_table.sql" -Raw

# Execute the SQL (you'll need to replace these with your actual database credentials)
# This is a template - you'll need to modify the connection string
$connectionString = "postgresql://username:password@localhost:5432/your_database"

Write-Host "SQL to execute:" -ForegroundColor Yellow
Write-Host $sqlContent -ForegroundColor Gray

Write-Host "Please run this SQL in your database management tool or modify this script with your database credentials." -ForegroundColor Red 