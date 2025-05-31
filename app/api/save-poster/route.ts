import { NextRequest, NextResponse } from 'next/server';
import { storageService, BUCKET_ID } from '@/lib/appwrite-server';

export async function POST(request: NextRequest) {
    try {
        const { dataUrl, campaignId } = await request.json();

        if (!dataUrl || !campaignId) {
            return NextResponse.json({ error: 'Data URL and campaign ID are required' }, { status: 400 });
        }

        console.log('💾 Saving final poster for campaign:', campaignId);

        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `campaign-${campaignId}-final.png`, { type: 'image/png' });

        try {
            // Try to upload to Appwrite storage using the correct bucket ID
            const uploadedFile = await storageService.uploadFile(file, BUCKET_ID);
            const finalUrl = storageService.getFileUrl(uploadedFile.$id, BUCKET_ID);

            console.log('✅ Final poster saved to storage:', finalUrl);
            return NextResponse.json({ finalUrl });
        } catch (storageError: any) {
            console.warn('⚠️ Storage upload failed, using data URL as fallback:', storageError.message);
            
            // Fallback: return the data URL directly
            // In a production environment, you might want to save to a different storage service
            return NextResponse.json({ 
                finalUrl: dataUrl,
                warning: 'Poster saved locally. Storage service unavailable.'
            });
        }
    } catch (error) {
        console.error('❌ Error saving poster:', error);
        return NextResponse.json(
            { error: 'Failed to save poster' },
            { status: 500 }
        );
    }
} 