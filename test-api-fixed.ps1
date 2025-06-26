# Test script for Kavach Backend API

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$BASE_URL = $BaseUrl

Write-Host "🧪 Testing Kavach Backend API" -ForegroundColor Cyan
Write-Host "Base URL: $BASE_URL" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BASE_URL/health" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Health check passed" -ForegroundColor Green
    Write-Host "   Response: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Enhanced Privacy Policy Analysis (Apify + Gemini) 
Write-Host "2. Testing Enhanced Privacy Policy Analysis (Apify + Gemini)..." -ForegroundColor Yellow
$testPayload = @{
    url = "https://github.com"
} | ConvertTo-Json

try {
    $analysisResponse = Invoke-RestMethod -Uri "$BASE_URL/api/privacy-policy/analyze" -Method POST -Body $testPayload -ContentType "application/json" -TimeoutSec 60
    Write-Host "   ✅ Enhanced analysis successful" -ForegroundColor Green
    Write-Host "   Safety: $($analysisResponse.data.safety)" -ForegroundColor Gray
    Write-Host "   Total Pages: $($analysisResponse.data.policyMetadata.totalPages)" -ForegroundColor Gray
    Write-Host "   Content Length: $($analysisResponse.data.policyMetadata.contentLength) chars" -ForegroundColor Gray
    Write-Host "   Analysis Type: $($analysisResponse.data.policyMetadata.analysisType)" -ForegroundColor Gray
    
    if ($analysisResponse.data.scores) {
        Write-Host "   Scores:" -ForegroundColor Gray
        Write-Host "     Data Collection: $($analysisResponse.data.scores.dataCollection)" -ForegroundColor Gray
        Write-Host "     Third Party: $($analysisResponse.data.scores.thirdParty)" -ForegroundColor Gray
        Write-Host "     User Rights: $($analysisResponse.data.scores.userRights)" -ForegroundColor Gray
        Write-Host "     Transparency: $($analysisResponse.data.scores.transparency)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "   ❌ Enhanced analysis failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Privacy Policy Discovery
Write-Host "3. Testing Privacy Policy Discovery..." -ForegroundColor Yellow
try {
    $findResponse = Invoke-RestMethod -Uri "$BASE_URL/api/privacy-policy/find?url=https://github.com" -Method GET -TimeoutSec 20
    Write-Host "   ✅ Policy discovery successful" -ForegroundColor Green
    Write-Host "   Found URL: $($findResponse.data.policyUrl)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Policy discovery failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "✅ Use these CORRECT endpoints:" -ForegroundColor Green
Write-Host "   Health: GET $BASE_URL/health" -ForegroundColor Gray
Write-Host "   API Info: GET $BASE_URL/api" -ForegroundColor Gray
Write-Host "   Enhanced Analysis: POST $BASE_URL/api/privacy-policy/analyze" -ForegroundColor Gray
Write-Host "   Find Policy: GET $BASE_URL/api/privacy-policy/find?url=..." -ForegroundColor Gray
Write-Host ""
