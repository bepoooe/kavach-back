# Testing Kavach Privacy Guardian with Apify + Gemini Integration

## 🧪 End-to-End Test Guide

### Prerequisites
1. **Backend Server Running**: Make sure the Express server is running on `localhost:3000`
2. **Extension Loaded**: Load the extension in Chrome developer mode
3. **API Keys Configured**: Gemini and Apify keys set in backend/.env

### Test Steps

#### 1. Start Backend Server
```bash
cd backend
node dist/server.js
```
✅ Verify server shows: "🚀 Kavach Backend Server running on port 3000"

#### 2. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder
4. Verify extension icon appears in toolbar

#### 3. Test Real-Time Analysis
1. Navigate to a test website (e.g., `https://www.google.com`)
2. Click the Kavach extension icon
3. Click "Analyze Policy" button
4. Observe real-time status updates:
   - 🔍 "Searching for privacy policy..."
   - 📄 "Found privacy policy, starting enhanced analysis..."
   - 🕷️ "Apify is crawling privacy pages..."
   - 🤖 "AI analyzing privacy content with Gemini..."

#### 4. Verify Enhanced Results
Check that the analysis shows:
- ✅ Privacy score (0-100)
- ✅ Analysis type badge (ENHANCED/STANDARD)
- ✅ Detailed scores breakdown (if enhanced)
- ✅ Key findings from AI analysis
- ✅ Comprehensive summary
- ✅ Risk assessment
- ✅ Compliance status

### Expected Integration Flow

```
Extension Click → Background Script → Backend API → Apify Actor → Gemini AI → Response
     ↓              ↓                    ↓             ↓            ↓           ↓
 User clicks    Sends request     Enhanced         Crawls        Analyzes    Returns to
 "Analyze"      to localhost     scraping        privacy        content     extension
               :3000/api        with Actor       pages          with AI     with results
```

### Test Websites

**Simple Sites** (Standard Analysis):
- https://example.com
- https://httpbin.org

**Complex Sites** (Enhanced Analysis):
- https://www.google.com
- https://www.facebook.com
- https://www.amazon.com
- https://www.twitter.com

### Troubleshooting

#### Backend Issues
- ❌ **Connection refused**: Backend server not running
- ❌ **404 errors**: Check API endpoint URLs in background script
- ❌ **CORS errors**: Verify CORS settings in server.ts

#### Apify Issues
- ❌ **Actor timeout**: Increase timeout in apify-scraper.ts
- ❌ **Rate limiting**: Check Apify account limits
- ❌ **Invalid results**: Verify actor ID `aYG0l9s7dbB7j3gbS`

#### Gemini Issues
- ❌ **API key invalid**: Verify Gemini API key in .env
- ❌ **Quota exceeded**: Check Gemini API usage limits
- ❌ **Response parsing errors**: Check prompt format in gemini-analyzer.ts

### Success Criteria

✅ **Real-time Updates**: Status messages appear during analysis
✅ **Enhanced Analysis**: Apify finds multiple privacy pages
✅ **AI Analysis**: Gemini provides detailed insights
✅ **Fallback Works**: Standard analysis when enhanced fails
✅ **UI Responsive**: Loading states and animations work
✅ **Error Handling**: Graceful failure with helpful messages

### Performance Benchmarks

- **Standard Analysis**: 3-10 seconds
- **Enhanced Analysis**: 30-60 seconds
- **Fallback Analysis**: 1-5 seconds
- **Error Response**: < 1 second

---

🎉 **Integration is working when you see enhanced privacy analysis with multi-page crawling, detailed scoring, and AI-powered insights in real-time!**
