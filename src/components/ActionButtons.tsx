import React from 'react';

interface ActionButtonsProps {
  onOptOut: () => void;
  onAnalyzePolicy: () => void;
  hasPrivacyAnalysis: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onOptOut, 
  onAnalyzePolicy, 
  hasPrivacyAnalysis 
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
          title="Analyze the privacy policy with AI"
        >
          🤖 Analyze Policy
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
