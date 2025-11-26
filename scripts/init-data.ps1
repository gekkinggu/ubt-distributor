# Initialize Sample Data
# Run this PowerShell script to reset and create sample data

Write-Host "🔄 Initializing sample data..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/init" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "📦 Sample data has been created:" -ForegroundColor Green
        Write-Host ""
        Write-Host "   👤 Admin user: admin / admin123" -ForegroundColor Yellow
        Write-Host "   👤 Operator user: operator / operator123" -ForegroundColor Yellow
        Write-Host "   🏥 3 Partners created" -ForegroundColor Yellow
        Write-Host "   📦 12 Products with QR codes created" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🌐 You can now login at http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error connecting to server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure the dev server is running:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Yellow
}
