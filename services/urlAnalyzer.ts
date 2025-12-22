import { groq } from './llm';

export interface AnalysisResult {
    productName: string;
    description: string;
    industry: string;
    suggestedTone: 'Professional' | 'Friendly' | 'Hype' | 'Luxury';
    brandColor: string;
    logoUrl?: string;
    screenshots: string[];
    keyFeatures: string[];
    suggestedCTA: string;
}

/**
 * Analyzes a website URL to extract product information
 */
export async function analyzeUrl(url: string): Promise<AnalysisResult> {
    console.log(`🔍 Analyzing URL: ${url}`);

    try {
        // Step 1: Fetch website metadata via proxy
        const metadata = await fetchWebsiteMetadata(url);

        // Step 2: Use AI to analyze the content
        const analysis = await analyzeWithAI(metadata, url);

        console.log('✅ URL analysis complete');
        return analysis;

    } catch (error) {
        console.error('❌ URL analysis failed:', error);
        throw new Error(`Failed to analyze URL: ${(error as Error).message}`);
    }
}

/**
 * Fetch website metadata (title, description, OG tags, etc.)
 */
async function fetchWebsiteMetadata(url: string) {
    try {
        // Use a CORS proxy or our backend proxy
        const proxyUrl = `http://localhost:3001/api/scrape?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Parse HTML to extract metadata
        const metadata = parseHtmlMetadata(html);

        return metadata;

    } catch (error) {
        console.error('Failed to fetch website:', error);
        // Return minimal metadata if fetch fails
        return {
            title: '',
            description: '',
            ogImage: '',
            content: '',
        };
    }
}

/**
 * Parse HTML to extract metadata
 */
function parseHtmlMetadata(html: string) {
    const metadata = {
        title: '',
        description: '',
        ogImage: '',
        ogTitle: '',
        ogDescription: '',
        content: '',
        headings: [] as string[],
    };

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) metadata.title = titleMatch[1].trim();

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) metadata.description = descMatch[1].trim();

    // Extract OG tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) metadata.ogTitle = ogTitleMatch[1].trim();

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDescMatch) metadata.ogDescription = ogDescMatch[1].trim();

    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImageMatch) metadata.ogImage = ogImageMatch[1].trim();

    // Extract main headings (h1, h2)
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);

    if (h1Matches) {
        metadata.headings.push(...h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()));
    }
    if (h2Matches) {
        metadata.headings.push(...h2Matches.slice(0, 5).map(h => h.replace(/<[^>]+>/g, '').trim()));
    }

    // Extract text content (simplified)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
        const bodyHtml = bodyMatch[1];
        // Remove scripts, styles, and tags
        const cleanText = bodyHtml
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        metadata.content = cleanText.slice(0, 2000); // Limit to 2000 chars
    }

    return metadata;
}

/**
 * Use AI to analyze metadata and extract structured information
 */
async function analyzeWithAI(metadata: any, url: string): Promise<AnalysisResult> {
    const prompt = `Analyze this website and extract product information in JSON format.

WEBSITE DATA:
URL: ${url}
Title: ${metadata.title || metadata.ogTitle}
Description: ${metadata.description || metadata.ogDescription}
Headings: ${metadata.headings.join(', ')}
Content Preview: ${metadata.content.slice(0, 500)}

Extract the following in strict JSON format:
{
  "productName": "The product/company name",
  "description": "A concise 1-2 sentence description of what the product does",
  "industry": "The industry category (e.g., SaaS, E-commerce, Healthcare, Fintech, etc.)",
  "suggestedTone": "Professional or Friendly or Hype or Luxury (based on the website's language style)",
  "brandColor": "A hex color that matches the brand (default to #6366f1 if unclear)",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "suggestedCTA": "A call-to-action text (e.g., 'Start Free Trial', 'Get Started', 'Learn More')"
}

IMPORTANT: Return ONLY valid JSON, no additional text.`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        });

        const rawResponse = completion.choices[0]?.message?.content || '{}';

        // Clean and parse JSON
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
        const parsed = JSON.parse(jsonStr);

        // Add screenshot (use OG image if available)
        const screenshots = metadata.ogImage ? [metadata.ogImage] : [];

        return {
            productName: parsed.productName || metadata.title || 'Unknown Product',
            description: parsed.description || metadata.description || '',
            industry: parsed.industry || 'SaaS',
            suggestedTone: parsed.suggestedTone || 'Professional',
            brandColor: parsed.brandColor || '#6366f1',
            logoUrl: metadata.ogImage,
            screenshots,
            keyFeatures: parsed.keyFeatures || [],
            suggestedCTA: parsed.suggestedCTA || 'Get Started',
        };

    } catch (error) {
        console.error('AI analysis failed:', error);

        // Fallback to basic extraction
        return {
            productName: metadata.title || metadata.ogTitle || 'Unknown Product',
            description: metadata.description || metadata.ogDescription || '',
            industry: 'SaaS',
            suggestedTone: 'Professional',
            brandColor: '#6366f1',
            screenshots: metadata.ogImage ? [metadata.ogImage] : [],
            keyFeatures: [],
            suggestedCTA: 'Get Started',
        };
    }
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}
