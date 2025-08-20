"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { campaignService, brandService, Campaign, Brand } from "@/lib/appwrite";
import { 
    Loader2, 
    X, 
    ArrowRight,
    ArrowLeft,
    Target,
    Users,
    Send,
    Image as ImageIcon,
    Calendar,
    CheckCircle,
    Sparkles,
    Eye,
    Mail,
    Bell,
    Monitor,
    Play,
    Square as Stop,
    Edit,
    Trash2,
    Info,
    Clock,
    Repeat,
    BarChart3
} from "lucide-react";
import { DateTimePicker, DatePicker, TimePicker } from "@/components/ui/date-time-picker";
import { format } from "date-fns";

interface CampaignBuilderProps {
    campaign?: Campaign;
    preselectedBrandId?: string;
    onSuccess: (campaign: Campaign) => void;
    onCancel: () => void;
}

interface AudienceSegment {
    id: string;
    name: string;
    userCount: number;
    description: string;
    behavioralStats: string[];
}

interface Creative {
    id: string;
    type: 'email' | 'push' | 'banner';
    title: string;
    content: string;
    preview: string;
}

export default function CampaignBuilder({ campaign, preselectedBrandId, onSuccess, onCancel }: CampaignBuilderProps) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Step 1: Campaign Goal
    const [campaignGoal, setCampaignGoal] = useState("");
    const [audienceCriteria, setAudienceCriteria] = useState("");
    const [aiSuggestedCriteria, setAiSuggestedCriteria] = useState("");

    // Step 2: Audience Segmentation
    const [recommendedSegments, setRecommendedSegments] = useState<AudienceSegment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<AudienceSegment | null>(null);

    // Step 3: Channel Selection
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    // Step 4: Creative Builder
    const [libraryCreatives, setLibraryCreatives] = useState<Creative[]>([]);
    const [selectedCreatives, setSelectedCreatives] = useState<Creative[]>([]);
    const [generatingCreatives, setGeneratingCreatives] = useState(false);

    // Step 5: Delivery Settings
    const [deliverySettings, setDeliverySettings] = useState({
        startDateTime: undefined as Date | undefined,
        endDateTime: undefined as Date | undefined,
        recurring: false,
        frequency: "daily" as 'daily' | 'weekly' | 'monthly',
        abTest: false,
        frequencyCap: 1
    });

    // Step 6 & 7: Campaign Summary
    const [campaignSummary, setCampaignSummary] = useState<any>(null);

    const steps = [
        { number: 1, title: "Goal", description: "Define campaign objective" },
        { number: 2, title: "Audience", description: "Select target segments" },
        { number: 3, title: "Channels", description: "Choose delivery channels" },
        { number: 4, title: "Creative", description: "Build campaign assets" },
        { number: 5, title: "Delivery", description: "Configure settings" },
        { number: 6, title: "Review", description: "Review and activate" }
    ];

    const channelOptions = [
        { id: "email", name: "Email", icon: Mail, description: "Send targeted email campaigns" },
        { id: "push", name: "Push Notification", icon: Bell, description: "Mobile push notifications" },
        { id: "web", name: "Web Banner", icon: Monitor, description: "Website banner advertisements" }
    ];

    useEffect(() => {
        if (user) {
            loadBrands();
        }
    }, [user]);

    useEffect(() => {
        if (campaignGoal && campaignGoal.length > 10) {
            generateAudienceSuggestion();
        }
    }, [campaignGoal]);

    const loadBrands = async () => {
        if (!user) return;
        try {
            const brandsData = await brandService.getUserBrands(user.$id);
            setBrands(brandsData);
        } catch (error) {
            console.error("Error loading brands:", error);
        }
    };

    const generateAudienceSuggestion = async () => {
        try {
            // Simulate AI suggestion based on campaign goal
            const suggestions = {
                "10% off on coconuts": "Frequent coconut buyers",
                "summer sale": "Seasonal shoppers and summer product enthusiasts",
                "new product launch": "Early adopters and brand loyalists",
                "membership drive": "High-value customers and frequent visitors"
            };
            
            const suggestion = Object.entries(suggestions).find(([key]) => 
                campaignGoal.toLowerCase().includes(key.toLowerCase())
            )?.[1] || "Active customers who match your campaign objective";
            
            setAiSuggestedCriteria(suggestion);
            if (!audienceCriteria) {
                setAudienceCriteria(suggestion);
            }
        } catch (error) {
            console.error("Error generating audience suggestion:", error);
        }
    };

    const generateAudienceSegments = async () => {
        setIsLoading(true);
        try {
            // Simulate AI-generated audience segments based on criteria
            const mockSegments: AudienceSegment[] = [
                {
                    id: "segment-1",
                    name: "High-Value Frequent Buyers",
                    userCount: 1247,
                    description: "Users who frequently purchase coconuts and have high order values",
                    behavioralStats: ["Avg. order value: $45", "Purchase frequency: Every 2 weeks", "Last purchase: Within 7 days"]
                },
                {
                    id: "segment-2", 
                    name: "Coconut Enthusiasts",
                    userCount: 856,
                    description: "Regular coconut buyers with consistent purchase patterns",
                    behavioralStats: ["Avg. order value: $28", "Purchase frequency: Monthly", "Product affinity: 85%"]
                },
                {
                    id: "segment-3",
                    name: "Price-Sensitive Shoppers",
                    userCount: 2103,
                    description: "Users who respond well to discounts and promotions",
                    behavioralStats: ["Promotion response rate: 78%", "Discount sensitivity: High", "Seasonal buyers"]
                }
            ];
            setRecommendedSegments(mockSegments);
        } catch (error) {
            setError("Failed to generate audience segments");
        } finally {
            setIsLoading(false);
        }
    };

    const generateCreatives = async () => {
        setGeneratingCreatives(true);
        try {
            // Simulate AI creative generation
            const mockCreatives: Creative[] = [];
            
            if (selectedChannels.includes("email")) {
                mockCreatives.push({
                    id: "email-1",
                    type: "email",
                    title: "10% Off Coconuts - Limited Time!",
                    content: "Subject: Fresh coconuts with 10% off just for you!\n\nBody: Don't miss out on this exclusive offer...",
                    preview: "Email template with coconut imagery and discount offer"
                });
            }
            
            if (selectedChannels.includes("push")) {
                mockCreatives.push({
                    id: "push-1",
                    type: "push",
                    title: "🥥 10% off coconuts now!",
                    content: "Limited time offer on fresh coconuts. Tap to shop now!",
                    preview: "Push notification with coconut emoji and urgency"
                });
            }
            
            if (selectedChannels.includes("web")) {
                mockCreatives.push({
                    id: "banner-1",
                    type: "banner",
                    title: "Fresh Coconuts - 10% Off",
                    content: "Banner design with tropical theme and call-to-action button",
                    preview: "Web banner with coconut imagery and discount badge"
                });
            }
            
            setSelectedCreatives(mockCreatives);
        } catch (error) {
            setError("Failed to generate creatives");
        } finally {
            setGeneratingCreatives(false);
        }
    };

    const handleNextStep = async () => {
        if (currentStep === 1 && !campaignGoal.trim()) {
            setError("Please enter a campaign goal");
            return;
        }
        
        if (currentStep === 2 && !selectedSegment) {
            if (recommendedSegments.length === 0) {
                await generateAudienceSegments();
                return;
            }
            setError("Please select an audience segment");
            return;
        }
        
        if (currentStep === 3 && selectedChannels.length === 0) {
            setError("Please select at least one channel");
            return;
        }
        
        if (currentStep === 4 && selectedCreatives.length === 0) {
            await generateCreatives();
            return;
        }
        
        if (currentStep === 5) {
            // Generate campaign summary
            setCampaignSummary({
                goal: campaignGoal,
                audience: selectedSegment,
                channels: selectedChannels,
                creatives: selectedCreatives,
                delivery: deliverySettings
            });
        }
        
        setError("");
        setCurrentStep(prev => Math.min(prev + 1, 6));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError("");
    };

    const handleChannelToggle = (channelId: string) => {
        setSelectedChannels(prev => 
            prev.includes(channelId) 
                ? prev.filter(id => id !== channelId)
                : [...prev, channelId]
        );
    };

    const activateCampaign = async () => {
        setIsLoading(true);
        try {
            // Create campaign object
            const campaignData = {
                name: campaignGoal.substring(0, 50),
                description: `Campaign targeting ${selectedSegment?.name} via ${selectedChannels.join(", ")}`,
                status: "active" as const,
                userId: user!.$id,
                brandId: preselectedBrandId || brands[0]?.$id || "",
                productName: "Campaign Product",
                productDescription: campaignGoal,
                productCategory: "General",
                campaignGoals: [campaignGoal],
                targetAudience: selectedSegment?.description || "",
                callToAction: "Take action now",
                targetPlatforms: selectedChannels,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const newCampaign = await campaignService.createCampaign(campaignData);
            onSuccess(newCampaign);
        } catch (error) {
            setError("Failed to activate campaign");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Target className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Define Your Campaign Goal</h2>
                            <p className="text-gray-600 dark:text-gray-400">What do you want to achieve with this campaign?</p>
                        </div>

                        <div className="max-w-md mx-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Campaign Goal
                                </label>
                                <input
                                    type="text"
                                    value={campaignGoal}
                                    onChange={(e) => setCampaignGoal(e.target.value)}
                                    placeholder="e.g., 10% off on coconuts"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                />
                            </div>

                            {aiSuggestedCriteria && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start space-x-2">
                                        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">AI Suggestion</p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">{aiSuggestedCriteria}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Target Audience Criteria
                                </label>
                                <textarea
                                    value={audienceCriteria}
                                    onChange={(e) => setAudienceCriteria(e.target.value)}
                                    placeholder="Describe your target audience..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Users className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Your Audience</h2>
                            <p className="text-gray-600 dark:text-gray-400">Choose the best audience segment for your campaign</p>
                        </div>

                        {recommendedSegments.length === 0 ? (
                            <div className="text-center py-8">
                                <button
                                    onClick={generateAudienceSegments}
                                    disabled={isLoading}
                                    className="btn-primary flex items-center mx-auto"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 mr-2" />
                                    )}
                                    Generate Audience Segments
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4 max-w-4xl mx-auto">
                                {recommendedSegments.map((segment) => (
                                    <div
                                        key={segment.id}
                                        onClick={() => setSelectedSegment(segment)}
                                        className={`p-6 border rounded-lg cursor-pointer transition-all ${
                                            selectedSegment?.id === segment.id
                                                ? "border-[#7A7FEE] bg-[#7A7FEE]/5"
                                                : "border-gray-200 dark:border-gray-700 hover:border-[#7A7FEE]/50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {segment.name}
                                            </h3>
                                            <span className="text-sm font-medium text-[#7A7FEE] bg-[#7A7FEE]/10 px-2 py-1 rounded-full">
                                                {segment.userCount.toLocaleString()} users
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">{segment.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {segment.behavioralStats.map((stat, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                                                >
                                                    {stat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Send className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Channels</h2>
                            <p className="text-gray-600 dark:text-gray-400">Select how you want to reach your audience</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {channelOptions.map((channel) => {
                                const Icon = channel.icon;
                                const isSelected = selectedChannels.includes(channel.id);
                                
                                return (
                                    <div
                                        key={channel.id}
                                        onClick={() => handleChannelToggle(channel.id)}
                                        className={`p-6 border rounded-lg cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-[#7A7FEE] bg-[#7A7FEE]/5"
                                                : "border-gray-200 dark:border-gray-700 hover:border-[#7A7FEE]/50"
                                        }`}
                                    >
                                        <div className="text-center">
                                            <Icon className={`w-8 h-8 mx-auto mb-3 ${
                                                isSelected ? "text-[#7A7FEE]" : "text-gray-400"
                                            }`} />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {channel.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {channel.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <ImageIcon className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Build Creatives</h2>
                            <p className="text-gray-600 dark:text-gray-400">Generate content for your selected channels</p>
                        </div>

                        {selectedCreatives.length === 0 ? (
                            <div className="text-center py-8">
                                <button
                                    onClick={generateCreatives}
                                    disabled={generatingCreatives}
                                    className="btn-primary flex items-center mx-auto"
                                >
                                    {generatingCreatives ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 mr-2" />
                                    )}
                                    Generate Creatives
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4 max-w-4xl mx-auto">
                                {selectedCreatives.map((creative) => (
                                    <div
                                        key={creative.id}
                                        className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {creative.title}
                                            </h3>
                                            <span className="text-xs bg-[#7A7FEE]/10 text-[#7A7FEE] px-2 py-1 rounded-full uppercase">
                                                {creative.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">{creative.preview}</p>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                                            <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                                {creative.content}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Calendar className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Settings</h2>
                            <p className="text-gray-600 dark:text-gray-400">Configure when and how your campaign runs</p>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-6">
                            {/* Date and Time Range */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campaign Start
                                    </label>
                                    <DateTimePicker
                                        date={deliverySettings.startDateTime}
                                        onDateTimeChange={(date) => setDeliverySettings(prev => ({ ...prev, startDateTime: date }))}
                                        placeholder="Select start date and time"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campaign End
                                    </label>
                                    <DateTimePicker
                                        date={deliverySettings.endDateTime}
                                        onDateTimeChange={(date) => setDeliverySettings(prev => ({ ...prev, endDateTime: date }))}
                                        placeholder="Select end date and time"
                                    />
                                </div>
                            </div>

                            {/* Recurrence */}
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recurring Campaign</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Run this campaign on a schedule</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={deliverySettings.recurring}
                                        onChange={(e) => setDeliverySettings(prev => ({ ...prev, recurring: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7A7FEE]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#7A7FEE]"></div>
                                </label>
                            </div>

                            {/* Frequency Cap */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Frequency Cap (messages per user per day)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={deliverySettings.frequencyCap}
                                    onChange={(e) => setDeliverySettings(prev => ({ ...prev, frequencyCap: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <CheckCircle className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review & Activate</h2>
                            <p className="text-gray-600 dark:text-gray-400">Review your campaign before activation</p>
                        </div>

                        {campaignSummary && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Campaign Goal */}
                                <div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Campaign Goal</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{campaignSummary.goal}</p>
                                </div>

                                {/* Selected Segment */}
                                <div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Target Audience</h3>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{campaignSummary.audience.name}</p>
                                            <p className="text-gray-600 dark:text-gray-400">{campaignSummary.audience.description}</p>
                                        </div>
                                        <span className="text-sm font-medium text-[#7A7FEE] bg-[#7A7FEE]/10 px-2 py-1 rounded-full">
                                            {campaignSummary.audience.userCount.toLocaleString()} users
                                        </span>
                                    </div>
                                </div>

                                {/* Channels */}
                                <div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Channels</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {campaignSummary.channels.map((channel: string) => (
                                            <span
                                                key={channel}
                                                className="px-3 py-1 bg-[#7A7FEE]/10 text-[#7A7FEE] rounded-full text-sm capitalize"
                                            >
                                                {channel}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Creatives Preview */}
                                <div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Creatives</h3>
                                    <div className="space-y-3">
                                        {campaignSummary.creatives.map((creative: Creative) => (
                                            <div key={creative.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{creative.title}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{creative.type}</p>
                                                </div>
                                                <button className="text-[#7A7FEE] hover:text-[#6366f1] text-sm">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Schedule */}
                                <div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Delivery Schedule</h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Start: </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {campaignSummary.delivery.startDateTime 
                                                    ? format(campaignSummary.delivery.startDateTime, "PPP 'at' HH:mm")
                                                    : "Not set"
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">End: </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {campaignSummary.delivery.endDateTime 
                                                    ? format(campaignSummary.delivery.endDateTime, "PPP 'at' HH:mm")
                                                    : "Not set"
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Frequency Cap: </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {campaignSummary.delivery.frequencyCap} messages/day
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Recurring: </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {campaignSummary.delivery.recurring ? "Yes" : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center space-x-4 pt-6">
                                    <button
                                        onClick={activateCampaign}
                                        disabled={isLoading}
                                        className="btn-primary flex items-center px-8 py-3"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Activating...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Activate Campaign
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );



            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111111] p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {campaign ? "Edit Campaign" : "Campaign Builder"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Follow the steps to create and launch your campaign
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                    currentStep > step.number
                                        ? "bg-[#7A7FEE] border-[#7A7FEE] text-white"
                                        : currentStep === step.number
                                        ? "border-[#7A7FEE] text-[#7A7FEE] bg-white dark:bg-gray-900"
                                        : "border-gray-300 dark:border-gray-600 text-gray-400"
                                }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <span className="text-sm font-medium">{step.number}</span>
                                    )}
                                </div>
                                <div className="ml-2 hidden sm:block">
                                    <p className={`text-sm font-medium ${
                                        currentStep >= step.number
                                            ? "text-gray-900 dark:text-white"
                                            : "text-gray-400"
                                    }`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {step.description}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-4 ${
                                        currentStep > step.number
                                            ? "bg-[#7A7FEE]"
                                            : "bg-gray-300 dark:bg-gray-600"
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <Info className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Step Content */}
                <div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-8">
                    {renderStepContent()}
                </div>

                {/* Navigation */}
                {currentStep < 6 && (
                    <div className="flex justify-between">
                        <button
                            onClick={handlePrevStep}
                            disabled={currentStep === 1}
                            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </button>

                        <button
                            onClick={handleNextStep}
                            disabled={isLoading}
                            className="btn-primary flex items-center"
                        >
                            Next Step
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                )}
                
                {/* Step 6 has its own navigation in the step content */}
                {currentStep === 6 && (
                    <div className="flex justify-start">
                        <button
                            onClick={handlePrevStep}
                            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
