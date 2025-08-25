"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { useAuth } from "@/lib/auth-context";
import { campaignService, brandService } from "@/lib/appwrite";
import type { Campaign, Brand } from "@/lib/appwrite";
import {
	Loader2,
	X,
	ArrowRight,
	ArrowLeft,
	Target,
	Users,
	Send,
	Image as ImageIcon,
	CheckCircle,
	Sparkles,
	Eye,
	Mail,
	Bell,
	Monitor,
	Play,
	Info,
	BarChart3,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-time-picker";
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
	type: "email" | "push" | "banner";
	title: string;
	content: string;
	preview: string;
}

interface CampaignSummary {
	name: string;
	goal: string;
	duration: {
		startDate: Date | undefined;
		endDate: Date | undefined;
		timezone: string;
		isOngoing: boolean;
	};
	audience: AudienceSegment[];
	channels: string[];
	creatives: Creative[];
	channelDelivery: {
		mobile: {
			enabled: boolean;
			sendTime: string;
			frequency: "daily" | "weekly" | "monthly";
			frequencyCap: number;
			dayOfWeek: number;
			dayOfMonth: number;
			weekdays: number[];
			customSchedule: { day: string; time: string }[];
		};
		web: {
			enabled: boolean;
			displaySchedule: "always" | "scheduled";
			startTime: string;
			endTime: string;
			daysOfWeek: number[];
			impressionCap: number;
		};
	};
}

