# Update Chrome Extension for Production Backend
param(
    [Parameter(Mandatory=$true)]
    [string]$RenderUrl
)

Write-Host "🔧 Updating Chrome Extension for Production Backend" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Validate URL format
if (-not ($RenderUrl -match "^https://.*\.onrender\.com$")) {
    Write-Host "❌ Invalid Render URL format!" -ForegroundColor Red
    Write-Host "💡 Expected format: https://your-service-name.onrender.com" -ForegroundColor Yellow
    Write-Host "📝 Example: https://kavach-backend.onrender.com" -ForegroundColor Gray
    exit 1
}

Write-Host "🌐 Backend URL: $RenderUrl" -ForegroundColor Green
Write-Host ""

# Check if extension source exists
$backgroundScript = "..\src\background\index.ts"
if (-not (Test-Path $backgroundScript)) {
    Write-Host "❌ Extension background script not found!" -ForegroundColor Red
    Write-Host "💡 Make sure you're running this from the /backend folder" -ForegroundColor Yellow
    exit 1
}

# Read current background script
$content = Get-Content $backgroundScript -Raw

# Check if localhost URL exists
if ($content -match "const BACKEND_URL = 'http://localhost:3000'") {
    Write-Host "🔍 Found localhost configuration" -ForegroundColor Yellow
    
    # Replace localhost with Render URL
    $updatedContent = $content -replace "const BACKEND_URL = 'http://localhost:3000'", "const BACKEND_URL = '$RenderUrl'"
    
    # Write updated content back
    Set-Content $backgroundScript -Value $updatedContent -NoNewline
    
    Write-Host "✅ Updated backend URL in extension" -ForegroundColor Green
    
} elseif ($content -match "const BACKEND_URL = 'https://.*\.onrender\.com'") {
    Write-Host "🔍 Found existing Render URL" -ForegroundColor Yellow
    
    # Replace existing Render URL with new one
    $updatedContent = $content -replace "const BACKEND_URL = 'https://.*\.onrender\.com'", "const BACKEND_URL = '$RenderUrl'"
    
    # Write updated content back
    Set-Content $backgroundScript -Value $updatedContent -NoNewline
    
    Write-Host "✅ Updated backend URL in extension" -ForegroundColor Green
    
} else {
    Write-Host "⚠️ Could not find BACKEND_URL in background script" -ForegroundColor Yellow
    Write-Host "💡 Please manually update BACKEND_URL in src/background/index.ts" -ForegroundColor Yellow
    Write-Host "   Change it to: const BACKEND_URL = '$RenderUrl'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔨 Building updated extension..." -ForegroundColor Yellow

# Build the extension
cd ..
$buildResult = npm run build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Extension built successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Next Steps:" -ForegroundColor White
    Write-Host "1. Go to chrome://extensions/" -ForegroundColor Gray
    Write-Host "2. Find 'Kavach - Privacy Guardian'" -ForegroundColor Gray  
    Write-Host "3. Click the reload button (🔄)" -ForegroundColor Gray
    Write-Host "4. Test the extension on any website!" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎉 Your extension is now using the production backend!" -ForegroundColor Green
    
} else {
    Write-Host "❌ Extension build failed!" -ForegroundColor Red
    Write-Host "💡 Error details:" -ForegroundColor Yellow
    Write-Host $buildResult -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔗 Your production backend: $RenderUrl" -ForegroundColor Cyan
Write-Host "🔗 Health check: $RenderUrl/health" -ForegroundColor Cyan
