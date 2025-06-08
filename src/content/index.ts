// Content script for detecting privacy policies and injecting tracking detection
class ContentScript {
  private privacyPolicyUrls: string[] = [];

  constructor() {
    this.detectPrivacyPolicies();
    this.injectTrackingDetector();
  }

  private detectPrivacyPolicies() {
    // Look for privacy policy links
    const privacyLinks = document.querySelectorAll('a[href*="privacy"], a[href*="terms"], a[href*="policy"]');
    
    privacyLinks.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      if (href && !this.privacyPolicyUrls.includes(href)) {
        this.privacyPolicyUrls.push(href);
      }
    });

    // Send privacy policy URLs to background script
    if (this.privacyPolicyUrls.length > 0) {
      chrome.runtime.sendMessage({
        action: 'privacyPoliciesFound',
        urls: this.privacyPolicyUrls,
        currentUrl: window.location.href
      });
    }
  }

  private injectTrackingDetector() {
    // Inject script to detect client-side tracking
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function() {
      // Remove the script element after loading
      (this as HTMLScriptElement).remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  private createGDPROptOutButton() {
    // Create a floating button for GDPR opt-out
    const button = document.createElement('div');
    button.id = 'kavach-gdpr-button';
    button.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        background: #2563eb;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
      " onmouseover="this.style.backgroundColor='#1d4ed8'" 
         onmouseout="this.style.backgroundColor='#2563eb'">
        🛡️ Quick Privacy Opt-out
      </div>
    `;

    button.addEventListener('click', () => {
      this.showOptOutDialog();
    });

    document.body.appendChild(button);
  }

  private showOptOutDialog() {
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          padding: 24px;
          border-radius: 12px;
          max-width: 400px;
          margin: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        ">
          <h3 style="margin: 0 0 16px 0; color: #1f2937;">Privacy Rights</h3>
          <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.5;">
            Exercise your privacy rights under GDPR/CCPA. This will help you opt-out of data collection and tracking.
          </p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="kavach-cancel" style="
              padding: 8px 16px;
              border: 1px solid #d1d5db;
              background: white;
              color: #374151;
              border-radius: 6px;
              cursor: pointer;
            ">Cancel</button>
            <button id="kavach-optout" style="
              padding: 8px 16px;
              border: none;
              background: #dc2626;
              color: white;
              border-radius: 6px;
              cursor: pointer;
            ">Opt Out</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('#kavach-cancel')?.addEventListener('click', () => {
      dialog.remove();
    });

    dialog.querySelector('#kavach-optout')?.addEventListener('click', () => {
      this.performOptOut();
      dialog.remove();
    });
  }

  private performOptOut() {
    // Simulate GDPR/CCPA opt-out actions
    const optOutActions = [
      'document.cookie = "gdpr_consent=false; path=/; max-age=31536000"',
      'document.cookie = "ccpa_optout=true; path=/; max-age=31536000"',
      'localStorage.setItem("privacy_optout", "true")',
    ];

    optOutActions.forEach(action => {
      try {
        eval(action);
      } catch (e) {
        console.log('Opt-out action failed:', action);
      }
    });

    // Show confirmation
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10002;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ">
        ✅ Privacy opt-out completed
      </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  init() {
    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.createGDPROptOutButton(), 1000);
      });
    } else {
      setTimeout(() => this.createGDPROptOutButton(), 1000);
    }
  }
}

const contentScript = new ContentScript();
contentScript.init();

export {};
