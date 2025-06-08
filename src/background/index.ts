import { SiteData, TrackerData } from '../utils/types';
import { TrustScoreCalculator, commonTrackers } from '../utils/privacy';

class BackgroundService {
  private siteData = new Map<string, SiteData>();
  private blockedRequests = new Map<string, number>();

  constructor() {
    this.setupRequestBlocking();
    this.setupTabListeners();
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
}

const backgroundService = new BackgroundService();

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getSiteData':
      backgroundService.getSiteData(request.url).then(sendResponse);
      return true;
    
    case 'toggleBlocking':
      backgroundService.toggleTrackerBlocking(request.enabled).then(() => {
        sendResponse({ success: true });
      });
      return true;
  }
});

export {};
