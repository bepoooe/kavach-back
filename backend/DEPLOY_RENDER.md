# Kavach Backend - Render Deployment

## 🚀 Deploy to Render

### Prerequisites
1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **API Keys**: Get your Gemini and Apify API keys

### Step 1: Prepare Environment Variables
Before deploying, you'll need these API keys:

#### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza...`)

#### Apify API Key
1. Go to [Apify Console](https://console.apify.com/account/integrations)
2. Create a new token
3. Copy the token (starts with `apify_api_...`)

### Step 2: Deploy on Render

#### Option A: Using render.yaml (Recommended)
1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect Render**: Go to [Render Dashboard](https://dashboard.render.com)
3. **New Service**: Click "New" → "Blueprint"
4. **Connect Repo**: Connect your GitHub repository
5. **Select Backend**: Choose the `/backend` folder as root
6. **Auto-Deploy**: Render will read `render.yaml` and deploy automatically

#### Option B: Manual Setup
1. **New Web Service**: Click "New" → "Web Service"
2. **Connect Repository**: Connect your GitHub repo
3. **Configure Service**:
   - **Name**: `kavach-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables
In your Render service dashboard, add these environment variables:

```bash
NODE_ENV=production
GEMINI_API_KEY=your_actual_gemini_api_key_here
APIFY_API_KEY=your_actual_apify_api_key_here
ALLOWED_ORIGINS=chrome-extension://*,https://www.google.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Step 4: Update Extension Configuration
Once deployed, update your Chrome extension to use the Render URL instead of localhost.

#### Update Background Script
In `src/background/index.ts`, change:
```typescript
const BACKEND_URL = 'http://localhost:3000';
```
To:
```typescript
const BACKEND_URL = 'https://your-service-name.onrender.com';
```

#### Rebuild Extension
```bash
npm run build
```

### Step 5: Test Deployment

#### Health Check
Your service should be available at:
```
https://your-service-name.onrender.com/health
```

#### API Test
Test the API endpoint:
```bash
curl -X POST https://your-service-name.onrender.com/api/privacy-policy/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
- **Solution**: Check that `package.json` and `tsconfig.json` are in the `/backend` folder
- **Logs**: Check build logs in Render dashboard

#### Environment Variables
- **Solution**: Ensure all required API keys are set correctly
- **Test**: Use the health endpoint to verify service is running

#### CORS Issues
- **Solution**: Add your Chrome extension ID to `ALLOWED_ORIGINS`
- **Format**: `chrome-extension://your-extension-id`

#### Cold Starts
- **Issue**: Free tier services sleep after 15 minutes of inactivity
- **Solution**: First request may take 30+ seconds to wake up
- **Upgrade**: Consider paid plan for always-on service

### Performance Optimization

#### Caching
- Enable response caching for better performance
- Set appropriate cache headers in your API responses

#### Rate Limiting
- Adjust rate limits based on your usage
- Monitor API usage in Render dashboard

## 🌐 Going Live

### Custom Domain (Optional)
1. **Domain Setup**: Add your custom domain in Render dashboard
2. **DNS Configuration**: Point your domain to Render
3. **SSL**: Render provides free SSL certificates

### Monitoring
- **Logs**: Monitor application logs in Render dashboard
- **Metrics**: Track API usage and performance
- **Alerts**: Set up alerts for service issues

### Security
- **API Keys**: Never commit API keys to version control
- **Environment**: Use environment variables for all secrets
- **CORS**: Restrict origins to only necessary domains

## 📱 Extension Updates

After deployment, update your extension's background script with the new backend URL and rebuild:

```bash
# Update BACKEND_URL in src/background/index.ts
npm run build

# Load updated extension in Chrome
# chrome://extensions/ → Developer mode → Load unpacked → Select dist folder
```

---

## 🎉 Success!

Your Kavach Privacy Guardian backend is now live on Render! 

The extension can now:
- ✅ Make real-time API calls to your hosted backend
- ✅ Use Apify for enhanced web scraping
- ✅ Leverage Gemini AI for privacy analysis
- ✅ Scale automatically with user demand

**Next**: Update your Chrome extension to use the new backend URL and enjoy global privacy protection! 🛡️
