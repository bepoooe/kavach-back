import React from 'react';
import { PrivacyPolicyAnalysis } from '../utils/types';

interface PrivacyAnalysisProps {
  analysis: PrivacyPolicyAnalysis;
}

const PrivacyAnalysis: React.FC<PrivacyAnalysisProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  };

  const getSafetyBadge = (analysisType?: string) => {
    if (analysis.loading) {
      return (
        <div style={{
          background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div className="spinner" style={{
            width: '12px',
            height: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          ANALYZING
        </div>
      );
    }

    const type = analysisType || 'standard';
    const colors = {
      enhanced: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
      standard: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
      basic: 'linear-gradient(90deg, #6b7280, #4b5563)',
      fallback: 'linear-gradient(90deg, #f59e0b, #d97706)',
      error: 'linear-gradient(90deg, #ef4444, #dc2626)'
    };

    return (
      <div style={{
        background: colors[type as keyof typeof colors] || colors.standard,
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {type.toUpperCase()} ANALYSIS
      </div>
    );
  };

  // Show loading state
  if (analysis.loading) {
    return (
      <div className="section">
        <div className="section-title">
          AI Privacy Policy Analysis
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', 
          padding: '20px', 
          borderRadius: '16px', 
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '16px' }}>
            {getSafetyBadge()}
          </div>
          
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px'
          }}>
            {analysis.summary}
          </div>
          
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            This may take 30-60 seconds for comprehensive analysis...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-title">
        AI Privacy Policy Analysis
      </div>
      
      {/* Privacy Score Bar */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', 
        padding: '20px', 
        borderRadius: '16px', 
        marginBottom: '20px',
        border: '2px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '12px' 
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
            Privacy Score
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {getSafetyBadge(analysis.analysisType)}
            <span style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: getScoreColor(analysis.score) 
            }}>
              {analysis.score}/100
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div style={{ 
          background: '#e2e8f0', 
          borderRadius: '8px', 
          height: '8px', 
          overflow: 'hidden',
          marginBottom: '8px'
        }}>
          <div style={{ 
            background: `linear-gradient(90deg, ${getScoreColor(analysis.score)}, ${getScoreColor(analysis.score)}dd)`,
            height: '100%', 
            width: `${analysis.score}%`,
            borderRadius: '8px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b', 
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{getScoreLabel(analysis.score)} Privacy Rating</span>
          {analysis.metadata?.totalPages && (
            <span>📄 {analysis.metadata.totalPages} pages analyzed</span>
          )}
        </div>
      </div>

      {/* Enhanced Scores Display */}
      {analysis.scores && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            📊 Detailed Privacy Scores
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Object.entries(analysis.scores).map(([key, value]) => (
              <div key={key} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: getScoreColor(value || 0) 
                }}>
                  {value}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Findings */}
      {analysis.keyFindings && analysis.keyFindings.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            🔍 Key Findings
          </div>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {analysis.keyFindings.map((finding, index) => (
              <div key={index} style={{
                padding: '12px 16px',
                borderBottom: index < analysis.keyFindings!.length - 1 ? '1px solid #f1f5f9' : 'none',
                fontSize: '13px',
                color: '#374151',
                lineHeight: '1.5'
              }}>
                • {finding}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#1e293b', 
          marginBottom: '12px'
        }}>
          📝 AI Analysis Summary
        </div>
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#374151'
        }}>
          {analysis.summary}
        </div>
      </div>

      {analysis.risks.length > 0 && (
        <div className="privacy-risks" style={{ marginBottom: '20px' }}>          <strong style={{ 
            fontSize: '16px', 
            marginBottom: '16px', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#dc2626'
          }}>
            Privacy Risks Detected
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.risks.map((risk, index) => (
              <div key={index} className="risk-item" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                borderRadius: '12px',
                border: '1px solid #fecaca',
                fontSize: '13px',
                lineHeight: '1.4'
              }}>
                <span style={{ 
                  color: '#dc2626', 
                  fontSize: '16px', 
                  flexShrink: 0,
                  marginTop: '2px'
                }}>•</span>
                <span style={{ color: '#7f1d1d', fontWeight: '500' }}>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.dataSharing.length > 0 && (
        <div>
          <strong style={{ 
            fontSize: '16px', 
            marginBottom: '16px', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#7c2d12'
          }}>
            🔗 Data Sharing Partners
          </strong>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '8px' 
          }}>
            {analysis.dataSharing.map((company, index) => (
              <span 
                key={index}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  color: '#dc2626',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: '2px solid #fecaca',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Positive Features */}
      {analysis.positiveFeatures && analysis.positiveFeatures.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <strong style={{ 
            fontSize: '14px', 
            color: '#166534', 
            display: 'block', 
            marginBottom: '12px',
            fontWeight: '700'
          }}>
            ✅ Positive Privacy Practices
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.positiveFeatures.map((feature: string, index: number) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                borderRadius: '12px',
                border: '1px solid #86efac',
                fontSize: '13px',
                lineHeight: '1.4'
              }}>
                <span style={{ 
                  color: '#059669', 
                  fontSize: '16px', 
                  flexShrink: 0,
                  marginTop: '2px'
                }}>✓</span>
                <span style={{ color: '#166534', fontWeight: '500' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyAnalysis;
