// Injected script that runs in the page context to detect client-side tracking
(function() {
  'use strict';

  // Store the original fetch function
  const originalFetch = window.fetch;

  // Define a proxy fetch function to intercept requests
  const trackingFetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : (input as Request).url;

    // Check for tracking patterns
    if (isTrackingRequest(url)) {
      console.log('Kavach: Detected tracking request via fetch:', url);
      reportTrackingAttempt(url, 'fetch');
    }

    // Proceed with the original fetch call
    return originalFetch.apply(window, [input, init] as any);
  };

  // Replace the global fetch with the proxy
  window.fetch = trackingFetch;

  // Detect common tracking patterns
  function isTrackingRequest(url: string): boolean {
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
  function reportTrackingAttempt(url: string, method: string) {
    window.postMessage({
      type: 'KAVACH_TRACKING_DETECTED',
      url: url,
      method: method,
      timestamp: Date.now()
    }, '*');
  }

  // Monitor canvas fingerprinting
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function() {
    console.log('Kavach: Canvas fingerprinting detected');
    reportTrackingAttempt(window.location.href, 'canvas-fingerprint');
    const result = originalToDataURL.apply(this, arguments as any);
    return result;
  };

  console.log('Kavach: Tracking detection initialized');
})();
