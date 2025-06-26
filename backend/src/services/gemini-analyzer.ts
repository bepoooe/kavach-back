import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PrivacyAnalysisResult {
  summary: string;
  safety: 'SAFE' | 'RISKY' | 'UNSAFE';
  keyFindings?: string[];
  dataCollectionScore?: number;
  thirdPartyScore?: number;
  userRightsScore?: number;
  transparencyScore?: number;
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

  async analyzePrivacyPolicy(policyText: string, websiteUrl: string, isEnhanced: boolean = false): Promise<PrivacyAnalysisResult> {
    try {
      const prompt = this.createAnalysisPrompt(policyText, websiteUrl, isEnhanced);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text, isEnhanced);
    } catch (error) {
      console.error('Error analyzing privacy policy with Gemini:', error);
      throw new Error('Failed to analyze privacy policy');
    }
  }

  private createAnalysisPrompt(policyText: string, websiteUrl: string, isEnhanced: boolean = false): string {
    const maxLength = isEnhanced ? 100000 : 50000; // Allow more content for enhanced analysis
    const truncatedText = policyText.substring(0, maxLength);
    
    return `
You are a privacy expert analyzing a website's privacy policy. Analyze the following privacy policy and provide a comprehensive assessment.

Website URL: ${websiteUrl}
Analysis Type: ${isEnhanced ? 'Enhanced (multiple pages)' : 'Standard'}

Privacy Policy Text:
${truncatedText}

Provide your analysis in exactly this format:
SAFETY: [SAFE/RISKY/UNSAFE]
SUMMARY: [exactly 30 words analyzing how this privacy policy affects user rights]
${isEnhanced ? `
KEY_FINDINGS: [3-5 key privacy concerns or positives, separated by |]
DATA_COLLECTION_SCORE: [0-100 score for data collection practices]
THIRD_PARTY_SCORE: [0-100 score for third-party sharing practices]  
USER_RIGHTS_SCORE: [0-100 score for user control and rights]
TRANSPARENCY_SCORE: [0-100 score for policy clarity and transparency]
` : ''}

Safety Guidelines:
- SAFE: Strong privacy protections, clear user rights, minimal data collection, no third-party sharing
- RISKY: Some concerning practices, moderate data sharing, unclear policies
- UNSAFE: Extensive data collection, broad third-party sharing, weak user rights, vague terms

Example:
SAFETY: RISKY
SUMMARY: This policy significantly restricts user rights by allowing extensive data sharing with third parties without clear consent mechanisms, offering limited deletion options and vague retention periods.

Respond in exactly this format, nothing else.
`;
  }

  private parseGeminiResponse(responseText: string, isEnhanced: boolean = false): PrivacyAnalysisResult {
    try {
      // Clean the response text
      const cleanedText = responseText.trim();
      
      // Extract safety rating
      const safetyMatch = cleanedText.match(/SAFETY:\s*(SAFE|RISKY|UNSAFE)/i);
      const safety = safetyMatch ? safetyMatch[1].toUpperCase() as 'SAFE' | 'RISKY' | 'UNSAFE' : 'RISKY';
      
      // Extract summary
      const summaryMatch = cleanedText.match(/SUMMARY:\s*(.+?)(?:\n|$)/i);
      const summary = summaryMatch ? summaryMatch[1].trim() : cleanedText;
      
      const result: PrivacyAnalysisResult = {
        summary: summary,
        safety: safety
      };
      
      if (isEnhanced) {
        // Extract enhanced analysis fields
        const keyFindingsMatch = cleanedText.match(/KEY_FINDINGS:\s*(.+?)(?:\n|$)/i);
        if (keyFindingsMatch) {
          result.keyFindings = keyFindingsMatch[1].split('|').map(finding => finding.trim());
        }
        
        const dataCollectionMatch = cleanedText.match(/DATA_COLLECTION_SCORE:\s*(\d+)/i);
        if (dataCollectionMatch) {
          result.dataCollectionScore = parseInt(dataCollectionMatch[1]);
        }
        
        const thirdPartyMatch = cleanedText.match(/THIRD_PARTY_SCORE:\s*(\d+)/i);
        if (thirdPartyMatch) {
          result.thirdPartyScore = parseInt(thirdPartyMatch[1]);
        }
        
        const userRightsMatch = cleanedText.match(/USER_RIGHTS_SCORE:\s*(\d+)/i);
        if (userRightsMatch) {
          result.userRightsScore = parseInt(userRightsMatch[1]);
        }
        
        const transparencyMatch = cleanedText.match(/TRANSPARENCY_SCORE:\s*(\d+)/i);
        if (transparencyMatch) {
          result.transparencyScore = parseInt(transparencyMatch[1]);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', responseText);
      
      // Return fallback analysis
      return {
        summary: 'Privacy policy analysis failed. Please review the policy manually for potential privacy concerns and data handling practices.',
        safety: 'RISKY'
      };
    }
  }
}
