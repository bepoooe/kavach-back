# Kavach Apify + Gemini Integration Test

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$TestUrl = "https://example.com"
)

Write-Host "🚀 Testing Kavach Apify + Gemini Integration" -ForegroundColor Cyan
Write-Host "Backend: $BaseUrl" -ForegroundColor Yellow
Write-Host "Test URL: $TestUrl" -ForegroundColor Yellow
Write-Host ""

# Test Enhanced Analysis
Write-Host "🔬 Testing Enhanced Privacy Policy Analysis (Apify + Gemini)" -ForegroundColor Green
Write-Host "This test demonstrates:"
Write-Host "  1. 🕷️ Apify web scraping for comprehensive content extraction" -ForegroundColor Gray
Write-Host "  2. 🤖 Gemini AI analysis for privacy assessment" -ForegroundColor Gray
Write-Host "  3. 🔄 Automatic fallback when Apify limits are exceeded" -ForegroundColor Gray
Write-Host "  4. ⚡ Optimized performance with timeouts and concurrency limits" -ForegroundColor Gray
Write-Host ""

$testPayload = @{
    url = $TestUrl
} | ConvertTo-Json

Write-Host "📊 Sending request to enhanced analysis endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/privacy-policy/analyze-enhanced" -Method POST -Body $testPayload -ContentType "application/json" -TimeoutSec 120
    
    Write-Host "✅ Enhanced Analysis Successful!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📋 Analysis Results:" -ForegroundColor Cyan
    Write-Host "  Safety Rating: $($response.data.safety)" -ForegroundColor $(if ($response.data.safety -eq 'SAFE') { 'Green' } elseif ($response.data.safety -eq 'RISKY') { 'Yellow' } else { 'Red' })
    Write-Host "  Summary Length: $($response.data.summary.Length) characters" -ForegroundColor Gray
    Write-Host "  Analysis Type: $($response.data.policyMetadata.analysisType)" -ForegroundColor Gray
    Write-Host "  Total Pages Analyzed: $($response.data.policyMetadata.totalPages)" -ForegroundColor Gray
    Write-Host "  Content Length: $($response.data.policyMetadata.contentLength) characters" -ForegroundColor Gray
    
    if ($response.data.policyMetadata.scrapingMethod) {
        Write-Host "  Scraping Method: $($response.data.policyMetadata.scrapingMethod)" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    if ($response.data.scores) {
        Write-Host "🎯 Privacy Scores (0-100):" -ForegroundColor Cyan
        Write-Host "  Data Collection: $($response.data.scores.dataCollection)" -ForegroundColor Gray
        Write-Host "  Third Party Sharing: $($response.data.scores.thirdParty)" -ForegroundColor Gray
        Write-Host "  User Rights: $($response.data.scores.userRights)" -ForegroundColor Gray
        Write-Host "  Transparency: $($response.data.scores.transparency)" -ForegroundColor Gray
        Write-Host ""
    }
    
    if ($response.data.keyFindings -and $response.data.keyFindings.Count -gt 0) {
        Write-Host "🔍 Key Findings:" -ForegroundColor Cyan
        $response.data.keyFindings | ForEach-Object { Write-Host "  • $_" -ForegroundColor Gray }
        Write-Host ""
    }
    
    if ($response.data.additionalPages -and $response.data.additionalPages.Count -gt 0) {
        Write-Host "📄 Additional Pages Found:" -ForegroundColor Cyan
        $response.data.additionalPages | ForEach-Object { 
            Write-Host "  • $($_.title) ($($_.url))" -ForegroundColor Gray 
        }
        Write-Host ""
    }
    
    Write-Host "📝 Summary Preview:" -ForegroundColor Cyan
    $summaryPreview = $response.data.summary.Substring(0, [Math]::Min(300, $response.data.summary.Length))
    Write-Host "  $summaryPreview..." -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "✅ INTEGRATION TEST PASSED" -ForegroundColor Green
    Write-Host "🎉 Apify and Gemini are working together successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Enhanced Analysis Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check if Apify API key is valid and has credits" -ForegroundColor Gray
    Write-Host "  2. Check if Gemini API key is valid" -ForegroundColor Gray
    Write-Host "  3. Check network connectivity" -ForegroundColor Gray
    Write-Host "  4. Check server logs for detailed error information" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔗 Integration Details:" -ForegroundColor Cyan
Write-Host "  • Apify Actor: Web Scraper with Cheerio fallback" -ForegroundColor Gray
Write-Host "  • Gemini Model: gemini-1.5-flash" -ForegroundColor Gray
Write-Host "  • Timeout Handling: 30s Apify, 45s scraping, 20s enhancement" -ForegroundColor Gray
Write-Host "  • Fallback Logic: Simple scraping when Apify fails" -ForegroundColor Gray
Write-Host "  • Rate Limiting: Reduced concurrency for stability" -ForegroundColor Gray
