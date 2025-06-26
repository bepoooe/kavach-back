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
  private readonly actorId: string = 'aYG0l9s7dbB7j3gbS'; // Web Scraper 
  private readonly lightActorId: string = 'apify/cheerio-scraper'; // Lighter alternative

  constructor() {
    const apiKey = process.env.APIFY_API_KEY || 'apify_api_EsvCiOOlJobxaZnJ3Klnyucd5IRdgq4CsoP3';
    if (!apiKey || apiKey === 'your_actual_apify_api_key_here') {
      throw new Error('APIFY_API_KEY environment variable is required and must be set to a valid Apify API key');
    }
    
    this.client = new ApifyClient({
      token: apiKey,
    });
    
    console.log('🕷️ Apify client initialized with actors:', this.actorId, 'and', this.lightActorId);
  }

  /**
   * Scrapes privacy policy pages using Apify Web Scraper
   */
  async scrapePrivacyPolicyPages(websiteUrl: string, privacyPolicyUrls: string[]): Promise<ApifyScrapedContent[]> {
    try {
      console.log(`🕷️ Starting Apify scraping for ${privacyPolicyUrls.length} privacy policy URLs`);

      // Try main actor first, then fallback to lighter actor
      let results;
      try {
        results = await this.scrapeWithActor(this.actorId, websiteUrl, privacyPolicyUrls);
      } catch (error: any) {
        if (error.type === 'actor-memory-limit-exceeded' || error.statusCode === 402) {
          console.log('🔄 Main actor memory limit exceeded, trying lighter actor...');
          results = await this.scrapeWithLightActor(websiteUrl, privacyPolicyUrls);
        } else {
          throw error;
        }
      }

      return this.processApifyResults(results, websiteUrl);

    } catch (error) {
      console.error('Error in Apify scraping:', error);
      throw new Error(`Failed to scrape privacy policy pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async scrapeWithActor(actorId: string, websiteUrl: string, privacyPolicyUrls: string[]): Promise<any[]> {
    // Prepare the input for the Apify actor
    const actorInput: ApifyActorInput = {
      startUrls: privacyPolicyUrls.map(url => ({ url })),
      linkSelector: 'a[href*="privacy"], a[href*="policy"], a[href*="terms"], a[href*="cookie"]',
      pageFunction: this.createPageFunction(),
      maxRequestsPerCrawl: 10, // Reduced for faster execution
      maxConcurrency: 3, // Reduced to avoid rate limits
      requestTimeoutSecs: 30, // Reduced timeout
      maxScrollHeightPixels: 3000, // Reduced scrolling
      maxSessionRotations: 5 // Reduced rotations
    };

    // Start the actor run
    const run = await this.client.actor(actorId).call(actorInput);

    console.log(`🚀 Apify actor run completed with ID: ${run.id}`);

    // Get the results
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`✅ Apify scraping completed. Found ${items.length} results`);

    return items;
  }

  private async scrapeWithLightActor(websiteUrl: string, privacyPolicyUrls: string[]): Promise<any[]> {
    console.log(`🪶 Using lightweight Cheerio scraper for ${privacyPolicyUrls.length} URLs`);
    
    const actorInput = {
      startUrls: privacyPolicyUrls.map(url => ({ url })),
      maxRequestsPerCrawl: 5,
      maxConcurrency: 2,
      requestTimeoutSecs: 20,
      pageFunction: `
        async function pageFunction(context) {
          const $ = context.$;
          const request = context.request;
          
          // Remove scripts and styles
          $('script, style, nav, header, footer').remove();
          
          // Try to get main content
          const content = $('main, .main-content, .content, .policy-content, .privacy-policy, article').first();
          const text = content.length ? content.text() : $('body').text();
          
          return {
            url: request.url,
            text: text.replace(/\\s+/g, ' ').trim(),
            title: $('title').text() || $('h1').first().text() || 'Privacy Policy',
            wordCount: text.split(/\\s+/).length
          };
        }
      `
    };

    const run = await this.client.actor(this.lightActorId).call(actorInput);
    console.log(`🚀 Lightweight actor run completed with ID: ${run.id}`);

    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    console.log(`✅ Lightweight scraping completed. Found ${items.length} results`);

    return items;
  }

  /**
   * Finds additional privacy-related pages on a website
   */
  async findPrivacyPages(websiteUrl: string): Promise<string[]> {
    try {
      // Try main actor first
      let items;
      try {
        const actorInput: ApifyActorInput = {
          startUrls: [{ url: websiteUrl }],
          linkSelector: 'a[href*="privacy"], a[href*="policy"], a[href*="terms"], a[href*="cookie"], a[href*="legal"], a[href*="data"]',
          pageFunction: this.createLinkFinderFunction(),
          maxRequestsPerCrawl: 5, // Reduced for faster discovery
          maxConcurrency: 2,
          requestTimeoutSecs: 20, // Reduced timeout
          maxScrollHeightPixels: 2000 // Reduced scrolling
        };

        const run = await this.client.actor(this.actorId).call(actorInput);
        console.log(`🔍 Finding privacy pages completed with run ID: ${run.id}`);

        const results = await this.client.dataset(run.defaultDatasetId).listItems();
        items = results.items;
      } catch (error: any) {
        if (error.type === 'actor-memory-limit-exceeded' || error.statusCode === 402) {
          console.log('🔄 Main actor memory limit exceeded for link finding, trying lighter approach...');
          
          // Use lightweight scraper for link finding
          const lightActorInput = {
            startUrls: [{ url: websiteUrl }],
            maxRequestsPerCrawl: 2,
            maxConcurrency: 1,
            requestTimeoutSecs: 15,
            pageFunction: `
              async function pageFunction(context) {
                const $ = context.$;
                const links = [];
                
                $('a[href*="privacy"], a[href*="policy"], a[href*="terms"], a[href*="cookie"], footer a, .footer a').each((i, el) => {
                  const href = $(el).attr('href');
                  const text = $(el).text().toLowerCase();
                  
                  if (href && (text.includes('privacy') || text.includes('policy') || text.includes('terms') || text.includes('cookie'))) {
                    links.push(href);
                  }
                });
                
                return {
                  url: context.request.url,
                  privacyLinks: [...new Set(links)]
                };
              }
            `
          };

          const run = await this.client.actor(this.lightActorId).call(lightActorInput);
          const results = await this.client.dataset(run.defaultDatasetId).listItems();
          items = results.items;
        } else {
          throw error;
        }
      }

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
