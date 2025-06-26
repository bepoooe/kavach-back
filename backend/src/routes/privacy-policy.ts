import express, { Request, Response } from 'express';
import { GeminiPrivacyAnalyzer } from '../services/gemini-analyzer';
import { PolicyScraper } from '../services/policy-scraper';
import { EnhancedPolicyService } from '../services/enhanced-policy-service';

const router = express.Router();

interface AnalyzeRequest {
  url: string;
  policyUrl?: string;
  enhanced?: boolean; // New option for enhanced analysis
}

interface AnalyzeResponse {
  success: boolean;
  data?: any;
  error?: string;
  policyUrl?: string;
}

// Initialize services
let analyzer: GeminiPrivacyAnalyzer;
let enhancedService: EnhancedPolicyService;

try {
  analyzer = new GeminiPrivacyAnalyzer();
  enhancedService = new EnhancedPolicyService();
} catch (error) {
  console.error('Failed to initialize services:', error);
}

/**
 * POST /api/privacy-policy/analyze
 * Analyzes a website's privacy policy using AI
 */
router.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, policyUrl, enhanced = false }: AnalyzeRequest = req.body;
    let useEnhancedAnalysis = enhanced;

    if (!url) {
      res.status(400).json({
        success: false,
        error: 'Website URL is required'
      } as AnalyzeResponse);
      return;
    }

    if (!analyzer) {
      res.status(500).json({
        success: false,
        error: 'Privacy policy analyzer is not available. Please check server configuration.'
      } as AnalyzeResponse);
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      } as AnalyzeResponse);
      return;
    }

    let scrapedContent;
    let isEnhancedAnalysis = false;

    if (useEnhancedAnalysis && enhancedService) {
      try {
        console.log(`🔍 Starting enhanced privacy policy analysis for ${url}`);
        const comprehensiveContent = await enhancedService.getComprehensivePrivacyContent(url, policyUrl);
        
        scrapedContent = {
          text: comprehensiveContent.allContent,
          url: comprehensiveContent.primary.url,
          title: comprehensiveContent.primary.title,
          lastModified: comprehensiveContent.primary.lastModified
        };
        
        isEnhancedAnalysis = true;
        console.log(`✅ Enhanced analysis found ${comprehensiveContent.metadata.totalPages} pages with ${comprehensiveContent.metadata.totalWordCount} words`);
        
      } catch (enhancedError) {
        console.warn('Enhanced analysis failed, falling back to simple analysis:', enhancedError);
        // Fall back to simple analysis
        useEnhancedAnalysis = false;
      }
    }

    if (!isEnhancedAnalysis) {
      // Use simple analysis
      let finalPolicyUrl = policyUrl;
      
      // If no specific policy URL provided, try to find it
      if (!finalPolicyUrl) {
        console.log(`🔍 Searching for privacy policy on ${url}`);
        const foundPolicyUrl = await PolicyScraper.findPrivacyPolicyUrl(url);
        
        if (!foundPolicyUrl) {
          res.status(404).json({
            success: false,
            error: 'No privacy policy found on this website'
          } as AnalyzeResponse);
          return;
        }
        
        finalPolicyUrl = foundPolicyUrl;
      }

      console.log(`📄 Scraping privacy policy from ${finalPolicyUrl}`);
      scrapedContent = await PolicyScraper.scrapePrivacyPolicy(finalPolicyUrl);
    }
    
    if (!scrapedContent.text || scrapedContent.text.length < 100) {
      res.status(400).json({
        success: false,
        error: 'Privacy policy content is too short or empty'
      } as AnalyzeResponse);
      return;
    }

    const analysisType = isEnhancedAnalysis ? 'enhanced' : 'standard';
    console.log(`🤖 Analyzing privacy policy with AI (${scrapedContent.text.length} characters, ${analysisType} mode)`);
    
    // Analyze with Gemini
    const analysis = await analyzer.analyzePrivacyPolicy(scrapedContent.text, url, isEnhancedAnalysis);

    const response: AnalyzeResponse = {
      success: true,
      data: {
        summary: analysis.summary,
        safety: analysis.safety,
        ...(isEnhancedAnalysis && {
          keyFindings: analysis.keyFindings,
          scores: {
            dataCollection: analysis.dataCollectionScore,
            thirdParty: analysis.thirdPartyScore,
            userRights: analysis.userRightsScore,
            transparency: analysis.transparencyScore
          }
        }),
        policyMetadata: {
          url: scrapedContent.url,
          title: scrapedContent.title,
          lastModified: scrapedContent.lastModified,
          contentLength: scrapedContent.text.length,
          analysisType,
          analyzedAt: new Date().toISOString()
        }
      },
      policyUrl: scrapedContent.url
    };

    console.log(`✅ Analysis complete for ${url} - Safety: ${analysis.safety} (${analysisType})`);
    res.json(response);

  } catch (error) {
    console.error('Error analyzing privacy policy:', error);
    
    let errorMessage = 'Failed to analyze privacy policy';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout - the website took too long to respond';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Website not found or not accessible';
      } else if (error.message.includes('scrape')) {
        errorMessage = 'Failed to extract privacy policy content';
      } else if (error.message.includes('API')) {
        errorMessage = 'AI analysis service temporarily unavailable';
      } else {
        errorMessage = error.message;
      }
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    } as AnalyzeResponse);
  }
});

