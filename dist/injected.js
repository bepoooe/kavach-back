/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*******************************!*\
  !*** ./src/injected/index.ts ***!
  \*******************************/

// Injected script that runs in the page context to detect client-side tracking
(function () {
    'use strict';
    // Track function calls that might indicate tracking
    const originalFetch = window.fetch;
    // Override fetch to detect tracking requests
    window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : input.toString();
        if (isTrackingRequest(url)) {
            console.log('Kavach: Detected tracking request via fetch:', url);
            reportTrackingAttempt(url, 'fetch');
        }
        return originalFetch.call(this, input, init);
    };
    // Detect common tracking patterns
    function isTrackingRequest(url) {
        const trackingPatterns = [
            /google-analytics\.com/,
            /googletagmanager\.com/,
            /doubleclick\.net/,
            /facebook\.com\/tr/,
            /connect\.facebook\.net/,
            /amazon-adsystem\.com/,
            /twitter\.com\/i\/adsct/,
            /linkedin\.com\/collect/,
            /track|analytics|pixel|beacon/i
        ];
        return trackingPatterns.some(pattern => pattern.test(url));
    }
    // Report tracking attempts to content script
    function reportTrackingAttempt(url, method) {
        window.postMessage({
            type: 'KAVACH_TRACKING_DETECTED',
            url: url,
            method: method,
            timestamp: Date.now()
        }, '*');
    }
    // Monitor canvas fingerprinting
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function () {
        console.log('Kavach: Canvas fingerprinting detected');
        reportTrackingAttempt(window.location.href, 'canvas-fingerprint');
        return originalToDataURL.apply(this, arguments);
    };
    console.log('Kavach: Tracking detection initialized');
})();

/******/ })()
;
//# sourceMappingURL=injected.js.map