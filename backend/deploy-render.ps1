# Render Deployment Scripts

Write-Host "🚀 Kavach Backend - Render Deployment Helper" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found!" -ForegroundColor Red
    Write-Host "💡 Initialize git first:" -ForegroundColor Yellow
    Write-Host "   git init" -ForegroundColor Gray
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Gray
    Write-Host "   git remote add origin https://github.com/yourusername/kavach-backend.git" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    exit 1
}

# Check for required files
Write-Host "📋 Checking deployment files..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "tsconfig.json", 
    "render.yaml",
    "src/server.ts"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - Found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Missing required files for deployment!" -ForegroundColor Red
    exit 1
}

# Check package.json scripts
Write-Host ""
Write-Host "🔧 Checking build configuration..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts.build -and $packageJson.scripts.start) {
    Write-Host "✅ Build scripts configured" -ForegroundColor Green
} else {
    Write-Host "❌ Missing build or start scripts in package.json" -ForegroundColor Red
    exit 1
}

# Environment variables check
Write-Host ""
Write-Host "🔑 Environment Variables Checklist:" -ForegroundColor Yellow
Write-Host ""
Write-Host "You'll need these environment variables in Render:" -ForegroundColor White
Write-Host "NODE_ENV=production" -ForegroundColor Gray
Write-Host "GEMINI_API_KEY=your_actual_gemini_key" -ForegroundColor Gray  
Write-Host "APIFY_API_KEY=your_actual_apify_key" -ForegroundColor Gray
Write-Host "ALLOWED_ORIGINS=chrome-extension://*" -ForegroundColor Gray
Write-Host ""

# Git status check
Write-Host "📤 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null

if ($gitStatus) {
    Write-Host "⚠️ Uncommitted changes found:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    Write-Host "💡 Commit and push your changes before deploying:" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git commit -m 'Ready for Render deployment'" -ForegroundColor Gray
    Write-Host "   git push" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✅ All changes committed" -ForegroundColor Green
}

# Final instructions
Write-Host ""
Write-Host "🌐 Ready for Render Deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor Gray
Write-Host "2. Click 'New' → 'Blueprint'" -ForegroundColor Gray
Write-Host "3. Connect your GitHub repository" -ForegroundColor Gray
Write-Host "4. Select this repository and branch" -ForegroundColor Gray
Write-Host "5. Render will auto-detect render.yaml and deploy!" -ForegroundColor Gray
Write-Host ""
Write-Host "Remember to set environment variables in Render dashboard!" -ForegroundColor Yellow
Write-Host ""
Write-Host "See DEPLOY_RENDER.md for detailed instructions" -ForegroundColor Cyan
