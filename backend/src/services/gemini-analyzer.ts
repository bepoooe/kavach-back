import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PrivacyAnalysisResult {
  score: number;
  risks: string[];
  summary: string;
  dataSharing: string[];
  recommendations: string[];
  complianceStatus: {
    gdpr: 'compliant' | 'non-compliant' | 'unclear';
    ccpa: 'compliant' | 'non-compliant' | 'unclear';
    coppa: 'compliant' | 'non-compliant' | 'unclear';
  };
  dataRetention: string;
  userRights: string[];
  thirdPartySharing: boolean;
  cookiePolicy: string;
}

export class GeminiPrivacyAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzePrivacyPolicy(policyText: string, websiteUrl: string): Promise<PrivacyAnalysisResult> {
    try {
      const prompt = this.createAnalysisPrompt(policyText, websiteUrl);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Error analyzing privacy policy with Gemini:', error);
      throw new Error('Failed to analyze privacy policy');
    }
  }

  private createAnalysisPrompt(policyText: string, websiteUrl: string): string {
    return `
You are a privacy expert analyzing a website's privacy policy. Analyze the following privacy policy and provide a concise assessment.

Website URL: ${websiteUrl}

Privacy Policy Text:
${policyText.substring(0, 50000)}

Provide ONLY a 30-word paragraph analyzing how this privacy policy affects user rights. Focus on whether it protects or hinders user privacy and data control. Be direct and specific.

Example format: "This policy significantly restricts user rights by allowing extensive data sharing with third parties without clear consent mechanisms, offering limited deletion options and vague retention periods."

Respond with exactly 30 words, no more, no less.
`;
  }

  private parseGeminiResponse(responseText: string): PrivacyAnalysisResult {
    try {
      // Clean the response text
      const cleanedText = responseText.trim();
      
      // Count words to ensure it's around 30 words
      const wordCount = cleanedText.split(' ').length;
      
      // Generate a basic score based on keywords in the response
      const negativeKeywords = ['restricts', 'limits', 'hinders', 'unclear', 'vague', 'extensive sharing', 'poor', 'concerning', 'lacks'];
      const positiveKeywords = ['protects', 'transparent', 'clear', 'strong', 'comprehensive', 'respects', 'empowers', 'secure'];
      
      let score = 50; // Base score
      negativeKeywords.forEach(keyword => {
        if (cleanedText.toLowerCase().includes(keyword)) score -= 5;
      });
      positiveKeywords.forEach(keyword => {
        if (cleanedText.toLowerCase().includes(keyword)) score += 5;
      });
      
      score = Math.max(0, Math.min(100, score));
      
      return {
        score: score,
        risks: [cleanedText],
        summary: cleanedText,
        dataSharing: [],
        recommendations: ['Review the full privacy policy for details', 'Contact website for privacy clarifications'],
        complianceStatus: {
          gdpr: 'unclear',
          ccpa: 'unclear',
          coppa: 'unclear'
        },
        dataRetention: 'See full privacy policy for retention details',
        userRights: [],
        thirdPartySharing: cleanedText.toLowerCase().includes('sharing') || cleanedText.toLowerCase().includes('third'),
        cookiePolicy: 'See full privacy policy for cookie details'
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', responseText);
      
      // Return fallback analysis
      return {
        score: 50,
        risks: ['Unable to analyze privacy policy - please review manually'],
        summary: 'Privacy policy analysis failed. Please review the policy manually for potential privacy concerns.',
        dataSharing: [],
        recommendations: ['Review the privacy policy manually', 'Contact the website for clarification on data practices'],
        complianceStatus: {
          gdpr: 'unclear',
          ccpa: 'unclear', 
          coppa: 'unclear'
        },
        dataRetention: 'Unable to determine data retention policy',
        userRights: [],
        thirdPartySharing: true,
        cookiePolicy: 'Unable to determine cookie policy'
      };
    }
  }
}
