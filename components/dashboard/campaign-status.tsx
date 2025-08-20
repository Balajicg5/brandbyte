"use client";

import { useState } from "react";
import { Campaign } from "@/lib/appwrite";
import { 
    Play, 
    Square as Stop, 
    Edit, 
    Trash2, 
    Eye,
    MoreVertical,
    AlertTriangle
} from "lucide-react";

interface CampaignStatusProps {
    campaign: Campaign;
    onStatusChange: (campaignId: string, newStatus: Campaign['status']) => void;
    onEdit: (campaign: Campaign) => void;
    onDelete: (campaignId: string) => void;
    onView?: (campaign: Campaign) => void;
}

export default function CampaignStatus({ 
    campaign, 
    onStatusChange, 
    onEdit, 
    onDelete,
    onView 
}: CampaignStatusProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    const canEdit = campaign.status === 'draft' || campaign.status === 'paused';
    const canActivate = campaign.status === 'draft' || campaign.status === 'paused';
    const canStop = campaign.status === 'active';

    return (
        <div className="relative">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                {campaign.status}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-3">
                {/* Quick Status Actions */}
                {canActivate && (
                    <button
                        onClick={() => onStatusChange(campaign.$id!, 'active')}
                        className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        title="Activate campaign"
                    >
                        <Play className="w-4 h-4" />
                    </button>
                )}
                
                {canStop && (
                    <button
                        onClick={() => onStatusChange(campaign.$id!, 'paused')}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                        title="Stop campaign"
                    >
                        <Stop className="w-4 h-4" />
                    </button>
                )}

                {/* View Button */}
                {onView && (
                    <button
                        onClick={() => onView(campaign)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="View campaign details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                )}

                {/* More Options Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            {canEdit && (
                                <button
                                    onClick={() => {
                                        onEdit(campaign);
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Campaign
                                </button>
                            )}
                            
                            {campaign.status === 'active' && (
                                <button
                                    onClick={() => {
                                        onStatusChange(campaign.$id!, 'completed');
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Stop className="w-4 h-4 mr-2" />
                                    Mark Complete
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(true);
                                    setShowMenu(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Campaign
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#272829] rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Campaign
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2 px-4 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(campaign.$id!);
                                    setShowDeleteConfirm(false);
                                }}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
