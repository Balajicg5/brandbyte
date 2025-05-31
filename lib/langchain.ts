import { PromptTemplate } from "@langchain/core/prompts";
import { serverAdCreativeService } from './appwrite-server';

export interface GenerateAdRequest {
    brandName: string;
    brandDescription: string;
    productName: string;
    productDescription: string;
    productCategory: string;
    campaignGoals: string[];
    targetAudience: string;
    targetPlatforms: string[];
    callToAction: string;
    primaryColor: string;
    secondaryColor: string;
    customPrompt?: string; // Optional custom prompt for regeneration
}

export interface AdCreativeResult {
    prompt: string;
    imageUrl: string;
    appwriteFileId?: string;
}

class LangChainService {
    constructor() {
        // No need for complex LLM initialization
    }

    async generateAdCreative(request: GenerateAdRequest): Promise<AdCreativeResult> {
        try {
            console.log('🎯 === STARTING AD CREATIVE GENERATION ===');
            console.log('📋 Request details:', {
                brandName: request.brandName,
                productName: request.productName,
                productDescription: request.productDescription.substring(0, 50) + '...',
                targetPlatforms: request.targetPlatforms,
                hasCustomPrompt: !!request.customPrompt
            });
            
            // Use custom prompt if provided, otherwise generate new prompt
            let imagePrompt: string;
            if (request.customPrompt) {
                console.log('✅ Using custom prompt provided by user');
                imagePrompt = request.customPrompt;
            } else {
                // Generate the visual prompt for image generation
                imagePrompt = await this.generateImagePrompt(request);
                console.log('✅ Prompt generation completed');
            }
            
            // Generate the image using Together AI
            const { imageUrl, imageData } = await this.generateImage(imagePrompt);
            console.log('✅ Image generation completed');
            
            // Use the original Together AI URL directly - no need to save to Appwrite storage
            // Together AI URLs are permanent and work reliably for downloads
            console.log('✅ Using Together AI URL directly:', imageUrl);

            console.log('🎉 === AD CREATIVE GENERATION COMPLETED ===');
            return {
                prompt: imagePrompt,
                imageUrl: imageUrl, // Use original Together AI URL
                appwriteFileId: undefined // No file ID since we're not saving to storage
            };
        } catch (error: any) {
            console.error('❌ === AD CREATIVE GENERATION FAILED ===');
            console.error('❌ ERROR in generateAdCreative:', error);
            throw new Error(`Failed to generate ad creative: ${error.message}`);
        }
    }

