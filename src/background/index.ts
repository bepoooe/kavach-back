import { SiteData, TrackerData } from '../utils/types';
import { TrustScoreCalculator, commonTrackers } from '../utils/privacy';

class BackgroundService {
  private siteData = new Map<string, SiteData>();
  private blockedRequests = new Map<string, number>();
  private privacyPolicyUrls = new Map<string, string[]>();

  constructor() {
    console.log('🚀 Kavach Background Service starting...');
    this.setupRequestBlocking();
    this.setupTabListeners();
    this.setupMessageListeners();
    console.log('✅ Kavach Background Service initialized');
  }

  private safeParseURL(url: string): URL | null {
    try {
      if (!url || typeof url !== 'string') {
        console.warn('❌ Invalid URL input:', url);
        return null;
      }
      return new URL(url);
    } catch (error) {
      console.warn('❌ Failed to parse URL:', url, error);
      return null;
    }
  }

  private getDomainFromURL(url: string): string | null {
    const parsedUrl = this.safeParseURL(url);
    return parsedUrl ? parsedUrl.hostname : null;
  }  private setupRequestBlocking() {
    console.log('🛡️ Kavach: Setting up request blocking...');
    
    // Monitor web requests to track third-party requests
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        console.log('🌐 Request detected:', details.url, 'Type:', details.type, 'Initiator:', details.initiator);
        
        if (details.type === 'main_frame') return {};
        
        const url = this.safeParseURL(details.url);
        const initiatorUrl = details.initiator ? this.safeParseURL(details.initiator) : null;
        
        if (url && initiatorUrl && url.hostname !== initiatorUrl.hostname) {
          console.log('🚨 Third-party request:', url.hostname, 'from', initiatorUrl.hostname);
          this.trackThirdPartyRequest(initiatorUrl.hostname, url.hostname, details.type);
        }
        
        return {};
      },
      { urls: ['<all_urls>'] },
      ['requestBody']
    );
  }  private setupTabListeners() {
    console.log('👂 Setting up tab listeners...');
    
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && this.isValidHttpUrl(tab.url)) {
        console.log('📄 Tab completed loading:', tab.url);
        this.initializeSiteData(tab.url);
      }
    });

    // Also listen for tab activation to ensure we have data for active tabs
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.url && this.isValidHttpUrl(tab.url)) {
          console.log('🔄 Tab activated:', tab.url);
          this.initializeSiteData(tab.url);
        }
      } catch (error) {
        console.log('❌ Error getting active tab:', error);
      }
    });
  }

  private isValidHttpUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }private trackThirdPartyRequest(sourceDomain: string, trackerDomain: string, requestType: string) {
    console.log('📊 Tracking third-party request:', { sourceDomain, trackerDomain, requestType });
    
    let siteData = this.siteData.get(sourceDomain);
    if (!siteData) {
      console.log('❌ No site data found for:', sourceDomain, '- Creating new site data');
      // Initialize site data for this domain
      this.initializeSiteDataForDomain(sourceDomain);
      siteData = this.siteData.get(sourceDomain);
      if (!siteData) {
        console.log('❌ Failed to create site data for:', sourceDomain);
        return;
      }
    }

    const existingTracker = siteData.trackers.find(t => t.domain === trackerDomain);
    if (existingTracker) {
      existingTracker.count++;
      console.log('📈 Updated tracker count:', trackerDomain, existingTracker.count);
    } else {
      const trackerInfo = commonTrackers[trackerDomain as keyof typeof commonTrackers];
      const newTracker = {
        domain: trackerDomain,
        count: 1,
        category: trackerInfo?.category || 'unknown',
        blocked: this.isTrackerBlocked(trackerDomain)
      };
      siteData.trackers.push(newTracker);
      console.log('🆕 New tracker detected:', newTracker);
    }

    // Recalculate trust score
    const oldScore = siteData.trustScore;
    siteData.trustScore = TrustScoreCalculator.calculateScore(siteData.trackers);
    console.log('🎯 Trust score updated:', oldScore, '→', siteData.trustScore);
    
    // Update data flow visualization
    this.updateDataFlow(siteData, sourceDomain, trackerDomain);
    
    this.siteData.set(sourceDomain, siteData);
  }

  private isTrackerBlocked(domain: string): boolean {
    // Check if domain is in our blocking rules
    const blockedDomains = ['doubleclick.net', 'googletagmanager.com', 'facebook.com/tr'];
    return blockedDomains.some(blocked => domain.includes(blocked));
  }

  private updateDataFlow(siteData: SiteData, source: string, tracker: string) {
    // Add nodes if they don't exist
    if (!siteData.dataFlow.nodes.find(n => n.id === source)) {
      siteData.dataFlow.nodes.push({
        id: source,
        domain: source,
        type: 'source',
        position: { x: 100, y: 100 }
      });
    }

    if (!siteData.dataFlow.nodes.find(n => n.id === tracker)) {
      const nodeCount = siteData.dataFlow.nodes.length;
      siteData.dataFlow.nodes.push({
        id: tracker,
        domain: tracker,
        type: 'tracker',
        position: { x: 200 + (nodeCount * 100), y: 150 }
      });
    }

    // Add edge if it doesn't exist
    if (!siteData.dataFlow.edges.find(e => e.from === source && e.to === tracker)) {
      siteData.dataFlow.edges.push({
        from: source,
        to: tracker,
        dataType: 'user_data'
      });
    }
  }  private initializeSiteData(url: string) {
    const domain = this.getDomainFromURL(url);
    if (!domain) {
      console.warn('❌ Cannot initialize site data for invalid URL:', url);
      return;
    }
    
    console.log('🏠 Initializing site data for:', domain);
    
    if (!this.siteData.has(domain)) {
      const newSiteData = {
        url,
        trustScore: 100,
        trackers: [],
        dataFlow: {
          nodes: [],
          edges: []
        }
      };
      this.siteData.set(domain, newSiteData);
      console.log('✅ Site data initialized:', newSiteData);
    } else {
      console.log('♻️ Site data already exists for:', domain);
    }
  }

  private initializeSiteDataForDomain(domain: string) {
    console.log('🏠 Initializing site data for domain:', domain);
    
    if (!this.siteData.has(domain)) {
      const newSiteData = {
        url: `https://${domain}`, // Construct basic URL from domain
        trustScore: 100,
        trackers: [],
        dataFlow: {
          nodes: [],
          edges: []
        }
      };
      this.siteData.set(domain, newSiteData);
      console.log('✅ Site data initialized for domain:', newSiteData);
    } else {
      console.log('♻️ Site data already exists for domain:', domain);
    }
  }  async getSiteData(url: string): Promise<SiteData | null> {
    const domain = this.getDomainFromURL(url);
    if (!domain) {
      console.warn('❌ Cannot get site data for invalid URL:', url);
      return null;
    }
    
    // Ensure site data exists for this domain
    if (!this.siteData.has(domain)) {
      console.log('🔄 Site data not found, initializing for:', domain);
      this.initializeSiteData(url);
    }
    
    const siteData = this.siteData.get(domain) || null;
    console.log('📊 Getting site data for:', domain, 'Found:', !!siteData, 'Trackers:', siteData?.trackers?.length || 0);
    return siteData;
  }
  async toggleTrackerBlocking(enabled: boolean) {
    // Toggle declarative net request rules
    const ruleIds = [1, 2, 3, 4, 5]; // IDs from rules.json
    
    if (enabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['tracker_rules']
      });
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['tracker_rules']
      });
    }
  }
  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('📨 Message received:', request.action, request);
      
      switch (request.action) {
        case 'getSiteData':
          this.getSiteData(request.url).then(sendResponse);
          return true;
        
        case 'getFingerprintScript':
          this.getFingerprintScript(request.apiKey).then(sendResponse);
          return true;

        case 'toggleBlocking':
          this.toggleTrackerBlocking(request.enabled).then(() => {
            sendResponse({ success: true });
          });
          return true;

        case 'analyzePrivacyPolicy':
          this.analyzePrivacyPolicy(request.url).then(sendResponse);
          return true;

        case 'privacyPoliciesFound':
          this.storePrivacyPolicyUrls(request.currentUrl, request.urls);
          sendResponse({ success: true });
          return true;

        case 'debugInfo':
          // Return debug information
          const debugInfo = {
            trackedDomains: Array.from(this.siteData.keys()),
            totalSites: this.siteData.size,
            siteDataSnapshot: Array.from(this.siteData.entries()).map(([domain, data]) => ({
              domain,
              trackerCount: data.trackers.length,
              trustScore: data.trustScore
            }))
          };
          console.log('🐛 Debug info requested:', debugInfo);
          sendResponse(debugInfo);
          return true;
        case 'runFingerprint':
          if (request.tabId) {
            this.handleFingerprinting(request.apiKey, request.tabId)
              .then(sendResponse)
              .catch(error => sendResponse({ success: false, error: error.message }));
          } else {
            sendResponse({ success: false, error: 'No tabId provided in the request.' });
          }
          return true; // Keep channel open for async response

        case 'performOptOut':
          this.performComprehensiveOptOut(request.url, request.tabId)
            .then(sendResponse)
            .catch((error: any) => sendResponse({ success: false, error: error.message }));
          return true;
      }
    });
  }
  private storePrivacyPolicyUrls(siteUrl: string, policyUrls: string[]) {
    const domain = this.getDomainFromURL(siteUrl);
    if (!domain) {
      console.warn('❌ Cannot store privacy policy URLs for invalid URL:', siteUrl);
      return;
    }
    this.privacyPolicyUrls.set(domain, policyUrls);
  }
  async analyzePrivacyPolicy(siteUrl: string): Promise<any> {
    const domain = this.getDomainFromURL(siteUrl);
    if (!domain) {
      console.warn('❌ Cannot analyze privacy policy for invalid URL:', siteUrl);
      return { error: 'Invalid URL provided' };
    }

    console.log('🤖 Starting real-time privacy policy analysis for:', siteUrl);

    try {
      // First, try enhanced analysis with Apify + Gemini
      const enhancedAnalysis = await this.callBackendAPI('/api/privacy-policy/analyze-enhanced', {
        url: siteUrl
      });

      if (enhancedAnalysis.success) {
        console.log('✅ Enhanced analysis completed successfully');
        return this.formatAnalysisResponse(enhancedAnalysis.data, 'enhanced');
      }

      // Fallback to standard analysis if enhanced fails
      console.log('⚠️ Enhanced analysis failed, trying standard analysis...');
      const standardAnalysis = await this.callBackendAPI('/api/privacy-policy/analyze', {
        url: siteUrl,
        enhanced: false
      });

      if (standardAnalysis.success) {
        console.log('✅ Standard analysis completed successfully');
        return this.formatAnalysisResponse(standardAnalysis.data, 'standard');
      }

      // If backend is unavailable, use fallback analysis
      console.log('⚠️ Backend unavailable, using fallback analysis...');
      return await this.fallbackPrivacyAnalysis(siteUrl);

    } catch (error) {
      console.error('❌ Privacy policy analysis failed:', error);
      return await this.fallbackPrivacyAnalysis(siteUrl);
    }
  }

  private async callBackendAPI(endpoint: string, data: any): Promise<any> {
    const BACKEND_URL = 'http://localhost:3000';
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Backend API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private formatAnalysisResponse(backendData: any, analysisType: string): any {
    // Convert backend response to extension format
    const score = this.calculateScoreFromSafety(backendData.safety, backendData.scores);
    
    return {
      score,
      risks: this.extractRisks(backendData),
      summary: backendData.summary || 'Privacy policy analysis completed',
      dataSharing: this.extractDataSharing(backendData),
      recommendations: this.generateRecommendations(backendData),
      complianceStatus: this.assessCompliance(backendData),
      analysisType,
      keyFindings: backendData.keyFindings || [],
      scores: backendData.scores || {},
      metadata: backendData.policyMetadata || {}
    };
  }

  private calculateScoreFromSafety(safety: string, scores?: any): number {
    // Base score from safety rating
    let baseScore = 50;
    switch (safety) {
      case 'SAFE': baseScore = 85; break;
      case 'RISKY': baseScore = 50; break;
      case 'UNSAFE': baseScore = 20; break;
    }

    // Adjust with detailed scores if available
    if (scores) {
      const avgScore = (
        (scores.dataCollection || 50) +
        (scores.thirdParty || 50) +
        (scores.userRights || 50) +
        (scores.transparency || 50)
      ) / 4;
      
      // Weighted average: 60% detailed scores, 40% safety rating
      return Math.round((avgScore * 0.6) + (baseScore * 0.4));
    }

    return baseScore;
  }

  private extractRisks(data: any): string[] {
    const risks: string[] = [];
    
    if (data.safety === 'UNSAFE') {
      risks.push('High privacy risk detected');
    } else if (data.safety === 'RISKY') {
      risks.push('Moderate privacy concerns identified');
    }

    if (data.scores) {
      if (data.scores.dataCollection < 50) {
        risks.push('Extensive data collection practices');
      }
      if (data.scores.thirdParty < 50) {
        risks.push('Significant third-party data sharing');
      }
      if (data.scores.userRights < 50) {
        risks.push('Limited user control and rights');
      }
      if (data.scores.transparency < 50) {
        risks.push('Unclear or vague privacy policy');
      }
    }

    if (data.keyFindings) {
      data.keyFindings.forEach((finding: string) => {
        if (finding.toLowerCase().includes('concern') || 
            finding.toLowerCase().includes('risk') ||
            finding.toLowerCase().includes('issue')) {
          risks.push(finding);
        }
      });
    }

    return risks.length > 0 ? risks : ['Analysis completed without major concerns'];
  }

  private extractDataSharing(data: any): string[] {
    const dataSharing: string[] = [];
    
    if (data.keyFindings) {
      data.keyFindings.forEach((finding: string) => {
        if (finding.toLowerCase().includes('google') ||
            finding.toLowerCase().includes('facebook') ||
            finding.toLowerCase().includes('analytics') ||
            finding.toLowerCase().includes('advertising') ||
            finding.toLowerCase().includes('third party') ||
            finding.toLowerCase().includes('partners')) {
          dataSharing.push(finding);
        }
      });
    }

    // Default common trackers if none found
    if (dataSharing.length === 0) {
      dataSharing.push('Analytics services', 'Advertising networks');
    }

    return dataSharing;
  }

  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];
    
    if (data.scores) {
      if (data.scores.userRights < 70) {
        recommendations.push('Review your privacy settings');
        recommendations.push('Consider opting out of data sharing');
      }
      if (data.scores.transparency < 70) {
        recommendations.push('Read the full privacy policy carefully');
      }
      if (data.scores.thirdParty < 60) {
        recommendations.push('Use privacy-focused browser settings');
        recommendations.push('Consider using tracking protection');
      }
    }

    if (data.safety === 'UNSAFE') {
      recommendations.push('Avoid sharing sensitive information');
      recommendations.push('Use alternative services if possible');
    }

    return recommendations.length > 0 ? recommendations : ['Enable privacy protection features'];
  }

  private assessCompliance(data: any): any {
    // Basic compliance assessment based on analysis
    const compliance = {
      gdpr: 'unclear',
      ccpa: 'unclear',
      coppa: 'unclear'
    };

    if (data.keyFindings) {
      const findings = data.keyFindings.join(' ').toLowerCase();
      
      if (findings.includes('gdpr') || findings.includes('data protection')) {
        compliance.gdpr = data.scores?.userRights > 70 ? 'compliant' : 'partial';
      }
      
      if (findings.includes('ccpa') || findings.includes('california')) {
        compliance.ccpa = data.scores?.userRights > 70 ? 'compliant' : 'partial';
      }
      
      if (findings.includes('children') || findings.includes('coppa')) {
        compliance.coppa = data.scores?.dataCollection > 80 ? 'compliant' : 'non-compliant';
      }
    }

    return compliance;
  }

  private async fallbackPrivacyAnalysis(siteUrl: string): Promise<any> {
    const domain = this.getDomainFromURL(siteUrl);
    if (!domain) {
      return { error: 'Invalid URL provided' };
    }

    const policyUrls = this.privacyPolicyUrls.get(domain) || [];
    
    // If no privacy policy URLs found, try to find them with enhanced detection
    if (policyUrls.length === 0) {
      // Expanded list of common privacy policy paths
      const commonPaths = [
        '/privacy',
        '/privacy-policy',
        '/privacy.html',
        '/privacy.php',
        '/privacy.aspx',
        '/terms',
        '/terms-of-service',
        '/terms-and-conditions',
        '/legal/privacy',
        '/legal/terms',
        '/help/privacy',
        '/support/privacy',
        '/about/privacy',
        '/policies/privacy',
        '/privacy-statement',
        '/privacy-notice',
        '/data-protection',
        '/cookie-policy',
        '/gdpr',
        '/ccpa'
      ];
      
      // Try multiple variations with different protocols and subdomains
      const urlVariations = [
        `https://${domain}`,
        `https://www.${domain}`,
        `http://${domain}`,
        `http://www.${domain}`
      ];
      
      for (const baseUrl of urlVariations) {        for (const path of commonPaths) {
          try {
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${baseUrl}${path}`, {
              method: 'HEAD', // Use HEAD request for faster checking
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              policyUrls.push(`${baseUrl}${path}`);
              break; // Found one, move to next base URL
            }
          } catch (e) {
            // Continue to next path
          }
        }
        if (policyUrls.length > 0) break; // Found policy, stop searching
      }
    }

    if (policyUrls.length === 0) {
      return {
        score: 50,
        risks: ['No privacy policy found'],
        summary: 'Unable to locate a privacy policy for this website.',
        dataSharing: [],
        recommendations: ['Look for privacy information in website footer'],
        complianceStatus: { gdpr: 'unclear', ccpa: 'unclear', coppa: 'unclear' },
        analysisType: 'fallback'
      };
    }

    // Fetch and analyze the privacy policy with basic analysis
    try {
      const policyText = await this.fetchPrivacyPolicyText(policyUrls[0]);
      const analysis = await this.performBasicPrivacyAnalysis(policyText, domain);
      
      // Store the analysis in site data
      const siteData = this.siteData.get(domain);
      if (siteData) {
        siteData.privacyAnalysis = analysis;
        this.siteData.set(domain, siteData);
      }
      
      return analysis;
    } catch (error) {
      console.error('Fallback privacy policy analysis failed:', error);
      return {
        score: 30,
        risks: ['Failed to analyze privacy policy'],
        summary: 'Privacy policy analysis encountered an error.',
        dataSharing: [],
        recommendations: ['Manual review recommended'],
        complianceStatus: { gdpr: 'unclear', ccpa: 'unclear', coppa: 'unclear' },
        analysisType: 'fallback'
      };
    }
  }

  private async performBasicPrivacyAnalysis(policyText: string, domain: string): Promise<any> {
    // Basic analysis without AI - simplified version
    const textLower = policyText.toLowerCase();
    
    let score = 70; // Start with neutral score
    const risks: string[] = [];
    const dataSharing: string[] = [];
    
    // Check for common privacy concerns
    if (textLower.includes('third party') || textLower.includes('partners')) {
      score -= 10;
      risks.push('Data may be shared with third parties');
      dataSharing.push('Third-party partners');
    }
    
    if (textLower.includes('cookies') || textLower.includes('tracking')) {
      dataSharing.push('Tracking cookies');
    }
    
    if (textLower.includes('advertising') || textLower.includes('marketing')) {
      score -= 5;
      dataSharing.push('Advertising partners');
    }
    
    if (textLower.includes('google analytics') || textLower.includes('analytics')) {
      dataSharing.push('Google Analytics');
    }
    
    // Check for positive indicators
    if (textLower.includes('gdpr') || textLower.includes('data protection')) {
      score += 10;
    }
    
    if (textLower.includes('opt out') || textLower.includes('opt-out')) {
      score += 5;
    }
    
    return {
      score: Math.max(20, Math.min(100, score)),
      risks: risks.length > 0 ? risks : ['Standard data collection practices'],
      summary: 'Basic privacy policy analysis completed',
      dataSharing: dataSharing.length > 0 ? dataSharing : ['Standard website analytics'],
      recommendations: score < 50 ? ['Review privacy settings', 'Consider opt-out options'] : ['Standard privacy recommendations'],
      complianceStatus: { gdpr: 'unclear', ccpa: 'unclear', coppa: 'unclear' },
      analysisType: 'basic'
    };
  }

  private async fetchPrivacyPolicyText(policyUrl: string): Promise<string> {
    try {
      const response = await fetch(policyUrl);
      const html = await response.text();

      // Remove script and style tags
      let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

      // Remove all HTML tags and decode entities
      let textContent = cleanHtml.replace(/<[^>]*>/g, ' ');

      // Decode common HTML entities
      textContent = textContent.replace(/&nbsp;/g, ' ')
                              .replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&quot;/g, '"')
                              .replace(/&#39;/g, "'");

      // Clean up whitespace
      textContent = textContent.replace(/\s+/g, ' ').trim();

      return textContent;
    } catch (error) {
      console.error('Failed to fetch privacy policy:', policyUrl, error);
      throw new Error(`Failed to fetch privacy policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }  private async performPrivacyAnalysis(policyText: string, domain: string): Promise<any> {
    const text = policyText.toLowerCase();
    const risks: string[] = [];
    const dataSharing: string[] = [];
    let score = 80; // Start with a higher base score

    // Enhanced risk detection with more sophisticated patterns
    const riskPatterns = {
      'Data Selling': {
        keywords: ['sell', 'sale', 'sold', 'monetize', 'revenue from data', 'third-party purchasers'],
        penalty: 25,
        context: ['personal information', 'user data', 'your data']
      },
      'Cross-site Tracking': {
        keywords: ['track across', 'follow you', 'behavioral tracking', 'cross-site', 'cross-platform'],
        penalty: 20,
        context: ['websites', 'platforms', 'services']
      },
      'Vague Data Retention': {
        keywords: ['indefinitely', 'as long as necessary', 'business purposes', 'legal requirements'],
        penalty: 15,
        context: ['retain', 'keep', 'store', 'maintain']
      },
      'Limited User Control': {
        keywords: ['cannot delete', 'unable to remove', 'permanent', 'irrevocable'],
        penalty: 20,
        context: ['account', 'data', 'information']
      },
      'Broad Data Collection': {
        keywords: ['all information', 'any data', 'everything', 'comprehensive'],
        penalty: 15,
        context: ['collect', 'gather', 'obtain']
      },
      'Weak Consent Mechanisms': {
        keywords: ['deemed consent', 'implied consent', 'continued use', 'by using'],
        penalty: 18,
        context: ['agree', 'consent', 'acceptance']
      },
      'Data Sharing with Law Enforcement': {
        keywords: ['law enforcement', 'government agencies', 'legal process', 'subpoena'],
        penalty: 10,
        context: ['share', 'provide', 'disclose']
      },
      'Location Tracking': {
        keywords: ['precise location', 'gps', 'geolocation', 'whereabouts'],
        penalty: 15,
        context: ['track', 'collect', 'monitor']
      },
      'Biometric Data Collection': {
        keywords: ['biometric', 'fingerprint', 'facial recognition', 'voice print'],
        penalty: 20,
        context: ['collect', 'process', 'store']
      },
      'Children Data Collection': {
        keywords: ['under 13', 'children', 'minors', 'parental consent'],
        penalty: 25,
        context: ['collect', 'process', 'target']
      }
    };

    // Check for risks with context awareness
    for (const [riskName, config] of Object.entries(riskPatterns)) {
      const hasKeywords = config.keywords.some(keyword => text.includes(keyword));
      const hasContext = config.context.some(context => text.includes(context));
      
      if (hasKeywords && hasContext) {
        risks.push(riskName);
        score -= config.penalty;
      }
    }

    // Enhanced data sharing detection
    const sharingEntities = {
      'Google': ['google', 'alphabet', 'youtube', 'gmail', 'google analytics', 'doubleclick'],
      'Meta/Facebook': ['facebook', 'meta', 'instagram', 'whatsapp', 'messenger'],
      'Amazon': ['amazon', 'aws', 'amazon web services', 'alexa'],
      'Microsoft': ['microsoft', 'office 365', 'azure', 'bing'],
      'Apple': ['apple', 'icloud', 'itunes', 'app store'],
      'TikTok/ByteDance': ['tiktok', 'bytedance'],
      'Twitter/X': ['twitter', 'x corp'],
      'Advertising Networks': ['adsense', 'admob', 'advertising partners', 'ad networks'],
      'Analytics Providers': ['analytics', 'tracking', 'measurement', 'statistics'],
      'Data Brokers': ['data broker', 'information broker', 'third-party data'],
      'Marketing Partners': ['marketing partners', 'promotional partners', 'affiliates'],
      'Government Agencies': ['government', 'law enforcement', 'regulatory agencies']
    };

    for (const [entity, keywords] of Object.entries(sharingEntities)) {
      const mentioned = keywords.some(keyword => text.includes(keyword));
      if (mentioned && !dataSharing.includes(entity)) {
        dataSharing.push(entity);
      }
    }

    // Positive privacy practices (score bonuses)
    const positivePatterns = [
      { keywords: ['opt-out', 'opt out'], bonus: 8, description: 'Clear opt-out mechanisms' },
      { keywords: ['delete account', 'data deletion'], bonus: 10, description: 'Account deletion available' },
      { keywords: ['anonymize', 'anonymization'], bonus: 6, description: 'Data anonymization' },
      { keywords: ['encryption', 'encrypted'], bonus: 8, description: 'Data encryption' },
      { keywords: ['minimal data', 'data minimization'], bonus: 12, description: 'Data minimization principle' },
      { keywords: ['user control', 'user choice'], bonus: 8, description: 'User control emphasized' },
      { keywords: ['transparent', 'transparency'], bonus: 6, description: 'Transparency commitment' },
      { keywords: ['third-party audits', 'security audits'], bonus: 10, description: 'Security auditing' },
      { keywords: ['gdpr', 'ccpa', 'privacy rights'], bonus: 12, description: 'Privacy law compliance' }
    ];

    const positiveFeatures: string[] = [];
    for (const pattern of positivePatterns) {
      const hasPositive = pattern.keywords.some(keyword => text.includes(keyword));
      if (hasPositive) {
        score += pattern.bonus;
        positiveFeatures.push(pattern.description);
      }
    }

    // Industry-specific risk assessment
    const industryRisks = {
      'Social Media': ['social', 'posts', 'friends', 'connections'],
      'E-commerce': ['purchase', 'shopping', 'payment', 'transactions'],
      'Financial': ['financial', 'banking', 'credit', 'loan'],
      'Healthcare': ['health', 'medical', 'patient', 'treatment'],
      'Education': ['student', 'academic', 'education', 'learning']
    };

    let industryType = 'General';
    for (const [industry, keywords] of Object.entries(industryRisks)) {
      const isIndustry = keywords.some(keyword => text.includes(keyword));
      if (isIndustry) {
        industryType = industry;
        // Apply industry-specific scoring adjustments
        if (industry === 'Financial' || industry === 'Healthcare') {
          score -= 5; // Higher standards for sensitive industries
        }
        break;
      }
    }

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, score));

    // Generate enhanced summary
    let summary = `This ${industryType.toLowerCase()} privacy policy has been analyzed for comprehensive privacy practices. `;
    
    if (score >= 80) {
      summary += 'The policy demonstrates strong privacy protection with clear user rights, limited data sharing, and transparent practices.';
    } else if (score >= 60) {
      summary += 'The policy shows reasonable privacy practices but has some areas of concern regarding data collection or sharing.';
    } else if (score >= 40) {
      summary += 'The policy has significant privacy concerns with extensive data collection, sharing, or unclear user rights.';
    } else {
      summary += 'The policy raises serious privacy concerns with poor user protection, extensive data sharing, or lack of user control.';
    }

    if (positiveFeatures.length > 0) {
      summary += ` Positive aspects include: ${positiveFeatures.slice(0, 3).join(', ')}.`;
    }

    return {
      score,
      risks: risks.slice(0, 8), // Limit to most important risks
      summary,
      dataSharing: [...new Set(dataSharing)].slice(0, 8), // Remove duplicates and limit
      industryType,
      positiveFeatures: positiveFeatures.slice(0, 5),
      analysisDepth: 'Enhanced AI Analysis',
      lastAnalyzed: new Date().toISOString()
    };
  }

  async getFingerprintScript(apiKey: string): Promise<{ script: string } | { error: string }> {
    const loaderUrl = `https://fpnpmcdn.net/v3/${apiKey}/loader_v3.11.10.js`;
    try {
      const response = await fetch(loaderUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch script: ${response.statusText}`);
      }
      const script = await response.text();
      return { script };
    } catch (error: any) {
      console.error('Failed to fetch FingerprintJS script:', error);
      return { error: error.message };
    }
  }

  async handleFingerprinting(apiKey: string, tabId: number) {
    try {
      // Inject the bundled fingerprinting script into the active tab's main world
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['fingerprint-agent.js'],
        world: 'MAIN'
      });

      // Now execute the code to run FingerprintJS in the main world
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: runFingerprintJS,
        args: [apiKey],
        world: 'MAIN'
      });

      if (results && results[0] && results[0].result) {
        return results[0].result;
      } else {
        throw new Error('No result returned from fingerprinting script');
      }
    } catch (error: any) {
      console.error('Background fingerprinting error:', error);
      return {
        success: false,
        error: `Failed to run fingerprinting: ${error.message}`
      };
    }
  }

  async performComprehensiveOptOut(url: string, tabId: number): Promise<{success: boolean, message?: string, error?: string}> {
    try {
      const domain = this.getDomainFromURL(url);
      if (!domain) {
        throw new Error('Invalid URL provided');
      }

      console.log('🚫 Starting comprehensive opt-out for:', domain);

      // Step 1: Update tracking rules to block this domain
      await this.addDomainToBlockList(domain);

      // Step 2: Clear all request tracking for this domain
      this.clearDomainTrackingData(domain);

      // Step 3: Block all future third-party requests from this domain
      await this.enableEnhancedBlockingForDomain(domain);

      // Step 4: Clear any stored privacy policy data
      this.privacyPolicyUrls.delete(domain);

      // Step 5: Mark domain as opted out
      await chrome.storage.local.set({
        [`optedOut_${domain}`]: {
          timestamp: Date.now(),
          userInitiated: true,
          comprehensive: true
        }
      });

      // Step 6: Reset trust score to reflect opt-out status
      const siteData = this.siteData.get(domain);
      if (siteData) {
        siteData.trustScore = 95; // High score due to opt-out
        siteData.trackers = []; // Clear tracked requests
        this.siteData.set(domain, siteData);
      }

      console.log('✅ Background opt-out processing completed for:', domain);
      
      return { 
        success: true, 
        message: `Comprehensive opt-out completed for ${domain}` 
      };

    } catch (error: any) {
      console.error('❌ Background opt-out failed:', error);
      return { 
        success: false, 
        error: `Opt-out failed: ${error.message}` 
      };
    }
  }

  private async addDomainToBlockList(domain: string): Promise<void> {
    try {
      // Get existing blocked domains
      const storage = await chrome.storage.local.get(['blockedDomains']);
      const blockedDomains = storage.blockedDomains || [];
      
      if (!blockedDomains.includes(domain)) {
        blockedDomains.push(domain);
        await chrome.storage.local.set({ blockedDomains });
        console.log('📝 Added domain to block list:', domain);
      }
    } catch (error) {
      console.warn('Failed to add domain to block list:', error);
    }
  }

  private clearDomainTrackingData(domain: string): void {
    try {
      // Remove from site data
      this.siteData.delete(domain);
      
      // Clear blocked requests count
      const keysToDelete = Array.from(this.blockedRequests.keys())
        .filter(key => key.includes(domain));
      keysToDelete.forEach(key => this.blockedRequests.delete(key));
      
      console.log('🧹 Cleared tracking data for:', domain);
    } catch (error) {
      console.warn('Failed to clear domain tracking data:', error);
    }
  }

  private async enableEnhancedBlockingForDomain(domain: string): Promise<void> {
    try {
      // Create dynamic rules to block requests from this domain
      const newRules: chrome.declarativeNetRequest.Rule[] = [
        {
          id: Date.now(),
          priority: 1,
          action: { type: 'block' as chrome.declarativeNetRequest.RuleActionType },
          condition: {
            initiatorDomains: [domain],
            resourceTypes: [
              'script' as chrome.declarativeNetRequest.ResourceType,
              'xmlhttprequest' as chrome.declarativeNetRequest.ResourceType,
              'image' as chrome.declarativeNetRequest.ResourceType,
              'media' as chrome.declarativeNetRequest.ResourceType,
              'font' as chrome.declarativeNetRequest.ResourceType,
              'websocket' as chrome.declarativeNetRequest.ResourceType
            ]
          }
        }
      ];

      // YouTube-specific blocking rules
      if (domain.includes('youtube.com') || domain.includes('google.com')) {
        newRules.push(
          {
            id: Date.now() + 1,
            priority: 2,
            action: { type: 'block' as chrome.declarativeNetRequest.RuleActionType },
            condition: {
              urlFilter: '*youtube.com/api/stats*',
              resourceTypes: ['xmlhttprequest' as chrome.declarativeNetRequest.ResourceType]
            }
          },
          {
            id: Date.now() + 2,
            priority: 2,
            action: { type: 'block' as chrome.declarativeNetRequest.RuleActionType },
            condition: {
              urlFilter: '*youtube.com/youtubei/v1/log_event*',
              resourceTypes: ['xmlhttprequest' as chrome.declarativeNetRequest.ResourceType]
            }
          },
          {
            id: Date.now() + 3,
            priority: 2,
            action: { type: 'block' as chrome.declarativeNetRequest.RuleActionType },
            condition: {
              urlFilter: '*youtube.com/ptracking*',
              resourceTypes: ['xmlhttprequest' as chrome.declarativeNetRequest.ResourceType, 'image' as chrome.declarativeNetRequest.ResourceType]
            }
          }
        );
      }

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: newRules
      });

      console.log('🛡️ Enhanced blocking enabled for:', domain);
    } catch (error) {
      console.warn('Failed to enable enhanced blocking:', error);
    }
  }
}

// This function gets injected into the webpage after the agent is injected
function runFingerprintJS(apiKey: string) {
  return new Promise((resolve) => {
    // The FingerprintJS object is now available on the window
    // thanks to the injected fingerprint-agent.js script.
    async function initializeFingerprint() {
      try {
        const fp = await (window as any).FingerprintJS.load({
          apiKey: apiKey,
          region: 'ap'
        });
        const result = await fp.get({
          extendedResult: true
        });
        resolve({
          success: true,
          data: {
            visitorId: result.visitorId,
            confidence: result.confidence,
            components: result.components,
            requestId: result.requestId,
            timestamp: Date.now()
          }
        });
      } catch (error: any) {
        resolve({
          success: false,
          error: `Fingerprinting failed: ${error.message}`
        });
      }
    }

    // Wait for the FingerprintJS object to be available
    let checks = 0;
    const interval = setInterval(() => {
      checks++;
      if ((window as any).FingerprintJS) {
        clearInterval(interval);
        initializeFingerprint();
      } else if (checks > 50) { // Timeout after 5 seconds
        clearInterval(interval);
        resolve({ success: false, error: 'FingerprintJS object not found after script injection.' });
      }
    }, 100);
  });
}

const backgroundService = new BackgroundService();

export {};
