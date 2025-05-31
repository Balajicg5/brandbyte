import { NextRequest, NextResponse } from 'next/server';
import { serverStorage } from '@/lib/appwrite-server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get('fileId');
        const bucketId = searchParams.get('bucketId') || process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'default-bucket';

        if (!fileId) {
            return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        }

        console.log('📁 Serving image:', fileId, 'from bucket:', bucketId);

        try {
            // Get the file from Appwrite storage
            const file = await serverStorage.getFileView(bucketId, fileId);
            
            // Create a response with proper headers
            const response = new NextResponse(file);
            
            // Set CORS headers
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
            
            // Set content type
            response.headers.set('Content-Type', 'image/png');
            response.headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            
            return response;
        } catch (storageError: any) {
            console.error('❌ Storage error:', storageError);
            return NextResponse.json({ 
                error: 'File not found',
                details: storageError.message 
            }, { status: 404 });
        }
    } catch (error) {
        console.error('❌ Error serving image:', error);
        return NextResponse.json({ 
            error: 'Internal server error'
        }, { status: 500 });
    }
} 