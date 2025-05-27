"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { brandService, Brand } from "@/lib/appwrite";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/layout";
import BrandForm from "@/components/dashboard/brand-form";
import { 
    Plus, 
    Edit, 
    Trash2, 
    Palette,
    Search,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BrandsPage() {
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadBrands();
        }
    }, [user]);

    const loadBrands = async () => {
        if (!user) return;
        
        try {
            const brandsData = await brandService.getUserBrands(user.$id);
            setBrands(brandsData);
        } catch (error) {
            console.error("Error loading brands:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSuccess = (newBrand: Brand) => {
        setBrands(prev => [newBrand, ...prev]);
        setShowCreateForm(false);
    };

    const handleEditSuccess = (updatedBrand: Brand) => {
        setBrands(prev => prev.map(brand => 
            brand.$id === updatedBrand.$id ? updatedBrand : brand
        ));
        setEditingBrand(null);
    };

    const handleDelete = async (brandId: string) => {
        try {
            await brandService.deleteBrand(brandId);
            setBrands(prev => prev.filter(brand => brand.$id !== brandId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting brand:", error);
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showCreateForm) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <BrandForm
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (editingBrand) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <BrandForm
                        brand={editingBrand}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingBrand(null)}
                    />
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Brands
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your brand identities and color palettes
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Brand
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search brands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                            />
                        </div>
                    </div>

                    {/* Brands Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 mb-4">
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        <div className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {searchTerm ? "No brands found" : "No brands yet"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {searchTerm 
                                    ? "Try adjusting your search terms"
                                    : "Create your first brand to start generating amazing ad creatives"
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="btn-primary inline-flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Brand
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBrands.map((brand) => (
                                <div
                                    key={brand.$id}
                                    className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                                >
                                    {/* Brand Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            {brand.logoUrl ? (
                                                <Image
                                                    src={brand.logoUrl}
                                                    alt={brand.name}
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 rounded-lg object-contain bg-gray-100 dark:bg-gray-700"
                                                />
                                            ) : (
                                                <div
                                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                                    style={{ backgroundColor: brand.primaryColor }}
                                                >
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {brand.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {brand.description}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Action Menu */}
                                        <div className="relative group">
                                            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                <button
                                                    onClick={() => setEditingBrand(brand)}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Brand
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(brand.$id!)}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Brand
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Palette */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            Color Palette
                                        </p>
                                        <div className="flex space-x-2">
                                            <div
                                                className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
                                                style={{ backgroundColor: brand.primaryColor }}
                                                title={`Primary: ${brand.primaryColor}`}
                                            ></div>
                                            <div
                                                className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
                                                style={{ backgroundColor: brand.secondaryColor }}
                                                title={`Secondary: ${brand.secondaryColor}`}
                                            ></div>
                                            <div
                                                className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
                                                style={{ backgroundColor: brand.accentColor }}
                                                title={`Accent: ${brand.accentColor}`}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex space-x-2 mt-4">
                                        <Link
                                            href={`/dashboard/campaigns/new?brandId=${brand.$id}`}
                                            className="flex-1 py-2 px-3 text-sm text-center bg-[#7A7FEE] text-white rounded-md hover:bg-[#6366f1] transition-colors"
                                        >
                                            Create Campaign
                                        </Link>
                                        <button
                                            onClick={() => setEditingBrand(brand)}
                                            className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-[#272829] rounded-lg p-6 max-w-md w-full mx-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Delete Brand
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Are you sure you want to delete this brand? This action cannot be undone and will also delete all associated campaigns.
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 py-2 px-4 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
} 