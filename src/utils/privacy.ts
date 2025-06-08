import { SiteData, TrackerData } from './types';

export class TrustScoreCalculator {
  static calculateScore(trackers: TrackerData[], privacyRisks: string[] = []): number {
    let score = 100;
    
    // Deduct points for trackers
    const trackerPenalty = Math.min(trackers.length * 5, 40);
    score -= trackerPenalty;
    
    // Deduct points for high-risk trackers
    const highRiskTrackers = trackers.filter(t => 
      ['advertising', 'social', 'analytics'].includes(t.category)
    );
    score -= highRiskTrackers.length * 3;
    
    // Deduct points for privacy policy risks
    score -= Math.min(privacyRisks.length * 8, 30);
    
    return Math.max(0, Math.min(100, score));
  }
}

export class PrivacyPolicyAnalyzer {
  static async analyzePolicy(url: string): Promise<any> {
    // Simulate AI analysis - in real implementation, this would call an AI service
    const mockAnalysis = {
      score: Math.floor(Math.random() * 40) + 60,
      risks: [
        'Data may be shared with third parties',
        'Vague data retention policies',
        'No explicit user consent for cookies'
      ],
      summary: 'This policy contains some concerning clauses about data sharing and lacks clarity on user rights.',
      dataSharing: ['Facebook', 'Google Analytics', 'Oracle']
    };
    
    return mockAnalysis;
  }
}

export const commonTrackers = {
  'doubleclick.net': { category: 'advertising', name: 'Google DoubleClick' },
  'googletagmanager.com': { category: 'analytics', name: 'Google Tag Manager' },
  'facebook.com': { category: 'social', name: 'Facebook Pixel' },
  'google-analytics.com': { category: 'analytics', name: 'Google Analytics' },
  'connect.facebook.net': { category: 'social', name: 'Facebook Connect' },
  'amazon-adsystem.com': { category: 'advertising', name: 'Amazon Advertising' },
  'twitter.com': { category: 'social', name: 'Twitter Analytics' },
  'linkedin.com': { category: 'social', name: 'LinkedIn Insights' }
};
