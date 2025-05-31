import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/appwrite-server';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        console.log('🖼️ Proxying image:', imageUrl);

        // Fetch the image from Together AI
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            console.error(`Failed to fetch image: ${response.status}`);
            return NextResponse.json({ 
                error: 'Failed to fetch image',
                storedUrl: imageUrl // Return original URL as fallback
            }, { status: 200 });
        }

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        const file = new File([blob], `image-${Date.now()}.png`, { type: 'image/png' });

        try {
            // Try to upload to Appwrite storage
            const uploadedFile = await storageService.uploadFile(file);
            const storedUrl = storageService.getFileUrl(uploadedFile.$id);
            
            console.log('✅ Image stored successfully:', storedUrl);
            return NextResponse.json({ storedUrl });
        } catch (storageError: any) {
            console.error('❌ Storage error:', storageError);
            
            // If it's a bucket not found error or any storage error, return original URL
            if (storageError.code === 404 || storageError.type === 'storage_bucket_not_found') {
                console.log('📦 Bucket not found, returning original URL');
                return NextResponse.json({ 
                    storedUrl: imageUrl,
                    warning: 'Storage bucket not found, using original URL'
                });
            }
            
            // For other storage errors, also fallback to original URL
            console.log('⚠️ Storage failed, returning original URL');
            return NextResponse.json({ 
                storedUrl: imageUrl,
                warning: 'Storage failed, using original URL'
            });
        }
    } catch (error) {
        console.error('❌ Error proxying image:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            storedUrl: request.body ? JSON.parse(await request.text()).imageUrl : null
        }, { status: 500 });
    }
} 