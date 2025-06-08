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
    return domain.length > 12 ? domain.substring(0, 12) + '...' : domain;
  };

  return (
    <div className="data-flow">
      <div className="flow-nodes">
        {sourceNode && (
          <div className="flow-node source">
            <div style={{ fontSize: '10px', marginBottom: '2px', opacity: 0.7 }}>
              Source
            </div>
            {formatDomain(sourceNode.domain)}
          </div>
        )}

        {dataFlow.edges.length > 0 && (
          <div className="flow-arrows"></div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {trackerNodes.slice(0, 3).map((node, index) => (
            <div key={node.id} className="flow-node tracker">
              <div style={{ fontSize: '10px', marginBottom: '2px', opacity: 0.7 }}>
                Tracker
              </div>
              {formatDomain(node.domain)}
            </div>
          ))}
          {trackerNodes.length > 3 && (
            <div style={{ 
              fontSize: '11px', 
              color: '#64748b', 
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              +{trackerNodes.length - 3} more
            </div>
          )}
        </div>
      </div>

      {dataFlow.edges.length > 0 && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 12px', 
          background: '#fef2f2', 
          borderRadius: '6px',
          fontSize: '11px',
          color: '#dc2626'
        }}>
          ⚠️ Your data is being shared with {dataFlow.edges.length} third-party domain{dataFlow.edges.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default DataFlowVisualization;
