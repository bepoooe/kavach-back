/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils/privacy.ts":
/*!******************************!*\
  !*** ./src/utils/privacy.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OptOutManager: () => (/* binding */ OptOutManager),
/* harmony export */   PrivacyPolicyAnalyzer: () => (/* binding */ PrivacyPolicyAnalyzer),
/* harmony export */   TrustScoreCalculator: () => (/* binding */ TrustScoreCalculator),
/* harmony export */   commonTrackers: () => (/* binding */ commonTrackers)
/* harmony export */ });
class TrustScoreCalculator {
    static calculateScore(trackers, privacyRisks = []) {
        let score = 100;
        // Deduct points for trackers
        const trackerPenalty = Math.min(trackers.length * 5, 40);
        score -= trackerPenalty;
        // Deduct points for high-risk trackers
        const highRiskTrackers = trackers.filter(t => ['advertising', 'social', 'analytics'].includes(t.category));
        score -= highRiskTrackers.length * 3;
        // Deduct points for privacy policy risks
        score -= Math.min(privacyRisks.length * 8, 30);
        return Math.max(0, Math.min(100, score));
    }
}
class PrivacyPolicyAnalyzer {
    static async analyzePolicy(url) {
        try {
            console.log('Analyzing privacy policy for:', url);
            const response = await fetch(`${this.API_BASE_URL}/privacy-policy/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
                // Add timeout for Chrome extension
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Analysis failed');
            }
            console.log('Privacy policy analysis completed:', result.data);
            return result.data;
        }
        catch (error) {
            console.error('Privacy policy analysis failed:', error);
            // Return enhanced fallback data based on error type
            const fallbackAnalysis = {
                score: 50,
                risks: ['Unable to analyze privacy policy - please review manually'],
                summary: 'Privacy policy analysis failed. This could be due to network issues, missing privacy policy, or service unavailability.',
                dataSharing: [],
                recommendations: [
                    'Review the privacy policy manually',
                    'Check if the website has a privacy policy',
                    'Contact the website for clarification on data practices'
                ],
                complianceStatus: {
                    gdpr: 'unclear',
                    ccpa: 'unclear',
                    coppa: 'unclear'
                },
                dataRetention: 'Unable to determine data retention policy',
                userRights: [],
                thirdPartySharing: true, // Assume worst case
                cookiePolicy: 'Unable to determine cookie policy',
                policyMetadata: {
                    url: null,
                    title: 'Privacy Policy Analysis Failed',
                    analyzedAt: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
            // Provide more specific feedback based on error type
            if (error instanceof Error) {
                if (error.message.includes('timeout') || error.message.includes('AbortError')) {
                    fallbackAnalysis.summary = 'Privacy policy analysis timed out. The website may be slow to respond.';
                    fallbackAnalysis.recommendations = [
                        'Try again in a few minutes',
                        'Check your internet connection',
                        'Review the privacy policy manually'
                    ];
                }
                else if (error.message.includes('404') || error.message.includes('not found')) {
                    fallbackAnalysis.summary = 'No privacy policy was found on this website.';
                    fallbackAnalysis.score = 30; // Lower score for missing privacy policy
                    fallbackAnalysis.risks = [
                        'No privacy policy found',
                        'Data practices unclear',
                        'User rights undefined'
                    ];
                    fallbackAnalysis.recommendations = [
                        'Contact the website to request their privacy policy',
                        'Avoid sharing personal information',
                        'Consider the privacy implications of using this site'
                    ];
                }
                else if (error.message.includes('network') || error.message.includes('fetch')) {
                    fallbackAnalysis.summary = 'Unable to connect to privacy analysis service.';
                    fallbackAnalysis.recommendations = [
                        'Check your internet connection',
                        'Try again later',
                        'Review the privacy policy manually'
                    ];
                }
            }
            return fallbackAnalysis;
        }
    }
    /**
     * Find privacy policy URL for a website
     */
    static async findPrivacyPolicyUrl(url) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/privacy-policy/find?url=${encodeURIComponent(url)}`, {
                method: 'GET',
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            if (!response.ok) {
                return null;
            }
            const result = await response.json();
            return result.success ? result.data.policyUrl : null;
        }
        catch (error) {
            console.error('Failed to find privacy policy URL:', error);
            return null;
        }
    }
}
// Production Render API endpoint
PrivacyPolicyAnalyzer.API_BASE_URL =  false
    ? 0
    : 'https://kavach-hackolution.onrender.com/api'; // Use production API for both dev and prod
const commonTrackers = {
    'doubleclick.net': { category: 'advertising', name: 'Google DoubleClick' },
    'googletagmanager.com': { category: 'analytics', name: 'Google Tag Manager' },
    'facebook.com': { category: 'social', name: 'Facebook Pixel' },
    'google-analytics.com': { category: 'analytics', name: 'Google Analytics' },
    'connect.facebook.net': { category: 'social', name: 'Facebook Connect' },
    'amazon-adsystem.com': { category: 'advertising', name: 'Amazon Advertising' },
    'twitter.com': { category: 'social', name: 'Twitter Analytics' },
    'linkedin.com': { category: 'social', name: 'LinkedIn Insights' }
};
class OptOutManager {
    static getOptOutStrategy(domain) {
        // Find matching strategy for domain or subdomain
        const strategies = Object.keys(this.OPT_OUT_STRATEGIES);
        const matchingStrategy = strategies.find(strategyDomain => domain.includes(strategyDomain) || strategyDomain.includes(domain));
        return matchingStrategy ? this.OPT_OUT_STRATEGIES[matchingStrategy] : null;
    }
    static getUniversalOptOutCookies() {
        return [
            'gdpr_consent=false',
            'ccpa_optout=true',
            'privacy_optout=true',
            'cookie_consent=rejected',
            'tracking_consent=false',
            'analytics_consent=false',
            'marketing_consent=false',
            'personalization_consent=false',
            'advertising_consent=false',
            'functional_consent=false',
            'performance_consent=false',
            'social_media_consent=false',
            'opt_out=true',
            'privacy_settings=all_rejected',
            'consent_mode=opt_out',
            'do_not_track=1',
            'user_consent_status=rejected',
            // OneTrust specific
            'OptanonConsent=',
            'OptanonAlertBoxClosed=',
            // Cookiebot specific
            'CookieConsent=no',
            // TrustArc specific
            'notice_behavior=implied,eu',
            'notice_gdpr_prefs=0,1,2,3:',
            // Quantcast specific
            'euconsent-v2=',
            // Generic IAB consent
            'gdpr=1',
            'gdpr_consent=',
            // Site-specific patterns
            'cookies_accepted=false',
            'accept_cookies=no',
            'cookie_policy_accepted=false',
            'data_processing_consent=false'
        ];
    }
    static getUniversalOptOutSelectors() {
        return [
            // Generic opt-out buttons
            'button[data-testid*="reject"]',
            'button[data-testid*="decline"]',
            'button[data-testid*="opt-out"]',
            'button[class*="reject"]',
            'button[class*="decline"]',
            'button[class*="opt-out"]',
            'a[href*="opt-out"]',
            'a[href*="unsubscribe"]',
            'a[href*="privacy-settings"]',
            // OneTrust CMP
            '#onetrust-reject-all-handler',
            '#onetrust-pc-btn-handler',
            '.optanon-category-2',
            '.optanon-category-3',
            '.optanon-category-4',
            // Cookiebot CMP
            '#CybotCookiebotDialogBodyButtonDecline',
            '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll',
            // TrustArc CMP
            '#truste-consent-required',
            '.truste-button-2',
            // Quantcast CMP
            '.qc-cmp2-summary-buttons > button:last-child',
            '.qc-cmp2-toggle-switch',
            // Generic consent management
            '[data-cy*="reject"]',
            '[data-cy*="decline"]',
            '[data-cy="manage-consent-reject-all"]',
            '[data-testid="consent-reject-all"]',
            '.sp_choice_type_REJECT_ALL',
            // Common cookie banner patterns
            '.cookie-banner button[data-role="reject"]',
            '.gdpr-banner .reject-all',
            '.consent-manager .decline-all',
            '.privacy-banner .opt-out',
            // Language-specific patterns
            'button:contains("Reject All")',
            'button:contains("Decline All")',
            'button:contains("Opt Out")',
            'button:contains("Refuse All")',
            'button:contains("Deny All")',
            'button:contains("No Thanks")',
            'button:contains("Disagree")',
            // Logout buttons
            'a[href*="logout"]',
            'a[href*="signout"]',
            'a[href*="sign-out"]',
            'button[data-testid*="logout"]',
            'button[data-testid*="signout"]',
            '.logout', '.signout', '.sign-out'
        ];
    }
    static getTrackingDomainsToBlock() {
        return [
            // Google tracking
            'google-analytics.com',
            'googletagmanager.com',
            'doubleclick.net',
            'googlesyndication.com',
            'googleadservices.com',
            'gstatic.com',
            // Facebook/Meta tracking  
            'facebook.com',
            'facebook.net',
            'connect.facebook.net',
            // Amazon tracking
            'amazon-adsystem.com',
            'amazonpay.com',
            // Microsoft tracking
            'bing.com',
            'microsoft.com',
            'live.com',
            // Social media tracking
            'twitter.com',
            'linkedin.com',
            'pinterest.com',
            'tiktok.com',
            'snapchat.com',
            // Analytics platforms
            'mixpanel.com',
            'segment.com',
            'amplitude.com',
            'hotjar.com',
            'fullstory.com',
            'logrocket.com',
            'mouseflow.com',
            'crazyegg.com',
            'optimizely.com',
            // Ad networks
            'criteo.com',
            'outbrain.com',
            'taboola.com',
            'pubmatic.com',
            'rubiconproject.com',
            'openx.com',
            'adsystem.com'
        ];
    }
}
// Website-specific opt-out mechanisms
OptOutManager.OPT_OUT_STRATEGIES = {
    'google.com': {
        cookiesToSet: [
            'CONSENT=PENDING+999',
            'NID=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'ANID=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ],
        selectors: ['[data-testid="reject-all"]', '.QS5gu'],
        logoutUrl: 'https://accounts.google.com/logout'
    },
    'facebook.com': {
        cookiesToSet: [
            'dpr=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'wd=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ],
        selectors: ['[data-testid="cookie-policy-manage-dialog-decline-button"]'],
        logoutUrl: 'https://www.facebook.com/logout.php'
    },
    'amazon.com': {
        cookiesToSet: [
            'ad-privacy=0',
            'csm-hit=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ],
        selectors: ['[data-cy="sp_choice_type_REJECT_ALL"]'],
        logoutUrl: 'https://www.amazon.com/gp/flex/sign-out.html'
    },
    'twitter.com': {
        cookiesToSet: [
            'personalization_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'guest_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ],
        selectors: ['[data-testid="decline"]'],
        logoutUrl: 'https://twitter.com/logout'
    },
    'linkedin.com': {
        cookiesToSet: [
            'UserMatchHistory=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'AnalyticsSyncHistory=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ],
        selectors: ['[data-tracking-control-name="consent-banner_decline-all"]'],
        logoutUrl: 'https://www.linkedin.com/uas/logout'
    },
    'youtube.com': {
        cookiesToSet: [
            'CONSENT=PENDING+999',
            'VISITOR_INFO1_LIVE=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ],
        selectors: ['[aria-label="Reject all"]', '[data-testid="reject-all-button"]'],
        logoutUrl: 'https://accounts.google.com/logout'
    },
    'instagram.com': {
        cookiesToSet: [
            'ig_nrcb=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        ],
        selectors: ['[data-testid="cookie-banner-decline"]'],
        logoutUrl: 'https://www.instagram.com/accounts/logout/'
    }
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./src/background/index.ts ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_privacy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/privacy */ "./src/utils/privacy.ts");

class BackgroundService {
    constructor() {
        this.siteData = new Map();
        this.blockedRequests = new Map();
        this.privacyPolicyUrls = new Map();
        console.log('🚀 Kavach Background Service starting...');
        this.setupRequestBlocking();
        this.setupTabListeners();
        this.setupMessageListeners();
        console.log('✅ Kavach Background Service initialized');
    }
    safeParseURL(url) {
        try {
            if (!url || typeof url !== 'string') {
                console.warn('❌ Invalid URL input:', url);
                return null;
            }
            return new URL(url);
        }
        catch (error) {
            console.warn('❌ Failed to parse URL:', url, error);
            return null;
        }
    }
    getDomainFromURL(url) {
        const parsedUrl = this.safeParseURL(url);
        return parsedUrl ? parsedUrl.hostname : null;
    }
    setupRequestBlocking() {
        console.log('🛡️ Kavach: Setting up request blocking...');
        // Monitor web requests to track third-party requests
        chrome.webRequest.onBeforeRequest.addListener((details) => {
            console.log('🌐 Request detected:', details.url, 'Type:', details.type, 'Initiator:', details.initiator);
            if (details.type === 'main_frame')
                return {};
            const url = this.safeParseURL(details.url);
            const initiatorUrl = details.initiator ? this.safeParseURL(details.initiator) : null;
            if (url && initiatorUrl && url.hostname !== initiatorUrl.hostname) {
                console.log('🚨 Third-party request:', url.hostname, 'from', initiatorUrl.hostname);
                this.trackThirdPartyRequest(initiatorUrl.hostname, url.hostname, details.type);
            }
            return {};
        }, { urls: ['<all_urls>'] }, ['requestBody']);
    }
    setupTabListeners() {
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
            }
            catch (error) {
                console.log('❌ Error getting active tab:', error);
            }
        });
    }
    isValidHttpUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    trackThirdPartyRequest(sourceDomain, trackerDomain, requestType) {
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
        }
        else {
            const trackerInfo = _utils_privacy__WEBPACK_IMPORTED_MODULE_0__.commonTrackers[trackerDomain];
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
        siteData.trustScore = _utils_privacy__WEBPACK_IMPORTED_MODULE_0__.TrustScoreCalculator.calculateScore(siteData.trackers);
        console.log('🎯 Trust score updated:', oldScore, '→', siteData.trustScore);
        // Update data flow visualization
        this.updateDataFlow(siteData, sourceDomain, trackerDomain);
        this.siteData.set(sourceDomain, siteData);
    }
    isTrackerBlocked(domain) {
        // Check if domain is in our blocking rules
        const blockedDomains = ['doubleclick.net', 'googletagmanager.com', 'facebook.com/tr'];
        return blockedDomains.some(blocked => domain.includes(blocked));
    }
    updateDataFlow(siteData, source, tracker) {
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
    initializeSiteData(url) {
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
        }
        else {
            console.log('♻️ Site data already exists for:', domain);
        }
    }
    initializeSiteDataForDomain(domain) {
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
        }
        else {
            console.log('♻️ Site data already exists for domain:', domain);
        }
    }
    async getSiteData(url) {
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
    async toggleTrackerBlocking(enabled) {
        // Toggle declarative net request rules
        const ruleIds = [1, 2, 3, 4, 5]; // IDs from rules.json
        if (enabled) {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ['tracker_rules']
            });
        }
        else {
            await chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ['tracker_rules']
            });
        }
    }
    setupMessageListeners() {
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
                    }
                    else {
                        sendResponse({ success: false, error: 'No tabId provided in the request.' });
                    }
                    return true; // Keep channel open for async response
                case 'performOptOut':
                    this.performComprehensiveOptOut(request.url, request.tabId)
                        .then(sendResponse)
                        .catch((error) => sendResponse({ success: false, error: error.message }));
                    return true;
            }
        });
    }
    storePrivacyPolicyUrls(siteUrl, policyUrls) {
        const domain = this.getDomainFromURL(siteUrl);
        if (!domain) {
            console.warn('❌ Cannot store privacy policy URLs for invalid URL:', siteUrl);
            return;
        }
        this.privacyPolicyUrls.set(domain, policyUrls);
    }
    async analyzePrivacyPolicy(siteUrl) {
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
        }
        catch (error) {
            console.error('❌ Privacy policy analysis failed:', error);
            return await this.fallbackPrivacyAnalysis(siteUrl);
        }
    }
    async callBackendAPI(endpoint, data) {
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
        }
        catch (error) {
            console.error(`Backend API call failed for ${endpoint}:`, error);
            throw error;
        }
    }
    formatAnalysisResponse(backendData, analysisType) {
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
    calculateScoreFromSafety(safety, scores) {
        // Base score from safety rating
        let baseScore = 50;
        switch (safety) {
            case 'SAFE':
                baseScore = 85;
                break;
            case 'RISKY':
                baseScore = 50;
                break;
            case 'UNSAFE':
                baseScore = 20;
                break;
        }
        // Adjust with detailed scores if available
        if (scores) {
            const avgScore = ((scores.dataCollection || 50) +
                (scores.thirdParty || 50) +
                (scores.userRights || 50) +
                (scores.transparency || 50)) / 4;
            // Weighted average: 60% detailed scores, 40% safety rating
            return Math.round((avgScore * 0.6) + (baseScore * 0.4));
        }
        return baseScore;
    }
    extractRisks(data) {
        const risks = [];
        if (data.safety === 'UNSAFE') {
            risks.push('High privacy risk detected');
        }
        else if (data.safety === 'RISKY') {
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
            data.keyFindings.forEach((finding) => {
                if (finding.toLowerCase().includes('concern') ||
                    finding.toLowerCase().includes('risk') ||
                    finding.toLowerCase().includes('issue')) {
                    risks.push(finding);
                }
            });
        }
        return risks.length > 0 ? risks : ['Analysis completed without major concerns'];
    }
    extractDataSharing(data) {
        const dataSharing = [];
        if (data.keyFindings) {
            data.keyFindings.forEach((finding) => {
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
    generateRecommendations(data) {
        const recommendations = [];
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
    assessCompliance(data) {
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
    async fallbackPrivacyAnalysis(siteUrl) {
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
            for (const baseUrl of urlVariations) {
                for (const path of commonPaths) {
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
                    }
                    catch (e) {
                        // Continue to next path
                    }
                }
                if (policyUrls.length > 0)
                    break; // Found policy, stop searching
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
        }
        catch (error) {
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
    async performBasicPrivacyAnalysis(policyText, domain) {
        // Basic analysis without AI - simplified version
        const textLower = policyText.toLowerCase();
        let score = 70; // Start with neutral score
        const risks = [];
        const dataSharing = [];
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
    async fetchPrivacyPolicyText(policyUrl) {
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
        }
        catch (error) {
            console.error('Failed to fetch privacy policy:', policyUrl, error);
            throw new Error(`Failed to fetch privacy policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async performPrivacyAnalysis(policyText, domain) {
        const text = policyText.toLowerCase();
        const risks = [];
        const dataSharing = [];
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
        const positiveFeatures = [];
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
        }
        else if (score >= 60) {
            summary += 'The policy shows reasonable privacy practices but has some areas of concern regarding data collection or sharing.';
        }
        else if (score >= 40) {
            summary += 'The policy has significant privacy concerns with extensive data collection, sharing, or unclear user rights.';
        }
        else {
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
    async getFingerprintScript(apiKey) {
        const loaderUrl = `https://fpnpmcdn.net/v3/${apiKey}/loader_v3.11.10.js`;
        try {
            const response = await fetch(loaderUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch script: ${response.statusText}`);
            }
            const script = await response.text();
            return { script };
        }
        catch (error) {
            console.error('Failed to fetch FingerprintJS script:', error);
            return { error: error.message };
        }
    }
    async handleFingerprinting(apiKey, tabId) {
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
            }
            else {
                throw new Error('No result returned from fingerprinting script');
            }
        }
        catch (error) {
            console.error('Background fingerprinting error:', error);
            return {
                success: false,
                error: `Failed to run fingerprinting: ${error.message}`
            };
        }
    }
    async performComprehensiveOptOut(url, tabId) {
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
        }
        catch (error) {
            console.error('❌ Background opt-out failed:', error);
            return {
                success: false,
                error: `Opt-out failed: ${error.message}`
            };
        }
    }
    async addDomainToBlockList(domain) {
        try {
            // Get existing blocked domains
            const storage = await chrome.storage.local.get(['blockedDomains']);
            const blockedDomains = storage.blockedDomains || [];
            if (!blockedDomains.includes(domain)) {
                blockedDomains.push(domain);
                await chrome.storage.local.set({ blockedDomains });
                console.log('📝 Added domain to block list:', domain);
            }
        }
        catch (error) {
            console.warn('Failed to add domain to block list:', error);
        }
    }
    clearDomainTrackingData(domain) {
        try {
            // Remove from site data
            this.siteData.delete(domain);
            // Clear blocked requests count
            const keysToDelete = Array.from(this.blockedRequests.keys())
                .filter(key => key.includes(domain));
            keysToDelete.forEach(key => this.blockedRequests.delete(key));
            console.log('🧹 Cleared tracking data for:', domain);
        }
        catch (error) {
            console.warn('Failed to clear domain tracking data:', error);
        }
    }
    async enableEnhancedBlockingForDomain(domain) {
        try {
            // Create dynamic rules to block requests from this domain
            const newRules = [
                {
                    id: Date.now(),
                    priority: 1,
                    action: { type: 'block' },
                    condition: {
                        initiatorDomains: [domain],
                        resourceTypes: [
                            'script',
                            'xmlhttprequest',
                            'image',
                            'media',
                            'font',
                            'websocket'
                        ]
                    }
                }
            ];
            // YouTube-specific blocking rules
            if (domain.includes('youtube.com') || domain.includes('google.com')) {
                newRules.push({
                    id: Date.now() + 1,
                    priority: 2,
                    action: { type: 'block' },
                    condition: {
                        urlFilter: '*youtube.com/api/stats*',
                        resourceTypes: ['xmlhttprequest']
                    }
                }, {
                    id: Date.now() + 2,
                    priority: 2,
                    action: { type: 'block' },
                    condition: {
                        urlFilter: '*youtube.com/youtubei/v1/log_event*',
                        resourceTypes: ['xmlhttprequest']
                    }
                }, {
                    id: Date.now() + 3,
                    priority: 2,
                    action: { type: 'block' },
                    condition: {
                        urlFilter: '*youtube.com/ptracking*',
                        resourceTypes: ['xmlhttprequest', 'image']
                    }
                });
            }
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: newRules
            });
            console.log('🛡️ Enhanced blocking enabled for:', domain);
        }
        catch (error) {
            console.warn('Failed to enable enhanced blocking:', error);
        }
    }
}
// This function gets injected into the webpage after the agent is injected
function runFingerprintJS(apiKey) {
    return new Promise((resolve) => {
        // The FingerprintJS object is now available on the window
        // thanks to the injected fingerprint-agent.js script.
        async function initializeFingerprint() {
            try {
                const fp = await window.FingerprintJS.load({
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
            }
            catch (error) {
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
            if (window.FingerprintJS) {
                clearInterval(interval);
                initializeFingerprint();
            }
            else if (checks > 50) { // Timeout after 5 seconds
                clearInterval(interval);
                resolve({ success: false, error: 'FingerprintJS object not found after script injection.' });
            }
        }, 100);
    });
}
const backgroundService = new BackgroundService();

})();

/******/ })()
;
//# sourceMappingURL=background.js.map