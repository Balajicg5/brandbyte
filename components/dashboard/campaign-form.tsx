"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { campaignService, brandService, Campaign, Brand } from "@/lib/appwrite";
import { togetherAI, GeneratePromptRequest } from "@/lib/together-ai";
import { Loader2, X, Wand2, Download, Eye } from "lucide-react";
import Image from "next/image";

interface CampaignFormProps {
    campaign?: Campaign;
    preselectedBrandId?: string;
    onSuccess: (campaign: Campaign) => void;
    onCancel: () => void;
}

const campaignGoalOptions = [
    "Brand Awareness",
    "Lead Generation", 
    "Sales Conversion",
    "Website Traffic",
    "App Downloads",
    "Social Media Engagement",
    "Product Launch",
    "Customer Retention"
];

const platformOptions = [
    "Facebook",
    "Instagram", 
    "Twitter/X",
    "LinkedIn",
    "TikTok",
    "YouTube",
    "Google Ads",
    "Pinterest"
];

const productCategories = [
    "Technology",
    "Fashion",
    "Beauty & Cosmetics",
    "Health & Fitness",
    "Food & Beverage",
    "Home & Garden",
    "Automotive",
    "Travel",
    "Education",
    "Finance",
    "Entertainment",
    "Sports",
    "Books & Media",
    "Services"
];

export default function CampaignForm({ campaign, preselectedBrandId, onSuccess, onCancel }: CampaignFormProps) {
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [generatedImage, setGeneratedImage] = useState("");

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (field: 'campaignGoals' | 'targetPlatforms', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const generateAdCreative = async () => {
        if (!selectedBrand || !formData.productName || !formData.productDescription) {
            setError("Please select a brand and fill in product details before generating ad creative.");
            return;
        }

        setIsGenerating(true);
        setError("");

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
            };

            const result = await togetherAI.generateAdCreative(request);
            setGeneratedPrompt(result.prompt);
            setGeneratedImage(result.imageUrl);
        } catch (error: any) {
            setError(error.message || "Failed to generate ad creative. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

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

            onSuccess(result as unknown as Campaign);
        } catch (error: any) {
            setError(error.message || "Failed to save campaign. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = `${formData.name || 'ad-creative'}.png`;
            link.click();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-[#272829] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {campaign ? "Edit Campaign" : "Create New Campaign"}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Campaign Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Campaign Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Campaign Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                    placeholder="Enter campaign name"
                                />
                            </div>

                            <div>
                                <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Brand *
                                </label>
                                <select
                                    id="brandId"
                                    name="brandId"
                                    required
                                    value={formData.brandId}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
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
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Campaign Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={3}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                placeholder="Describe your campaign objectives"
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    id="productName"
                                    name="productName"
                                    required
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Product Category *
                                </label>
                                <select
                                    id="productCategory"
                                    name="productCategory"
                                    required
                                    value={formData.productCategory}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
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
                            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Product Description *
                            </label>
                            <textarea
                                id="productDescription"
                                name="productDescription"
                                required
                                rows={3}
                                value={formData.productDescription}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                placeholder="Describe your product, its features, and benefits"
                            />
                        </div>

                        <div>
                            <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Product Price (Optional)
                            </label>
                            <input
                                type="text"
                                id="productPrice"
                                name="productPrice"
                                value={formData.productPrice}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                placeholder="e.g., $99.99, Free, Starting at $50"
                            />
                        </div>
                    </div>

                    {/* Campaign Goals */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Campaign Goals</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Campaign Goals *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {campaignGoalOptions.map((goal) => (
                                    <label key={goal} className="flex items-center space-x-2 cursor-pointer">
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

                        <div>
                            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Target Audience *
                            </label>
                            <textarea
                                id="targetAudience"
                                name="targetAudience"
                                required
                                rows={2}
                                value={formData.targetAudience}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                placeholder="Describe your target audience (age, interests, demographics, etc.)"
                            />
                        </div>

                        <div>
                            <label htmlFor="callToAction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Call to Action *
                            </label>
                            <input
                                type="text"
                                id="callToAction"
                                name="callToAction"
                                required
                                value={formData.callToAction}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                placeholder="e.g., Shop Now, Learn More, Download App, Sign Up Today"
                            />
                        </div>
                    </div>

                    {/* Target Platforms */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Target Platforms</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Target Platforms *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {platformOptions.map((platform) => (
                                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
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
                    </div>

                    {/* AI Ad Creative Generation */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Ad Creative</h3>
                            <button
                                type="button"
                                onClick={generateAdCreative}
                                disabled={isGenerating || !selectedBrand || !formData.productName}
                                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Generate Ad Creative
                                    </>
                                )}
                            </button>
                        </div>

                        {generatedPrompt && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Generated Prompt:</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{generatedPrompt}</p>
                            </div>
                        )}

                        {generatedImage && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Generated Ad Creative:</h4>
                                    <button
                                        type="button"
                                        onClick={downloadImage}
                                        className="btn-primary-outline flex items-center text-sm"
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </button>
                                </div>
                                <div className="relative">
                                    <Image
                                        src={generatedImage}
                                        alt="Generated ad creative"
                                        width={512}
                                        height={512}
                                        className="w-full max-w-md mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name || !formData.brandId || !formData.productName}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#7A7FEE] rounded-md hover:bg-[#6366f1] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {campaign ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                campaign ? "Update Campaign" : "Create Campaign"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 