# ✅ Kavach Render Deployment Checklist

## 📋 Pre-Deployment Setup

### 1. Initialize Git Repository
```bash
cd backend
git init
git add .
git commit -m "Initial commit - Kavach backend ready for Render"
```

### 2. Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Create new repository: `kavach-backend`
3. Connect local repo to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/kavach-backend.git
git branch -M main
git push -u origin main
```

### 3. Get API Keys
- **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Apify API Key**: [Apify Console](https://console.apify.com/account/integrations)

## 🚀 Render Deployment

### 4. Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New" → "Blueprint"**
3. Connect your GitHub repository
4. Select the `kavach-backend` repository
5. Click **"Connect"**
6. Render automatically detects `render.yaml` and deploys!

### 5. Set Environment Variables
In Render dashboard → Environment tab, add:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
APIFY_API_KEY=your_actual_apify_api_key_here
```

### 6. Wait for Deployment
- Build time: ~2-3 minutes
- First deploy may take longer
- Watch logs for any errors

## 🔧 Update Chrome Extension

### 7. Update Extension Backend URL
```powershell
# After deployment is complete
cd backend
.\update-extension.ps1 -RenderUrl "https://your-service-name.onrender.com"
```

### 8. Test Extension
1. Go to `chrome://extensions/`
2. Reload the Kavach extension
3. Navigate to any website
4. Click extension icon → "Analyze Policy"
5. Should see: "Apify is crawling..." and "AI analyzing with Gemini..."

## ✅ Verification Tests

### 9. Health Check
Visit: `https://your-service-name.onrender.com/health`
Should return: `{"status":"healthy","version":"1.0.0"}`

### 10. API Test
```bash
curl -X POST https://your-service-name.onrender.com/api/privacy-policy/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

### 11. Extension End-to-End Test
- Navigate to Google.com
- Click Kavach extension
- Click "Analyze Policy"
- Should complete with detailed privacy scores

## 🎉 Deployment Complete!

Your Kavach Privacy Guardian is now live with:
- ✅ Real-time privacy policy analysis
- ✅ Apify multi-page crawling
- ✅ Gemini AI intelligent analysis
- ✅ Global accessibility via Render
- ✅ Auto-scaling based on usage

## 📁 Created Files Summary

### Deployment Configuration
- `render.yaml` - Render service configuration
- `Dockerfile` - Container setup (backup option)
- `.env.production` - Production environment template

### Documentation  
- `DEPLOY_RENDER.md` - Complete deployment guide
- `RENDER_DEPLOYMENT_SUMMARY.md` - Feature overview
- `DEPLOYMENT_CHECKLIST.md` - This checklist

### Scripts
- `deploy-render.ps1` - Pre-deployment verification
- `update-extension.ps1` - Updates extension for production

## 🆘 Troubleshooting

### Common Issues
- **Build fails**: Check package.json scripts
- **API errors**: Verify environment variables
- **CORS issues**: Check ALLOWED_ORIGINS setting
- **Cold starts**: First request takes 30+ seconds on free tier

### Support Resources
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Service Logs**: Available in Render dashboard
- **Extension Debug**: Browser console (F12)

---

**You're ready to deploy Kavach to production! 🚀**
