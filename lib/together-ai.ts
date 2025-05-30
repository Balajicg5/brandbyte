interface GeneratePromptRequest {
    brandName: string;
    brandDescription: string;
    productName: string;
    productDescription: string;
    productCategory: string;
    campaignGoals: string[];
    targetAudience: string;
    targetPlatforms: string[];
    callToAction: string;
    primaryColor: string;
    secondaryColor: string;
    userId: string;
    brandId: string;
    campaignId?: string;
    customPrompt?: string;
}

class TogetherAIService {
    async generateAdCreative(request: GeneratePromptRequest): Promise<{ prompt: string; imageUrl: string; appwriteFileId?: string }> {
        try {
            const response = await fetch('/api/generate-ad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `API request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return {
                prompt: data.prompt,
                imageUrl: data.imageUrl,
                appwriteFileId: data.appwriteFileId
            };
        } catch (error: any) {
            console.error('Error calling generate-ad API:', error);
            throw new Error(error.message || 'Failed to generate ad creative. Please try again.');
        }
    }
}

export const togetherAI = new TogetherAIService();
export type { GeneratePromptRequest };