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

            // Much shorter, focused system prompt
            const systemPrompt = `You are an ad creative expert. Create a detailed visual prompt for AI image generation.

Focus on:
- Brand colors and style
- Product showcase
- Professional composition
- Clear visual hierarchy

Keep it under 100 words and be specific about visual elements.`;

            // Simplified user prompt template
            const promptTemplate = PromptTemplate.fromTemplate(`
Create a visual prompt for an ad image:

Brand: {brandName} ({brandDescription})
Product: {productName} - {productDescription}
Colors: {primaryColor}, {secondaryColor}
Audience: {targetAudience}
Platforms: {targetPlatforms}

Generate a concise visual prompt focusing on composition, lighting, and brand aesthetic.`);

            console.log('🚀 Step 3: Formatting prompt template...');
            const userPrompt = await promptTemplate.format({
                brandName: request.brandName,
                brandDescription: request.brandDescription,
                primaryColor: request.primaryColor,
                secondaryColor: request.secondaryColor,
                productName: request.productName,
                productDescription: request.productDescription,
                targetAudience: request.targetAudience,
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
                    max_tokens: 200, // Reduced from 800
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
            
            const generatedPrompt = data.choices[0]?.message?.content;
            
            if (!generatedPrompt) {
                console.error('❌ Step 8 FAILED: No prompt in response:', data);
                throw new Error('No prompt generated from Together AI');
            }

            console.log('✅ Step 9: Prompt generated successfully:', generatedPrompt.substring(0, 100) + '...');
            return generatedPrompt.trim();
        } catch (error: any) {
            console.error('❌ ERROR in generateImagePrompt:', error);
            throw error;
        }
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