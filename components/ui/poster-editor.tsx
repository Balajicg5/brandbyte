"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Campaign, adCreativeService } from '@/lib/appwrite';
import { 
    Type, 
    Download, 
    Plus, 
    Trash2, 
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Palette,
    Eye,
    EyeOff,
    Copy,
    RotateCw,
    Move,
    Square,
    Circle,
    Triangle,
    Zap,
    Sparkles,
    Save,
    Monitor,
    Smartphone,
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    Edit3,
    MousePointer2,
    ArrowLeft,
    X,
    Image as ImageIcon
} from 'lucide-react';

interface TextElement {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fill: string;
    fontStyle: string;
    fontWeight: string;
    textDecoration: string;
    align: string;
    rotation: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
    visible: boolean;
    strokeWidth: number;
    stroke: string;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    letterSpacing: number;
    lineHeight: number;
}

interface PosterEditorProps {
    backgroundImageUrl: string;
    campaign: Campaign;
    onSave?: (dataUrl: string) => void;
    width?: number;
    height?: number;
}

// Platform sizes for different social media platforms
const PLATFORM_SIZES = {
    'instagram-post': { width: 1080, height: 1080, name: 'Instagram Post (1:1)' },
    'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story (9:16)' },
    'facebook-post': { width: 1200, height: 630, name: 'Facebook Post (1.91:1)' },
    'facebook-cover': { width: 1640, height: 859, name: 'Facebook Cover' },
    'twitter-post': { width: 1200, height: 675, name: 'Twitter Post (16:9)' },
    'linkedin-post': { width: 1200, height: 627, name: 'LinkedIn Post' },
    'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail (16:9)' },
    'pinterest-pin': { width: 1000, height: 1500, name: 'Pinterest Pin (2:3)' },
    'custom': { width: 1024, height: 1024, name: 'Custom Size' }
};

