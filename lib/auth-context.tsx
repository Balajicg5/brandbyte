"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from './appwrite';

interface User {
    $id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string) => Promise<any>;
    verifyOTP: (userId: string, secret: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser({
                    $id: currentUser.$id,
                    email: currentUser.email,
                    name: currentUser.name || currentUser.email
                });
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string) => {
        try {
            const session = await authService.createEmailOTPSession(email);
            return session;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const verifyOTP = async (userId: string, secret: string) => {
        try {
            await authService.verifyEmailOTP(userId, secret);
            await checkAuthState(); // Refresh user state after successful verification
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyOTP,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 