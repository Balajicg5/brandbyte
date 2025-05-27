"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [userId, setUserId] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const { login, verifyOTP } = useAuth();
    const router = useRouter();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const session = await login(email);
            setUserId(session.userId);
            setStep("otp");
        } catch (error: any) {
            setError(error.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await verifyOTP(userId, otp);
            router.push("/dashboard"); // Redirect to dashboard after successful signup
        } catch (error: any) {
            setError(error.message || "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep("email");
        setOtp("");
        setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111111] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Link 
                        href="/" 
                        className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-[#7A7FEE] mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {step === "email" ? "Join BrandByte" : "Enter verification code"}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {step === "email" 
                                ? "Start creating amazing ad creatives with AI"
                                : `We sent a verification code to ${email}`
                            }
                        </p>
                    </div>
                </div>

                {step === "email" ? (
                    <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE]"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7A7FEE] hover:bg-[#6366f1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7A7FEE] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Send verification code"
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{" "}
                                <Link href="/auth/signin" className="text-[#7A7FEE] hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                By signing up, you agree to our{" "}
                                <Link href="/terms" className="text-[#7A7FEE] hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-[#7A7FEE] hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
                        <div>
                            <label htmlFor="otp" className="sr-only">
                                Verification code
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                required
                                className="block w-full text-center px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-[#7A7FEE] text-lg tracking-widest"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7A7FEE] hover:bg-[#6366f1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7A7FEE] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Verify and create account"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToEmail}
                                className="w-full flex justify-center py-2 px-4 text-sm text-gray-600 dark:text-gray-400 hover:text-[#7A7FEE]"
                            >
                                Use a different email
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 