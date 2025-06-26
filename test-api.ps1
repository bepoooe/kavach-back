# Test Kavach Backend API Endpoints

Write-Host "🧪 Testing Kavach Backend API" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "https://kavach-back.onrender.com"

# Test 1: Health Check
Write-Host "🏥 Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Health Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: API Info
Write-Host "📋 Testing API Info..." -ForegroundColor Yellow
try {
    $api = Invoke-RestMethod -Uri "$BASE_URL/api" -Method Get -TimeoutSec 10
    Write-Host "✅ API Status: $($api.status)" -ForegroundColor Green
    Write-Host "   Available Endpoints:" -ForegroundColor Gray
    $api.endpoints.PSObject.Properties | ForEach-Object {
        Write-Host "   - $($_.Name): $($_.Value)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ API Info Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Standard Analysis
Write-Host "🔍 Testing Standard Analysis..." -ForegroundColor Yellow
try {
    $body = @{
        url = "https://google.com"
        enhanced = $false
    } | ConvertTo-Json
    
    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    $analysis = Invoke-RestMethod -Uri "$BASE_URL/api/privacy-policy/analyze" -Method Post -Body $body -Headers $headers -TimeoutSec 30
    
    if ($analysis.success) {
        Write-Host "✅ Standard Analysis: SUCCESS" -ForegroundColor Green
        Write-Host "   Safety Score: $($analysis.data.safety)" -ForegroundColor Gray
        Write-Host "   Analysis Type: $($analysis.data.policyMetadata.analysisType)" -ForegroundColor Gray
        Write-Host "   Policy URL: $($analysis.policyUrl)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Standard Analysis: $($analysis.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Standard Analysis Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Enhanced Analysis
Write-Host "🚀 Testing Enhanced Analysis..." -ForegroundColor Yellow
try {
    $body = @{
        url = "https://google.com"
    } | ConvertTo-Json
    
    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    $enhanced = Invoke-RestMethod -Uri "$BASE_URL/api/privacy-policy/analyze-enhanced" -Method Post -Body $body -Headers $headers -TimeoutSec 60
    
    if ($enhanced.success) {
        Write-Host "✅ Enhanced Analysis: SUCCESS" -ForegroundColor Green
        Write-Host "   Safety Score: $($enhanced.data.safety)" -ForegroundColor Gray
        Write-Host "   Analysis Type: $($enhanced.data.policyMetadata.analysisType)" -ForegroundColor Gray
        Write-Host "   Total Pages: $($enhanced.data.policyMetadata.totalPages)" -ForegroundColor Gray
        Write-Host "   Key Findings: $($enhanced.data.keyFindings.Count) items" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Enhanced Analysis: $($enhanced.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Enhanced Analysis Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Find Privacy Policy
Write-Host "🔍 Testing Find Privacy Policy..." -ForegroundColor Yellow
try {
    $find = Invoke-RestMethod -Uri "$BASE_URL/api/privacy-policy/find?url=https://google.com" -Method Get -TimeoutSec 20
    
    if ($find.success) {
        Write-Host "✅ Find Policy: SUCCESS" -ForegroundColor Green
        Write-Host "   Found URL: $($find.data.policyUrl)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Find Policy: $($find.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Find Policy Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Use these CORRECT endpoints:" -ForegroundColor Green
Write-Host "   Health: GET $BASE_URL/health" -ForegroundColor Gray
Write-Host "   API Info: GET $BASE_URL/api" -ForegroundColor Gray
Write-Host "   Standard Analysis: POST $BASE_URL/api/privacy-policy/analyze" -ForegroundColor Gray
Write-Host "   Enhanced Analysis: POST $BASE_URL/api/privacy-policy/analyze-enhanced" -ForegroundColor Gray
Write-Host "   Find Policy: GET $BASE_URL/api/privacy-policy/find?url=..." -ForegroundColor Gray
Write-Host ""
Write-Host "❌ WRONG endpoint you used:" -ForegroundColor Red
Write-Host "   $BASE_URL/privacy-policy/analyze (missing /api/)" -ForegroundColor Gray
