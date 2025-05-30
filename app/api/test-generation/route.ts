import { NextRequest, NextResponse } from 'next/server';
import { langchainService } from '@/lib/langchain';
import { adCreativeService } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 === STARTING TEST GENERATION ===');
        
        // Minimal test data with required IDs
        const testRequest = {
            brandName: "TestBrand",
            brandDescription: "A test brand for demonstration",
            productName: "TestProduct",
            productDescription: "A simple test product for generating ad creatives",
            productCategory: "Technology",
            campaignGoals: ["Brand Awareness"],
            targetAudience: "Young professionals",
            targetPlatforms: ["Facebook"],
            callToAction: "Buy Now",
            primaryColor: "#7A7FEE",
            secondaryColor: "#00D4FF"
        };

        console.log('📋 Test request:', testRequest);

        // Test the generation
        const result = await langchainService.generateAdCreative(testRequest);

        // Test saving to ad creative collection (with dummy IDs)
        try {
            const adCreative = await adCreativeService.createAdCreative({
                userId: 'test-user-id',
                campaignId: 'test-campaign-id',
                brandId: 'test-brand-id',
                prompt: result.prompt,
                imageUrl: result.imageUrl,
                generationDate: new Date().toISOString()
            });
            console.log('✅ Test ad creative saved to collection:', adCreative.$id);
        } catch (adCreativeError) {
            console.error('⚠️ WARNING: Test failed to save ad creative to collection:', adCreativeError);
        }

        console.log('✅ Test completed successfully');
        return NextResponse.json({
            success: true,
            result: result
        });

    } catch (error: any) {
        console.error('❌ Test failed:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                stack: error.stack 
            },
            { status: 500 }
        );
    }
} 