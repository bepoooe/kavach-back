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
      console.log(`🤖 Starting Gemini analysis for ${websiteUrl} (${isEnhanced ? 'enhanced' : 'standard'} mode)`);
      console.log(`📝 Content length: ${policyText.length} characters`);
      
      const prompt = this.createAnalysisPrompt(policyText, websiteUrl, isEnhanced);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Gemini analysis completed successfully`);
      
      return this.parseGeminiResponse(text, isEnhanced);
    } catch (error) {
      console.error('❌ Error analyzing privacy policy with Gemini:', error);
      throw new Error(`Failed to analyze privacy policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createAnalysisPrompt(policyText: string, websiteUrl: string, isEnhanced: boolean = false): string {
    const maxLength = isEnhanced ? 150000 : 50000;
    const truncatedText = policyText.substring(0, maxLength);
    
    const enhancedInstructions = isEnhanced ? `
ENHANCED ANALYSIS MODE:
This content was scraped from multiple pages using advanced web crawling (Apify). It may include:
- Main privacy policy page
- Terms of service  
- Cookie policy
- Data protection addendums
- GDPR/CCPA specific pages

Please provide extra detailed analysis since this is comprehensive multi-page content.
    ` : '';
    
    return `You are a privacy expert analyzing a website's privacy policy. Analyze the following privacy policy and provide a comprehensive assessment.

Website URL: ${websiteUrl}
Analysis Type: ${isEnhanced ? 'Enhanced (multi-page crawling via Apify)' : 'Standard (single page)'}
Content Length: ${truncatedText.length} characters

${enhancedInstructions}

PRIVACY POLICY CONTENT:
${truncatedText}

Please provide a detailed analysis in the following JSON format:

{
  "summary": "Detailed summary of the privacy policy (200-400 words)",
  "safety": "SAFE or RISKY or UNSAFE",
  "keyFindings": [
    "Key finding 1 about data collection",
    "Key finding 2 about third-party sharing", 
    "Key finding 3 about user rights",
    "Key finding 4 about data retention",
    "Key finding 5 about security measures"
  ],
  "dataCollectionScore": 85,
  "thirdPartyScore": 70,
  "userRightsScore": 90,
  "transparencyScore": 80
}

SCORING CRITERIA:
- Data Collection Score: 100 = minimal collection, 0 = excessive collection
- Third Party Score: 100 = no sharing, 0 = extensive sharing without consent
- User Rights Score: 100 = full rights (access, delete, port, opt-out), 0 = no rights
- Transparency Score: 100 = very clear and detailed, 0 = vague and confusing

SAFETY ASSESSMENT:
- SAFE: Good privacy practices, user-friendly, clear rights
- RISKY: Some concerning practices but manageable
- UNSAFE: Significant privacy risks, poor practices, unclear terms

${isEnhanced ? 'Since this is enhanced analysis from multiple pages, please be extra thorough in identifying privacy practices across all the content provided.' : ''}

Respond ONLY with valid JSON.`;
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
