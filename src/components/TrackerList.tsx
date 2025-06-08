import React from 'react';
import { TrackerData } from '../utils/types';

interface TrackerListProps {
  trackers: TrackerData[];
}

const TrackerList: React.FC<TrackerListProps> = ({ trackers }) => {
  if (trackers.length === 0) {
    return (
      <div className="empty-state">
        <p>No trackers detected on this page.</p>
      </div>
    );
  }

  const getCategoryClass = (category: string) => {
    return `category-${category}`;
  };

  const formatDomain = (domain: string) => {
    return domain.length > 20 ? domain.substring(0, 20) + '...' : domain;
  };

  return (
    <div className="tracker-list">
      {trackers.map((tracker, index) => (
        <div key={index} className="tracker-item">
          <div className="tracker-info">
            <span className={`tracker-category ${getCategoryClass(tracker.category)}`}>
              {tracker.category}
            </span>
            <span>{formatDomain(tracker.domain)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="tracker-count">{tracker.count}</span>
            {tracker.blocked && (
              <span className="blocked-indicator" title="Blocked">🚫</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackerList;
