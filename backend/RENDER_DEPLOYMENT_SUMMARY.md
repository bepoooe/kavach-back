# 🚀 Kavach Backend - Render Deployment Package

## 📦 Files Created for Render Deployment

### Core Deployment Files
- ✅ `render.yaml` - Render service configuration
- ✅ `Dockerfile` - Container configuration (optional)
- ✅ `.env.production` - Production environment template
- ✅ `DEPLOY_RENDER.md` - Complete deployment guide

### Helper Scripts
- ✅ `deploy-render.ps1` - Pre-deployment checker
- ✅ `update-extension.ps1` - Updates Chrome extension URLs

## 🎯 Quick Deployment Steps

### 1. Prepare Your Repository
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select your repository and branch
5. Render reads `render.yaml` and deploys automatically!

### 3. Set Environment Variables
In Render dashboard, add these environment variables:
```
GEMINI_API_KEY=your_actual_gemini_api_key
APIFY_API_KEY=your_actual_apify_api_key
```

### 4. Update Chrome Extension
```powershell
# After your service is deployed
cd backend
.\update-extension.ps1 -RenderUrl "https://your-service-name.onrender.com"
```

## 🌐 Your Service URLs

After deployment, your service will be available at:
- **API Base**: `https://your-service-name.onrender.com`
- **Health Check**: `https://your-service-name.onrender.com/health`
- **Privacy Analysis**: `https://your-service-name.onrender.com/api/privacy-policy/analyze`

## 🔧 Configuration Details

### render.yaml Configuration
- **Service Type**: Web service (REST API)
- **Environment**: Node.js
- **Plan**: Free tier (can upgrade later)
- **Build**: `npm install && npm run build`
- **Start**: `npm start`
- **Health Check**: `/health` endpoint

### Environment Variables Required
- `GEMINI_API_KEY` - For AI privacy analysis
- `APIFY_API_KEY` - For enhanced web scraping
- `NODE_ENV` - Set to "production"
- `ALLOWED_ORIGINS` - CORS configuration

### Performance Features
- ✅ Rate limiting (1000 requests per 15 minutes)
- ✅ CORS protection
- ✅ Security headers with Helmet
- ✅ Health monitoring
- ✅ Auto-scaling

## 🚨 Important Notes

### Free Tier Limitations
- **Sleep Mode**: Service sleeps after 15 minutes of inactivity
- **Cold Start**: First request after sleep takes 30+ seconds
- **Bandwidth**: 100GB/month
- **Build Minutes**: 500 minutes/month

### Production Considerations
- **Custom Domain**: Available on paid plans
- **Always-On**: Upgrade to prevent sleeping
- **Database**: Consider adding persistent storage
- **Monitoring**: Set up alerts and logging

## 🛡️ Security Features

### Implemented Security
- ✅ Rate limiting per IP address
- ✅ CORS restrictions to Chrome extensions only
- ✅ Input validation on all endpoints
- ✅ Helmet.js security headers
- ✅ Environment variable protection

### Additional Security (Recommended)
- 🔄 API key rotation
- 🔄 Request logging and monitoring
- 🔄 DDoS protection (Render Pro)
- 🔄 Private networking (Render Teams)

## 🧪 Testing Your Deployment

### Automated Testing
```powershell
# Run pre-deployment checks
.\deploy-render.ps1

# Test API after deployment
curl -X GET https://your-service-name.onrender.com/health
curl -X POST https://your-service-name.onrender.com/api/privacy-policy/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

### Extension Testing
1. Load updated extension in Chrome
2. Navigate to any website
3. Click Kavach icon
4. Click "Analyze Policy"
5. Watch for real-time updates using your production backend!

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Health endpoint returns `{"status": "healthy"}`
- ✅ Privacy analysis works end-to-end
- ✅ Chrome extension connects to production backend
- ✅ Apify and Gemini integrations function properly
- ✅ No CORS or authentication errors

---

## 🆘 Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **API Issues**: Check service logs in Render dashboard
- **Extension Issues**: Check browser console for errors
- **Environment**: Verify all API keys are set correctly

**You're now ready to deploy Kavach to the world! 🌍**