export default function CampaignBuilder({
	campaign,
	preselectedBrandId,
	onSuccess,
	onCancel,
}: CampaignBuilderProps) {
	const { user } = useAuth();
	const campaignNameId = useId();
	const campaignGoalId = useId();
	const audienceCriteriaId = useId();
	const timezoneId = useId();
	const mobileSendTimeId = useId();
	const mobileFrequencyId = useId();
	const activeDaysId = useId();
	const webDisplayScheduleId = useId();
	const webStartTimeId = useId();
	const webEndTimeId = useId();
	const dailyFrequencyCapId = useId();
	const weeklyFrequencyCapId = useId();
	const monthlyFrequencyCapId = useId();

	const [currentStep, setCurrentStep] = useState(1);
	const [brands, setBrands] = useState<Brand[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// Step 1: Campaign Details
	const [campaignName, setCampaignName] = useState("");
	const [campaignGoal, setCampaignGoal] = useState("");
	const [audienceCriteria, setAudienceCriteria] = useState("");
	const [aiSuggestedCriteria, setAiSuggestedCriteria] = useState("");
	const [campaignDuration, setCampaignDuration] = useState({
		startDate: undefined as Date | undefined,
		endDate: undefined as Date | undefined,
		timezone: "UTC",
		isOngoing: false,
	});

	// Step 2: Audience Segmentation
	const [recommendedSegments, setRecommendedSegments] = useState<
		AudienceSegment[]
	>([]);
	const [selectedSegments, setSelectedSegments] = useState<AudienceSegment[]>(
		[],
	);
	const [showAllSegments, setShowAllSegments] = useState(false);
	const [loadingSegments, setLoadingSegments] = useState(false);

	// Step 4: Channel Selection
	const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

	// Step 5: Creative Builder
	const [selectedCreatives, setSelectedCreatives] = useState<Creative[]>([]);
	const [generatingCreatives, setGeneratingCreatives] = useState(false);

	// Step 4: Delivery Settings (Channel-specific)
	const [channelDeliverySettings, setChannelDeliverySettings] = useState({
		mobile: {
			enabled: false,
			sendTime: "09:00",
			frequency: "daily" as "daily" | "weekly" | "monthly",
			frequencyCap: 1,
			dayOfWeek: 1, // Monday
			dayOfMonth: 1,
			weekdays: [1, 2, 3, 4, 5], // Monday to Friday
			customSchedule: [] as { day: string; time: string }[],
		},
		web: {
			enabled: false,
			displaySchedule: "always" as "always" | "scheduled",
			startTime: "00:00",
			endTime: "23:59",
			daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
			impressionCap: 10,
		},
	});

	// Step 6 & 7: Campaign Summary
	const [campaignSummary, setCampaignSummary] =
		useState<CampaignSummary | null>(null);

	// Global Frequency Caps
	const [frequencyCaps, setFrequencyCaps] = useState({
		daily: 3,
		weekly: 10,
		monthly: 30,
	});

	const steps = [
		{ number: 1, title: "Setup", description: "Campaign details & timeline" },
		{ number: 2, title: "Audience", description: "Select target segments" },
		{ number: 3, title: "Channels", description: "Choose delivery channels" },
		{ number: 4, title: "Creative", description: "Build campaign assets" },
		{ number: 5, title: "Delivery", description: "Configure channel settings" },
		{ number: 6, title: "Review", description: "Review and activate" },
	];

	const channelOptions = [
		{
			id: "email",
			name: "Email",
			icon: Mail,
			description: "Send targeted email campaigns",
		},
		{
			id: "push",
			name: "Push Notification",
			icon: Bell,
			description: "Mobile push notifications",
		},
		{
			id: "web",
			name: "Web Banner",
			icon: Monitor,
			description: "Website banner advertisements",
		},
	];

	useEffect(() => {
		// Auto-enable channel delivery settings when channels are selected
		setChannelDeliverySettings((prev) => ({
			...prev,
			mobile: {
				...prev.mobile,
				enabled:
					selectedChannels.includes("email") ||
					selectedChannels.includes("push"),
			},
			web: { ...prev.web, enabled: selectedChannels.includes("web") },
		}));
	}, [selectedChannels]);

	const loadBrands = useCallback(async () => {
		if (!user) return;
		try {
			const brandsData = await brandService.getUserBrands(user.$id);
			setBrands(brandsData);
		} catch (error) {
			console.error("Error loading brands:", error);
		}
	}, [user]);

	const generateAudienceSuggestion = useCallback(async () => {
		try {
			// Simulate AI suggestion based on campaign goal
			const suggestions = {
				"10% off on coconuts": "Frequent coconut buyers",
				"summer sale": "Seasonal shoppers and summer product enthusiasts",
				"new product launch": "Early adopters and brand loyalists",
				"membership drive": "High-value customers and frequent visitors",
			};

			const suggestion =
				Object.entries(suggestions).find(([key]) =>
					campaignGoal.toLowerCase().includes(key.toLowerCase()),
				)?.[1] || "Active customers who match your campaign objective";

			setAiSuggestedCriteria(suggestion);
			if (!audienceCriteria) {
				setAudienceCriteria(suggestion);
			}
		} catch (error) {
			console.error("Error generating audience suggestion:", error);
		}
	}, [campaignGoal, audienceCriteria]);

	const generateAudienceSegments = useCallback(async () => {
		setLoadingSegments(true);
		try {
			// Simulate AI-generated audience segments based on criteria
			const mockSegments: AudienceSegment[] = [
				{
					id: "segment-1",
					name: "High-Value Frequent Buyers",
					userCount: 1247,
					description:
						"Users who frequently purchase coconuts and have high order values",
					behavioralStats: [
						"Avg. order value: $45",
						"Purchase frequency: Every 2 weeks",
						"Last purchase: Within 7 days",
					],
				},
				{
					id: "segment-2",
					name: "Coconut Enthusiasts",
					userCount: 856,
					description:
						"Regular coconut buyers with consistent purchase patterns",
					behavioralStats: [
						"Avg. order value: $28",
						"Purchase frequency: Monthly",
						"Product affinity: 85%",
					],
				},
				{
					id: "segment-3",
					name: "Price-Sensitive Shoppers",
					userCount: 2103,
					description: "Users who respond well to discounts and promotions",
					behavioralStats: [
						"Promotion response rate: 78%",
						"Discount sensitivity: High",
						"Seasonal buyers",
					],
				},
				{
					id: "segment-4",
					name: "New Customers",
					userCount: 543,
					description: "Recent customers with first-time purchase behavior",
					behavioralStats: [
						"First purchase: Within 30 days",
						"Browse time: 8 min avg",
						"Mobile preference: 70%",
					],
				},
				{
					id: "segment-5",
					name: "Seasonal Shoppers",
					userCount: 1876,
					description: "Customers who shop during specific seasons or events",
					behavioralStats: [
						"Holiday purchases: High",
						"Summer activity: Peak",
						"Seasonal trends: Strong",
					],
				},
			];
			setRecommendedSegments(mockSegments);
		} catch (_error) {
			console.error("Failed to generate audience segments:", _error);
			setError("Failed to generate audience segments");
		} finally {
			setLoadingSegments(false);
		}
	}, []);

	const generateCreatives = useCallback(async () => {
		setGeneratingCreatives(true);
		try {
			// Simulate AI creative generation
			const mockCreatives: Creative[] = [];

			if (selectedChannels.includes("email")) {
				mockCreatives.push({
					id: "email-1",
					type: "email",
					title: "10% Off Coconuts - Limited Time!",
					content:
						"Subject: Fresh coconuts with 10% off just for you!\n\nBody: Don't miss out on this exclusive offer...",
					preview: "Email template with coconut imagery and discount offer",
				});
			}

			if (selectedChannels.includes("push")) {
				mockCreatives.push({
					id: "push-1",
					type: "push",
					title: "🥥 10% off coconuts now!",
					content: "Limited time offer on fresh coconuts. Tap to shop now!",
					preview: "Push notification with coconut emoji and urgency",
				});
			}

			if (selectedChannels.includes("web")) {
				mockCreatives.push({
					id: "banner-1",
					type: "banner",
					title: "Fresh Coconuts - 10% Off",
					content:
						"Banner design with tropical theme and call-to-action button",
					preview: "Web banner with coconut imagery and discount badge",
				});
			}

			setSelectedCreatives(mockCreatives);
		} catch (error) {
			console.error("Failed to generate creatives:", error);
			setError("Failed to generate creatives");
		} finally {
			setGeneratingCreatives(false);
		}
	}, [selectedChannels]);

	useEffect(() => {
		if (user) {
			loadBrands();
		}
	}, [user, loadBrands]);

	useEffect(() => {
		if (campaignGoal && campaignGoal.length > 10) {
			generateAudienceSuggestion();
		}
	}, [campaignGoal, generateAudienceSuggestion]);

	useEffect(() => {
		// Auto-load audience segments when step 2 is reached
		if (
			currentStep === 2 &&
			recommendedSegments.length === 0 &&
			!loadingSegments
		) {
			generateAudienceSegments();
		}
	}, [
		currentStep,
		recommendedSegments.length,
		loadingSegments,
		generateAudienceSegments,
	]);

	useEffect(() => {
		// Auto-load creatives when step 4 is reached and channels are selected
		if (
			currentStep === 4 &&
			selectedChannels.length > 0 &&
			selectedCreatives.length === 0 &&
			!generatingCreatives
		) {
			generateCreatives();
		}
	}, [
		currentStep,
		selectedChannels.length,
		selectedCreatives.length,
		generatingCreatives,
		generateCreatives,
	]);

	const handleNextStep = async () => {
		if (currentStep === 1) {
			if (!campaignName.trim()) {
				setError("Please enter a campaign name");
				return;
			}
			if (!campaignGoal.trim()) {
				setError("Please enter a campaign goal");
				return;
			}
			if (
				!campaignDuration.isOngoing &&
				(!campaignDuration.startDate || !campaignDuration.endDate)
			) {
				setError("Please set campaign start and end dates, or mark as ongoing");
				return;
			}
			if (
				!campaignDuration.isOngoing &&
				campaignDuration.startDate &&
				campaignDuration.endDate &&
				campaignDuration.startDate >= campaignDuration.endDate
			) {
				setError("End date must be after start date");
				return;
			}
		}

		if (currentStep === 2 && selectedSegments.length === 0) {
			setError("Please select at least one audience segment");
			return;
		}

		if (currentStep === 3 && selectedChannels.length === 0) {
			setError("Please select at least one channel");
			return;
		}

		if (currentStep === 5) {
			// Generate campaign summary
			setCampaignSummary({
				name: campaignName,
				goal: campaignGoal,
				duration: campaignDuration,
				audience: selectedSegments,
				channels: selectedChannels,
				creatives: selectedCreatives,
				channelDelivery: channelDeliverySettings,
			});
		}

		setError("");
		setCurrentStep((prev) => Math.min(prev + 1, 6));
	};

	const handlePrevStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
		setError("");
	};

	const handleChannelToggle = (channelId: string) => {
		setSelectedChannels((prev) =>
			prev.includes(channelId)
				? prev.filter((id) => id !== channelId)
				: [...prev, channelId],
		);
	};

	const handleSegmentToggle = (segment: AudienceSegment) => {
		setSelectedSegments((prev) => {
			const isSelected = prev.some((s) => s.id === segment.id);
			if (isSelected) {
				return prev.filter((s) => s.id !== segment.id);
			} else {
				return [...prev, segment];
			}
		});
	};

	const activateCampaign = async () => {
		setIsLoading(true);
		try {
			// Create campaign object
			const campaignData = {
				name: campaignName || campaignGoal.substring(0, 50),
				description: `Campaign targeting ${selectedSegments.map((s) => s.name).join(", ")} via ${selectedChannels.join(", ")}`,
				status: "active" as const,
				userId: user?.$id || "",
				brandId: preselectedBrandId || brands[0]?.$id || "",
				productName: "Campaign Product",
				productDescription: campaignGoal,
				productCategory: "General",
				campaignGoals: [campaignGoal],
				targetAudience: selectedSegments.map((s) => s.description).join("; "),
				callToAction: "Take action now",
				targetPlatforms: selectedChannels,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			const newCampaign = await campaignService.createCampaign(campaignData);
			onSuccess(newCampaign);
		} catch (_error) {
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
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Campaign Setup
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Configure your campaign details and timeline
							</p>
						</div>

						<div className="max-w-2xl mx-auto space-y-6">
							<div>
								<label
									htmlFor={campaignNameId}
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Campaign Name
								</label>
								<input
									id={campaignNameId}
									type="text"
									value={campaignName}
									onChange={(e) => setCampaignName(e.target.value)}
									placeholder="e.g., Summer Sale 2024"
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
								/>
							</div>

							<div>
								<label
									htmlFor={campaignGoalId}
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Campaign Goal
								</label>
								<input
									id={campaignGoalId}
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
											<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
												AI Suggestion
											</p>
											<p className="text-sm text-blue-700 dark:text-blue-300">
												{aiSuggestedCriteria}
											</p>
										</div>
									</div>
								</div>
							)}

							<div>
								<label
									htmlFor={audienceCriteriaId}
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Target Audience Criteria
								</label>
								<textarea
									id={audienceCriteriaId}
									value={audienceCriteria}
									onChange={(e) => setAudienceCriteria(e.target.value)}
									placeholder="Describe your target audience..."
									rows={3}
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
								/>
							</div>

							{/* Campaign Duration */}
							<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
									Campaign Duration
								</h3>

								{/* Ongoing Campaign Toggle */}
								<div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
									<div>
										<h4 className="text-sm font-medium text-gray-900 dark:text-white">
											Ongoing Campaign
										</h4>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Run this campaign indefinitely
										</p>
									</div>
									<label className="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={campaignDuration.isOngoing}
											onChange={(e) =>
												setCampaignDuration((prev) => ({
													...prev,
													isOngoing: e.target.checked,
												}))
											}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7A7FEE]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#7A7FEE]"></div>
									</label>
								</div>

								{/* Date Range */}
								{!campaignDuration.isOngoing && (
									<div className="grid md:grid-cols-2 gap-4 mb-4">
										<div>
											<label
												htmlFor="startDate"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
											>
												Campaign Start Date
											</label>
											<DatePicker
												date={campaignDuration.startDate}
												onDateChange={(date) =>
													setCampaignDuration((prev) => ({
														...prev,
														startDate: date,
													}))
												}
												placeholder="Select start date"
											/>
										</div>
										<div>
											<label
												htmlFor="endDate"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
											>
												Campaign End Date
											</label>
											<DatePicker
												date={campaignDuration.endDate}
												onDateChange={(date) =>
													setCampaignDuration((prev) => ({
														...prev,
														endDate: date,
													}))
												}
												placeholder="Select end date"
											/>
										</div>
									</div>
								)}

								{/* Timezone */}
								<div>
									<label
										htmlFor={timezoneId}
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
									>
										Campaign Timezone
									</label>
									<select
										id={timezoneId}
										value={campaignDuration.timezone}
										onChange={(e) =>
											setCampaignDuration((prev) => ({
												...prev,
												timezone: e.target.value,
											}))
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
									>
										<option value="UTC">UTC</option>
										<option value="America/New_York">Eastern Time (ET)</option>
										<option value="America/Chicago">Central Time (CT)</option>
										<option value="America/Denver">Mountain Time (MT)</option>
										<option value="America/Los_Angeles">
											Pacific Time (PT)
										</option>
										<option value="Europe/London">London (GMT)</option>
										<option value="Europe/Paris">Paris (CET)</option>
										<option value="Asia/Tokyo">Tokyo (JST)</option>
										<option value="Asia/Shanghai">Beijing (CST)</option>
										<option value="Australia/Sydney">Sydney (AEST)</option>
									</select>
								</div>

								{/* Duration Summary */}
								{campaignDuration.startDate &&
									campaignDuration.endDate &&
									!campaignDuration.isOngoing && (
										<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
											<div className="flex items-center space-x-2">
												<Info className="w-5 h-5 text-blue-600" />
												<div>
													<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
														Campaign Duration
													</p>
													<p className="text-sm text-blue-700 dark:text-blue-300">
														{Math.ceil(
															(campaignDuration.endDate.getTime() -
																campaignDuration.startDate.getTime()) /
																(1000 * 60 * 60 * 24),
														)}{" "}
														days ({format(campaignDuration.startDate, "MMM d")}{" "}
														- {format(campaignDuration.endDate, "MMM d, yyyy")})
													</p>
												</div>
											</div>
										</div>
									)}
							</div>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						<div className="text-center mb-8">
							<Users className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Select Your Audience
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Choose one or more audience segments for your campaign
							</p>
						</div>

						{loadingSegments ? (
							<div className="text-center py-12">
								<Loader2 className="w-8 h-8 text-[#7A7FEE] animate-spin mx-auto mb-4" />
								<p className="text-gray-600 dark:text-gray-400">
									Analyzing your audience and generating segments...
								</p>
							</div>
						) : (
							<div className="max-w-4xl mx-auto space-y-4">
								{/* Show All Segments Toggle */}
								<div className="flex justify-between items-center mb-4">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
											{showAllSegments
												? "All Audience Segments"
												: "Recommended Segments"}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{selectedSegments.length} segment
											{selectedSegments.length !== 1 ? "s" : ""} selected
										</p>
									</div>
									<button
										type="button"
										onClick={() => setShowAllSegments(!showAllSegments)}
										className="text-[#7A7FEE] hover:text-[#6366f1] text-sm font-medium"
									>
										{showAllSegments ? "Show Recommended" : "Show All Segments"}
									</button>
								</div>

								<div className="grid gap-4">
									{(showAllSegments
										? recommendedSegments
										: recommendedSegments.slice(0, 3)
									).map((segment) => {
										const isSelected = selectedSegments.some(
											(s) => s.id === segment.id,
										);
										return (
											<button
												key={segment.id}
												type="button"
												onClick={() => handleSegmentToggle(segment)}
												className={`text-left p-6 border rounded-lg cursor-pointer transition-all ${
													isSelected
														? "border-[#7A7FEE] bg-[#7A7FEE]/5"
														: "border-gray-200 dark:border-gray-700 hover:border-[#7A7FEE]/50"
												}`}
											>
												<div className="flex justify-between items-start mb-3">
													<div className="flex items-center space-x-3">
														<div
															className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
																isSelected
																	? "bg-[#7A7FEE] border-[#7A7FEE]"
																	: "border-gray-300 dark:border-gray-600"
															}`}
														>
															{isSelected && (
																<CheckCircle className="w-3 h-3 text-white" />
															)}
														</div>
														<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
															{segment.name}
														</h3>
													</div>
													<span className="text-sm font-medium text-[#7A7FEE] bg-[#7A7FEE]/10 px-2 py-1 rounded-full">
														{segment.userCount.toLocaleString()} users
													</span>
												</div>
												<p className="text-gray-600 dark:text-gray-400 mb-3">
													{segment.description}
												</p>
												<div className="flex flex-wrap gap-2">
													{segment.behavioralStats.map((stat, statIndex) => (
														<span
															key={`${segment.id}-stat-${statIndex}`}
															className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
														>
															{stat}
														</span>
													))}
												</div>
											</button>
										);
									})}
								</div>

								{selectedSegments.length > 0 && (
									<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
										<div className="flex items-center space-x-2 mb-2">
											<Info className="w-5 h-5 text-blue-600" />
											<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
												Selected Audience Summary
											</p>
										</div>
										<p className="text-sm text-blue-700 dark:text-blue-300">
											Total reach:{" "}
											{selectedSegments
												.reduce(
													(total, segment) => total + segment.userCount,
													0,
												)
												.toLocaleString()}{" "}
											users across {selectedSegments.length} segment
											{selectedSegments.length !== 1 ? "s" : ""}
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						<div className="text-center mb-8">
							<Send className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Choose Channels
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Select how you want to reach your audience
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
							{channelOptions.map((channel) => {
								const Icon = channel.icon;
								const isSelected = selectedChannels.includes(channel.id);

								return (
									<button
										key={channel.id}
										type="button"
										onClick={() => handleChannelToggle(channel.id)}
										className={`p-6 border rounded-lg cursor-pointer transition-all ${
											isSelected
												? "border-[#7A7FEE] bg-[#7A7FEE]/5"
												: "border-gray-200 dark:border-gray-700 hover:border-[#7A7FEE]/50"
										}`}
									>
										<div className="text-center">
											<Icon
												className={`w-8 h-8 mx-auto mb-3 ${
													isSelected ? "text-[#7A7FEE]" : "text-gray-400"
												}`}
											/>
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
												{channel.name}
											</h3>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{channel.description}
											</p>
										</div>
									</button>
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
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Campaign Creatives
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								AI-generated content for your selected channels
							</p>
						</div>

						{generatingCreatives ? (
							<div className="text-center py-12">
								<Loader2 className="w-8 h-8 text-[#7A7FEE] animate-spin mx-auto mb-4" />
								<p className="text-gray-600 dark:text-gray-400">
									Generating creative content for your campaign...
								</p>
							</div>
						) : selectedCreatives.length === 0 ? (
							<div className="text-center py-8">
								<button
									type="button"
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
							<div className="grid gap-6 max-w-4xl mx-auto">
								{selectedCreatives.map((creative) => (
									<div
										key={creative.id}
										className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#272829]"
									>
										<div className="flex justify-between items-start mb-4">
											<div className="flex items-center space-x-3">
												{creative.type === "email" && (
													<Mail className="w-6 h-6 text-[#7A7FEE]" />
												)}
												{creative.type === "push" && (
													<Bell className="w-6 h-6 text-[#7A7FEE]" />
												)}
												{creative.type === "banner" && (
													<Monitor className="w-6 h-6 text-[#7A7FEE]" />
												)}
												<div>
													<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
														{creative.title}
													</h3>
													<span className="text-xs bg-[#7A7FEE]/10 text-[#7A7FEE] px-2 py-1 rounded-full uppercase">
														{creative.type}
													</span>
												</div>
											</div>
											<button
												type="button"
												className="text-[#7A7FEE] hover:text-[#6366f1] text-sm flex items-center space-x-1"
											>
												<Eye className="w-4 h-4" />
												<span>Preview</span>
											</button>
										</div>
										<p className="text-gray-600 dark:text-gray-400 mb-4">
											{creative.preview}
										</p>
										<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
											<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
												Content:
											</h4>
											<pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
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
							<BarChart3 className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Delivery Settings
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Configure delivery settings for your marketing channels
							</p>
						</div>

						<div className="max-w-4xl mx-auto space-y-6">
							{/* Mobile Channels (Email & Push) Combined Settings */}
							{(selectedChannels.includes("email") ||
								selectedChannels.includes("push")) && (
								<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
									<div className="flex items-center mb-6">
										<div className="flex items-center space-x-3">
											<Mail className="w-6 h-6 text-[#7A7FEE]" />
											<Bell className="w-6 h-6 text-[#7A7FEE]" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
											Mobile & Email Settings
										</h3>
									</div>

									<div className="grid md:grid-cols-2 gap-6">
										<div>
											<label
												htmlFor={mobileSendTimeId}
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
											>
												Send Time
											</label>
											<input
												id={mobileSendTimeId}
												type="time"
												value={channelDeliverySettings.mobile.sendTime}
												onChange={(e) =>
													setChannelDeliverySettings((prev) => ({
														...prev,
														mobile: {
															...prev.mobile,
															sendTime: e.target.value,
														},
													}))
												}
												className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
											/>
										</div>
										<div>
											<label
												htmlFor={mobileFrequencyId}
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
											>
												Frequency
											</label>
											<select
												id={mobileFrequencyId}
												value={channelDeliverySettings.mobile.frequency}
												onChange={(e) =>
													setChannelDeliverySettings((prev) => ({
														...prev,
														mobile: {
															...prev.mobile,
															frequency: e.target.value as
																| "daily"
																| "weekly"
																| "monthly",
														},
													}))
												}
												className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
											>
												<option value="daily">Daily</option>
												<option value="weekly">Weekly</option>
												<option value="monthly">Monthly</option>
											</select>
										</div>

										{/* Weekdays Selection - Only show when frequency is weekly */}
										{channelDeliverySettings.mobile.frequency === "weekly" && (
											<div>
												<label
													htmlFor={activeDaysId}
													className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
												>
													Active Days
												</label>
												<div className="flex flex-wrap gap-2" id={activeDaysId}>
													{[
														"Mon",
														"Tue",
														"Wed",
														"Thu",
														"Fri",
														"Sat",
														"Sun",
													].map((day, index) => {
														const dayNumber = index + 1;
														const isSelected =
															channelDeliverySettings.mobile.weekdays.includes(
																dayNumber,
															);
														return (
															<button
																key={day}
																type="button"
																onClick={() => {
																	setChannelDeliverySettings((prev) => ({
																		...prev,
																		mobile: {
																			...prev.mobile,
																			weekdays: isSelected
																				? prev.mobile.weekdays.filter(
																						(d) => d !== dayNumber,
																					)
																				: [...prev.mobile.weekdays, dayNumber],
																		},
																	}));
																}}
																className={`px-3 py-1 text-sm rounded-full border transition-colors ${
																	isSelected
																		? "bg-[#7A7FEE] border-[#7A7FEE] text-white"
																		: "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#7A7FEE]"
																}`}
															>
																{day}
															</button>
														);
													})}
												</div>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Web Banner Settings */}
							{selectedChannels.includes("web") && (
								<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
									<div className="flex items-center mb-6">
										<Monitor className="w-6 h-6 text-[#7A7FEE] mr-3" />
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
											Web Banner Settings
										</h3>
									</div>

									<div className="grid md:grid-cols-1 gap-6">
										<div>
											<label
												htmlFor={webDisplayScheduleId}
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
											>
												Display Schedule
											</label>
											<select
												id={webDisplayScheduleId}
												value={channelDeliverySettings.web.displaySchedule}
												onChange={(e) =>
													setChannelDeliverySettings((prev) => ({
														...prev,
														web: {
															...prev.web,
															displaySchedule: e.target.value as
																| "always"
																| "scheduled",
														},
													}))
												}
												className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
											>
												<option value="always">Always Display</option>
												<option value="scheduled">Scheduled Hours</option>
											</select>
										</div>

										{channelDeliverySettings.web.displaySchedule ===
											"scheduled" && (
											<>
												<div>
													<label
														htmlFor={webStartTimeId}
														className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
													>
														Start Time
													</label>
													<input
														id={webStartTimeId}
														type="time"
														value={channelDeliverySettings.web.startTime}
														onChange={(e) =>
															setChannelDeliverySettings((prev) => ({
																...prev,
																web: { ...prev.web, startTime: e.target.value },
															}))
														}
														className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
													/>
												</div>
												<div>
													<label
														htmlFor={webEndTimeId}
														className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
													>
														End Time
													</label>
													<input
														id={webEndTimeId}
														type="time"
														value={channelDeliverySettings.web.endTime}
														onChange={(e) =>
															setChannelDeliverySettings((prev) => ({
																...prev,
																web: { ...prev.web, endTime: e.target.value },
															}))
														}
														className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
													/>
												</div>
											</>
										)}
									</div>
								</div>
							)}

							{/* Global Frequency Caps */}
							<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
								<div className="flex items-center mb-6">
									<BarChart3 className="w-6 h-6 text-[#7A7FEE] mr-3" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Frequency Cap Settings
									</h3>
								</div>

								<div className="grid md:grid-cols-3 gap-6">
									<div>
										<label
											htmlFor={dailyFrequencyCapId}
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
										>
											Daily Cap
										</label>
										<input
											id={dailyFrequencyCapId}
											type="number"
											min="1"
											max="20"
											value={frequencyCaps.daily}
											onChange={(e) =>
												setFrequencyCaps((prev) => ({
													...prev,
													daily: parseInt(e.target.value),
												}))
											}
											className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											Max messages per day
										</p>
									</div>
									<div>
										<label
											htmlFor={weeklyFrequencyCapId}
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
										>
											Weekly Cap
										</label>
										<input
											id={weeklyFrequencyCapId}
											type="number"
											min="1"
											max="100"
											value={frequencyCaps.weekly}
											onChange={(e) =>
												setFrequencyCaps((prev) => ({
													...prev,
													weekly: parseInt(e.target.value),
												}))
											}
											className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											Max messages per week
										</p>
									</div>
									<div>
										<label
											htmlFor={monthlyFrequencyCapId}
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
										>
											Monthly Cap
										</label>
										<input
											id={monthlyFrequencyCapId}
											type="number"
											min="1"
											max="500"
											value={frequencyCaps.monthly}
											onChange={(e) =>
												setFrequencyCaps((prev) => ({
													...prev,
													monthly: parseInt(e.target.value),
												}))
											}
											className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent"
										/>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											Max messages per month
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				);

			case 6:
				return (
					<div className="space-y-6">
						<div className="text-center mb-8">
							<CheckCircle className="w-12 h-12 text-[#7A7FEE] mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Review & Activate
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Review your campaign before activation
							</p>
						</div>

						{campaignSummary && (
							<div className="max-w-4xl mx-auto space-y-6">
								{/* Campaign Name & Goal */}
								<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
										Campaign Details
									</h3>
									<div className="space-y-2">
										<div>
											<span className="text-gray-600 dark:text-gray-400">
												Name:{" "}
											</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{campaignSummary.name}
											</span>
										</div>
										<div>
											<span className="text-gray-600 dark:text-gray-400">
												Goal:{" "}
											</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{campaignSummary.goal}
											</span>
										</div>
									</div>
								</div>

								{/* Campaign Duration */}
								<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
										Campaign Duration
									</h3>
									<div className="grid md:grid-cols-2 gap-4 text-sm">
										{campaignSummary.duration.isOngoing ? (
											<div className="col-span-2">
												<span className="text-gray-600 dark:text-gray-400">
													Duration:{" "}
												</span>
												<span className="font-medium text-green-600 dark:text-green-400">
													Ongoing Campaign
												</span>
											</div>
										) : (
											<>
												<div>
													<span className="text-gray-600 dark:text-gray-400">
														Start:{" "}
													</span>
													<span className="font-medium text-gray-900 dark:text-white">
														{campaignSummary.duration.startDate
															? format(
																	campaignSummary.duration.startDate,
																	"PPP",
																)
															: "Not set"}
													</span>
												</div>
												<div>
													<span className="text-gray-600 dark:text-gray-400">
														End:{" "}
													</span>
													<span className="font-medium text-gray-900 dark:text-white">
														{campaignSummary.duration.endDate
															? format(campaignSummary.duration.endDate, "PPP")
															: "Not set"}
													</span>
												</div>
											</>
										)}
										<div>
											<span className="text-gray-600 dark:text-gray-400">
												Timezone:{" "}
											</span>
											<span className="font-medium text-gray-900 dark:text-white">
												{campaignSummary.duration.timezone}
											</span>
										</div>
									</div>
								</div>

								{/* Selected Segments */}
								<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
										Target Audience
									</h3>
									<div className="space-y-3">
										{campaignSummary.audience.map(
											(segment: AudienceSegment) => (
												<div
													key={segment.id}
													className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-800 rounded"
												>
													<div>
														<p className="font-medium text-gray-900 dark:text-white">
															{segment.name}
														</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															{segment.description}
														</p>
													</div>
													<span className="text-sm font-medium text-[#7A7FEE] bg-[#7A7FEE]/10 px-2 py-1 rounded-full">
														{segment.userCount.toLocaleString()} users
													</span>
												</div>
											),
										)}
										<div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
											<p className="text-sm text-blue-700 dark:text-blue-300">
												Total reach:{" "}
												{campaignSummary.audience
													.reduce(
														(total: number, segment: AudienceSegment) =>
															total + segment.userCount,
														0,
													)
													.toLocaleString()}{" "}
												users
											</p>
										</div>
									</div>
								</div>

								{/* Channels */}
								<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
										Marketing Channels
									</h3>
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
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
										Generated Creatives
									</h3>
									<div className="space-y-3">
										{campaignSummary.creatives.map((creative: Creative) => (
											<div
												key={creative.id}
												className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded"
											>
												<div>
													<p className="font-medium text-gray-900 dark:text-white">
														{creative.title}
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{creative.type}
													</p>
												</div>
												<button
													type="button"
													className="text-[#7A7FEE] hover:text-[#6366f1] text-sm"
												>
													<Eye className="w-4 h-4" />
												</button>
											</div>
										))}
									</div>
								</div>

								{/* Channel Delivery Settings Summary */}
								<div className="bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
										Delivery Settings
									</h3>
									<div className="space-y-4">
										{(campaignSummary.channels.includes("email") ||
											campaignSummary.channels.includes("push")) && (
											<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
												<div className="flex items-center space-x-3">
													<div className="flex space-x-1">
														<Mail className="w-5 h-5 text-[#7A7FEE]" />
														<Bell className="w-5 h-5 text-[#7A7FEE]" />
													</div>
													<div>
														<p className="font-medium text-gray-900 dark:text-white">
															Mobile & Email
														</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															{campaignSummary.channelDelivery.mobile.frequency}{" "}
															at{" "}
															{campaignSummary.channelDelivery.mobile.sendTime}
														</p>
													</div>
												</div>
												<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
													Cap:{" "}
													{campaignSummary.channelDelivery.mobile.frequencyCap}
													/day
												</span>
											</div>
										)}
										{campaignSummary.channels.includes("web") && (
											<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
												<div className="flex items-center space-x-3">
													<Monitor className="w-5 h-5 text-[#7A7FEE]" />
													<div>
														<p className="font-medium text-gray-900 dark:text-white">
															Web Banners
														</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															{
																campaignSummary.channelDelivery.web
																	.displaySchedule
															}{" "}
															display
														</p>
													</div>
												</div>
												<span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
													Cap:{" "}
													{campaignSummary.channelDelivery.web.impressionCap}
													/day
												</span>
											</div>
										)}
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex justify-center space-x-4 pt-6">
									<button
										type="button"
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
						type="button"
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
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
										currentStep > step.number
											? "bg-[#7A7FEE] border-[#7A7FEE] text-white"
											: currentStep === step.number
												? "border-[#7A7FEE] text-[#7A7FEE] bg-white dark:bg-gray-900"
												: "border-gray-300 dark:border-gray-600 text-gray-400"
									}`}
								>
									{currentStep > step.number ? (
										<CheckCircle className="w-4 h-4" />
									) : (
										<span className="text-sm font-medium">{step.number}</span>
									)}
								</div>
								<div className="ml-2 hidden sm:block">
									<p
										className={`text-sm font-medium ${
											currentStep >= step.number
												? "text-gray-900 dark:text-white"
												: "text-gray-400"
										}`}
									>
										{step.title}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{step.description}
									</p>
								</div>
								{index < steps.length - 1 && (
									<div
										className={`w-8 h-0.5 mx-4 ${
											currentStep > step.number
												? "bg-[#7A7FEE]"
												: "bg-gray-300 dark:bg-gray-600"
										}`}
									/>
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
							type="button"
							onClick={handlePrevStep}
							disabled={currentStep === 1}
							className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Previous
						</button>

						<button
							type="button"
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
							type="button"
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
