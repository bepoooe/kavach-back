# Kavach Privacy Guardian - Backend API

This is the backend API server for the Kavach Privacy Guardian Chrome extension. It provides AI-powered privacy policy analysis using Google's Gemini API with enhanced web scraping capabilities through Apify integration.

## Features

- 🤖 **AI-Powered Analysis**: Uses Google Gemini to analyze privacy policies
- �️ **Enhanced Web Scraping**: Apify integration for comprehensive content extraction
- �🔍 **Automatic Policy Detection**: Finds privacy policy URLs automatically across multiple pages
- 📊 **Comprehensive Scoring**: Provides detailed privacy scores and risk assessments
- 🌐 **Multi-Page Analysis**: Analyzes privacy policies across multiple related pages
- 🛡️ **Security**: Rate limiting, CORS protection, and input validation
- 🚀 **Production Ready**: Optimized for deployment on Render

## API Endpoints

### POST /api/privacy-policy/analyze
Analyzes a website's privacy policy using AI with optional enhanced mode.

**Request Body:**
```json
{
  "url": "https://example.com",
  "policyUrl": "https://example.com/privacy", // optional
  "enhanced": false // optional - enables Apify-powered comprehensive analysis
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Privacy policy analysis summary in 30 words",
    "safety": "SAFE|RISKY|UNSAFE",
    "keyFindings": ["Finding 1", "Finding 2"], // only in enhanced mode
    "scores": { // only in enhanced mode
      "dataCollection": 85,
      "thirdParty": 60,
      "userRights": 90,
      "transparency": 75
    },
    "policyMetadata": {
      "url": "https://example.com/privacy",
      "title": "Privacy Policy",
      "contentLength": 15000,
      "analysisType": "standard|enhanced",
      "totalPages": 3, // only in enhanced mode
      "scrapingMethod": "simple|enhanced|mixed", // only in enhanced mode
      "analyzedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "policyUrl": "https://example.com/privacy"
}
```

### POST /api/privacy-policy/analyze-enhanced
Performs comprehensive privacy policy analysis using Apify integration to crawl multiple privacy-related pages.

**Request Body:**
```json
{
  "url": "https://example.com",
  "policyUrl": "https://example.com/privacy" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Comprehensive privacy policy analysis summary",
    "safety": "SAFE|RISKY|UNSAFE",
    "keyFindings": ["Key privacy concern 1", "Key privacy concern 2"],
    "scores": {
      "dataCollection": 85,
      "thirdParty": 60,
      "userRights": 90,
      "transparency": 75
    },
    "policyMetadata": {
      "url": "https://example.com/privacy",
      "title": "Privacy Policy",
      "contentLength": 25000,
      "analysisType": "enhanced",
      "totalPages": 5,
      "scrapingMethod": "mixed",
      "analyzedAt": "2024-01-01T00:00:00.000Z"
    },
    "additionalPages": [
      {
        "url": "https://example.com/cookie-policy",
        "title": "Cookie Policy",
        "wordCount": 800
      }
    ]
  },
  "policyUrl": "https://example.com/privacy"
}
```

### GET /api/privacy-policy/find
Finds privacy policy URL for a website.

**Query Parameters:**
- `url`: Website URL to search

## Setup

### Local Development

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
```

3. **Configure Environment Variables:**
```env
# Required - Google Gemini API key for AI analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Required - Apify API key for enhanced web scraping
APIFY_API_KEY=apify_api_EsvCiOOlJobxaZnJ3Klnyucd5IRdgq4CsoP3

# Optional - Server configuration
PORT=3000
NODE_ENV=development
```

**Environment Variable Details:**

- **GEMINI_API_KEY**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **APIFY_API_KEY**: Get from [Apify Console](https://console.apify.com/account/integrations) 
  - The provided key `apify_api_EsvCiOOlJobxaZnJ3Klnyucd5IRdgq4CsoP3` is included
  - Enhanced analysis uses [aYG0l9s7dbB7j3gbS Actor](https://console.apify.com/actors/aYG0l9s7dbB7j3gbS/input)
- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment mode (development/production)

4. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

5. **Test the Apify Integration:**
```bash
# Test the complete Apify integration
npm run test-apify

# Or run specific tests
node test-apify.js
```

6. **Start the development server:**
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Production Deployment on Render

1. **Environment Variables:**
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: `chrome-extension://,moz-extension://`

2. **Build Command:** `npm run build`
3. **Start Command:** `npm start`

## Usage in Chrome Extension

Update your Chrome extension's privacy analyzer to call this API:

```typescript
// src/utils/privacy.ts
export class PrivacyPolicyAnalyzer {
  private static readonly API_BASE_URL = 'https://your-render-app.onrender.com/api';
  
  static async analyzePolicy(url: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/privacy-policy/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Privacy policy analysis failed:', error);
      // Return fallback data
      return {
        score: 50,
        risks: ['Unable to analyze privacy policy'],
        summary: 'Privacy policy analysis unavailable'
      };
    }
  }
}
```

## Architecture

- **Express.js**: Web framework
- **Google Gemini**: AI analysis engine
- **Puppeteer**: Web scraping for JavaScript-heavy sites
- **Cheerio**: HTML parsing for static content
- **TypeScript**: Type safety and better development experience

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Only allows Chrome extension origins
- **Input Validation**: URL validation and content sanitization
- **Error Handling**: Comprehensive error handling and logging

## Error Handling

The API provides detailed error responses:

- `400`: Bad request (invalid URL, missing parameters)
- `404`: Privacy policy not found
- `408`: Request timeout
- `429`: Rate limit exceeded
- `500`: Internal server error (AI service issues, scraping failures)

## Performance

- **Caching**: Consider implementing Redis for frequently analyzed sites
- **Timeouts**: 30-second timeout for scraping, 15-second for simple requests
- **Optimization**: Text truncation to stay within AI model limits

## Support

For issues related to the Chrome extension, please check the main project repository.

## Enhanced Privacy Analysis with Apify

The backend now includes enhanced privacy policy analysis powered by Apify web scraping. This provides:

### Key Features

1. **Multi-Page Analysis**: 
   - Discovers and analyzes privacy policies across multiple pages
   - Includes cookie policies, data protection notices, terms of service
   - Provides comprehensive view of data practices

2. **Improved Content Extraction**:
   - Uses Apify's robust web scraping for JavaScript-heavy sites
   - Handles dynamic content and SPAs better than simple HTTP requests
   - Fallback to simple scraping if Apify is unavailable

3. **Enhanced AI Analysis**:
   - Processes larger amounts of privacy-related content
   - Provides detailed scoring across multiple dimensions
   - Identifies key privacy findings and concerns

### Analysis Modes

- **Standard Mode** (`/analyze`): Traditional single-page analysis with optional enhancement
- **Enhanced Mode** (`/analyze-enhanced`): Full multi-page analysis using Apify

### Scoring System

Enhanced analysis provides scores (0-100) for:
- **Data Collection**: How much personal data is collected
- **Third Party Sharing**: Extent of data sharing with external parties  
- **User Rights**: Level of user control and rights provided
- **Transparency**: Clarity and accessibility of privacy information

### Usage Examples

```javascript
// Standard analysis
const response = await fetch('/api/privacy-policy/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com',
    enhanced: true // Enable enhanced mode
  })
});

// Full enhanced analysis
const enhancedResponse = await fetch('/api/privacy-policy/analyze-enhanced', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com'
  })
});
```
