import React from 'react';
import { PrivacyPolicyAnalysis } from '../utils/types';

interface PrivacyAnalysisProps {
  analysis: PrivacyPolicyAnalysis;
}

const PrivacyAnalysis: React.FC<PrivacyAnalysisProps> = ({ analysis }) => {
  return (
    <div className="section">
      <div className="section-title">
        📋 Privacy Policy Analysis
      </div>
      
      <div className="privacy-summary">
        {analysis.summary}
      </div>

      {analysis.risks.length > 0 && (
        <div className="privacy-risks">
          <strong style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
            ⚠️ Potential Risks:
          </strong>
          {analysis.risks.map((risk, index) => (
            <div key={index} className="risk-item">
              <span>•</span>
              <span>{risk}</span>
            </div>
          ))}
        </div>
      )}

      {analysis.dataSharing.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <strong style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
            🔗 Data Shared With:
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {analysis.dataSharing.map((company, index) => (
              <span 
                key={index}
                style={{
                  padding: '4px 8px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyAnalysis;
