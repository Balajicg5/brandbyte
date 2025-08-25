"use client";

import { useState, useEffect, useRef } from "react";
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
    User,
    Images,
    Edit3,
    ChevronDown
} from "lucide-react";
import { brandColors } from "@/components/landing-page/color-utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Brands", href: "/dashboard/brands", icon: Palette },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { name: "Editor", href: "/dashboard/editor", icon: Edit3 },
    { name: "Gallery", href: "/dashboard/gallery", icon: Images },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111111]">
            {/* Top Navigation Bar */}
            <nav className="bg-white dark:bg-[#272829] border-b border-gray-200 dark:border-gray-700">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        {/* Left side - Logo and Navigation */}
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex flex-shrink-0 items-center">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    BrandByte
                                </h2>
                            </div>
                            
                            {/* Desktop Navigation */}
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? "border-[#7A7FEE] text-[#7A7FEE]"
                                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                            }`}
                                        >
                                            <item.icon className="w-4 h-4 mr-2" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right side - User menu */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="relative ml-3" ref={dropdownRef}>
                                <div>
                                    <button
                                        type="button"
                                        className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:ring-offset-2"
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <div className="flex items-center space-x-3 px-3 py-2">
                                            <User className="w-6 h-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-full" />
                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {user?.email}
                                                </p>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                </div>
                                
                                {/* User dropdown menu */}
                                {userDropdownOpen && (
                                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-[#272829] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setUserDropdownOpen(false);
                                            }}
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md bg-white dark:bg-[#272829] p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:ring-offset-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <span className="sr-only">Open main menu</span>
                                {mobileMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors ${
                                            isActive
                                                ? "border-[#7A7FEE] bg-[#7A7FEE]/10 text-[#7A7FEE]"
                                                : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="w-5 h-5 mr-3" />
                                            {item.name}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pb-3 pt-4">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <User className="w-8 h-8 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800 dark:text-white">
                                        {user?.name}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {user?.email}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex w-full items-center px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="w-5 h-5 mr-3" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main content */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
} 