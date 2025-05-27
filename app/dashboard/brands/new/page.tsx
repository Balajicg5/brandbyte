"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/layout";
import BrandForm from "@/components/dashboard/brand-form";
import { Brand } from "@/lib/appwrite";

export default function NewBrandPage() {
    const router = useRouter();

    const handleSuccess = (brand: Brand) => {
        router.push("/dashboard/brands");
    };

    const handleCancel = () => {
        router.push("/dashboard/brands");
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <BrandForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DashboardLayout>
        </ProtectedRoute>
    );
} 