    private async generateImagePrompt(request: GenerateAdRequest): Promise<string> {
        try {
            console.log('🚀 Step 1: Starting prompt generation...');
            const apiKey = process.env.TOGETHER_API_KEY;
            
            if (!apiKey) {
                throw new Error('Together.ai API key not configured');
            }
            console.log('✅ Step 2: API key found');

            // Enhanced system prompt for ad creative generation with text overlay areas
            const systemPrompt = `You are an expert advertising creative director specializing in AI image generation for commercial advertisements.

Create visual prompts for advertising posters that:
- Generate professional advertising layouts with clear text overlay areas
- Include designated spaces for brand name placement (top or prominent position)
- Include designated areas for call-to-action buttons or text
- Focus on lifestyle integration and emotional appeal
- Use dynamic compositions that guide the eye to text areas
- Create premium, commercial-grade aesthetics
- NEVER generate any text, words, letters, or typography in the image
- Design for text overlay compatibility with clean, uncluttered areas

The image should look like a professional ad template ready for brand name and CTA overlay.
Keep prompts focused on layout, mood, and visual hierarchy. Maximum 3 sentences.
CRITICAL: The image must contain NO TEXT, NO WORDS, NO LETTERS, NO TYPOGRAPHY whatsoever.`;

            // Enhanced user prompt template focused on ad layout and text placement areas
            const promptTemplate = PromptTemplate.fromTemplate(`
Create an advertising image prompt for a professional ad creative:

PRODUCT: {productName} - {productDescription}
BRAND: {brandName} 
AUDIENCE: {targetAudience}
CAMPAIGN GOAL: {campaignGoals}
BRAND COLORS: {primaryColor} and {secondaryColor}
PLATFORMS: {targetPlatforms}

Generate a {productCategory} advertisement layout that:
1. Has a clear focal area at the top for brand name overlay
2. Includes a prominent call-to-action placement area (bottom or side)
3. Appeals to {targetAudience} through lifestyle and emotion
4. Uses {primaryColor} and {secondaryColor} as the primary color scheme
5. Creates visual hierarchy for text overlay
6. Looks like a professional advertising template

Focus on composition, lighting, and space for text overlays. No text should be generated in the image itself.
Make it poster-worthy and commercial-grade for {targetPlatforms} platforms.
IMPORTANT: Generate absolutely NO TEXT, NO WORDS, NO LETTERS in the image - only visual elements and layout.`);

            console.log('🚀 Step 3: Formatting prompt template...');
            const userPrompt = await promptTemplate.format({
                brandName: request.brandName,
                primaryColor: request.primaryColor,
                secondaryColor: request.secondaryColor,
                productName: request.productName,
                productDescription: request.productDescription,
                productCategory: request.productCategory,
                targetAudience: request.targetAudience,
                campaignGoals: request.campaignGoals.join(', '),
                targetPlatforms: request.targetPlatforms.join(', ')
            });

            console.log('📝 Step 4: User prompt formatted:', userPrompt.substring(0, 200) + '...');
            console.log('🚀 Step 5: Calling Together AI API...');
            
            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 400, // Increased for more detailed layout descriptions
                    temperature: 0.7,
                }),
            });

            console.log('📡 Step 6: API response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Step 6 FAILED: API error response:', errorText);
                throw new Error(`Prompt generation failed: ${response.status} ${response.statusText}`);
            }

            console.log('🚀 Step 7: Parsing response...');
            const data = await response.json();
            console.log('📄 Step 8: Response data structure:', Object.keys(data));
            
            let generatedPrompt = data.choices[0]?.message?.content;
            
            if (!generatedPrompt) {
                console.error('❌ Step 8 FAILED: No prompt in response:', data);
                throw new Error('No prompt generated from Together AI');
            }

            // Enhanced post-processing for ad creative layout
            generatedPrompt = this.enhancePromptForAdCreativeLayout(generatedPrompt.trim(), request);

            console.log('✅ Step 9: Enhanced ad creative prompt generated successfully:', generatedPrompt.substring(0, 100) + '...');
            return generatedPrompt;
        } catch (error: any) {
            console.error('❌ ERROR in generateImagePrompt:', error);
            throw error;
        }
    }

    private enhancePromptForAdCreativeLayout(basePrompt: string, request: GenerateAdRequest): string {
        // Get simple color descriptors
        const colorDescriptors = this.getColorDescriptors(request.primaryColor, request.secondaryColor);
        
        // Enhanced ad creative specifications
        const adCreativeEnhancements = [
            "professional advertising layout",
            "clear text overlay areas",
            "brand name placement space at top",
            "call-to-action button area",
            `${colorDescriptors.primary} and ${colorDescriptors.secondary} brand color scheme`,
            "commercial photography style",
            "premium advertising aesthetic",
            "text-ready composition",
            "marketing campaign visual",
            "no text or typography in image",
            "clean overlay-friendly design"
        ];

        // Platform-specific enhancements
        const platformEnhancements = this.getPlatformSpecificEnhancements(request.targetPlatforms);

        // Clean the prompt and remove any hex colors
        let cleanedPrompt = basePrompt.replace(/#[0-9A-Fa-f]{6}/g, (match) => {
            if (match.toLowerCase() === request.primaryColor.toLowerCase()) {
                return colorDescriptors.primary;
            } else if (match.toLowerCase() === request.secondaryColor.toLowerCase()) {
                return colorDescriptors.secondary;
            }
            return 'brand color';
        });

        // Remove any potential text generation instructions
        cleanedPrompt = cleanedPrompt.replace(/\b(text|words|letters|typography|font|headline|title|writing|script|caption|label|sign|banner|message|slogan|tagline)\b/gi, 'visual element');

        // Create final comprehensive ad creative prompt
        const finalPrompt = `${cleanedPrompt}, ${adCreativeEnhancements.join(', ')}, ${platformEnhancements.join(', ')}, high quality, 4k, professional advertising photography, absolutely no text or words in image, text-free design, clean visual layout`;
        
        return finalPrompt;
    }

    private getPlatformSpecificEnhancements(platforms: string[]): string[] {
        const enhancements: string[] = [];
        
        if (platforms.includes('Instagram') || platforms.includes('Social Media')) {
            enhancements.push('Instagram-style composition', 'social media optimized layout');
        }
        
        if (platforms.includes('Facebook')) {
            enhancements.push('Facebook ad format', 'social engagement focused');
        }
        
        if (platforms.includes('Google Ads') || platforms.includes('Search')) {
            enhancements.push('search ad visual', 'conversion-focused layout');
        }
        
        if (platforms.includes('LinkedIn')) {
            enhancements.push('professional business aesthetic', 'B2B advertising style');
        }
        
        if (platforms.includes('YouTube')) {
            enhancements.push('video thumbnail style', 'attention-grabbing composition');
        }
        
        if (platforms.includes('Print') || platforms.includes('Outdoor')) {
            enhancements.push('print advertising layout', 'billboard-ready design');
        }
        
        // Default enhancement if no specific platform matches
        if (enhancements.length === 0) {
            enhancements.push('multi-platform advertising design', 'versatile ad layout');
        }
        
        return enhancements;
    }

    private getColorDescriptors(primaryColor: string, secondaryColor: string): { primary: string; secondary: string } {
        const colorMap: { [key: string]: string } = {
            '#FF0000': 'red',
            '#00FF00': 'green', 
            '#0000FF': 'blue',
            '#FFFF00': 'yellow',
            '#FF00FF': 'magenta',
            '#00FFFF': 'cyan',
            '#FFA500': 'orange',
            '#800080': 'purple',
            '#FFC0CB': 'pink',
            '#A52A2A': 'brown',
            '#808080': 'gray',
            '#000000': 'black',
            '#FFFFFF': 'white',
            '#3B82F6': 'blue',
            '#EF4444': 'red',
            '#10B981': 'green',
            '#F59E0B': 'yellow',
            '#8B5CF6': 'purple',
            '#EC4899': 'pink'
        };

        const getColorDescriptor = (color: string): string => {
            const upperColor = color.toUpperCase();
            if (colorMap[upperColor]) {
                return colorMap[upperColor];
            }
            
            // Simple color analysis
            if (color.startsWith('#') && color.length === 7) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                
                if (r > g && r > b) return 'red';
                if (g > r && g > b) return 'green';
                if (b > r && b > g) return 'blue';
                if (r > 200 && g > 200 && b > 200) return 'light';
                if (r < 100 && g < 100 && b < 100) return 'dark';
            }
            
            return 'colorful';
        };

        return {
            primary: getColorDescriptor(primaryColor),
            secondary: getColorDescriptor(secondaryColor)
        };
    }

    private async generateImage(prompt: string): Promise<{ imageUrl: string; imageData?: ArrayBuffer }> {
        try {
            console.log('🖼️ Step 10: Starting image generation...');
            console.log('📝 Step 11: Using prompt:', prompt.substring(0, 100) + '...');
            
            const apiKey = process.env.TOGETHER_API_KEY;
            
            if (!apiKey) {
                throw new Error('Together.ai API key not configured');
            }
            console.log('✅ Step 12: API key confirmed for image generation');

            console.log('🚀 Step 13: Calling FLUX image generation API...');

            const requestBody = {
                model: 'black-forest-labs/FLUX.1-schnell-Free',
                prompt: prompt,
                width: 1024,
                height: 1024,
                steps: 4,
                n: 1
            };
            
            console.log('📦 Step 14: Request payload:', JSON.stringify(requestBody, null, 2));

            const response = await fetch('https://api.together.xyz/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('📡 Step 15: Image API response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Step 15 FAILED: Image API error response:', errorText);
                throw new Error(`Image generation failed: ${response.status} ${response.statusText}`);
            }

            console.log('🚀 Step 16: Parsing image response...');
            const data = await response.json();
            console.log('📄 Step 17: Image response structure:', Object.keys(data));
            console.log('📄 Step 17b: Image data array length:', data.data?.length);
            
            if (!data.data?.[0]) {
                console.error('❌ Step 17 FAILED: No image data in response:', data);
                throw new Error('No image data returned from Together AI');
            }

            const imageData = data.data[0];
            console.log('📄 Step 18: Image data keys:', Object.keys(imageData));
            
            // Handle URL response (most common)
            if (imageData.url) {
                console.log('✅ Step 19: Image generated with URL:', imageData.url);
                return { imageUrl: imageData.url };
            }
            
            // Handle base64 response (fallback)
            if (imageData.b64_json) {
                const base64Url = `data:image/png;base64,${imageData.b64_json}`;
                console.log('✅ Step 19 (alt): Image generated with base64 data');
                return { imageUrl: base64Url };
            }
            
            console.error('❌ Step 19 FAILED: Invalid image response format - no URL or base64 data');
            throw new Error('Invalid image response format - no URL or base64 data');
        } catch (error: any) {
            console.error('❌ ERROR in generateImage:', error);
            throw error;
        }
    }

    async generateAdCopy(request: GenerateAdRequest): Promise<string> {
        try {
            const apiKey = process.env.TOGETHER_API_KEY;
            
            if (!apiKey) {
                throw new Error('Together.ai API key not configured');
            }

            const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert copywriter. Create compelling ad copy for the following:

Brand: {brandName}
Product: {productName}
Product Description: {productDescription}
Target Audience: {targetAudience}
Campaign Goals: {campaignGoals}
Platforms: {targetPlatforms}
Call to Action: {callToAction}

Create engaging, persuasive ad copy that:
1. Grabs attention with a strong headline
2. Highlights key benefits
3. Speaks directly to the target audience
4. Creates urgency or desire
5. Ends with the specified call-to-action
6. Is optimized for the target platforms

Keep it concise but impactful. Format as: Headline, Body text, Call-to-action.

Ad Copy:`);

            const userPrompt = await promptTemplate.format({
                brandName: request.brandName,
                productName: request.productName,
                productDescription: request.productDescription,
                targetAudience: request.targetAudience,
                campaignGoals: request.campaignGoals.join(', '),
                targetPlatforms: request.targetPlatforms.join(', '),
                callToAction: request.callToAction
            });

            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
                    messages: [
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ad copy generation failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || 'Failed to generate ad copy';
        } catch (error) {
            console.error('Error generating ad copy:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const langchainService = new LangChainService();