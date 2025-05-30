"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { adCreativeService, AdCreative } from "@/lib/appwrite";
import { Download, Eye, X, Calendar, Tag, Target } from "lucide-react";
import Image from "next/image";

interface AdGalleryProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdGallery({ isOpen, onClose }: AdGalleryProps) {
    const { user } = useAuth();
    const [adCreatives, setAdCreatives] = useState<AdCreative[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAd, setSelectedAd] = useState<AdCreative | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            loadAdCreatives();
        }
    }, [isOpen, user]);

    const loadAdCreatives = async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            const adCreativesData = await adCreativeService.getUserAdCreatives(user.$id);
            setAdCreatives(adCreativesData);
        } catch (error) {
            console.error("Error loading ad creatives:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = (imageUrl: string, adCreativeId: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ad-creative-${adCreativeId}.png`;
        link.click();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#272829] rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Ad Gallery
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            All your generated ad creatives in one place
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-3"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : adCreatives.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Target className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Ad Creatives Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Create some campaigns and generate ad creatives to see them here!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {adCreatives.map((adCreative) => (
                                <div
                                    key={adCreative.$id}
                                    className="group bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image
                                            src={adCreative.imageUrl}
                                            alt="Generated ad creative"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                        
                                        {/* Overlay with actions */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setViewingImage(adCreative.imageUrl)}
                                                    className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                                                    title="View full size"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-700" />
                                                </button>
                                                <button
                                                    onClick={() => downloadImage(adCreative.imageUrl, adCreative.$id || 'unknown')}
                                                    className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                                                    title="Download image"
                                                >
                                                    <Download className="w-4 h-4 text-gray-700" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                                            Ad Creative
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {adCreative.prompt.substring(0, 100)}...
                                        </p>

                                        {/* Meta information */}
                                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Tag className="w-3 h-3 mr-1" />
                                                <span className="truncate">Campaign: {adCreative.campaignId || 'Standalone'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Target className="w-3 h-3 mr-1" />
                                                <span className="truncate">Brand: {adCreative.brandId}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                <span>{formatDate(adCreative.generationDate)}</span>
                                            </div>
                                        </div>

                                        {/* Generation date badge */}
                                        <div className="mt-3">
                                            <span className="px-2 py-1 text-xs bg-[#7A7FEE]/10 text-[#7A7FEE] rounded-full">
                                                Generated {formatDate(adCreative.generationDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Full size image modal */}
            {viewingImage && (
                <div 
                    className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]" 
                    onClick={() => setViewingImage(null)}
                >
                    <div className="max-w-4xl max-h-full p-4">
                        <Image
                            src={viewingImage}
                            alt="Ad creative"
                            width={1024}
                            height={1024}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 