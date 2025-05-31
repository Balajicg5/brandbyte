"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PosterEditor from '@/components/ui/poster-editor';
import { Campaign, campaignService } from '@/lib/appwrite';

export default function EditorPage() {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaign');
    const encodedImageUrl = searchParams.get('image');
    const imageUrl = encodedImageUrl ? decodeURIComponent(encodedImageUrl) : null;
    
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCampaign = async () => {
            if (!campaignId) {
                setError('No campaign ID provided');
                setLoading(false);
                return;
            }

            if (!imageUrl) {
                setError('No image URL provided');
                setLoading(false);
                return;
            }

            try {
                const campaignData = await campaignService.getCampaign(campaignId);
                setCampaign(campaignData);
            } catch (err) {
                console.error('Failed to load campaign:', err);
                setError('Failed to load campaign data');
            } finally {
                setLoading(false);
            }
        };

        loadCampaign();
    }, [campaignId, imageUrl]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading editor...</p>
                </div>
            </div>
        );
    }

    if (error || !campaign || !imageUrl) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {error || 'Missing required data'}
                    </h2>
                    <p className="text-gray-500 mb-4">
                        {error || 'Campaign ID and image URL are required to use the editor.'}
                    </p>
                    <a 
                        href="/dashboard/campaigns" 
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        Return to Campaigns
                    </a>
                </div>
            </div>
        );
    }

    const handleSave = (finalUrl: string) => {
        console.log('Poster saved:', finalUrl);
        // You could redirect to gallery or show a success message
        // window.location.href = '/dashboard/gallery';
    };

    return (
        <PosterEditor
            backgroundImageUrl={imageUrl}
            campaign={campaign}
            onSave={handleSave}
        />
    );
} 