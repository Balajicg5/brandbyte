import { Client, Account, ID, Databases, Storage, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID };

// Database configuration
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brandbyte-db';
export const BRANDS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BRANDS_COLLECTION_ID || 'brands';
export const CAMPAIGNS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CAMPAIGNS_COLLECTION_ID || 'campaigns';
export const AD_CREATIVES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_AD_CREATIVES_COLLECTION_ID || 'ad-creatives';
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'brand-assets';

// Brand interface
export interface Brand {
    $id?: string;
    userId: string;
    name: string;
    description: string;
    logo?: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    createdAt: string;
    updatedAt: string;
}

// Campaign interface  
export interface Campaign {
    $id?: string;
    userId: string;
    brandId: string;
    name: string;
    description: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    // Product details
    productName: string;
    productDescription: string;
    productPrice?: string;
    productCategory: string;
    // Campaign goals - stored as JSON string in Appwrite
    campaignGoals: string[];
    targetAudience: string;
    callToAction: string;
    // Target platforms - stored as JSON string in Appwrite
    targetPlatforms: string[];
    // Generated content
    generatedPrompt?: string;
    generatedImageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// AdCreative interface for storing generated ad creatives
export interface AdCreative {
    $id?: string;
    userId: string;
    campaignId: string;
    brandId: string;
    prompt: string;
    imageUrl: string;
    generationDate: string;
}

// Helper functions for array serialization
const serializeArrayField = (arr: string[]): string => {
    return JSON.stringify(arr);
};

const deserializeArrayField = (str: string): string[] => {
    try {
        return JSON.parse(str);
    } catch {
        return [];
    }
};

// Transform campaign for Appwrite storage
const transformCampaignForStorage = (campaign: any) => {
    return {
        ...campaign,
        campaignGoals: typeof campaign.campaignGoals === 'object' 
            ? serializeArrayField(campaign.campaignGoals)
            : campaign.campaignGoals,
        targetPlatforms: typeof campaign.targetPlatforms === 'object'
            ? serializeArrayField(campaign.targetPlatforms)
            : campaign.targetPlatforms
    };
};

// Transform campaign from Appwrite storage
const transformCampaignFromStorage = (campaign: any): Campaign => {
    return {
        ...campaign,
        campaignGoals: typeof campaign.campaignGoals === 'string'
            ? deserializeArrayField(campaign.campaignGoals)
            : campaign.campaignGoals,
        targetPlatforms: typeof campaign.targetPlatforms === 'string'
            ? deserializeArrayField(campaign.targetPlatforms)
            : campaign.targetPlatforms
    };
};

// Authentication functions
export const authService = {
    // Create Email OTP session
    createEmailOTPSession: async (email: string) => {
        try {
            const session = await account.createEmailToken(ID.unique(), email);
            return session;
        } catch (error) {
            console.error('Error creating email OTP session:', error);
            throw error;
        }
    },

    // Verify Email OTP
    verifyEmailOTP: async (userId: string, secret: string) => {
        try {
            const session = await account.createSession(userId, secret);
            return session;
        } catch (error) {
            console.error('Error verifying email OTP:', error);
            throw error;
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const user = await account.get();
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Logout
    logout: async () => {
        try {
            await account.deleteSession('current');
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    // Check if user is authenticated
    isAuthenticated: async () => {
        try {
            await account.get();
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Brand management functions
export const brandService = {
    // Create a new brand
    createBrand: async (brand: Omit<Brand, '$id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const now = new Date().toISOString();
            const response = await databases.createDocument(
                DATABASE_ID,
                BRANDS_COLLECTION_ID,
                ID.unique(),
                {
                    ...brand,
                    createdAt: now,
                    updatedAt: now
                }
            );
            return response;
        } catch (error) {
            console.error('Error creating brand:', error);
            throw error;
        }
    },

    // Get user's brands
    getUserBrands: async (userId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BRANDS_COLLECTION_ID,
                [
                    Query.equal('userId', userId)
                ]
            );
            return response.documents as unknown as Brand[];
        } catch (error) {
            console.error('Error getting user brands:', error);
            throw error;
        }
    },

    // Update brand
    updateBrand: async (brandId: string, updates: Partial<Brand>) => {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                BRANDS_COLLECTION_ID,
                brandId,
                {
                    ...updates,
                    updatedAt: new Date().toISOString()
                }
            );
            return response;
        } catch (error) {
            console.error('Error updating brand:', error);
            throw error;
        }
    },

    // Delete brand
    deleteBrand: async (brandId: string) => {
        try {
            await databases.deleteDocument(DATABASE_ID, BRANDS_COLLECTION_ID, brandId);
        } catch (error) {
            console.error('Error deleting brand:', error);
            throw error;
        }
    },

    // Upload brand logo
    uploadLogo: async (file: File) => {
        try {
            const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
            return response;
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    },

    // Get logo URL
    getLogoUrl: (fileId: string) => {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
        return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}&mode=admin`;
    },

    // Delete logo
    deleteLogo: async (fileId: string) => {
        try {
            await storage.deleteFile(BUCKET_ID, fileId);
        } catch (error) {
            console.error('Error deleting logo:', error);
            throw error;
        }
    }
};

// Campaign management functions
export const campaignService = {
    // Create a new campaign
    createCampaign: async (campaign: Omit<Campaign, '$id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const now = new Date().toISOString();
            const transformedCampaign = transformCampaignForStorage({
                ...campaign,
                createdAt: now,
                updatedAt: now
            });
            
            const response = await databases.createDocument(
                DATABASE_ID,
                CAMPAIGNS_COLLECTION_ID,
                ID.unique(),
                transformedCampaign
            );
            return transformCampaignFromStorage(response);
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    },

    // Get user's campaigns
    getUserCampaigns: async (userId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                CAMPAIGNS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('createdAt')
                ]
            );
            return response.documents.map(doc => transformCampaignFromStorage(doc)) as Campaign[];
        } catch (error) {
            console.error('Error getting user campaigns:', error);
            throw error;
        }
    },

    // Get brand campaigns
    getBrandCampaigns: async (brandId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                CAMPAIGNS_COLLECTION_ID,
                [
                    Query.equal('brandId', brandId),
                    Query.orderDesc('createdAt')
                ]
            );
            return response.documents.map(doc => transformCampaignFromStorage(doc)) as Campaign[];
        } catch (error) {
            console.error('Error getting brand campaigns:', error);
            throw error;
        }
    },

    // Get campaigns with generated images for gallery
    getCampaignsWithImages: async (userId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                CAMPAIGNS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.isNotNull('generatedImageUrl'),
                    Query.orderDesc('updatedAt')
                ]
            );
            return response.documents.map(doc => transformCampaignFromStorage(doc)) as Campaign[];
        } catch (error) {
            console.error('Error getting campaigns with images:', error);
            throw error;
        }
    },

    // Update campaign
    updateCampaign: async (campaignId: string, updates: Partial<Campaign>) => {
        try {
            const transformedUpdates = transformCampaignForStorage({
                ...updates,
                updatedAt: new Date().toISOString()
            });
            
            const response = await databases.updateDocument(
                DATABASE_ID,
                CAMPAIGNS_COLLECTION_ID,
                campaignId,
                transformedUpdates
            );
            return transformCampaignFromStorage(response);
        } catch (error) {
            console.error('Error updating campaign:', error);
            throw error;
        }
    },

    // Delete campaign
    deleteCampaign: async (campaignId: string) => {
        try {
            await databases.deleteDocument(DATABASE_ID, CAMPAIGNS_COLLECTION_ID, campaignId);
        } catch (error) {
            console.error('Error deleting campaign:', error);
            throw error;
        }
    }
};

// Ad Creative management functions
export const adCreativeService = {
    // Create a new ad creative
    createAdCreative: async (adCreative: Omit<AdCreative, '$id'>) => {
        try {
            const response = await databases.createDocument(
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

    // Get user's ad creatives
    getUserAdCreatives: async (userId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                AD_CREATIVES_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('generationDate')
                ]
            );
            return response.documents as unknown as AdCreative[];
        } catch (error) {
            console.error('Error getting user ad creatives:', error);
            throw error;
        }
    },

    // Get campaign ad creatives
    getCampaignAdCreatives: async (campaignId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                AD_CREATIVES_COLLECTION_ID,
                [
                    Query.equal('campaignId', campaignId),
                    Query.orderDesc('generationDate')
                ]
            );
            return response.documents as unknown as AdCreative[];
        } catch (error) {
            console.error('Error getting campaign ad creatives:', error);
            throw error;
        }
    },

    // Delete ad creative
    deleteAdCreative: async (adCreativeId: string) => {
        try {
            await databases.deleteDocument(DATABASE_ID, AD_CREATIVES_COLLECTION_ID, adCreativeId);
        } catch (error) {
            console.error('Error deleting ad creative:', error);
            throw error;
        }
    }
}; 