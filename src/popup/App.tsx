import React, { useState, useEffect } from 'react';
import { SiteData } from '../utils/types';
import TrustScore from '../components/TrustScore';
import TrackerList from '../components/TrackerList';
import PrivacyAnalysis from '../components/PrivacyAnalysis';
import DataFlowVisualization from '../components/DataFlowVisualization';
import ActionButtons from '../components/ActionButtons';

const App: React.FC = () => {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [blockingEnabled, setBlockingEnabled] = useState(true);  const [analyzingPolicy, setAnalyzingPolicy] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    loadCurrentSiteData();
    loadSettings();
  }, []);

  const loadCurrentSiteData = async () => {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) return;

      setCurrentUrl(tab.url);

      // Get site data from background script
      const response = await chrome.runtime.sendMessage({
        action: 'getSiteData',
        url: tab.url
      });

      setSiteData(response);
    } catch (error) {
      console.error('Failed to load site data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get(['blockingEnabled']);
      setBlockingEnabled(result.blockingEnabled ?? true);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleToggleBlocking = async (enabled: boolean) => {
    try {
      await chrome.runtime.sendMessage({
        action: 'toggleBlocking',
        enabled
      });
      
      await chrome.storage.sync.set({ blockingEnabled: enabled });      setBlockingEnabled(enabled);
    } catch (error) {
      console.error('Failed to toggle blocking:', error);
    }
  };

  const handleOptOut = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) return;

      const url = new URL(tab.url);
      const origin = url.origin;
      const domain = url.hostname;

      // Clear all cookies for this domain
      await chrome.cookies.getAll({ domain }, async (cookies) => {
        for (const cookie of cookies) {
          await chrome.cookies.remove({
            url: `${cookie.secure ? 'https' : 'http'}://${cookie.domain}${cookie.path}`,
            name: cookie.name
          });
        }
      });

      // Clear all storage data for this origin
      await chrome.browsingData.remove({
        origins: [origin]
      }, {
        localStorage: true,
        indexedDB: true,
        webSQL: true,
        serviceWorkers: true,
        cacheStorage: true,
        fileSystems: true
      });      // Revoke permissions for this origin (only the ones that can be revoked)
      try {
        await chrome.permissions.remove({
          origins: [origin]
        });
      } catch (e) {
        // Permissions might not be removable, continue
        console.log('Could not revoke permissions:', e);
      }

      // Send message to content script to perform additional cleanup
      if (tab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Clear localStorage and sessionStorage
            try {
              localStorage.clear();
              sessionStorage.clear();
              
              // Set opt-out cookies
              document.cookie = "gdpr_consent=false; path=/; max-age=31536000; SameSite=Strict";
              document.cookie = "ccpa_optout=true; path=/; max-age=31536000; SameSite=Strict";
              document.cookie = "privacy_optout=true; path=/; max-age=31536000; SameSite=Strict";
              
              // Show notification
              const notification = document.createElement('div');
              notification.innerHTML = `
                <div style="
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  z-index: 10002;
                  background: #dc2626;
                  color: white;
                  padding: 16px 20px;
                  border-radius: 12px;
                  font-family: system-ui, -apple-system, sans-serif;
                  font-size: 14px;
                  font-weight: 600;
                  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
                  border: 2px solid #fecaca;
                ">
                  🛡️ Privacy Reset Complete - Permissions & Data Cleared
                </div>
              `;
              document.body.appendChild(notification);
              setTimeout(() => notification.remove(), 4000);
            } catch (e) {
              console.error('Failed to clear storage:', e);
            }
          }
        });
      }

      console.log('✅ Successfully cleared cookies, storage, and permissions for:', domain);
      
    } catch (error) {
      console.error('Failed to perform opt-out:', error);
    }
  };

  const handleAnalyzePolicy = async () => {
    if (!siteData || analyzingPolicy) return;

    setAnalyzingPolicy(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzePrivacyPolicy',
        url: currentUrl
      });

      setSiteData({
        ...siteData,
        privacyAnalysis: response
      });
    } catch (error) {
      console.error('Failed to analyze privacy policy:', error);
      // Show user-friendly error
      setSiteData({
        ...siteData,
        privacyAnalysis: {
          score: 0,
          risks: ['Analysis failed due to technical error'],
          summary: 'Unable to analyze privacy policy at this time. Please try again later.',
          dataSharing: []
        }
      });
    } finally {
      setAnalyzingPolicy(false);
    }
  };

  const handleDebugInfo = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'debugInfo'
      });
      setDebugInfo(response);
      console.log('🐛 Debug Info:', response);
    } catch (error) {
      console.error('Failed to get debug info:', error);
    }
  };
  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-logo">
            <img src="logo.png" alt="Kavach Logo" className="logo-image" />
          </div>
          <div className="spinner"></div>
          Loading site data...
        </div>
      </div>
    );
  }

  return (
    <div className="app">      <header className="header">
        <div className="logo">
          <img src="logo.png" alt="Kavach Logo" className="logo-image" />
        </div>
        <div className="header-text">
          <h1>Kavach</h1>
          <p>Privacy Guardian</p>
        </div>
      </header>

      <div className="content">
        {siteData ? (
          <>
            <TrustScore 
              score={siteData.trustScore} 
              url={currentUrl}
            />
            
            <div className="section">              <div className="section-header">
                <div className="section-title">
                  Tracker Blocking
                </div>
                <div 
                  className={`toggle-switch ${blockingEnabled ? 'active' : ''}`}
                  onClick={() => handleToggleBlocking(!blockingEnabled)}
                />
              </div>
              <TrackerList trackers={siteData.trackers} />
            </div>

            {siteData.privacyAnalysis && (
              <PrivacyAnalysis analysis={siteData.privacyAnalysis} />
            )}            <div className="section">
              <div className="section-title" style={{ marginBottom: '20px' }}>
                Data Flow
              </div>
              <DataFlowVisualization dataFlow={siteData.dataFlow} />            </div>            <ActionButtons 
              onOptOut={handleOptOut}
              onAnalyzePolicy={handleAnalyzePolicy}
              hasPrivacyAnalysis={!!siteData.privacyAnalysis}
              analyzingPolicy={analyzingPolicy}
            />

            {/* Debug Section */}
            <div className="debug-section">
              <button onClick={handleDebugInfo} className="debug-button">
                🐛 Debug Info
              </button>
              {debugInfo && (
                <div className="debug-info">
                  <p><strong>Tracked Domains:</strong> {debugInfo.totalSites}</p>
                  <p><strong>Current Domain:</strong> {new URL(currentUrl).hostname}</p>
                  {debugInfo.siteDataSnapshot.length > 0 && (
                    <details>
                      <summary>Site Data</summary>
                      <pre>{JSON.stringify(debugInfo.siteDataSnapshot, null, 2)}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (          <div className="empty-state">
            <div className="empty-state-logo">
              <img src="logo.png" alt="Kavach Logo" className="logo-image" />
            </div>
            <p>No tracking data available for this site yet.</p>
            <p>Navigate to a website to see privacy insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
