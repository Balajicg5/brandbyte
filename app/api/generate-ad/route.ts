import { NextRequest, NextResponse } from 'next/server';

interface GeneratePromptRequest {
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
}

export async function POST(request: NextRequest) {
    try {
        const body: GeneratePromptRequest = await request.json();
        const apiKey = process.env.TOGETHER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Together.ai API key not configured' },
                { status: 500 }
            );
        }

        // Generate prompt
        const systemPrompt = `You are an expert ad creative director specializing in generating detailed, specific prompts for AI image generation models. Your goal is to create prompts that will generate high-quality, brand-consistent ad creatives.

Guidelines for creating prompts:
1. Be specific about visual elements, colors, composition, and style
2. Include brand colors and aesthetic preferences
3. Specify the target platform's format and requirements
4. Ensure the prompt is optimized for Flux Schnell model
5. Include lighting, mood, and artistic style directions
6. Be concise but comprehensive (aim for 150-300 words)

The prompt should generate an ad creative that:
- Represents the brand identity effectively
- Showcases the product appealingly
- Appeals to the target audience
- Works well on the specified platforms
- Includes effective visual hierarchy and composition`;

        const userPrompt = `Create a detailed image generation prompt for an ad creative with these specifications:

Brand: ${body.brandName}
Brand Description: ${body.brandDescription}
Brand Colors: Primary: ${body.primaryColor}, Secondary: ${body.secondaryColor}

Product: ${body.productName}
Product Description: ${body.productDescription}
Product Category: ${body.productCategory}

Campaign Goals: ${body.campaignGoals.join(', ')}
Target Audience: ${body.targetAudience}
Target Platforms: ${body.targetPlatforms.join(', ')}
Call to Action: ${body.callToAction}

Generate a comprehensive prompt that will create a professional, eye-catching ad creative suitable for these platforms and audience. Focus on visual composition, color usage, typography placement areas, and overall aesthetic that aligns with the brand identity.`;

        // Generate prompt with LLM
        const promptResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
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
                max_tokens: 800,
                temperature: 0.7,
            }),
        });

        if (!promptResponse.ok) {
            const errorText = await promptResponse.text();
            console.error('Together.ai Prompt API error response:', errorText);
            throw new Error(`Prompt generation failed: ${promptResponse.status} ${promptResponse.statusText} - ${errorText}`);
        }

        const promptData = await promptResponse.json();
        const generatedPrompt = promptData.choices[0]?.message?.content || 'Failed to generate prompt';

        // Generate image with FLUX
        const imageResponse = await fetch('https://api.together.xyz/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'black-forest-labs/FLUX.1-schnell-Free',
                prompt: generatedPrompt,
                width: 1024,
                height: 1024,
                steps: 4,
                n: 1
            }),
        });

        if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error('Together.ai API error response:', errorText);
            throw new Error(`Image generation failed: ${imageResponse.status} ${imageResponse.statusText} - ${errorText}`);
        }

        const imageData = await imageResponse.json();
        
        if (!imageData.data?.[0]?.url && !imageData.data?.[0]?.b64_json) {
            throw new Error('Invalid image response format');
        }

        // Handle both URL and base64 response formats
        const imageUrl = imageData.data[0].url || `data:image/png;base64,${imageData.data[0].b64_json}`;

        return NextResponse.json({
            prompt: generatedPrompt,
            imageUrl: imageUrl
        });

    } catch (error: any) {
        console.error('Error in generate-ad API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate ad creative' },
            { status: 500 }
        );
    }
}