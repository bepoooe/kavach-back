import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface ScrapedContent {
  text: string;
  url: string;
  title: string;
  lastModified?: string;
}

export class PolicyScraper {
  private static readonly PRIVACY_KEYWORDS = [
    'privacy policy', 'privacy notice', 'data policy', 'cookie policy',
    'privacy statement', 'data protection', 'privacy practices'
  ];

  private static readonly PRIVACY_SELECTORS = [
    'a[href*="privacy"]',
    'a[href*="cookie"]', 
    'a[href*="data-policy"]',
    'a[href*="data-protection"]',
    '.privacy-policy',
    '.privacy-link',
    '#privacy-policy',
    '[data-testid*="privacy"]'
  ];

  static async findPrivacyPolicyUrl(baseUrl: string): Promise<string | null> {
    try {
      const response = await axios.get(baseUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Look for privacy policy links
      for (const selector of this.PRIVACY_SELECTORS) {
        const links = $(selector);
        for (let i = 0; i < links.length; i++) {
          const link = $(links[i]);
          const href = link.attr('href');
          const text = link.text().toLowerCase();
          
          if (href && this.PRIVACY_KEYWORDS.some(keyword => 
            text.includes(keyword) || href.toLowerCase().includes(keyword.replace(' ', '-'))
          )) {
            return this.normalizeUrl(href, baseUrl);
          }
        }
      }

      // Check footer for privacy links
      const footerLinks = $('footer a, .footer a');
      for (let i = 0; i < footerLinks.length; i++) {
        const link = $(footerLinks[i]);
        const href = link.attr('href');
        const text = link.text().toLowerCase();
        
        if (href && this.PRIVACY_KEYWORDS.some(keyword => text.includes(keyword))) {
          return this.normalizeUrl(href, baseUrl);
        }
      }

      // Try common privacy policy URLs
      const commonPaths = [
        '/privacy', '/privacy-policy', '/privacy.html', '/privacy.php',
        '/cookie-policy', '/data-policy', '/privacy-notice', '/privacy-statement'
      ];

      for (const path of commonPaths) {
        try {
          const testUrl = new URL(path, baseUrl).toString();
          const testResponse = await axios.head(testUrl, { timeout: 5000 });
          if (testResponse.status === 200) {
            return testUrl;
          }
        } catch {
          // Continue to next path
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding privacy policy URL:', error);
      return null;
    }
  }

  static async scrapePrivacyPolicy(url: string): Promise<ScrapedContent> {
    try {
      // First try simple HTTP request
      try {
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        
        // Remove script, style, and navigation elements
        $('script, style, nav, header, footer, .navigation, .menu, .sidebar').remove();
        
        // Try to find main content area
        let content = '';
        const contentSelectors = [
          'main', '.main-content', '.content', '.policy-content',
          '.privacy-policy', '.privacy-content', 'article', '.article'
        ];

        for (const selector of contentSelectors) {
          const element = $(selector);
          if (element.length > 0 && element.text().trim().length > 500) {
            content = element.text();
            break;
          }
        }

        // Fallback to body content
        if (!content || content.length < 500) {
          content = $('body').text();
        }

        const title = $('title').text() || $('h1').first().text() || 'Privacy Policy';

        return {
          text: this.cleanText(content),
          url,
          title: title.trim(),
          lastModified: response.headers['last-modified']
        };
      } catch (simpleError) {
        console.log('Simple scraping failed, trying headless browser...');
        return await this.scrapeWithPuppeteer(url);
      }
    } catch (error) {
      console.error('Error scraping privacy policy:', error);
      throw new Error(`Failed to scrape privacy policy from ${url}`);
    }
  }

  private static async scrapeWithPuppeteer(url: string): Promise<ScrapedContent> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set a reasonable timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract content
      const content = await page.evaluate(() => {
        // Remove unwanted elements
        const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, .navigation, .menu, .sidebar');
        elementsToRemove.forEach(el => el.remove());

        // Try to find main content
        const contentSelectors = [
          'main', '.main-content', '.content', '.policy-content',
          '.privacy-policy', '.privacy-content', 'article', '.article'
        ];

        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent && element.textContent.trim().length > 500) {
            return {
              text: element.textContent,
              title: document.title || document.querySelector('h1')?.textContent || 'Privacy Policy'
            };
          }
        }

        // Fallback to body
        return {
          text: document.body.textContent || '',
          title: document.title || 'Privacy Policy'
        };
      });

      return {
        text: this.cleanText(content.text),
        url,
        title: content.title.trim()
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private static normalizeUrl(href: string, baseUrl: string): string {
    try {
      if (href.startsWith('http')) {
        return href;
      }
      return new URL(href, baseUrl).toString();
    } catch {
      return href;
    }
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }
}
