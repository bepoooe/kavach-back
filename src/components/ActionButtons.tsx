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
        title="Revoke all permissions and clear cookies for this website"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          borderColor: '#dc2626'
        }}
      >
        <span>1-Click Opt-out</span>
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
            </>          ) : (
            <>
              <span>Analyze Policy</span>
            </>
          )}
        </button>
      )}
      
      {hasPrivacyAnalysis && (        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #DFFF19, #007E36)',
          borderRadius: '16px',
          border: '2px solid #007E36',
          color: '#003d1b',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <span>Analysis Complete</span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
