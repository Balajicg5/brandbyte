"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/layout";
import CampaignBuilder from "@/components/dashboard/campaign-builder";
import { Campaign } from "@/lib/appwrite";

export default function NewCampaignPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedBrandId = searchParams.get("brandId");

    const handleSuccess = (campaign: Campaign) => {
        router.push("/dashboard/campaigns");
    };

    const handleCancel = () => {
        router.push("/dashboard/campaigns");
    };

    return (
        <ProtectedRoute>
            <CampaignBuilder
                preselectedBrandId={preselectedBrandId || undefined}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </ProtectedRoute>
    );
} 