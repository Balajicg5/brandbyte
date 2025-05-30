"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/layout";
import { 
    Settings, 
    User, 
    Mail, 
    Lock, 
    Bell,
    Palette,
    Eye,
    EyeOff,
    Save,
    Loader2,
    Check,
    X,
    Shield,
    Trash2
} from "lucide-react";

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    // Password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        campaignUpdates: true,
        productUpdates: false,
        marketingEmails: false,
    });

    // Theme settings
    const [themeSettings, setThemeSettings] = useState({
        darkMode: false,
        compactView: false,
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            // For now, we'll just show a success message
            // Profile update functionality will be implemented later
            setSuccess("Profile update feature will be implemented soon!");
        } catch (error: any) {
            setError(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);

        try {
            // Here you would implement password change logic
            // For now, we'll just show a success message
            setSuccess("Password updated successfully!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            setError(error.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );
        
        if (confirmed) {
            const doubleConfirmed = window.confirm(
                "This will permanently delete all your data including brands, campaigns, and ad creatives. Are you absolutely sure?"
            );
            
            if (doubleConfirmed) {
                try {
                    // Here you would implement account deletion logic
                    alert("Account deletion feature will be implemented soon.");
                } catch (error) {
                    setError("Failed to delete account");
                }
            }
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 dark:bg-[#111111] p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#7A7FEE] to-[#00D4FF] rounded-lg mr-4">
                                    <Settings className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Account Settings
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Manage your account preferences and security
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 text-red-500 mr-2" />
                                    <p className="text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <Check className="w-5 h-5 text-green-500 mr-2" />
                                    <p className="text-green-700 dark:text-green-400">{success}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Profile Settings */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center mb-6">
                                    <User className="w-5 h-5 text-[#7A7FEE] mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Profile Information
                                    </h2>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Email cannot be changed. Contact support if needed.
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center px-4 py-2 bg-[#7A7FEE] text-white rounded-lg hover:bg-[#5A5FCC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Password Settings */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center mb-6">
                                    <Lock className="w-5 h-5 text-[#7A7FEE] mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Change Password
                                    </h2>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                            className="flex items-center px-4 py-2 bg-[#7A7FEE] text-white rounded-lg hover:bg-[#5A5FCC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Lock className="w-4 h-4 mr-2" />
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Notification Settings */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center mb-6">
                                    <Bell className="w-5 h-5 text-[#7A7FEE] mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Notification Preferences
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries({
                                        emailNotifications: "Email Notifications",
                                        campaignUpdates: "Campaign Updates",
                                        productUpdates: "Product Updates",
                                        marketingEmails: "Marketing Emails"
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-gray-700 dark:text-gray-300">{label}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings[key as keyof typeof notificationSettings]}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        [key]: e.target.checked
                                                    })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7A7FEE]/20 dark:peer-focus:ring-[#7A7FEE]/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#7A7FEE]"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-red-200 dark:border-red-800 p-6">
                                <div className="flex items-center mb-6">
                                    <Shield className="w-5 h-5 text-red-500 mr-2" />
                                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                                        Danger Zone
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Delete Account
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
} 