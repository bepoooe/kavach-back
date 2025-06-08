import React from 'react';
import { DataFlowNode, DataFlowEdge } from '../utils/types';

interface DataFlowVisualizationProps {
  dataFlow: {
    nodes: DataFlowNode[];
    edges: DataFlowEdge[];
  };
}

const DataFlowVisualization: React.FC<DataFlowVisualizationProps> = ({ dataFlow }) => {
  if (dataFlow.nodes.length === 0) {
    return (
      <div className="data-flow">
        <div className="empty-state">
          <p>No data flow detected yet.</p>
        </div>
      </div>
    );
  }

  const sourceNode = dataFlow.nodes.find(n => n.type === 'source');
  const trackerNodes = dataFlow.nodes.filter(n => n.type === 'tracker');

  const formatDomain = (domain: string) => {
    return domain.length > 10 ? domain.substring(0, 10) + '...' : domain;
  };

  const displayedTrackers = trackerNodes.slice(0, 2);
  const remainingCount = Math.max(0, trackerNodes.length - 2);

  return (
    <div className="data-flow">
      <div className="flow-container">
        {/* Source Node */}
        {sourceNode && (
          <div className="flow-section source-section">
            <div className="flow-node source">
              <div className="node-label">Source</div>
              <div className="node-domain">{formatDomain(sourceNode.domain)}</div>
            </div>
          </div>
        )}

        {/* Arrow Connector */}
        {dataFlow.edges.length > 0 && sourceNode && displayedTrackers.length > 0 && (
          <div className="flow-section arrow-section">
            <div className="flow-arrow">
              <div className="arrow-line"></div>
              <div className="arrow-head">→</div>
            </div>
          </div>
        )}

        {/* Tracker Nodes */}
        {displayedTrackers.length > 0 && (
          <div className="flow-section trackers-section">
            <div className="tracker-nodes">
              {displayedTrackers.map((node, index) => (
                <div key={node.id} className="flow-node tracker">
                  <div className="node-label">Tracker</div>
                  <div className="node-domain">{formatDomain(node.domain)}</div>
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="remaining-count">
                  +{remainingCount} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data sharing warning */}
      {dataFlow.edges.length > 0 && (
        <div className="data-sharing-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            Data shared with {dataFlow.edges.length} third-party domain{dataFlow.edges.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataFlowVisualization;
