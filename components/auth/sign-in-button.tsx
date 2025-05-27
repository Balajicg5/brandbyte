"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useState } from "react";

export default function SignInButton() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="w-20 h-9 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                        {user.name}
                    </span>
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-2">
                            <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                {user.email}
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    setIsDropdownOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md mt-1"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href="/auth/signin"
            className="btn-secondary text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
            Sign In
        </Link>
    );
} 