"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { brandService, Brand } from "@/lib/appwrite";
import { brandColors } from "@/components/landing-page/color-utils";
import { Upload, X, Loader2, Palette } from "lucide-react";
import Image from "next/image";

interface BrandFormProps {
    brand?: Brand;
    onSuccess: (brand: Brand) => void;
    onCancel: () => void;
}

const predefinedColors = [
    brandColors.primary,
    brandColors.secondary,
    brandColors.tertiary,
    brandColors.quaternary,
    "#FF5733", "#33FF57", "#3357FF", "#FF33F1",
    "#F1FF33", "#33F1FF", "#FF8533", "#8533FF",
    "#FF3385", "#85FF33", "#3385FF", "#000000"
];

export default function BrandForm({ brand, onSuccess, onCancel }: BrandFormProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [logoPreview, setLogoPreview] = useState<string | null>(
        brand?.logo ? brandService.getLogoUrl(brand.logo).toString() : null
    );
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: brand?.name || "",
        description: brand?.description || "",
        primaryColor: brand?.primaryColor || brandColors.primary,
        secondaryColor: brand?.secondaryColor || brandColors.secondary,
        accentColor: brand?.accentColor || brandColors.tertiary,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor' | 'accentColor', color: string) => {
        setFormData(prev => ({ ...prev, [colorType]: color }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Logo file size must be less than 5MB');
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setError("");
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        setError("");

        try {
            let logoId = brand?.logo;

            // Upload new logo if selected
            if (logoFile) {
                const uploadResponse = await brandService.uploadLogo(logoFile);
                logoId = uploadResponse.$id;
            }

            const brandData = {
                userId: user.$id,
                name: formData.name,
                description: formData.description,
                logo: logoId,
                primaryColor: formData.primaryColor,
                secondaryColor: formData.secondaryColor,
                accentColor: formData.accentColor,
            };

            let result;
            if (brand?.$id) {
                // Update existing brand
                result = await brandService.updateBrand(brand.$id, brandData);
            } else {
                // Create new brand
                result = await brandService.createBrand(brandData);
            }

            onSuccess(result as unknown as Brand);
        } catch (error: any) {
            setError(error.message || "Failed to save brand. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const ColorPicker = ({ 
        label, 
        value, 
        onChange 
    }: { 
        label: string;
        value: string;
        onChange: (color: string) => void;
    }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="flex items-center space-x-3">
                <div
                    className="w-10 h-10 rounded-md border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                    style={{ backgroundColor: value }}
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'color';
                        input.value = value;
                        input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
                        input.click();
                    }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    placeholder="#000000"
                />
            </div>
            <div className="grid grid-cols-8 gap-2 mt-2">
                {predefinedColors.map((color) => (
                    <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => onChange(color)}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white dark:bg-[#272829] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {brand ? "Edit Brand" : "Create New Brand"}
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Brand Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Brand Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                            placeholder="Enter your brand name"
                        />
                    </div>

                    {/* Brand Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                            placeholder="Describe your brand and its mission"
                        />
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Brand Logo
                        </label>
                        {logoPreview ? (
                            <div className="relative inline-block">
                                <Image
                                    src={logoPreview}
                                    alt="Logo preview"
                                    width={120}
                                    height={120}
                                    className="w-30 h-30 object-contain rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-30 h-30 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-[#7A7FEE] transition-colors"
                            >
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload logo</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG up to 5MB</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                            <Palette className="w-5 h-5 mr-2" />
                            Brand Colors
                        </h3>
                        
                        <ColorPicker
                            label="Primary Color"
                            value={formData.primaryColor}
                            onChange={(color) => handleColorChange('primaryColor', color)}
                        />
                        
                        <ColorPicker
                            label="Secondary Color"
                            value={formData.secondaryColor}
                            onChange={(color) => handleColorChange('secondaryColor', color)}
                        />
                        
                        <ColorPicker
                            label="Accent Color"
                            value={formData.accentColor}
                            onChange={(color) => handleColorChange('accentColor', color)}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name || !formData.description}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#7A7FEE] rounded-md hover:bg-[#6366f1] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {brand ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                brand ? "Update Brand" : "Create Brand"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 