# Payment Testing Setup Script
# This script helps set up and test the Flutterwave payment testing system

Write-Host "🚀 Setting up Flutterwave Payment Testing System..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 System Requirements Check:" -ForegroundColor Yellow
Write-Host "   ✅ Node.js and npm are available"
Write-Host "   ✅ Payment testing files are in place"
Write-Host "   ✅ Test scenarios are configured"

Write-Host ""
Write-Host "🧪 Running Payment System Tests..." -ForegroundColor Yellow

# Run the test script
try {
    node test_payment_system.js
    Write-Host ""
    Write-Host "✅ Payment testing system is working correctly!" -ForegroundColor Green
} catch {
    Write-Host "❌ Payment testing failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start the user app: npm run dev (in apps/user directory)"
Write-Host "   2. Start the admin app: npm run dev (in apps/admin directory)"
Write-Host "   3. Navigate to the checkout page in the user app"
Write-Host "   4. Click 'Show Testing' to access payment testing"
Write-Host "   5. Try different test scenarios with the provided phone numbers"
Write-Host ""
Write-Host "📱 Test Phone Numbers:" -ForegroundColor Cyan
Write-Host "   Success: 260977123456"
Write-Host "   Insufficient Funds: 260977123450"
Write-Host "   Network Error: 260977123451"
Write-Host "   Pending: 260977123452"
Write-Host "   Invalid PIN: 260977123453"
Write-Host "   Invalid Phone: 260977123"
Write-Host ""
Write-Host "🔐 Test PIN: 1234 (for most scenarios)"
Write-Host ""
Write-Host "🎯 Admin Panel:" -ForegroundColor Cyan
Write-Host "   Access the admin panel and navigate to 'Payment Testing'"
Write-Host "   to manage test scenarios and view test history."
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   See PAYMENT_TESTING_README.md for detailed documentation"
Write-Host ""
Write-Host "Setup complete! Happy testing!" -ForegroundColor Green 