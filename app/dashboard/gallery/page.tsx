"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { adCreativeService, AdCreative } from "@/lib/appwrite";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/layout";
import { 
    Images, 
    Download, 
    Eye, 
    Target, 
    Calendar, 
    Tag,
    Loader2,
    Search,
    Filter
} from "lucide-react";
import Image from "next/image";

export default function GalleryPage() {
    const { user } = useAuth();
    const [adCreatives, setAdCreatives] = useState<AdCreative[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCreatives, setFilteredCreatives] = useState<AdCreative[]>([]);

    useEffect(() => {
        if (user) {
            loadAdCreatives();
        }
    }, [user]);

    useEffect(() => {
        // Filter ad creatives based on search term
        if (searchTerm.trim() === "") {
            setFilteredCreatives(adCreatives);
        } else {
            const filtered = adCreatives.filter(creative =>
                creative.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                creative.campaignId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                creative.brandId.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCreatives(filtered);
        }
    }, [searchTerm, adCreatives]);

    const loadAdCreatives = async () => {
        if (!user) return;
        
        setIsLoading(true);
        setError("");
        
        try {
            const adCreativesData = await adCreativeService.getUserAdCreatives(user.$id);
            setAdCreatives(adCreativesData);
        } catch (error: any) {
            console.error("Error loading ad creatives:", error);
            setError("Failed to load ad creatives. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = async (imageUrl: string, adCreativeId: string) => {
        try {
            // Fetch the image as blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Create download link
            const link = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = `ad-creative-${adCreativeId}.png`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            // Fallback to simple download
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `ad-creative-${adCreativeId}.png`;
            link.click();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 dark:bg-[#111111] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#7A7FEE] to-[#00D4FF] rounded-lg mr-4">
                                    <Images className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Ad Creative Gallery
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        View and manage all your AI-generated ad creatives
                                    </p>
                                </div>
                            </div>

                            {/* Search and Stats */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search ad creatives..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                    />
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {filteredCreatives.length} of {adCreatives.length} ad creatives
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <p className="text-red-700 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#7A7FEE] mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">Loading your ad creatives...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Empty State */}
                                {filteredCreatives.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                            <Images className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {searchTerm ? "No matching ad creatives" : "No ad creatives yet"}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            {searchTerm 
                                                ? "Try adjusting your search terms to find what you're looking for."
                                                : "Create some campaigns and generate ad creatives to see them here!"
                                            }
                                        </p>
                                        {!searchTerm && (
                                            <a
                                                href="/dashboard/campaigns/new"
                                                className="inline-flex items-center px-4 py-2 bg-[#7A7FEE] text-white rounded-lg hover:bg-[#5A5FCC] transition-colors"
                                            >
                                                Create Your First Campaign
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    /* Gallery Grid */
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredCreatives.map((adCreative) => (
                                            <div
                                                key={adCreative.$id}
                                                className="group bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-[#7A7FEE]/30 transition-all duration-200"
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
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                                                        Ad Creative
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                                        {adCreative.prompt.substring(0, 100)}...
                                                    </p>

                                                    {/* Meta information */}
                                                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center">
                                                            <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">Campaign: {adCreative.campaignId || 'Standalone'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Target className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">Brand: {adCreative.brandId}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
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
                            </>
                        )}

                        {/* Full size image modal */}
                        {viewingImage && (
                            <div 
                                className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" 
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
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
} 