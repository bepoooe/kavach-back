import { SiteData, TrackerData } from '../utils/types';
import { TrustScoreCalculator, commonTrackers } from '../utils/privacy';

class BackgroundService {
  private siteData = new Map<string, SiteData>();
  private blockedRequests = new Map<string, number>();
  private privacyPolicyUrls = new Map<string, string[]>();

  constructor() {
    this.setupRequestBlocking();
    this.setupTabListeners();
    this.setupMessageListeners();
  }
  private setupRequestBlocking() {
    // Monitor web requests to track third-party requests
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        if (details.type === 'main_frame') return {};
        
        const url = new URL(details.url);
        const initiatorUrl = details.initiator ? new URL(details.initiator) : null;
        
        if (initiatorUrl && url.hostname !== initiatorUrl.hostname) {
          this.trackThirdPartyRequest(initiatorUrl.hostname, url.hostname, details.type);
        }
        
        return {};
      },
      { urls: ['<all_urls>'] },
      ['requestBody']
    );
  }

  private setupTabListeners() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.initializeSiteData(tab.url);
      }
    });
  }

  private trackThirdPartyRequest(sourceDomain: string, trackerDomain: string, requestType: string) {
    const siteData = this.siteData.get(sourceDomain);
    if (!siteData) return;

    const existingTracker = siteData.trackers.find(t => t.domain === trackerDomain);
    if (existingTracker) {
      existingTracker.count++;
    } else {
      const trackerInfo = commonTrackers[trackerDomain as keyof typeof commonTrackers];
      siteData.trackers.push({
        domain: trackerDomain,
        count: 1,
        category: trackerInfo?.category || 'unknown',
        blocked: this.isTrackerBlocked(trackerDomain)
      });
    }

    // Recalculate trust score
    siteData.trustScore = TrustScoreCalculator.calculateScore(siteData.trackers);
    
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
  }

  private initializeSiteData(url: string) {
    const domain = new URL(url).hostname;
    if (!this.siteData.has(domain)) {
      this.siteData.set(domain, {
        url,
        trustScore: 100,
        trackers: [],
        dataFlow: {
          nodes: [],
          edges: []
        }
      });
    }
  }

  async getSiteData(url: string): Promise<SiteData | null> {
    const domain = new URL(url).hostname;
    return this.siteData.get(domain) || null;
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
