import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PrivacyAnalysisResult {
  summary: string;
  safety: 'SAFE' | 'RISKY' | 'UNSAFE';
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

Provide your analysis in exactly this format:
SAFETY: [SAFE/RISKY/UNSAFE]
SUMMARY: [exactly 30 words analyzing how this privacy policy affects user rights]

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

  private parseGeminiResponse(responseText: string): PrivacyAnalysisResult {
    try {
      // Clean the response text
      const cleanedText = responseText.trim();
      
      // Extract safety rating
      const safetyMatch = cleanedText.match(/SAFETY:\s*(SAFE|RISKY|UNSAFE)/i);
      const safety = safetyMatch ? safetyMatch[1].toUpperCase() as 'SAFE' | 'RISKY' | 'UNSAFE' : 'RISKY';
      
      // Extract summary
      const summaryMatch = cleanedText.match(/SUMMARY:\s*(.+)/i);
      const summary = summaryMatch ? summaryMatch[1].trim() : cleanedText;
      
      return {
        summary: summary,
        safety: safety
      };
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
