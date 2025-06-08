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
      >
        🛡️ Quick Opt-out
      </button>
        {!hasPrivacyAnalysis && (
        <button 
          className="btn btn-secondary"
          onClick={onAnalyzePolicy}
          disabled={analyzingPolicy}
          title="Analyze the privacy policy with AI"
        >
          {analyzingPolicy ? (
            <>
              <div className="spinner" style={{ width: '12px', height: '12px', marginRight: '6px' }}></div>
              Analyzing...
            </>
          ) : (
            <>🤖 Analyze Policy</>
          )}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
