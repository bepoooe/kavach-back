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
  }private setupRequestBlocking() {
    console.log('🛡️ Kavach: Setting up request blocking...');
    
    // Monitor web requests to track third-party requests
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        console.log('🌐 Request detected:', details.url, 'Type:', details.type, 'Initiator:', details.initiator);
        
        if (details.type === 'main_frame') return {};
        
        const url = new URL(details.url);
        const initiatorUrl = details.initiator ? new URL(details.initiator) : null;
        
        if (initiatorUrl && url.hostname !== initiatorUrl.hostname) {
          console.log('🚨 Third-party request:', url.hostname, 'from', initiatorUrl.hostname);
          this.trackThirdPartyRequest(initiatorUrl.hostname, url.hostname, details.type);
        }
        
        return {};
      },
      { urls: ['<all_urls>'] },
      ['requestBody']
    );
  }
  private setupTabListeners() {
    console.log('👂 Setting up tab listeners...');
    
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        console.log('📄 Tab completed loading:', tab.url);
        this.initializeSiteData(tab.url);
      }
    });

    // Also listen for tab activation to ensure we have data for active tabs
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.url) {
          console.log('🔄 Tab activated:', tab.url);
          this.initializeSiteData(tab.url);
        }
      } catch (error) {
        console.log('❌ Error getting active tab:', error);
      }
    });
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
    const domain = new URL(url).hostname;
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
    const domain = new URL(url).hostname;
    
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
      }
    });
  }

  private storePrivacyPolicyUrls(siteUrl: string, policyUrls: string[]) {
    const domain = new URL(siteUrl).hostname;
    this.privacyPolicyUrls.set(domain, policyUrls);
  }

  async analyzePrivacyPolicy(siteUrl: string): Promise<any> {
    const domain = new URL(siteUrl).hostname;
    const policyUrls = this.privacyPolicyUrls.get(domain) || [];
    
    // If no privacy policy URLs found, try to find them
    if (policyUrls.length === 0) {
      // Try common privacy policy paths
      const commonPaths = [
        '/privacy',
        '/privacy-policy',
        '/privacy.html',
        '/terms',
        '/terms-of-service',
        '/legal/privacy'
      ];
      
      for (const path of commonPaths) {
        try {
          const response = await fetch(`https://${domain}${path}`);
          if (response.ok) {
            policyUrls.push(response.url);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
    }

    if (policyUrls.length === 0) {
      return {
        score: 50,
        risks: ['No privacy policy found'],
        summary: 'Unable to locate a privacy policy for this website.',
        dataSharing: []
      };
    }

    // Fetch and analyze the privacy policy
    try {
      const policyText = await this.fetchPrivacyPolicyText(policyUrls[0]);
      const analysis = await this.performPrivacyAnalysis(policyText, domain);
      
      // Store the analysis in site data
      const siteData = this.siteData.get(domain);
      if (siteData) {
        siteData.privacyAnalysis = analysis;
        this.siteData.set(domain, siteData);
      }
      
      return analysis;
    } catch (error) {
      console.error('Privacy policy analysis failed:', error);
      return {
        score: 30,
        risks: ['Failed to analyze privacy policy'],
        summary: 'Privacy policy analysis failed due to technical issues.',
        dataSharing: []
      };
    }
  }

  private async fetchPrivacyPolicyText(policyUrl: string): Promise<string> {
    const response = await fetch(policyUrl);
    const html = await response.text();
    
    // Extract text content from HTML (simple approach)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    return doc.body.textContent || doc.body.innerText || '';
  }
  private async performPrivacyAnalysis(policyText: string, domain: string): Promise<any> {
    // Mock AI-powered analysis (in real implementation, this would call an AI service)
    const text = policyText.toLowerCase();
    
    const risks: string[] = [];
    const dataSharing: string[] = [];
    let score = 70; // Base score

    // Analyze for common privacy risks
    if (text.includes('sell') && text.includes('personal information')) {
      risks.push('May sell personal information to third parties');
      score -= 20;
    }

    if (text.includes('track') && text.includes('across websites')) {
      risks.push('Tracks users across multiple websites');
      score -= 15;
    }

    if (text.includes('advertising') && text.includes('personalized')) {
      risks.push('Uses data for targeted advertising');
      score -= 10;
    }

    if (text.includes('location') && text.includes('collect')) {
      risks.push('Collects location data');
      score -= 10;
    }

    if (!text.includes('opt-out') && !text.includes('opt out')) {
      risks.push('Limited opt-out options');
      score -= 15;
    }

    if (!text.includes('delete') && !text.includes('removal')) {
      risks.push('No clear data deletion process');
      score -= 10;
    }

    // Check for data sharing mentions
    const commonPartners = [
      'google', 'facebook', 'amazon', 'microsoft', 'adobe', 'salesforce',
      'analytics', 'advertising', 'partners', 'affiliates', 'subsidiaries'
    ];

    commonPartners.forEach(partner => {
      if (text.includes(partner)) {
        if (partner === 'google') dataSharing.push('Google');
        else if (partner === 'facebook') dataSharing.push('Meta/Facebook');
        else if (partner === 'amazon') dataSharing.push('Amazon');
        else if (partner === 'microsoft') dataSharing.push('Microsoft');
        else if (partner === 'adobe') dataSharing.push('Adobe');
        else if (partner === 'analytics') dataSharing.push('Analytics Providers');
        else if (partner === 'advertising') dataSharing.push('Advertising Networks');
        else if (partner === 'partners') dataSharing.push('Business Partners');
      }
    });

    // Generate summary based on analysis
    let summary = `This privacy policy has been analyzed for key privacy practices. `;
    
    if (score >= 80) {
      summary += 'The policy shows good privacy practices with clear user rights and limited data sharing.';
    } else if (score >= 60) {
      summary += 'The policy shows moderate privacy practices but has some concerning data collection or sharing practices.';
    } else if (score >= 40) {
      summary += 'The policy shows concerning privacy practices with extensive data collection and sharing.';
    } else {
      summary += 'The policy shows poor privacy practices with significant risks to user privacy.';
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      risks: risks.slice(0, 5), // Limit to 5 most important risks
      summary,
      dataSharing: [...new Set(dataSharing)].slice(0, 6) // Remove duplicates and limit
    };
  }
}

const backgroundService = new BackgroundService();

export {};