export default function PosterEditor({ 
    backgroundImageUrl, 
    campaign,
    onSave, 
    width = 1024,
    height = 1024
}: PosterEditorProps) {
    const [textElements, setTextElements] = useState<TextElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null);
    const [stageSize, setStageSize] = useState({ width: 800, height: 800 });
    const [scale, setScale] = useState(1);
    const [isClient, setIsClient] = useState(false);
    const [konvaComponents, setKonvaComponents] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORM_SIZES>('custom');
    const [isEditingText, setIsEditingText] = useState(false);
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const [lastTap, setLastTap] = useState<{ elementId: string; time: number } | null>(null);
    const [showImageSelector, setShowImageSelector] = useState(!backgroundImageUrl);
    const [availableImages, setAvailableImages] = useState<string[]>([]);
    const [loadingImages, setLoadingImages] = useState(true);
    const [pica, setPica] = useState<any>(null);
    const [originalBackgroundImage, setOriginalBackgroundImage] = useState<HTMLImageElement | null>(null);
    
    // Crop functionality state
    const [isCropping, setIsCropping] = useState(false);
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [cropPreview, setCropPreview] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    
    const stageRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);
    const cropCanvasRef = useRef<HTMLCanvasElement>(null);

    // Enhanced font options for ad posters - using web-safe fonts
    const fontFamilies = [
        'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
        'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New', 'Lucida Console',
        'Arial Black', 'Palatino', 'Garamond', 'Bookman', 'Tahoma',
        'Geneva', 'Monaco', 'Lucida Grande', 'Century Gothic', 'Franklin Gothic Medium'
    ];

    const fontWeights = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const fontStyles = ['normal', 'italic'];
    const textDecorations = ['none', 'underline', 'line-through'];
    const alignments = ['left', 'center', 'right'];

    // Color palettes for ad posters
    const colorPalettes = {
        brand: ['#3B82F6', '#EF4444', '#FFFFFF', '#000000'],
        vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
        professional: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1', '#FFFFFF'],
        warm: ['#E74C3C', '#E67E22', '#F39C12', '#F1C40F', '#D35400', '#C0392B'],
        cool: ['#3498DB', '#2980B9', '#1ABC9C', '#16A085', '#8E44AD', '#9B59B6'],
        monochrome: ['#000000', '#2C2C2C', '#555555', '#808080', '#CCCCCC', '#FFFFFF']
    };

    useEffect(() => {
        setIsClient(true);
        
        // Dynamically import Konva components only on client side
        const loadKonva = async () => {
            try {
                const { Stage, Layer, Text, Image: KonvaImage, Transformer } = await import('react-konva');
                setKonvaComponents({ Stage, Layer, Text, KonvaImage, Transformer });
            } catch (error) {
                console.error('Failed to load Konva:', error);
            }
        };
        
        // Dynamically import Pica for image resizing
        const loadPica = async () => {
            try {
                const PicaModule = await import('pica');
                const Pica = PicaModule.default;
                setPica(new Pica());
            } catch (error) {
                console.error('Failed to load Pica:', error);
            }
        };
        
        loadKonva();
        loadPica();
    }, []);

    useEffect(() => {
        if (!isClient) return;
        storeAndLoadBackgroundImage();
    }, [backgroundImageUrl, isClient]);

    useEffect(() => {
        if (!isClient) return;
        loadAvailableImages();
    }, [campaign, isClient]);

    useEffect(() => {
        if (!isClient || !konvaComponents) return;
        
        // Update transformer when selection changes
        if (transformerRef.current) {
            const stage = stageRef.current;
            if (stage && selectedId && !isDownloading) {
                const selectedNode = stage.findOne(`#${selectedId}`);
                if (selectedNode) {
                    transformerRef.current.nodes([selectedNode]);
                    transformerRef.current.getLayer()?.batchDraw();
                }
            } else {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        }
    }, [selectedId, isClient, konvaComponents, isDownloading]);

    useEffect(() => {
        calculateAndSetScale();
        window.addEventListener('resize', calculateAndSetScale);
        return () => window.removeEventListener('resize', calculateAndSetScale);
    }, [backgroundImage, selectedPlatform]);

    // Update background image when platform changes
    useEffect(() => {
        if (originalBackgroundImage && pica) {
            updateBackgroundImageForPlatform();
        }
    }, [selectedPlatform, originalBackgroundImage, pica]);

    const calculateAndSetScale = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth - 40;
            const containerHeight = containerRef.current.offsetHeight - 40;
            
            // Get the selected platform dimensions
            const platformSize = PLATFORM_SIZES[selectedPlatform];
            const targetWidth = platformSize.width;
            const targetHeight = platformSize.height;
            
            // Calculate scale to fit the platform size within the container
            const scaleX = containerWidth / targetWidth;
            const scaleY = containerHeight / targetHeight;
            const newScale = Math.min(scaleX, scaleY, 1);
            
            setStageSize({
                width: targetWidth * newScale,
                height: targetHeight * newScale
            });
            setScale(newScale);
        }
    };

    const resizeImageWithPica = async (sourceImage: HTMLImageElement, targetWidth: number, targetHeight: number): Promise<HTMLImageElement> => {
        if (!pica) {
            console.warn('Pica not loaded, using original image');
            return sourceImage;
        }

        try {
            // Calculate crop dimensions to maintain aspect ratio
            const sourceAspect = sourceImage.width / sourceImage.height;
            const targetAspect = targetWidth / targetHeight;
            
            let cropWidth, cropHeight, cropX, cropY;
            
            if (sourceAspect > targetAspect) {
                // Source is wider, crop width
                cropHeight = sourceImage.height;
                cropWidth = cropHeight * targetAspect;
                cropX = (sourceImage.width - cropWidth) / 2;
                cropY = 0;
            } else {
                // Source is taller, crop height
                cropWidth = sourceImage.width;
                cropHeight = cropWidth / targetAspect;
                cropX = 0;
                cropY = (sourceImage.height - cropHeight) / 2;
            }

            // Create source canvas with cropped image
            const sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = cropWidth;
            sourceCanvas.height = cropHeight;
            const sourceCtx = sourceCanvas.getContext('2d');
            
            if (sourceCtx) {
                // Draw the cropped portion of the source image
                sourceCtx.drawImage(
                    sourceImage,
                    cropX, cropY, cropWidth, cropHeight,  // Source crop area
                    0, 0, cropWidth, cropHeight           // Destination area
                );
            }

            // Create target canvas
            const targetCanvas = document.createElement('canvas');
            targetCanvas.width = targetWidth;
            targetCanvas.height = targetHeight;

            // Resize using Pica with high quality settings
            await pica.resize(sourceCanvas, targetCanvas, {
                quality: 3,
                alpha: true,
                unsharpAmount: 80,
                unsharpRadius: 0.6,
                unsharpThreshold: 2
            });

            // Convert back to image
            const resizedImage = new Image();
            resizedImage.crossOrigin = 'anonymous';
            
            return new Promise((resolve, reject) => {
                resizedImage.onload = () => resolve(resizedImage);
                resizedImage.onerror = reject;
                resizedImage.src = targetCanvas.toDataURL('image/png', 1.0);
            });
        } catch (error) {
            console.error('Error resizing image with Pica:', error);
            return sourceImage;
        }
    };

    const updateBackgroundImageForPlatform = async () => {
        if (!originalBackgroundImage || !pica) return;

        const platformSize = PLATFORM_SIZES[selectedPlatform];
        
        try {
            const resizedImage = await resizeImageWithPica(
                originalBackgroundImage, 
                platformSize.width, 
                platformSize.height
            );
            setBackgroundImage(resizedImage);
        } catch (error) {
            console.error('Failed to resize background image:', error);
            setBackgroundImage(originalBackgroundImage);
        }
    };

    const storeAndLoadBackgroundImage = async () => {
        try {
            const response = await fetch('/api/proxy-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: backgroundImageUrl })
            });

            if (response.ok) {
                const { storedUrl, warning } = await response.json();
                
                if (warning) {
                    console.warn('Storage warning:', warning);
                }
                
                console.log('📦 Attempting to load stored image:', storedUrl);
                setStoredImageUrl(storedUrl);
                
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    console.log('✅ Successfully loaded stored image');
                    setOriginalBackgroundImage(img);
                    setBackgroundImage(img);
                    calculateAndSetScale();
                };
                img.onerror = (error) => {
                    console.error('❌ Failed to load stored image:', error);
                    loadOriginalImage();
                };
                img.src = storedUrl;
            } else {
                loadOriginalImage();
            }
        } catch (error) {
            console.error('Error in proxy request:', error);
            loadOriginalImage();
        }
    };

    const loadOriginalImage = () => {
        console.log('🌐 Loading original image directly:', backgroundImageUrl);
        setStoredImageUrl(backgroundImageUrl);
        
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            console.log('✅ Successfully loaded original image');
            setOriginalBackgroundImage(img);
            setBackgroundImage(img);
            calculateAndSetScale();
        };
        img.onerror = (error) => {
            console.error('❌ Failed to load original image:', error);
            createPlaceholderImage();
        };
        img.src = backgroundImageUrl;
    };

    const createPlaceholderImage = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#f3f4f6');
            gradient.addColorStop(1, '#e5e7eb');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#6b7280';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Image not available', width / 2, height / 2 - 20);
            ctx.fillText('Please select another image', width / 2, height / 2 + 20);
        }
        
        const img = new window.Image();
        img.onload = () => {
            setBackgroundImage(img);
            calculateAndSetScale();
        };
        img.src = canvas.toDataURL();
    };

    const addTextElement = (preset?: 'headline' | 'subheading' | 'body' | 'cta') => {
        const presets = {
            headline: { fontSize: 72, fontWeight: 'bold', text: 'Your Headline Here' },
            subheading: { fontSize: 48, fontWeight: '600', text: 'Subheading Text' },
            body: { fontSize: 32, fontWeight: 'normal', text: 'Body text content' },
            cta: { fontSize: 40, fontWeight: 'bold', text: campaign.callToAction || 'Call to Action' }
        };

        const presetConfig = preset ? presets[preset] : presets.headline;
        const platformSize = PLATFORM_SIZES[selectedPlatform];

        const newElement: TextElement = {
            id: `text-${Date.now()}`,
            text: presetConfig.text,
            x: platformSize.width / 2 - 100,
            y: platformSize.height / 2 - 40,
            fontSize: presetConfig.fontSize,
            fontFamily: 'Arial',
            fill: '#3B82F6',
            fontStyle: 'normal',
            fontWeight: presetConfig.fontWeight,
            textDecoration: 'none',
            align: 'center',
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            visible: true,
            strokeWidth: 0,
            stroke: '#000000',
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            letterSpacing: 0,
            lineHeight: 1.2
        };
        
        setTextElements([...textElements, newElement]);
        setSelectedId(newElement.id);
    };

    const updateTextElement = (id: string, updates: Partial<TextElement>) => {
        setTextElements(elements => 
            elements.map(el => el.id === id ? { ...el, ...updates } : el)
        );
    };

    const deleteTextElement = (id: string) => {
        setTextElements(elements => elements.filter(el => el.id !== id));
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    const duplicateTextElement = (id: string) => {
        const element = textElements.find(el => el.id === id);
        if (element) {
            const newElement = {
                ...element,
                id: `text-${Date.now()}`,
                x: element.x + 20,
                y: element.y + 20
            };
            setTextElements([...textElements, newElement]);
            setSelectedId(newElement.id);
        }
    };

    const handleTextChange = (attrs: any) => {
        if (selectedId) {
            updateTextElement(selectedId, attrs);
        }
    };

    const handleStageClick = (e: any) => {
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
            setIsEditingText(false);
            setEditingElementId(null);
        }
    };

    // Double-tap to edit text functionality
    const handleTextClick = (elementId: string) => {
        const now = Date.now();
        
        if (lastTap && lastTap.elementId === elementId && now - lastTap.time < 300) {
            // Double tap detected
            setIsEditingText(true);
            setEditingElementId(elementId);
            setSelectedId(elementId);
            setTimeout(() => {
                if (textInputRef.current) {
                    textInputRef.current.focus();
                    textInputRef.current.select();
                }
            }, 100);
        } else {
            // Single tap
            setSelectedId(elementId);
        }
        
        setLastTap({ elementId, time: now });
    };

    const handleTextInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            setIsEditingText(false);
            setEditingElementId(null);
        }
    };

    const downloadImage = async (platform: keyof typeof PLATFORM_SIZES) => {
        if (!stageRef.current || !originalBackgroundImage) return;
        
        setIsDownloading(true);
        
        // Hide transformer during download
        setSelectedId(null);
        
        try {
            const stage = stageRef.current;
            const platformSize = PLATFORM_SIZES[platform];
            
            // Create a high-quality resized background using Pica
            let finalBackgroundImage = originalBackgroundImage;
            if (pica) {
                try {
                    finalBackgroundImage = await resizeImageWithPica(
                        originalBackgroundImage,
                        platformSize.width,
                        platformSize.height
                    );
                } catch (error) {
                    console.warn('Failed to resize with Pica, using original:', error);
                }
            }
            
            // Create a temporary canvas for the export
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = platformSize.width;
            exportCanvas.height = platformSize.height;
            const exportCtx = exportCanvas.getContext('2d');
            
            if (exportCtx) {
                // Fill with white background first
                exportCtx.fillStyle = '#FFFFFF';
                exportCtx.fillRect(0, 0, platformSize.width, platformSize.height);
                
                // Draw the resized background image to fill the entire canvas
                exportCtx.drawImage(finalBackgroundImage, 0, 0, platformSize.width, platformSize.height);
                
                // Create a temporary stage for text overlay
                const tempStage = stage.clone();
                tempStage.scale({ x: 1, y: 1 });
                tempStage.size({ width: platformSize.width, height: platformSize.height });
                
                // Get the stage content and overlay it
                const stageDataURL = tempStage.toDataURL({
                    mimeType: 'image/png',
                    quality: 1,
                    pixelRatio: 2
                });
                
                const stageImg = new Image();
                stageImg.onload = () => {
                    // Draw the stage content on top
                    exportCtx.drawImage(stageImg, 0, 0, platformSize.width, platformSize.height);
                    
                    // Download the final image
                    const link = document.createElement('a');
                    link.download = `${campaign.name || 'poster'}-${platform}.png`;
                    link.href = exportCanvas.toDataURL('image/png');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    setIsDownloading(false);
                };
                stageImg.src = stageDataURL;
            }
        } catch (error) {
            console.error('Failed to download image:', error);
            setIsDownloading(false);
        }
    };

    const exportAndSave = async () => {
        if (!stageRef.current || !originalBackgroundImage) return;
        
        setIsSaving(true);
        
        // Hide transformer during save
        const currentSelectedId = selectedId;
        setSelectedId(null);
        
        try {
            const stage = stageRef.current;
            const platformSize = PLATFORM_SIZES[selectedPlatform];
            
            // Create a high-quality resized background using Pica
            let finalBackgroundImage = originalBackgroundImage;
            if (pica) {
                try {
                    finalBackgroundImage = await resizeImageWithPica(
                        originalBackgroundImage,
                        platformSize.width,
                        platformSize.height
                    );
                } catch (error) {
                    console.warn('Failed to resize with Pica for save, using original:', error);
                }
            }
            
            // Create export canvas
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = platformSize.width;
            exportCanvas.height = platformSize.height;
            const exportCtx = exportCanvas.getContext('2d');
            
            if (exportCtx) {
                // Draw the resized background
                exportCtx.drawImage(finalBackgroundImage, 0, 0, platformSize.width, platformSize.height);
                
                // Create temporary stage for text overlay
                const tempStage = stage.clone();
                tempStage.scale({ x: 1, y: 1 });
                tempStage.size({ width: platformSize.width, height: platformSize.height });
                
                const stageDataURL = tempStage.toDataURL({
                    mimeType: 'image/png',
                    quality: 1,
                    pixelRatio: 2
                });
                
                const stageImg = new Image();
                stageImg.onload = async () => {
                    // Draw the stage content on top
                    exportCtx.drawImage(stageImg, 0, 0, platformSize.width, platformSize.height);
                    
                    const finalDataURL = exportCanvas.toDataURL('image/png');
                    
                    const response = await fetch('/api/save-poster', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            dataUrl: finalDataURL,
                            campaignId: campaign.$id
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to save poster');
                    }

                    const { finalUrl, warning } = await response.json();
                    
                    if (warning) {
                        console.warn('Save warning:', warning);
                    }
                    
                    console.log('✅ Poster saved successfully:', finalUrl);
                    
                    if (onSave) {
                        onSave(finalUrl);
                    }
                    
                    setIsSaving(false);
                    // Restore selection after save
                    setSelectedId(currentSelectedId);
                };
                stageImg.src = stageDataURL;
            }
        } catch (error) {
            console.error('Failed to save poster:', error);
            setIsSaving(false);
            // Restore selection after save
            setSelectedId(currentSelectedId);
        }
    };

    // Load available images from campaign
    const loadAvailableImages = async () => {
        try {
            setLoadingImages(true);
            // Get campaign ad creatives using the service
            const adCreatives = await adCreativeService.getCampaignAdCreatives(campaign.$id!);
            const images = adCreatives.map(creative => creative.imageUrl);
            setAvailableImages(images);
        } catch (error) {
            console.error('Failed to load campaign images:', error);
        } finally {
            setLoadingImages(false);
        }
    };

    const selectBackgroundImage = (imageUrl: string) => {
        setShowImageSelector(false);
        // Update the background image URL and reload
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setOriginalBackgroundImage(img);
            setBackgroundImage(img);
            calculateAndSetScale();
            // Trigger resize for current platform if Pica is loaded
            if (pica) {
                updateBackgroundImageForPlatform();
            }
        };
        img.onerror = () => {
            console.error('Failed to load selected image');
            createPlaceholderImage();
        };
        img.src = imageUrl;
        setStoredImageUrl(imageUrl);
    };

    // Crop functionality methods
    const startCropping = () => {
        if (!originalBackgroundImage) return;
        
        // Initialize crop area to center of image
        const imgWidth = originalBackgroundImage.width;
        const imgHeight = originalBackgroundImage.height;
        const cropSize = Math.min(imgWidth, imgHeight) * 0.8;
        
        setCropArea({
            x: (imgWidth - cropSize) / 2,
            y: (imgHeight - cropSize) / 2,
            width: cropSize,
            height: cropSize
        });
        
        setShowCropModal(true);
        generateCropPreview();
    };

    const generateCropPreview = () => {
        if (!originalBackgroundImage || !cropCanvasRef.current) return;
        
        const canvas = cropCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas size to crop area
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
        
        // Draw the cropped portion
        ctx.drawImage(
            originalBackgroundImage,
            cropArea.x, cropArea.y, cropArea.width, cropArea.height,
            0, 0, cropArea.width, cropArea.height
        );
        
        setCropPreview(canvas.toDataURL());
    };

    const applyCrop = async () => {
        if (!originalBackgroundImage || !cropCanvasRef.current) return;
        
        try {
            const canvas = cropCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Create cropped image
            canvas.width = cropArea.width;
            canvas.height = cropArea.height;
            
            ctx.drawImage(
                originalBackgroundImage,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                0, 0, cropArea.width, cropArea.height
            );
            
            // Convert to image
            const croppedImage = new Image();
            croppedImage.crossOrigin = 'anonymous';
            
            croppedImage.onload = () => {
                setOriginalBackgroundImage(croppedImage);
                setBackgroundImage(croppedImage);
                setShowCropModal(false);
                calculateAndSetScale();
                
                // Trigger resize for current platform if Pica is loaded
                if (pica) {
                    updateBackgroundImageForPlatform();
                }
            };
            
            croppedImage.src = canvas.toDataURL();
        } catch (error) {
            console.error('Failed to apply crop:', error);
        }
    };

    const updateCropArea = (updates: Partial<typeof cropArea>) => {
        if (!originalBackgroundImage) return;
        
        const newCropArea = { ...cropArea, ...updates };
        
        // Ensure crop area stays within image bounds
        newCropArea.x = Math.max(0, Math.min(newCropArea.x, originalBackgroundImage.width - newCropArea.width));
        newCropArea.y = Math.max(0, Math.min(newCropArea.y, originalBackgroundImage.height - newCropArea.height));
        newCropArea.width = Math.max(50, Math.min(newCropArea.width, originalBackgroundImage.width - newCropArea.x));
        newCropArea.height = Math.max(50, Math.min(newCropArea.height, originalBackgroundImage.height - newCropArea.y));
        
        setCropArea(newCropArea);
        
        // Debounce preview generation
        setTimeout(() => generateCropPreview(), 100);
    };

    const selectedElement = textElements.find(el => el.id === selectedId);

    if (!isClient || !konvaComponents) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading poster editor...</p>
                </div>
            </div>
        );
    }

    const { Stage, Layer, Text, KonvaImage, Transformer } = konvaComponents;
    const platformSize = PLATFORM_SIZES[selectedPlatform];

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Top Toolbar */}
            <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center space-x-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.location.href = '/dashboard'}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Poster Editor</h1>
                    <Badge variant="secondary">{campaign.name}</Badge>
                </div>
                
                <div className="flex items-center space-x-3">
                    {/* Platform Size Selector */}
                    <Select value={selectedPlatform} onValueChange={(value: keyof typeof PLATFORM_SIZES) => setSelectedPlatform(value)}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(PLATFORM_SIZES).map(([key, size]) => (
                                <SelectItem key={key} value={key}>
                                    <div className="flex items-center space-x-2">
                                        {key.includes('instagram') && <Instagram className="w-4 h-4" />}
                                        {key.includes('facebook') && <Facebook className="w-4 h-4" />}
                                        {key.includes('twitter') && <Twitter className="w-4 h-4" />}
                                        {key.includes('linkedin') && <Linkedin className="w-4 h-4" />}
                                        {key.includes('youtube') && <Youtube className="w-4 h-4" />}
                                        {key === 'custom' && <Monitor className="w-4 h-4" />}
                                        <span>{size.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Download Button */}
                    <Button 
                        onClick={() => downloadImage(selectedPlatform)} 
                        disabled={isDownloading}
                        variant="outline"
                    >
                        {isDownloading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </>
                        )}
                    </Button>

                    {/* Change Background Button */}
                    <Button 
                        onClick={() => setShowImageSelector(true)} 
                        variant="outline"
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Change Background
                    </Button>

                    {/* Crop Background Button */}
                    <Button 
                        onClick={startCropping} 
                        variant="outline"
                        disabled={!originalBackgroundImage}
                    >
                        <Square className="w-4 h-4 mr-2" />
                        Crop Background
                    </Button>

                    {/* Save Button */}
                    <Button onClick={exportAndSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tools */}
                <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                    <div className="p-4">
                        {/* Add Text Elements */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Add Text Elements</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Button onClick={() => addTextElement('headline')} size="sm" variant="outline" className="h-12">
                                    <div className="text-center">
                                        <Type className="w-4 h-4 mx-auto mb-1" />
                                        <span className="text-xs">Headline</span>
                                    </div>
                                </Button>
                                <Button onClick={() => addTextElement('subheading')} size="sm" variant="outline" className="h-12">
                                    <div className="text-center">
                                        <Type className="w-4 h-4 mx-auto mb-1" />
                                        <span className="text-xs">Subheading</span>
                                    </div>
                                </Button>
                                <Button onClick={() => addTextElement('body')} size="sm" variant="outline" className="h-12">
                                    <div className="text-center">
                                        <Type className="w-4 h-4 mx-auto mb-1" />
                                        <span className="text-xs">Body</span>
                                    </div>
                                </Button>
                                <Button onClick={() => addTextElement('cta')} size="sm" variant="outline" className="h-12">
                                    <div className="text-center">
                                        <Zap className="w-4 h-4 mx-auto mb-1" />
                                        <span className="text-xs">CTA</span>
                                    </div>
                                </Button>
                            </div>
                        </div>

                        {/* Text Properties */}
                        {selectedElement ? (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Text Properties</h3>
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => duplicateTextElement(selectedElement.id)}
                                            className="h-7 w-7 p-0"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => updateTextElement(selectedElement.id, { visible: !selectedElement.visible })}
                                            className="h-7 w-7 p-0"
                                        >
                                            {selectedElement.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteTextElement(selectedElement.id)}
                                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-4 mb-4">
                                        <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                                        <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
                                        <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
                                        <TabsTrigger value="position" className="text-xs">Position</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="content" className="space-y-4">
                                        <div>
                                            <Label htmlFor="text-content" className="text-sm font-medium">Text Content</Label>
                                            {isEditingText && editingElementId === selectedElement.id ? (
                                                <Input
                                                    ref={textInputRef}
                                                    value={selectedElement.text}
                                                    onChange={(e) => handleTextChange({ text: e.target.value })}
                                                    onKeyDown={handleTextInputKeyDown}
                                                    onBlur={() => {
                                                        setIsEditingText(false);
                                                        setEditingElementId(null);
                                                    }}
                                                    className="mt-1"
                                                    placeholder="Enter your text..."
                                                />
                                            ) : (
                                                <div 
                                                    className="mt-1 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    onClick={() => {
                                                        setIsEditingText(true);
                                                        setEditingElementId(selectedElement.id);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">{selectedElement.text || 'Click to edit text'}</span>
                                                        <Edit3 className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm font-medium">Font Family</Label>
                                            <Select
                                                value={selectedElement.fontFamily}
                                                onValueChange={(value) => handleTextChange({ fontFamily: value })}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {fontFamilies.map(font => (
                                                        <SelectItem key={font} value={font}>
                                                            <span style={{ fontFamily: font }}>{font}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm font-medium">Font Size: {selectedElement.fontSize}px</Label>
                                            <Slider
                                                value={[selectedElement.fontSize]}
                                                onValueChange={([value]) => handleTextChange({ fontSize: value })}
                                                min={8}
                                                max={200}
                                                step={1}
                                                className="mt-2"
                                            />
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="style" className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Color Palettes</Label>
                                            <div className="space-y-3">
                                                {Object.entries(colorPalettes).map(([name, colors]) => (
                                                    <div key={name}>
                                                        <p className="text-xs font-medium capitalize mb-1 text-gray-600 dark:text-gray-400">{name}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {colors.map((color, index) => (
                                                                <button
                                                                    key={index}
                                                                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                                                                    style={{ backgroundColor: color }}
                                                                    onClick={() => handleTextChange({ fill: color })}
                                                                    title={color}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm font-medium">Text Alignment</Label>
                                            <div className="flex gap-1 mt-1">
                                                {alignments.map(align => (
                                                    <Button
                                                        key={align}
                                                        variant={selectedElement.align === align ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleTextChange({ align })}
                                                        className="flex-1"
                                                    >
                                                        {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                                        {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                                        {align === 'right' && <AlignRight className="w-4 h-4" />}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="effects" className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Opacity: {Math.round(selectedElement.opacity * 100)}%</Label>
                                            <Slider
                                                value={[selectedElement.opacity]}
                                                onValueChange={([value]) => handleTextChange({ opacity: value })}
                                                min={0}
                                                max={1}
                                                step={0.01}
                                                className="mt-2"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm font-medium">Shadow Blur: {selectedElement.shadowBlur}px</Label>
                                            <Slider
                                                value={[selectedElement.shadowBlur]}
                                                onValueChange={([value]) => handleTextChange({ shadowBlur: value })}
                                                min={0}
                                                max={50}
                                                step={1}
                                                className="mt-2"
                                            />
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="position" className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Rotation: {Math.round(selectedElement.rotation)}°</Label>
                                            <Slider
                                                value={[selectedElement.rotation]}
                                                onValueChange={([value]) => handleTextChange({ rotation: value })}
                                                min={-180}
                                                max={180}
                                                step={1}
                                                className="mt-2"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label className="text-sm font-medium">Letter Spacing: {selectedElement.letterSpacing}px</Label>
                                            <Slider
                                                value={[selectedElement.letterSpacing]}
                                                onValueChange={([value]) => handleTextChange({ letterSpacing: value })}
                                                min={-5}
                                                max={20}
                                                step={0.1}
                                                className="mt-2"
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <MousePointer2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">No Text Selected</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Click on a text element or add a new one to start editing
                                </p>
                                <Button onClick={() => addTextElement('headline')} size="sm" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Text Element
                                </Button>
                            </div>
                        )}

                        {/* Text Elements List */}
                        {textElements.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Text Layers</h3>
                                <div className="space-y-2">
                                    {textElements.map((element) => (
                                        <div
                                            key={element.id}
                                            className={`p-2 rounded border cursor-pointer transition-colors ${
                                                selectedId === element.id 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                            onClick={() => setSelectedId(element.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2 min-w-0">
                                                    <Type className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                                    <span className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">
                                                        {element.text || 'Empty Text'}
                                                    </span>
                                                    {!element.visible && <EyeOff className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                                                <span className="truncate">{element.fontFamily}</span>
                                                <span>•</span>
                                                <span>{element.fontSize}px</span>
                                                <div 
                                                    className="w-2 h-2 rounded border border-gray-300 flex-shrink-0"
                                                    style={{ backgroundColor: element.fill }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div 
                        ref={containerRef}
                        className="relative bg-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                        style={{ 
                            width: stageSize.width + 40,
                            height: stageSize.height + 40,
                            maxWidth: '100%',
                            maxHeight: '100%'
                        }}
                    >
                        <div className="absolute inset-0 p-5 flex items-center justify-center">
                            <Stage
                                ref={stageRef}
                                width={stageSize.width}
                                height={stageSize.height}
                                scaleX={scale}
                                scaleY={scale}
                                onClick={handleStageClick}
                                onTap={handleStageClick}
                            >
                                <Layer>
                                    {backgroundImage && (
                                        <KonvaImage
                                            image={backgroundImage}
                                            width={platformSize.width}
                                            height={platformSize.height}
                                            scaleX={1}
                                            scaleY={1}
                                        />
                                    )}
                                    
                                    {textElements.filter(el => el.visible).map((element) => (
                                        <Text
                                            key={element.id}
                                            id={element.id}
                                            text={element.text}
                                            x={element.x}
                                            y={element.y}
                                            fontSize={element.fontSize}
                                            fontFamily={element.fontFamily}
                                            fill={element.fill}
                                            fontStyle={element.fontStyle}
                                            fontWeight={element.fontWeight}
                                            textDecoration={element.textDecoration}
                                            align={element.align}
                                            rotation={element.rotation}
                                            scaleX={element.scaleX}
                                            scaleY={element.scaleY}
                                            opacity={element.opacity}
                                            strokeWidth={element.strokeWidth}
                                            stroke={element.stroke}
                                            shadowColor={element.shadowColor}
                                            shadowBlur={element.shadowBlur}
                                            shadowOffsetX={element.shadowOffsetX}
                                            shadowOffsetY={element.shadowOffsetY}
                                            letterSpacing={element.letterSpacing}
                                            lineHeight={element.lineHeight}
                                            draggable
                                            onClick={() => handleTextClick(element.id)}
                                            onTap={() => handleTextClick(element.id)}
                                            onDragEnd={(e: any) => {
                                                updateTextElement(element.id, {
                                                    x: e.target.x(),
                                                    y: e.target.y()
                                                });
                                            }}
                                            onTransformEnd={(e: any) => {
                                                const node = e.target;
                                                updateTextElement(element.id, {
                                                    x: node.x(),
                                                    y: node.y(),
                                                    rotation: node.rotation(),
                                                    scaleX: node.scaleX(),
                                                    scaleY: node.scaleY()
                                                });
                                            }}
                                        />
                                    ))}
                                    
                                    {!isDownloading && !isSaving && (
                                        <Transformer
                                            ref={transformerRef}
                                            boundBoxFunc={(oldBox: any, newBox: any) => {
                                                if (newBox.width < 5 || newBox.height < 5) {
                                                    return oldBox;
                                                }
                                                return newBox;
                                            }}
                                        />
                                    )}
                                </Layer>
                            </Stage>
                        </div>

                        {/* Canvas Instructions */}
                        {textElements.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center text-gray-400">
                                    <Type className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm">Add text elements to get started</p>
                                    <p className="text-xs mt-1">Double-tap text to edit</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Selection Modal */}
            {showImageSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Select Background Image
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowImageSelector(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        {loadingImages ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-gray-500">Loading campaign images...</p>
                                </div>
                            </div>
                        ) : availableImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {availableImages.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                                        onClick={() => selectBackgroundImage(imageUrl)}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={`Campaign image ${index + 1}`}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white rounded-full p-2">
                                                    <ImageIcon className="w-6 h-6 text-gray-700" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    No Images Available
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    This campaign doesn't have any generated images yet.
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/dashboard/campaigns'}
                                    variant="outline"
                                >
                                    Go to Campaigns
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Crop Modal */}
            {showCropModal && originalBackgroundImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Crop Background Image
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCropModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Original Image with Crop Area */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Original Image
                                </h3>
                                <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                                    <img
                                        src={originalBackgroundImage.src}
                                        alt="Original"
                                        className="w-full h-auto max-h-96 object-contain"
                                        style={{ maxWidth: '500px' }}
                                    />
                                    {/* Crop Area Overlay */}
                                    <div
                                        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                                        style={{
                                            left: `${(cropArea.x / originalBackgroundImage.width) * 100}%`,
                                            top: `${(cropArea.y / originalBackgroundImage.height) * 100}%`,
                                            width: `${(cropArea.width / originalBackgroundImage.width) * 100}%`,
                                            height: `${(cropArea.height / originalBackgroundImage.height) * 100}%`,
                                        }}
                                    >
                                        <div className="absolute inset-0 border border-white border-dashed"></div>
                                    </div>
                                </div>
                                
                                {/* Crop Controls */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">X Position</Label>
                                            <Slider
                                                value={[cropArea.x]}
                                                onValueChange={([value]) => updateCropArea({ x: value })}
                                                min={0}
                                                max={originalBackgroundImage.width - cropArea.width}
                                                step={1}
                                                className="mt-2"
                                            />
                                            <span className="text-xs text-gray-500">{Math.round(cropArea.x)}px</span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Y Position</Label>
                                            <Slider
                                                value={[cropArea.y]}
                                                onValueChange={([value]) => updateCropArea({ y: value })}
                                                min={0}
                                                max={originalBackgroundImage.height - cropArea.height}
                                                step={1}
                                                className="mt-2"
                                            />
                                            <span className="text-xs text-gray-500">{Math.round(cropArea.y)}px</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">Width</Label>
                                            <Slider
                                                value={[cropArea.width]}
                                                onValueChange={([value]) => updateCropArea({ width: value })}
                                                min={50}
                                                max={originalBackgroundImage.width - cropArea.x}
                                                step={1}
                                                className="mt-2"
                                            />
                                            <span className="text-xs text-gray-500">{Math.round(cropArea.width)}px</span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Height</Label>
                                            <Slider
                                                value={[cropArea.height]}
                                                onValueChange={([value]) => updateCropArea({ height: value })}
                                                min={50}
                                                max={originalBackgroundImage.height - cropArea.y}
                                                step={1}
                                                className="mt-2"
                                            />
                                            <span className="text-xs text-gray-500">{Math.round(cropArea.height)}px</span>
                                        </div>
                                    </div>
                                    
                                    {/* Preset Crop Ratios */}
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Preset Ratios</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const size = Math.min(originalBackgroundImage.width, originalBackgroundImage.height);
                                                    updateCropArea({
                                                        width: size,
                                                        height: size,
                                                        x: (originalBackgroundImage.width - size) / 2,
                                                        y: (originalBackgroundImage.height - size) / 2
                                                    });
                                                }}
                                            >
                                                1:1 Square
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const width = Math.min(originalBackgroundImage.width, originalBackgroundImage.height * (16/9));
                                                    const height = width * (9/16);
                                                    updateCropArea({
                                                        width,
                                                        height,
                                                        x: (originalBackgroundImage.width - width) / 2,
                                                        y: (originalBackgroundImage.height - height) / 2
                                                    });
                                                }}
                                            >
                                                16:9 Landscape
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const height = Math.min(originalBackgroundImage.height, originalBackgroundImage.width * (16/9));
                                                    const width = height * (9/16);
                                                    updateCropArea({
                                                        width,
                                                        height,
                                                        x: (originalBackgroundImage.width - width) / 2,
                                                        y: (originalBackgroundImage.height - height) / 2
                                                    });
                                                }}
                                            >
                                                9:16 Portrait
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const width = Math.min(originalBackgroundImage.width, originalBackgroundImage.height * (4/3));
                                                    const height = width * (3/4);
                                                    updateCropArea({
                                                        width,
                                                        height,
                                                        x: (originalBackgroundImage.width - width) / 2,
                                                        y: (originalBackgroundImage.height - height) / 2
                                                    });
                                                }}
                                            >
                                                4:3 Classic
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Crop Preview */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Crop Preview
                                </h3>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                                    {cropPreview ? (
                                        <img
                                            src={cropPreview}
                                            alt="Crop Preview"
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-48 flex items-center justify-center text-gray-500">
                                            <div className="text-center">
                                                <Square className="w-8 h-8 mx-auto mb-2" />
                                                <p>Crop preview will appear here</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Crop Info */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Crop Information</h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <p>Position: {Math.round(cropArea.x)}, {Math.round(cropArea.y)}</p>
                                        <p>Size: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}</p>
                                        <p>Aspect Ratio: {(cropArea.width / cropArea.height).toFixed(2)}:1</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <Button
                                variant="outline"
                                onClick={() => setShowCropModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={applyCrop}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Apply Crop
                            </Button>
                        </div>
                        
                        {/* Hidden canvas for crop processing */}
                        <canvas
                            ref={cropCanvasRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 