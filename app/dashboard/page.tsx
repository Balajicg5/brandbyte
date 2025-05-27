"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { brandService, campaignService, Brand, Campaign } from "@/lib/appwrite";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/layout";
import { 
    Palette, 
    Megaphone, 
    Plus, 
    BarChart3, 
    TrendingUp,
    Users,
    Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        if (!user) return;
        
        try {
            const [brandsData, campaignsData] = await Promise.all([
                brandService.getUserBrands(user.$id),
                campaignService.getUserCampaigns(user.$id)
            ]);
            
            setBrands(brandsData);
            setCampaigns(campaignsData);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        {
            name: "Total Brands",
            value: brands.length,
            icon: Palette,
            color: "bg-blue-500",
            change: "+2 this month",
        },
        {
            name: "Active Campaigns",
            value: campaigns.filter(c => c.status === 'active').length,
            icon: Megaphone,
            color: "bg-green-500",
            change: "+5 this week",
        },
        {
            name: "Total Campaigns",
            value: campaigns.length,
            icon: BarChart3,
            color: "bg-purple-500",
            change: "+12 this month",
        },
        {
            name: "Conversion Rate",
            value: "12.5%",
            icon: TrendingUp,
            color: "bg-orange-500",
            change: "+2.1% vs last month",
        },
    ];

    if (isLoading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="p-6">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="p-6 space-y-6">
                    {/* Welcome Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Here's what's happening with your ad campaigns today.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                href="/dashboard/brands/new"
                                className="btn-primary flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Brand
                            </Link>
                            <Link
                                href="/dashboard/campaigns/new"
                                className="btn-primary-outline flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Campaign
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div
                                key={stat.name}
                                className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {stat.name}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {stat.change}
                                </p>
                            </div>
                        ))}
                    </div>

                    {brands.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No brands yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Get started by creating your first brand to begin generating amazing ad creatives.
                            </p>
                            <Link
                                href="/dashboard/brands/new"
                                className="btn-primary inline-flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Brand
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Brands */}
                            <div className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Recent Brands
                                    </h2>
                                    <Link
                                        href="/dashboard/brands"
                                        className="text-sm text-[#7A7FEE] hover:underline"
                                    >
                                        View all
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {brands.slice(0, 3).map((brand) => (
                                        <div
                                            key={brand.$id}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            {brand.logoUrl ? (
                                                <Image
                                                    src={brand.logoUrl}
                                                    alt={brand.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 rounded-lg object-contain bg-gray-100 dark:bg-gray-700"
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                                                    style={{ backgroundColor: brand.primaryColor }}
                                                >
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {brand.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {brand.description}
                                                </p>
                                            </div>
                                            <div className="flex space-x-1">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: brand.primaryColor }}
                                                ></div>
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: brand.secondaryColor }}
                                                ></div>
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: brand.accentColor }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Campaigns */}
                            <div className="bg-white dark:bg-[#272829] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Recent Campaigns
                                    </h2>
                                    <Link
                                        href="/dashboard/campaigns"
                                        className="text-sm text-[#7A7FEE] hover:underline"
                                    >
                                        View all
                                    </Link>
                                </div>
                                {campaigns.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No campaigns yet. Create your first campaign to get started.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {campaigns.slice(0, 3).map((campaign) => (
                                            <div
                                                key={campaign.$id}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {campaign.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {campaign.description}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        campaign.status === 'active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : campaign.status === 'paused'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : campaign.status === 'draft'
                                                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}
                                                >
                                                    {campaign.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
} 