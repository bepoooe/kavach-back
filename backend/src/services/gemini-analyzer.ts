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
You are a privacy expert analyzing a website's privacy policy. Please analyze the following privacy policy and provide a comprehensive assessment.

Website URL: ${websiteUrl}

Privacy Policy Text:
${policyText.substring(0, 50000)} // Limit to avoid token limits

Please provide your analysis in the following JSON format (respond ONLY with valid JSON):

{
  "score": <number between 0-100, where 100 is most privacy-friendly>,
  "risks": [
    "<specific privacy risk 1>",
    "<specific privacy risk 2>",
    "<etc>"
  ],
  "summary": "<2-3 sentence summary of the main privacy concerns>",
  "dataSharing": [
    "<company/service 1 that data is shared with>",
    "<company/service 2 that data is shared with>",
    "<etc>"
  ],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<etc>"
  ],
  "complianceStatus": {
    "gdpr": "<compliant|non-compliant|unclear>",
    "ccpa": "<compliant|non-compliant|unclear>",
    "coppa": "<compliant|non-compliant|unclear>"
  },
  "dataRetention": "<description of data retention policy>",
  "userRights": [
    "<user right 1 (e.g., right to deletion)>",
    "<user right 2 (e.g., right to access)>",
    "<etc>"
  ],
  "thirdPartySharing": <true|false>,
  "cookiePolicy": "<summary of cookie usage and user control>"
}

Focus on:
1. Data collection practices and transparency
2. Third-party sharing and partnerships
3. User consent mechanisms
4. Data retention policies
5. User rights and control options
6. Compliance with major privacy regulations (GDPR, CCPA, COPPA)
7. Cookie and tracking practices
8. Data security measures
9. Contact information for privacy concerns
10. Clear and understandable language

Assign scores based on:
- 90-100: Excellent privacy practices, full transparency, strong user control
- 80-89: Good privacy practices with minor concerns
- 70-79: Acceptable but with some notable issues
- 60-69: Several concerning practices
- 50-59: Poor privacy practices
- Below 50: Very concerning or deceptive practices

Be specific in identifying risks and provide actionable recommendations for users.
`;
  }

  private parseGeminiResponse(responseText: string): PrivacyAnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const cleanedResponse = jsonMatch[0]
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedResponse);
      
      // Validate and provide defaults for required fields
      return {
        score: Math.max(0, Math.min(100, parsed.score || 50)),
        risks: Array.isArray(parsed.risks) ? parsed.risks : ['Unable to analyze privacy risks'],
        summary: parsed.summary || 'Privacy policy analysis unavailable',
        dataSharing: Array.isArray(parsed.dataSharing) ? parsed.dataSharing : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        complianceStatus: {
          gdpr: parsed.complianceStatus?.gdpr || 'unclear',
          ccpa: parsed.complianceStatus?.ccpa || 'unclear',
          coppa: parsed.complianceStatus?.coppa || 'unclear'
        },
        dataRetention: parsed.dataRetention || 'Data retention policy unclear',
        userRights: Array.isArray(parsed.userRights) ? parsed.userRights : [],
        thirdPartySharing: parsed.thirdPartySharing !== false,
        cookiePolicy: parsed.cookiePolicy || 'Cookie policy information unavailable'
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
