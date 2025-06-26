import { PolicyScraper, ScrapedContent } from './policy-scraper';
import { ApifyScraper, ApifyScrapedContent } from './apify-scraper';

export interface EnhancedPrivacyContent {
  primary: ScrapedContent;
  additional: ApifyScrapedContent[];
  allContent: string;
  metadata: {
    totalPages: number;
    totalWordCount: number;
    scrapingMethod: 'simple' | 'enhanced' | 'mixed';
    timestamp: string;
  };
}

export class EnhancedPolicyService {
  private apifyScraper: ApifyScraper;

  constructor() {
    try {
      this.apifyScraper = new ApifyScraper();
    } catch (error) {
      console.warn('Apify scraper not available:', error);
    }
  }

  /**
   * Enhanced privacy policy analysis that combines simple scraping with Apify
   */
  async getComprehensivePrivacyContent(websiteUrl: string, providedPolicyUrl?: string): Promise<EnhancedPrivacyContent> {
    try {
      console.log(`🔍 Starting comprehensive privacy policy analysis for ${websiteUrl}`);

      let primaryPolicyUrl = providedPolicyUrl;
      
      // Step 1: Find the main privacy policy URL if not provided
      if (!primaryPolicyUrl) {
        primaryPolicyUrl = await PolicyScraper.findPrivacyPolicyUrl(websiteUrl);
        
        if (!primaryPolicyUrl) {
          throw new Error('No privacy policy found on this website');
        }
      }

      // Step 2: Scrape the main privacy policy with simple scraper
      console.log(`📄 Scraping main privacy policy from ${primaryPolicyUrl}`);
      const primaryContent = await PolicyScraper.scrapePrivacyPolicy(primaryPolicyUrl);

      // Step 3: Try to find additional privacy-related pages with Apify
      let additionalContent: ApifyScrapedContent[] = [];
      let scrapingMethod: 'simple' | 'enhanced' | 'mixed' = 'simple';

      if (this.apifyScraper) {
        try {
          console.log(`🕷️ Finding additional privacy pages with Apify`);
          
          // Find additional privacy-related URLs
          const additionalUrls = await this.apifyScraper.findPrivacyPages(websiteUrl);
          
          // Filter out the main policy URL to avoid duplicates
          const uniqueUrls = additionalUrls.filter(url => 
            !this.isSameUrl(url, primaryPolicyUrl) && 
            this.isRelevantPrivacyUrl(url)
          );

          if (uniqueUrls.length > 0) {
            console.log(`🔗 Found ${uniqueUrls.length} additional privacy-related URLs`);
            
            // Scrape additional pages with Apify
            const urlsToScrape = [primaryPolicyUrl, ...uniqueUrls.slice(0, 5)]; // Limit to avoid too many requests
            additionalContent = await this.apifyScraper.scrapePrivacyPolicyPages(websiteUrl, urlsToScrape);
            
            // Remove the primary content from additional results
            additionalContent = additionalContent.filter(content => 
              !this.isSameUrl(content.url, primaryPolicyUrl)
            );
            
            scrapingMethod = additionalContent.length > 0 ? 'mixed' : 'simple';
          }
        } catch (apifyError) {
          console.warn('Apify enhanced scraping failed, using simple scraping only:', apifyError);
          scrapingMethod = 'simple';
        }
      }

      // Step 4: If simple scraping didn't get enough content, try Apify for the main URL
      if (primaryContent.text.length < 1000 && this.apifyScraper) {
        try {
          console.log(`📝 Primary content too short, enhancing with Apify`);
          const apifyResults = await this.apifyScraper.scrapePrivacyPolicyPages(websiteUrl, [primaryPolicyUrl]);
          
          if (apifyResults.length > 0 && apifyResults[0].text.length > primaryContent.text.length) {
            // Replace primary content with better Apify result
            primaryContent.text = apifyResults[0].text;
            primaryContent.title = apifyResults[0].title || primaryContent.title;
            scrapingMethod = 'enhanced';
            console.log(`✅ Enhanced primary content with Apify (${apifyResults[0].text.length} chars)`);
          }
        } catch (error) {
          console.warn('Failed to enhance primary content with Apify:', error);
        }
      }

      // Step 5: Combine all content
      const allContentParts = [primaryContent.text];
      additionalContent.forEach(content => {
        if (content.text && content.text.length > 200) { // Only include substantial content
          allContentParts.push(`\n\n--- Additional Privacy Content from ${content.url} ---\n${content.text}`);
        }
      });

      const combinedContent = allContentParts.join('\n\n');
      const totalWordCount = combinedContent.split(/\s+/).length;

      console.log(`✅ Comprehensive analysis complete: ${totalWordCount} words from ${1 + additionalContent.length} pages`);

      return {
        primary: primaryContent,
        additional: additionalContent,
        allContent: combinedContent,
        metadata: {
          totalPages: 1 + additionalContent.length,
          totalWordCount,
          scrapingMethod,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error in comprehensive privacy policy analysis:', error);
      throw new Error(`Failed to analyze privacy policy comprehensively: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fallback method that tries multiple approaches to get privacy content
   */
  async getPrivacyContentWithFallback(websiteUrl: string, providedPolicyUrl?: string): Promise<ScrapedContent> {
    try {
      // Try comprehensive approach first
      const comprehensiveContent = await this.getComprehensivePrivacyContent(websiteUrl, providedPolicyUrl);
      
      // Return the combined content as a ScrapedContent object
      return {
        text: comprehensiveContent.allContent,
        url: comprehensiveContent.primary.url,
        title: comprehensiveContent.primary.title,
        lastModified: comprehensiveContent.primary.lastModified
      };
    } catch (error) {
      console.warn('Comprehensive analysis failed, falling back to simple scraping:', error);
      
      // Fallback to simple scraping
      let policyUrl = providedPolicyUrl;
      
      if (!policyUrl) {
        policyUrl = await PolicyScraper.findPrivacyPolicyUrl(websiteUrl);
        if (!policyUrl) {
          throw new Error('No privacy policy found on this website');
        }
      }
      
      return await PolicyScraper.scrapePrivacyPolicy(policyUrl);
    }
  }

  private isSameUrl(url1: string, url2: string): boolean {
    try {
      const u1 = new URL(url1);
      const u2 = new URL(url2);
      return u1.hostname === u2.hostname && u1.pathname === u2.pathname;
    } catch {
      return url1.toLowerCase() === url2.toLowerCase();
    }
  }

  private isRelevantPrivacyUrl(url: string): boolean {
    const urlLower = url.toLowerCase();
    const relevantKeywords = [
      'privacy', 'policy', 'cookie', 'terms', 'data-protection', 
      'gdpr', 'ccpa', 'legal', 'data-policy'
    ];
    
    return relevantKeywords.some(keyword => urlLower.includes(keyword)) &&
           !urlLower.includes('contact') && 
           !urlLower.includes('careers') &&
           !urlLower.includes('press') &&
           !urlLower.includes('blog');
  }
}
