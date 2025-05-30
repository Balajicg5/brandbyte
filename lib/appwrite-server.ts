import { Client, Databases, Storage, ID, Query } from 'node-appwrite';

// Server-side client for API routes
const serverClient = new Client();

serverClient
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// For server-side operations, we need to set the API key
if (process.env.APPWRITE_API_KEY) {
    serverClient.setKey(process.env.APPWRITE_API_KEY);
}

export const serverDatabases = new Databases(serverClient);
export const serverStorage = new Storage(serverClient);

export { ID, Query };

// Database configuration
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brandbyte-db';
export const AD_CREATIVES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_AD_CREATIVES_COLLECTION_ID || 'ad-creatives';
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'brand-assets';

// AdCreative interface for server operations
export interface AdCreative {
    $id?: string;
    userId: string;
    campaignId: string;
    brandId: string;
    prompt: string;
    imageUrl: string;
    generationDate: string;
}

// Server-side Ad Creative management functions
export const serverAdCreativeService = {
    // Create a new ad creative
    createAdCreative: async (adCreative: Omit<AdCreative, '$id'>) => {
        try {
            const response = await serverDatabases.createDocument(
                DATABASE_ID,
                AD_CREATIVES_COLLECTION_ID,
                ID.unique(),
                adCreative
            );
            return response as unknown as AdCreative;
        } catch (error) {
            console.error('Error creating ad creative:', error);
            throw error;
        }
    },

    // Save image to Appwrite storage
    saveImageToStorage: async (imageData: ArrayBuffer, fileName: string) => {
        try {
            console.log('🚀 Server: Uploading to Appwrite storage...');
            
            // Convert ArrayBuffer to Blob
            const blob = new Blob([imageData], { type: 'image/png' });
            const file = new File([blob], fileName, { type: 'image/png' });
            
            const response = await serverStorage.createFile(
                BUCKET_ID,
                ID.unique(),
                file
            );
            
            console.log('✅ Server: File uploaded successfully:', response.$id);
            
            // Use the same URL format as client-side getFileView
            const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
            const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
            const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${projectId}&mode=admin`;
            
            console.log('📎 Server: Constructed file URL:', fileUrl);
            
            return {
                fileId: response.$id,
                url: fileUrl
            };
        } catch (error) {
            console.error('❌ Server: Error uploading to storage:', error);
            throw error;
        }
    }
}; 