import React from 'react';

interface ActionButtonsProps {
  onOptOut: () => void;
  onAnalyzePolicy: () => void;
  hasPrivacyAnalysis: boolean;
  analyzingPolicy?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onOptOut, 
  onAnalyzePolicy, 
  hasPrivacyAnalysis,
  analyzingPolicy = false
}) => {
  return (
    <div className="action-buttons">
      <button 
        className="btn btn-primary"
        onClick={onOptOut}
        title="Exercise your GDPR/CCPA rights and opt-out of tracking"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '16px' }}>🛡️</span>
        <span>Quick Opt-out</span>
      </button>
      
      {!hasPrivacyAnalysis && (
        <button 
          className="btn btn-secondary"
          onClick={onAnalyzePolicy}
          disabled={analyzingPolicy}
          title="Analyze the privacy policy with AI"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {analyzingPolicy ? (
            <>
              <div className="spinner" style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #cbd5e1',
                borderTopColor: '#475569',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>🤖</span>
              <span>Analyze Policy</span>
            </>
          )}
        </button>
      )}
      
      {hasPrivacyAnalysis && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          borderRadius: '16px',
          border: '2px solid #86efac',
          color: '#166534',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span style={{ fontSize: '16px' }}>✅</span>
          <span>Analysis Complete</span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
