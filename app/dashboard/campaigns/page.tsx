"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { campaignService, brandService, Campaign, Brand } from "@/lib/appwrite";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/layout";
import CampaignForm from "@/components/dashboard/campaign-form";
import { 
    Plus, 
    Edit, 
    Trash2, 
    Megaphone,
    Search,
    MoreVertical,
    Eye,
    Download,
    Play,
    Pause,
    Square
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CampaignsPage() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        
        try {
            const [campaignsData, brandsData] = await Promise.all([
                campaignService.getUserCampaigns(user.$id),
                brandService.getUserBrands(user.$id)
            ]);
            setCampaigns(campaignsData);
            setBrands(brandsData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSuccess = (newCampaign: Campaign) => {
        setCampaigns(prev => [newCampaign, ...prev]);
        setShowCreateForm(false);
    };

    const handleEditSuccess = (updatedCampaign: Campaign) => {
        setCampaigns(prev => prev.map(campaign => 
            campaign.$id === updatedCampaign.$id ? updatedCampaign : campaign
        ));
        setEditingCampaign(null);
    };

    const handleDelete = async (campaignId: string) => {
        try {
            await campaignService.deleteCampaign(campaignId);
            setCampaigns(prev => prev.filter(campaign => campaign.$id !== campaignId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting campaign:", error);
        }
    };

    const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
        try {
            const updatedCampaign = await campaignService.updateCampaign(campaignId, { status: newStatus });
            setCampaigns(prev => prev.map(campaign => 
                campaign.$id === campaignId 
                    ? { ...campaign, status: newStatus }
                    : campaign
            ));
        } catch (error) {
            console.error("Error updating campaign status:", error);
        }
    };

    const getBrandName = (brandId: string) => {
        const brand = brands.find(b => b.$id === brandId);
        return brand ? brand.name : "Unknown Brand";
    };

    const downloadImage = (imageUrl: string, campaignName: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${campaignName}-ad-creative.png`;
        link.click();
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.productName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: Campaign['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    if (showCreateForm) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <CampaignForm
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (editingCampaign) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <CampaignForm
                        campaign={editingCampaign}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingCampaign(null)}
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
                                Campaigns
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your ad campaigns and generate AI-powered creatives
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Campaign
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                            />
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Campaigns List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/4"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCampaigns.length === 0 ? (
                        <div className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {searchTerm || statusFilter !== "all" ? "No campaigns found" : "No campaigns yet"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {searchTerm || statusFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "Create your first campaign to start generating AI-powered ad creatives"
                                }
                            </p>
                            {!searchTerm && statusFilter === "all" && (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="btn-primary inline-flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Campaign
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCampaigns.map((campaign) => (
                                <div
                                    key={campaign.$id}
                                    className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {campaign.name}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                                                    {campaign.status}
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                {campaign.description}
                                            </p>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Brand:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {getBrandName(campaign.brandId)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Product:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {campaign.productName}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {campaign.productCategory}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Platforms:</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {campaign.targetPlatforms.slice(0, 2).join(", ")}
                                                        {campaign.targetPlatforms.length > 2 && ` +${campaign.targetPlatforms.length - 2}`}
                                                    </p>
                                                </div>
                                            </div>

                                            {campaign.generatedImageUrl && (
                                                <div className="mt-4 flex items-center space-x-2">
                                                    <div className="w-16 h-16 relative">
                                                        <Image
                                                            src={campaign.generatedImageUrl}
                                                            alt="Generated ad creative"
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-cover rounded border border-gray-200 dark:border-gray-700"
                                                        />
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setViewingImage(campaign.generatedImageUrl!)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                            title="View image"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => downloadImage(campaign.generatedImageUrl!, campaign.name)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                            title="Download image"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-2">
                                            {/* Status Controls */}
                                            {campaign.status === 'draft' && (
                                                <button
                                                    onClick={() => handleStatusChange(campaign.$id!, 'active')}
                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md"
                                                    title="Activate campaign"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            {campaign.status === 'active' && (
                                                <button
                                                    onClick={() => handleStatusChange(campaign.$id!, 'paused')}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md"
                                                    title="Pause campaign"
                                                >
                                                    <Pause className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            {campaign.status === 'paused' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(campaign.$id!, 'active')}
                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md"
                                                        title="Resume campaign"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(campaign.$id!, 'completed')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                                                        title="Complete campaign"
                                                    >
                                                        <Square className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            {/* Menu */}
                                            <div className="relative group">
                                                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                    <button
                                                        onClick={() => setEditingCampaign(campaign)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Campaign
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(campaign.$id!)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete Campaign
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
                                    Delete Campaign
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Are you sure you want to delete this campaign? This action cannot be undone.
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

                    {/* Image View Modal */}
                    {viewingImage && (
                        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" onClick={() => setViewingImage(null)}>
                            <div className="max-w-4xl max-h-full p-4">
                                <Image
                                    src={viewingImage}
                                    alt="Generated ad creative"
                                    width={1024}
                                    height={1024}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
} 