"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
    Home, 
    Palette, 
    Megaphone, 
    Settings, 
    Menu, 
    X, 
    LogOut,
    User
} from "lucide-react";
import { brandColors } from "@/components/landing-page/color-utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Brands", href: "/dashboard/brands", icon: Palette },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111111]">
            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#272829] shadow-xl">
                        <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    BrandByte
                                </h2>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 p-4 space-y-2">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                isActive
                                                    ? "bg-[#7A7FEE]/10 text-[#7A7FEE]"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5 mr-3" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center mb-3">
                                    <User className="w-8 h-8 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white dark:bg-[#272829] border-r border-gray-200 dark:border-gray-700">
                    <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            BrandByte
                        </h2>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-[#7A7FEE]/10 text-[#7A7FEE]"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-3">
                            <User className="w-8 h-8 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar for mobile */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#272829] border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        BrandByte
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
} 