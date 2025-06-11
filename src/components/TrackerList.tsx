import React from 'react';
import { TrackerData } from '../utils/types';

interface TrackerListProps {
  trackers: TrackerData[];
}

const TrackerList: React.FC<TrackerListProps> = ({ trackers }) => {
  if (trackers.length === 0) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🎯</div>
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#64748b' }}>No trackers detected</p>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>This page appears to be clean!</p>
      </div>
    );
  }

  const getCategoryClass = (category: string) => {
    return `category-${category}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'advertising': return '📢';
      case 'analytics': return '📊';
      case 'social': return '👥';
      default: return '❓';
    }
  };

  const formatDomain = (domain: string) => {
    return domain.length > 24 ? domain.substring(0, 24) + '...' : domain;
  };

  const blockedCount = trackers.filter(t => t.blocked).length;
  const totalRequests = trackers.reduce((sum, t) => sum + t.count, 0);

  return (
    <div>
      {/* Summary Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        padding: '16px',
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderRadius: '12px',
        border: '1px solid #bae6fd'
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>
            {trackers.length}
          </div>
          <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase' }}>
            Trackers
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>
            {blockedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase' }}>
            Blocked
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b' }}>
            {totalRequests}
          </div>
          <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase' }}>
            Requests
          </div>
        </div>
      </div>

      <div className="tracker-list">
        {trackers.map((tracker, index) => (
          <div key={index} className="tracker-item">
            <div className="tracker-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>
                  {getCategoryIcon(tracker.category)}
                </span>
                <span className={`tracker-category ${getCategoryClass(tracker.category)}`}>
                  {tracker.category}
                </span>
              </div>
              <div style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#1e293b',
                marginTop: '4px'
              }}>
                {formatDomain(tracker.domain)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="tracker-count">
                {tracker.count} req{tracker.count !== 1 ? 's' : ''}
              </span>
              {tracker.blocked ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid #86efac'
                }}>
                  <span style={{ fontSize: '14px' }}>🛡️</span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    color: '#166534',
                    textTransform: 'uppercase'
                  }}>
                    Blocked
                  </span>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid #fecaca'
                }}>
                  <span style={{ fontSize: '14px' }}>⚠️</span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    color: '#991b1b',
                    textTransform: 'uppercase'
                  }}>
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackerList;
