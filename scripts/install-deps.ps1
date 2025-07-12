# Get the current directory
$rootDir = $PSScriptRoot | Split-Path -Parent
$monorepoDir = "$rootDir\monorepo"

# Install root dependencies
Write-Host "Installing root dependencies..."
Set-Location $monorepoDir
npm install

# Install shared package dependencies
Write-Host "Installing shared package dependencies..."
Set-Location "$monorepoDir\packages\config"
npm install
Set-Location "$monorepoDir\packages\ui"
npm install
Set-Location "$monorepoDir\packages\utils"
npm install

# Install app dependencies
Write-Host "Installing app dependencies..."
Set-Location "$monorepoDir\apps\admin"
npm install
Set-Location "$monorepoDir\apps\user"
npm install
Set-Location "$monorepoDir\apps\vendor"
npm install

Write-Host "All dependencies have been installed successfully!" 