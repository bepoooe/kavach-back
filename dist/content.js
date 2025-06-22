/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
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
/*!******************************!*\
  !*** ./src/content/index.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
// Content script for detecting privacy policies and injecting tracking detection
class ContentScript {
    constructor() {
        this.privacyPolicyUrls = [];
        console.log('🔍 Kavach Content Script starting on:', window.location.href);
        this.detectPrivacyPolicies();
        this.injectTrackingDetector();
        console.log('✅ Kavach Content Script initialized');
    }
    detectPrivacyPolicies() {
        // Look for privacy policy links with better detection
        const selectors = [
            'a[href*="privacy"]',
            'a[href*="terms"]',
            'a[href*="policy"]',
            'a[href*="legal"]',
            'a[href*="gdpr"]',
            'a[href*="ccpa"]'
        ];
        const privacyKeywords = [
            'privacy policy',
            'privacy statement',
            'privacy notice',
            'terms of service',
            'terms and conditions',
            'data policy',
            'cookie policy',
            'legal',
            'gdpr',
            'ccpa'
        ];
        // Check link hrefs and text content
        selectors.forEach(selector => {
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                const href = link.href;
                const text = link.textContent?.toLowerCase() || '';
                if (href && !this.privacyPolicyUrls.includes(href)) {
                    // Check if the link text contains privacy-related keywords
                    const isPrivacyRelated = privacyKeywords.some(keyword => text.includes(keyword) || href.toLowerCase().includes(keyword));
                    if (isPrivacyRelated) {
                        this.privacyPolicyUrls.push(href);
                    }
                }
            });
        });
        // Also check for common footer links
        const footerElements = document.querySelectorAll('footer, .footer, [class*="footer"]');
        footerElements.forEach(footer => {
            const links = footer.querySelectorAll('a');
            links.forEach(link => {
                const href = link.href;
                const text = link.textContent?.toLowerCase() || '';
                if (href && !this.privacyPolicyUrls.includes(href)) {
                    const isPrivacyRelated = privacyKeywords.some(keyword => text.includes(keyword));
                    if (isPrivacyRelated) {
                        this.privacyPolicyUrls.push(href);
                    }
                }
            });
        });
        // Send privacy policy URLs to background script
        if (this.privacyPolicyUrls.length > 0) {
            chrome.runtime.sendMessage({
                action: 'privacyPoliciesFound',
                urls: this.privacyPolicyUrls,
                currentUrl: window.location.href
            }).catch(error => {
                console.log('Failed to send privacy policy URLs:', error);
            });
        }
    }
    injectTrackingDetector() {
        // Inject script to detect client-side tracking
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('injected.js');
        script.onload = function () {
            // Remove the script element after loading
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    }
    init() {
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    // Re-scan for privacy policies after DOM is fully loaded
                    this.detectPrivacyPolicies();
                }, 1000);
            });
        }
        else {
            setTimeout(() => {
                // Re-scan for privacy policies
                this.detectPrivacyPolicies();
            }, 1000);
        }
        // Also scan again after a delay to catch dynamically loaded content
        setTimeout(() => {
            this.detectPrivacyPolicies();
        }, 3000);
    }
}
const contentScript = new ContentScript();
contentScript.init();


/******/ })()
;
//# sourceMappingURL=content.js.map