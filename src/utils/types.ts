export interface TrackerData {
  domain: string;
  count: number;
  category: string;
  blocked: boolean;
}

export interface PrivacyPolicyAnalysis {
  score: number;
  risks: string[];
  summary: string;
  dataSharing: string[];
  industryType?: string;
  positiveFeatures?: string[];
  analysisDepth?: string;
  lastAnalyzed?: string;
  // New fields for enhanced analysis
  loading?: boolean;
  analysisType?: string;
  recommendations?: string[];
  complianceStatus?: {
    gdpr: string;
    ccpa: string;
    coppa: string;
  };
  keyFindings?: string[];
  scores?: {
    dataCollection?: number;
    thirdParty?: number;
    userRights?: number;
    transparency?: number;
  };
  metadata?: {
    url?: string;
    title?: string;
    contentLength?: number;
    totalPages?: number;
    scrapingMethod?: string;
    analyzedAt?: string;
  };
}

export interface DataFlowNode {
  id: string;
  domain: string;
  type: 'source' | 'tracker' | 'destination';
  position: { x: number; y: number };
}

export interface DataFlowEdge {
  from: string;
  to: string;
  dataType: string;
}

export interface SiteData {
  url: string;
  trustScore: number;
  trackers: TrackerData[];
  privacyAnalysis?: PrivacyPolicyAnalysis;
  dataFlow: {
    nodes: DataFlowNode[];
    edges: DataFlowEdge[];
  };
}
