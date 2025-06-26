# Kavach Extension Debug Script
# This script helps debug the Chrome extension integration

Write-Host "Kavach Extension Debug Utility" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get -TimeoutSec 5
    Write-Host "Backend Status: $($health.status) - SUCCESS" -ForegroundColor Green
    Write-Host "Version: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "Backend Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Solution: Start backend with 'cd backend; npm start'" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""

# Test 2: API Endpoints
Write-Host "Testing API Endpoints..." -ForegroundColor Yellow

# Test standard analyze endpoint
try {
    $body = @{url = "https://example.com"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/privacy-policy/analyze" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "Standard Analysis Endpoint: Working" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*404*") {
        Write-Host "Standard Analysis Endpoint: Not Found (404)" -ForegroundColor Red
    } else {
        Write-Host "Standard Analysis Endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   (This may be normal if no privacy policy found)" -ForegroundColor Gray
    }
}

# Test enhanced analyze endpoint
try {
    $body = @{url = "https://google.com"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/privacy-policy/analyze-enhanced" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15
    Write-Host "Enhanced Analysis Endpoint: Working" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*404*") {
        Write-Host "Enhanced Analysis Endpoint: Not Found (404)" -ForegroundColor Red
    } else {
        Write-Host "Enhanced Analysis Endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   (This may be normal - enhanced analysis can fail gracefully)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 3: Extension Build Check
Write-Host "Checking Extension Build..." -ForegroundColor Yellow
if (Test-Path "dist/manifest.json") {
    Write-Host "Extension Built: dist/manifest.json exists - SUCCESS" -ForegroundColor Green
    
    # Check manifest permissions
    $manifest = Get-Content "dist/manifest.json" | ConvertFrom-Json
    if ($manifest.host_permissions -contains "http://localhost:3000/*") {
        Write-Host "Localhost Permission: Configured - SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "Localhost Permission: Missing" -ForegroundColor Red
        Write-Host "Solution: Rebuild extension with 'npm run build'" -ForegroundColor Yellow
    }
} else {
    Write-Host "Extension Build: Missing" -ForegroundColor Red
    Write-Host "Solution: Build extension with 'npm run build'" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Environment Variables
Write-Host "Checking Environment Variables..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "Environment File: Found - SUCCESS" -ForegroundColor Green
    
    $envContent = Get-Content "backend/.env" -Raw
    if ($envContent -like "*GEMINI_API_KEY*") {
        Write-Host "Gemini API Key: Configured - SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "Gemini API Key: Missing" -ForegroundColor Red
    }
    
    if ($envContent -like "*APIFY_API_KEY*") {
        Write-Host "Apify API Token: Configured - SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "Apify API Token: Missing" -ForegroundColor Red
    }
} else {
    Write-Host "Environment File: Missing backend/.env" -ForegroundColor Red
    Write-Host "Solution: Copy backend/.env.example to backend/.env and add API keys" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Debug Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. If all tests pass: Load extension in Chrome (chrome://extensions/)" -ForegroundColor Gray
Write-Host "2. Enable 'Developer mode' and click 'Load unpacked'" -ForegroundColor Gray
Write-Host "3. Select the 'dist' folder" -ForegroundColor Gray
Write-Host "4. Navigate to a website and click the Kavach icon" -ForegroundColor Gray
Write-Host "5. Click 'Analyze Policy' and watch for real-time updates!" -ForegroundColor Gray
Write-Host ""
