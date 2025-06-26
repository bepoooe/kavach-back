import { ApifyClient } from 'apify-client';
import axios from 'axios';

export interface ApifyScrapedContent {
  text: string;
  url: string;
  title: string;
  metadata?: {
    wordCount: number;
    lastModified?: string;
    contentType?: string;
    links?: string[];
    headers?: string[];
  };
}

export interface ApifyActorInput {
  startUrls: Array<{ url: string }>;
  linkSelector?: string;
  pageFunction?: string;
  maxRequestsPerCrawl?: number;
  maxConcurrency?: number;
  requestTimeoutSecs?: number;
  maxScrollHeightPixels?: number;
  maxSessionRotations?: number;
}

export class ApifyScraper {
  private readonly client: ApifyClient;
  private readonly actorId: string = 'aYG0l9s7dbB7j3gbS';

  constructor() {
    const apiKey = process.env.APIFY_API_KEY || 'apify_api_EsvCiOOlJobxaZnJ3Klnyucd5IRdgq4CsoP3';
    if (!apiKey) {
      throw new Error('APIFY_API_KEY environment variable is required');
    }
    
    this.client = new ApifyClient({
      token: apiKey,
    });
  }

  /**
   * Scrapes privacy policy pages using Apify Web Scraper
   */
  async scrapePrivacyPolicyPages(websiteUrl: string, privacyPolicyUrls: string[]): Promise<ApifyScrapedContent[]> {
    try {
      console.log(`🕷️ Starting Apify scraping for ${privacyPolicyUrls.length} privacy policy URLs`);

      // Prepare the input for the Apify actor
      const actorInput: ApifyActorInput = {
        startUrls: privacyPolicyUrls.map(url => ({ url })),
        linkSelector: 'a[href*="privacy"], a[href*="policy"], a[href*="terms"], a[href*="cookie"]',
        pageFunction: this.createPageFunction(),
        maxRequestsPerCrawl: 50,
        maxConcurrency: 5,
        requestTimeoutSecs: 60,
        maxScrollHeightPixels: 5000,
        maxSessionRotations: 10
      };

      // Start the actor run
      const run = await this.client.actor(this.actorId).call(actorInput);

      console.log(`🚀 Apify actor run completed with ID: ${run.id}`);

      // Get the results
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      console.log(`✅ Apify scraping completed. Found ${items.length} results`);

      return this.processApifyResults(items, websiteUrl);

    } catch (error) {
      console.error('Error in Apify scraping:', error);
      throw new Error(`Failed to scrape privacy policy pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds additional privacy-related pages on a website
   */
  async findPrivacyPages(websiteUrl: string): Promise<string[]> {
    try {
      const actorInput: ApifyActorInput = {
        startUrls: [{ url: websiteUrl }],
        linkSelector: 'a[href*="privacy"], a[href*="policy"], a[href*="terms"], a[href*="cookie"], a[href*="legal"], a[href*="data"]',
        pageFunction: this.createLinkFinderFunction(),
        maxRequestsPerCrawl: 10,
        maxConcurrency: 2,
        requestTimeoutSecs: 30,
        maxScrollHeightPixels: 3000
      };

      const run = await this.client.actor(this.actorId).call(actorInput);

      console.log(`🔍 Finding privacy pages completed with run ID: ${run.id}`);

      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      const privacyUrls = this.extractPrivacyUrls(items);

      console.log(`🔗 Found ${privacyUrls.length} privacy-related URLs`);

      return privacyUrls;

    } catch (error) {
      console.error('Error finding privacy pages:', error);
      return []; // Return empty array instead of throwing to allow fallback
    }
  }

  private createPageFunction(): string {
    return `
      async function pageFunction(context) {
        const { page, request } = context;
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Remove scripts, styles, and other non-content elements
        await page.evaluate(() => {
          const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, .navigation, .menu, .sidebar, .advertisement, .ads');
          elementsToRemove.forEach(el => el.remove());
        });
        
        // Extract the main content
        const content = await page.evaluate(() => {
          // Try to find main content areas
          const contentSelectors = [
            'main', '.main-content', '.content', '.policy-content',
            '.privacy-policy', '.privacy-content', 'article', '.article',
            '.terms-content', '.legal-content', '.page-content'
          ];
          
          let mainContent = '';
          
          for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 500) {
              mainContent = element.textContent;
              break;
            }
          }
          
          // Fallback to body content
          if (!mainContent || mainContent.length < 500) {
            mainContent = document.body.textContent || '';
          }
          
          // Get page metadata
          const title = document.title || document.querySelector('h1')?.textContent || 'Privacy Policy';
          const lastModified = document.querySelector('meta[name="last-modified"]')?.getAttribute('content') || 
                              document.querySelector('[data-last-modified]')?.textContent || '';
          
          // Extract headers for structure understanding
          const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .map(h => h.textContent?.trim())
            .filter(text => text && text.length > 0);
          
          // Extract relevant links
          const links = Array.from(document.querySelectorAll('a[href]'))
            .map(a => a.href)
            .filter(href => href.includes('privacy') || href.includes('policy') || href.includes('terms') || href.includes('cookie'));
          
          return {
            text: mainContent.replace(/\\s+/g, ' ').trim(),
            title: title.trim(),
            lastModified,
            headers,
            links: [...new Set(links)], // Remove duplicates
            wordCount: mainContent.split(/\\s+/).length
          };
        });
        
        return {
          url: request.url,
          ...content
        };
      }
    `;
  }

  private createLinkFinderFunction(): string {
    return `
      async function pageFunction(context) {
        const { page, request } = context;
        
        await page.waitForLoadState('networkidle');
        
        const links = await page.evaluate(() => {
          const relevantSelectors = [
            'a[href*="privacy"]',
            'a[href*="policy"]', 
            'a[href*="terms"]',
            'a[href*="cookie"]',
            'a[href*="legal"]',
            'a[href*="data"]',
            'footer a',
            '.footer a',
            '.legal-links a'
          ];
          
          const foundLinks = new Set();
          
          relevantSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const href = el.href;
              const text = el.textContent?.toLowerCase() || '';
              
              if (href && (
                text.includes('privacy') || 
                text.includes('policy') || 
                text.includes('terms') || 
                text.includes('cookie') ||
                text.includes('legal') ||
                text.includes('data protection')
              )) {
                foundLinks.add(href);
              }
            });
          });
          
          return Array.from(foundLinks);
        });
        
        return {
          url: request.url,
          privacyLinks: links
        };
      }
    `;
  }

  private processApifyResults(results: any[], websiteUrl: string): ApifyScrapedContent[] {
    return results
      .filter(result => result.text && result.text.length > 100) // Filter out empty or too short content
      .map(result => ({
        text: result.text,
        url: result.url,
        title: result.title || 'Privacy Policy',
        metadata: {
          wordCount: result.wordCount || result.text.split(/\s+/).length,
          lastModified: result.lastModified,
          contentType: 'privacy-policy',
          links: result.links || [],
          headers: result.headers || []
        }
      }));
  }

  private extractPrivacyUrls(results: any[]): string[] {
    const allLinks = new Set<string>();
    
    results.forEach(result => {
      if (result.privacyLinks && Array.isArray(result.privacyLinks)) {
        result.privacyLinks.forEach((link: string) => allLinks.add(link));
      }
    });
    
    return Array.from(allLinks);
  }
}
