import { NextRequest, NextResponse } from 'next/server';
import { langchainService, GenerateAdRequest } from '@/lib/langchain';
import { serverAdCreativeService } from '@/lib/appwrite-server';

export interface GenerateAdRequestWithIds extends GenerateAdRequest {
    userId: string;
    campaignId: string;
    brandId: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateAdRequestWithIds = await request.json();
        
        // Validate required fields
        if (!body.brandName || !body.productName || !body.productDescription) {
            return NextResponse.json(
                { error: 'Missing required fields: brandName, productName, productDescription' },
                { status: 400 }
            );
        }

        if (!body.userId || !body.brandId || !body.campaignId) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, brandId, campaignId' },
                { status: 400 }
            );
        }

        // Check if Together.ai API key is configured
        const apiKey = process.env.TOGETHER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Together.ai API key not configured' },
                { status: 500 }
            );
        }

        // Check if Appwrite API key is configured
        if (!process.env.APPWRITE_API_KEY) {
            return NextResponse.json(
                { error: 'Appwrite API key not configured' },
                { status: 500 }
            );
        }

        // Use LangChain service to generate ad creative
        const result = await langchainService.generateAdCreative(body);

        // Save to adcreative collection with only required fields using server-side service
        try {
            const adCreative = await serverAdCreativeService.createAdCreative({
                userId: body.userId,
                campaignId: body.campaignId,
                brandId: body.brandId,
                prompt: result.prompt,
                imageUrl: result.imageUrl,
                generationDate: new Date().toISOString()
            });
            
            console.log('✅ Ad creative saved to collection:', adCreative.$id);
        } catch (adCreativeError) {
            console.error('⚠️ WARNING: Failed to save ad creative to collection:', adCreativeError);
            // Continue without throwing error - generation was successful
        }

        return NextResponse.json({
            prompt: result.prompt,
            imageUrl: result.imageUrl,
            appwriteFileId: result.appwriteFileId
        });

    } catch (error: any) {
        console.error('Error in generate-ad API:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate ad creative' },
            { status: 500 }
        );
    }
}