/**
 * POST /api/privacy-policy/analyze-enhanced  
 * Enhanced privacy policy analysis using Apify integration
 */
router.post('/analyze-enhanced', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, policyUrl }: AnalyzeRequest = req.body;

    if (!url) {
      res.status(400).json({
        success: false,
        error: 'Website URL is required'
      } as AnalyzeResponse);
      return;
    }

    if (!analyzer || !enhancedService) {
      res.status(500).json({
        success: false,
        error: 'Enhanced privacy policy analyzer is not available. Please check server configuration.'
      } as AnalyzeResponse);
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      } as AnalyzeResponse);
      return;
    }

    console.log(`🚀 Starting enhanced privacy policy analysis for ${url}`);
    
    // Use enhanced analysis
    const comprehensiveContent = await enhancedService.getComprehensivePrivacyContent(url, policyUrl);
    
    if (!comprehensiveContent.allContent || comprehensiveContent.allContent.length < 100) {
      res.status(400).json({
        success: false,
        error: 'Privacy policy content is too short or empty'
      } as AnalyzeResponse);
      return;
    }

    console.log(`🤖 Analyzing comprehensive privacy content with AI (${comprehensiveContent.allContent.length} characters from ${comprehensiveContent.metadata.totalPages} pages)`);
    
    // Analyze with Gemini in enhanced mode
    const analysis = await analyzer.analyzePrivacyPolicy(comprehensiveContent.allContent, url, true);

    const response: AnalyzeResponse = {
      success: true,
      data: {
        summary: analysis.summary,
        safety: analysis.safety,
        keyFindings: analysis.keyFindings,
        scores: {
          dataCollection: analysis.dataCollectionScore,
          thirdParty: analysis.thirdPartyScore,
          userRights: analysis.userRightsScore,
          transparency: analysis.transparencyScore
        },
        policyMetadata: {
          url: comprehensiveContent.primary.url,
          title: comprehensiveContent.primary.title,
          lastModified: comprehensiveContent.primary.lastModified,
          contentLength: comprehensiveContent.allContent.length,
          analysisType: 'enhanced',
          totalPages: comprehensiveContent.metadata.totalPages,
          scrapingMethod: comprehensiveContent.metadata.scrapingMethod,
          analyzedAt: new Date().toISOString()
        },
        additionalPages: comprehensiveContent.additional.map(page => ({
          url: page.url,
          title: page.title,
          wordCount: page.metadata?.wordCount
        }))
      },
      policyUrl: comprehensiveContent.primary.url
    };

    console.log(`✅ Enhanced analysis complete for ${url} - Safety: ${analysis.safety}, Pages: ${comprehensiveContent.metadata.totalPages}`);
    res.json(response);

  } catch (error) {
    console.error('Error in enhanced privacy policy analysis:', error);
    
    let errorMessage = 'Failed to perform enhanced privacy policy analysis';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout - the analysis took too long to complete';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Website not found or not accessible';
      } else if (error.message.includes('scrape')) {
        errorMessage = 'Failed to extract comprehensive privacy policy content';
      } else if (error.message.includes('API')) {
        errorMessage = 'AI analysis service temporarily unavailable';
      } else if (error.message.includes('Apify')) {
        errorMessage = 'Enhanced scraping service temporarily unavailable, try standard analysis';
      } else {
        errorMessage = error.message;
      }
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    } as AnalyzeResponse);
  }
});

/**
 * GET /api/privacy-policy/find
 * Find privacy policy URL for a given website
 */
router.get('/find', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Website URL is required as query parameter'
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
      return;
    }

    const policyUrl = await PolicyScraper.findPrivacyPolicyUrl(url);

    if (!policyUrl) {
      res.status(404).json({
        success: false,
        error: 'No privacy policy found on this website'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        policyUrl,
        foundAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error finding privacy policy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search for privacy policy'
    });
  }
});

export { router as privacyPolicyRouter };
