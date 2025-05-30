"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { campaignService, brandService, Campaign, Brand } from "@/lib/appwrite";
import { togetherAI, GeneratePromptRequest } from "@/lib/together-ai";
import { adCreativeService, AdCreative } from "@/lib/appwrite";
import { 
    Loader2, 
    X, 
    Wand2, 
    Download, 
    Check, 
    Info, 
    Sparkles,
    Target,
    Users,
    Package,
    Megaphone,
    Eye,
    ArrowRight,
    Images,
    Calendar,
    Tag
} from "lucide-react";
import Image from "next/image";
import "@/components/landing-page/styles.css";

interface CampaignFormProps {
    campaign?: Campaign;
    preselectedBrandId?: string;
    onSuccess: (campaign: Campaign) => void;
    onCancel: () => void;
}

export default function CampaignForm({ campaign, preselectedBrandId, onSuccess, onCancel }: CampaignFormProps) {
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [generatedImage, setGeneratedImage] = useState("");
    const [savedCampaign, setSavedCampaign] = useState<Campaign | null>(null);
    const [showGallery, setShowGallery] = useState(false);
    const [adCreatives, setAdCreatives] = useState<AdCreative[]>([]);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    // Generation progress
    const [generationStep, setGenerationStep] = useState("");
    const [generationProgress, setGenerationProgress] = useState(0);

    // New states for prompt editing
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState("");
    const [isCampaignFinalized, setIsCampaignFinalized] = useState(false);

    const [formData, setFormData] = useState({
        name: campaign?.name || "",
        description: campaign?.description || "",
        brandId: campaign?.brandId || preselectedBrandId || "",
        status: campaign?.status || "draft" as const,
        
        // Product details
        productName: campaign?.productName || "",
        productDescription: campaign?.productDescription || "",
        productPrice: campaign?.productPrice || "",
        productCategory: campaign?.productCategory || "",
        
        // Campaign goals
        campaignGoals: campaign?.campaignGoals || [],
        targetAudience: campaign?.targetAudience || "",
        callToAction: campaign?.callToAction || "",
        
        // Target platforms
        targetPlatforms: campaign?.targetPlatforms || [],
    });

    // Options
    const campaignGoalOptions = [
        "Brand Awareness", "Lead Generation", "Sales Conversion", "Website Traffic",
        "App Downloads", "Social Media Engagement", "Product Launch", "Customer Retention"
    ];

    const platformOptions = [
        "Facebook", "Instagram", "Twitter/X", "LinkedIn", 
        "TikTok", "YouTube", "Google Ads", "Pinterest"
    ];

    const productCategories = [
        "Technology", "Fashion", "Beauty & Cosmetics", "Health & Fitness",
        "Food & Beverage", "Home & Garden", "Automotive", "Travel",
        "Education", "Finance", "Entertainment", "Sports", "Books & Media", "Services"
    ];

    useEffect(() => {
        if (user) {
            loadBrands();
        }
    }, [user]);

    useEffect(() => {
        if (formData.brandId && brands.length > 0) {
            const brand = brands.find(b => b.$id === formData.brandId);
            setSelectedBrand(brand || null);
        }
    }, [formData.brandId, brands]);

    useEffect(() => {
        if (campaign?.generatedPrompt) {
            setGeneratedPrompt(campaign.generatedPrompt);
        }
        if (campaign?.generatedImageUrl) {
            setGeneratedImage(campaign.generatedImageUrl);
        }
    }, [campaign]);

    const loadBrands = async () => {
        if (!user) return;
        
        try {
            const brandsData = await brandService.getUserBrands(user.$id);
            setBrands(brandsData);
        } catch (error) {
            console.error("Error loading brands:", error);
        }
    };

    const loadAdCreatives = async () => {
        if (!user) return;
        
        try {
            const adCreativesData = await adCreativeService.getUserAdCreatives(user.$id);
            setAdCreatives(adCreativesData);
        } catch (error) {
            console.error("Error loading ad creatives:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
        setSuccess("");
    };

    const handleMultiSelectChange = (field: 'campaignGoals' | 'targetPlatforms', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
        setError("");
        setSuccess("");
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError("Campaign name is required");
            return false;
        }
        if (!formData.brandId) {
            setError("Please select a brand");
            return false;
        }
        if (!formData.productName.trim()) {
            setError("Product name is required");
            return false;
        }
        if (!formData.productDescription.trim()) {
            setError("Product description is required");
            return false;
        }
        if (!formData.targetAudience.trim()) {
            setError("Target audience is required");
            return false;
        }
        if (!formData.callToAction.trim()) {
            setError("Call to action is required");
            return false;
        }
        if (formData.targetPlatforms.length === 0) {
            setError("Please select at least one platform");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !user) return;

        setIsLoading(true);
        setError("");

        try {
            const campaignData = {
                userId: user.$id,
                brandId: formData.brandId,
                name: formData.name,
                description: formData.description,
                status: formData.status,
                productName: formData.productName,
                productDescription: formData.productDescription,
                productPrice: formData.productPrice,
                productCategory: formData.productCategory,
                campaignGoals: formData.campaignGoals,
                targetAudience: formData.targetAudience,
                callToAction: formData.callToAction,
                targetPlatforms: formData.targetPlatforms,
                generatedPrompt: generatedPrompt || undefined,
                generatedImageUrl: generatedImage || undefined,
            };

            let result;
            if (campaign?.$id) {
                result = await campaignService.updateCampaign(campaign.$id, campaignData);
            } else {
                result = await campaignService.createCampaign(campaignData);
            }

            setSavedCampaign(result as unknown as Campaign);
            setSuccess("Campaign saved successfully! You can now generate AI ad creatives.");
        } catch (error: any) {
            setError(error.message || "Failed to save campaign. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateAdCreative = async () => {
        if (!validateForm() || !selectedBrand || !user) return;

        // Save campaign first if not saved
        if (!savedCampaign) {
            await handleSubmit(new Event('submit') as any);
            return;
        }

        setIsGenerating(true);
        setError("");
        setGenerationStep("Initializing AI generation...");
        setGenerationProgress(10);

        try {
            const request: GeneratePromptRequest = {
                brandName: selectedBrand.name,
                brandDescription: selectedBrand.description,
                productName: formData.productName,
                productDescription: formData.productDescription,
                productCategory: formData.productCategory,
                campaignGoals: formData.campaignGoals,
                targetAudience: formData.targetAudience,
                targetPlatforms: formData.targetPlatforms,
                callToAction: formData.callToAction,
                primaryColor: selectedBrand.primaryColor,
                secondaryColor: selectedBrand.secondaryColor,
                userId: user.$id,
                brandId: formData.brandId,
                campaignId: savedCampaign.$id,
            };

            setGenerationStep("Creating prompt...");
            setGenerationProgress(30);

            await new Promise(resolve => setTimeout(resolve, 1000));

            setGenerationStep("Generating image...");
            setGenerationProgress(50);

            const result = await togetherAI.generateAdCreative(request);
            
            setGenerationStep("Saving to storage...");
            setGenerationProgress(80);

            await new Promise(resolve => setTimeout(resolve, 500));

            setGeneratedPrompt(result.prompt);
            setGeneratedImage(result.imageUrl);

            // Update the saved campaign with generated content
            const updatedCampaignData = {
                generatedPrompt: result.prompt,
                generatedImageUrl: result.imageUrl,
            };
            
            const updatedCampaign = await campaignService.updateCampaign(savedCampaign.$id!, updatedCampaignData);
            setSavedCampaign(updatedCampaign as unknown as Campaign);

            setGenerationStep("Complete!");
            setGenerationProgress(100);
            setSuccess("Ad creative generated successfully!");

            setTimeout(() => {
                setGenerationStep("");
                setGenerationProgress(0);
            }, 2000);

        } catch (error: any) {
            setError(error.message || "Failed to generate ad creative. Please try again.");
            setGenerationStep("");
            setGenerationProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = async (imageUrl: string, filename: string = 'ad-creative') => {
        try {
            // Fetch the image as blob
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Create download link
            const link = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = `${filename}.png`;
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
            link.download = `${filename}.png`;
            link.click();
        }
    };

    const startEditingPrompt = () => {
        setEditedPrompt(generatedPrompt);
        setIsEditingPrompt(true);
    };

    const cancelEditingPrompt = () => {
        setEditedPrompt("");
        setIsEditingPrompt(false);
    };

    const regenerateWithCustomPrompt = async () => {
        if (!editedPrompt.trim() || !selectedBrand || !user || !savedCampaign) return;

        setIsGenerating(true);
        setError("");
        setGenerationStep("Regenerating with custom prompt...");
        setGenerationProgress(30);

        try {
            const request: GeneratePromptRequest = {
                brandName: selectedBrand.name,
                brandDescription: selectedBrand.description,
                productName: formData.productName,
                productDescription: formData.productDescription,
                productCategory: formData.productCategory,
                campaignGoals: formData.campaignGoals,
                targetAudience: formData.targetAudience,
                targetPlatforms: formData.targetPlatforms,
                callToAction: formData.callToAction,
                primaryColor: selectedBrand.primaryColor,
                secondaryColor: selectedBrand.secondaryColor,
                userId: user.$id,
                brandId: formData.brandId,
                campaignId: savedCampaign.$id,
                customPrompt: editedPrompt.trim()
            };

            setGenerationStep("Generating image with custom prompt...");
            setGenerationProgress(60);

            const result = await togetherAI.generateAdCreative(request);
            
            setGenerationStep("Saving updated creative...");
            setGenerationProgress(80);

            setGeneratedPrompt(result.prompt);
            setGeneratedImage(result.imageUrl);

            // Update the saved campaign with new generated content
            const updatedCampaignData = {
                generatedPrompt: result.prompt,
                generatedImageUrl: result.imageUrl,
            };
            
            const updatedCampaign = await campaignService.updateCampaign(savedCampaign.$id!, updatedCampaignData);
            setSavedCampaign(updatedCampaign as unknown as Campaign);

            setGenerationStep("Complete!");
            setGenerationProgress(100);
            setSuccess("Ad creative regenerated successfully with your custom prompt!");
            setIsEditingPrompt(false);

            setTimeout(() => {
                setGenerationStep("");
                setGenerationProgress(0);
            }, 2000);

        } catch (error: any) {
            setError(error.message || "Failed to regenerate ad creative. Please try again.");
            setGenerationStep("");
            setGenerationProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    const finalizeCampaign = async () => {
        if (!savedCampaign) return;
        
        // Mark campaign as finalized
        setIsCampaignFinalized(true);
        
        // Load all ad creatives to show in gallery
        await loadAdCreatives();
        setShowGallery(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleBackToCampaigns = () => {
        setShowGallery(false);
        if (savedCampaign) {
            onSuccess(savedCampaign);
        }
    };

    // Gallery View
    if (showGallery) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#111111] p-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#7A7FEE] to-[#00D4FF] rounded-full mb-4">
                            <Images className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-black dark:text-white mb-2">
                            Your AI Generated
                            <span className="block text-[#7A7FEE] dark:text-[#7A7FEE]">Ad Creatives</span>
                        </h1>
                        <p className="text-gray-700 dark:text-gray-300">
                            Browse all your generated ad creatives
                        </p>
                    </div>

                    {/* Gallery */}
                    <div className="card overflow-hidden mb-8">
                        <div className="p-8 md:p-10 lg:p-12">
                            {adCreatives.length === 0 ? (
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
                                                            onClick={() => downloadImage(adCreative.imageUrl, `ad-creative-${adCreative.$id}`)}
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

                    {/* Actions */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleBackToCampaigns}
                            className="btn-primary flex items-center"
                        >
                            Back to Campaigns
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>

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
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#111111] p-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#7A7FEE] to-[#00D4FF] rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-black dark:text-white mb-2">
                        {campaign ? "Edit Campaign" : "Create New"}
                        <span className="block text-[#7A7FEE] dark:text-[#7A7FEE]">Campaign</span>
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300">
                        Create AI-powered ad creatives that convert
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="card overflow-hidden">
                    {/* Progress Bar */}
                    {isGenerating && (
                        <div className="bg-gradient-to-r from-[#7A7FEE] to-[#00D4FF] h-1">
                            <div 
                                className="bg-white h-full transition-all duration-500 ease-out"
                                style={{ width: `${100 - generationProgress}%` }}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 lg:p-12 space-y-8">
                        {/* Status Messages */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 text-red-500 mr-2" />
                                    <p className="text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Check className="w-5 h-5 text-green-500 mr-2" />
                                    <p className="text-green-700 dark:text-green-400">{success}</p>
                                </div>
                            </div>
                        )}

                        {isGenerating && generationStep && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
                                    <p className="text-blue-700 dark:text-blue-400">{generationStep}</p>
                                    <span className="ml-auto text-blue-600 dark:text-blue-400 font-medium">
                                        {generationProgress}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Campaign Basics */}
                        <section className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-[#7A7FEE] to-[#00D4FF] rounded-lg flex items-center justify-center">
                                    <Megaphone className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="section-title">Campaign Basics</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campaign Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                        placeholder="e.g., Summer Collection Launch"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Brand *
                                    </label>
                                    <select
                                        name="brandId"
                                        value={formData.brandId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                        required
                                    >
                                        <option value="">Choose a brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.$id} value={brand.$id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Campaign Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                    placeholder="Describe your campaign objectives and key messaging"
                                    required
                                />
                            </div>
                        </section>

                        {/* Product Details */}
                        <section className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="section-title">Product Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                        placeholder="e.g., Organic Cotton T-Shirt"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Product Category
                                    </label>
                                    <select
                                        name="productCategory"
                                        value={formData.productCategory}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                    >
                                        <option value="">Select category</option>
                                        {productCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Description *
                                </label>
                                <textarea
                                    name="productDescription"
                                    value={formData.productDescription}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                    placeholder="Describe your product's features, benefits, and what makes it special"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Price (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="productPrice"
                                    value={formData.productPrice}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                    placeholder="e.g., $99.99, Free, Starting at $50"
                                />
                            </div>
                        </section>

                        {/* Target & Goals */}
                        <section className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="section-title">Target & Goals</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Target Audience *
                                </label>
                                <textarea
                                    name="targetAudience"
                                    value={formData.targetAudience}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                    placeholder="e.g., Young professionals aged 25-35 who value sustainable fashion"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Call to Action *
                                </label>
                                <input
                                    type="text"
                                    name="callToAction"
                                    value={formData.callToAction}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                    placeholder="e.g., Shop Now, Learn More, Download App"
                                    required
                                />
                            </div>

                            {/* Campaign Goals */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Campaign Goals
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {campaignGoalOptions.map((goal) => (
                                        <label key={goal} className="flex items-center space-x-2 cursor-pointer p-3 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.campaignGoals.includes(goal)}
                                                onChange={() => handleMultiSelectChange('campaignGoals', goal)}
                                                className="rounded border-gray-300 text-[#7A7FEE] focus:ring-[#7A7FEE]"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{goal}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Target Platforms */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Target Platforms *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {platformOptions.map((platform) => (
                                        <label key={platform} className="flex items-center space-x-2 cursor-pointer p-3 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.targetPlatforms.includes(platform)}
                                                onChange={() => handleMultiSelectChange('targetPlatforms', platform)}
                                                className="rounded border-gray-300 text-[#7A7FEE] focus:ring-[#7A7FEE]"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{platform}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Save Campaign Button */}
                        {!savedCampaign && (
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary flex items-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Save Campaign Details
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* AI Generation Section */}
                        {savedCampaign && (
                            <section className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                        <Wand2 className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="section-title">AI Ad Creative</h2>
                                </div>

                                {!generatedImage ? (
                                    <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Ready to Generate Your Ad Creative?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            Your campaign details have been saved. Now let's create your AI-powered ad creative!
                                        </p>
                                        <button
                                            type="button"
                                            onClick={generateAdCreative}
                                            disabled={isGenerating}
                                            className="btn-primary flex items-center mx-auto"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="w-5 h-5 mr-2" />
                                                    Generate Ad Creative
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center">
                                                    <Check className="w-6 h-6 text-green-500 mr-2" />
                                                    <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                                                        Ad Creative Generated Successfully!
                                                    </h3>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => downloadImage(generatedImage, formData.name || 'ad-creative')}
                                                        className="btn-secondary text-green-600 hover:text-green-700"
                                                        title="Download image as PNG"
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Download
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={generateAdCreative}
                                                        disabled={isGenerating}
                                                        className="btn-secondary text-blue-600 hover:text-blue-700"
                                                        title="Generate new image with AI"
                                                    >
                                                        <Wand2 className="w-4 h-4 mr-1" />
                                                        Regenerate
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <div className="flex-1">
                                                    <Image
                                                        src={generatedImage}
                                                        alt="Generated ad creative"
                                                        width={400}
                                                        height={400}
                                                        className="w-full max-w-md mx-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg"
                                                    />
                                                </div>
                                                {generatedPrompt && (
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">AI Generated Prompt:</h4>
                                                            {!isEditingPrompt && (
                                                                <button
                                                                    type="button"
                                                                    onClick={startEditingPrompt}
                                                                    className="text-sm text-[#7A7FEE] hover:text-[#5A5FCC] flex items-center"
                                                                >
                                                                    <Wand2 className="w-3 h-3 mr-1" />
                                                                    Edit & Regenerate
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {isEditingPrompt ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    value={editedPrompt}
                                                                    onChange={(e) => setEditedPrompt(e.target.value)}
                                                                    rows={6}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent resize-none"
                                                                    placeholder="Edit the prompt and regenerate the image..."
                                                                />
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={regenerateWithCustomPrompt}
                                                                        disabled={isGenerating || !editedPrompt.trim()}
                                                                        className="flex-1 px-3 py-2 bg-[#7A7FEE] text-white rounded-md hover:bg-[#5A5FCC] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                                    >
                                                                        {isGenerating ? (
                                                                            <>
                                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />
                                                                                Generating...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Wand2 className="w-3 h-3 mr-1 inline" />
                                                                                Regenerate
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelEditingPrompt}
                                                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                {generatedPrompt}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>

                            {savedCampaign && generatedImage && !isCampaignFinalized && (
                                <button
                                    type="button"
                                    onClick={finalizeCampaign}
                                    className="btn-primary flex items-center"
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Complete Campaign
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 