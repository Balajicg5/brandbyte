"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Type, 
    Download, 
    Plus, 
    Trash2, 
    AlignLeft,
    AlignCenter,
    AlignRight
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
    align: string;
    rotation: number;
    scaleX: number;
    scaleY: number;
}

interface TextOverlayEditorProps {
    backgroundImageUrl: string;
    onSave?: (dataUrl: string) => void;
    initialTexts?: TextElement[];
    width?: number;
    height?: number;
}

export default function TextOverlayEditor({ 
    backgroundImageUrl, 
    onSave, 
    initialTexts = [],
    width = 1024,
    height = 1024
}: TextOverlayEditorProps) {
    const [textElements, setTextElements] = useState<TextElement[]>(initialTexts);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [stageSize, setStageSize] = useState({ width: 800, height: 800 });
    const [scale, setScale] = useState(1);
    const [isClient, setIsClient] = useState(false);
    const [konvaComponents, setKonvaComponents] = useState<any>(null);
    
    const stageRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Font options
    const fontFamilies = [
        'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
        'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New', 'Lucida Console'
    ];

    const fontStyles = ['normal', 'bold', 'italic', 'bold italic'];
    const alignments = ['left', 'center', 'right'];

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
        
        loadKonva();
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
        // Load background image
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setBackgroundImage(img);
            
            // Calculate scale to fit container
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth - 40; // padding
                const containerHeight = Math.min(600, window.innerHeight * 0.6);
                
                const scaleX = containerWidth / width;
                const scaleY = containerHeight / height;
                const newScale = Math.min(scaleX, scaleY, 1);
                
                setScale(newScale);
                setStageSize({
                    width: width * newScale,
                    height: height * newScale
                });
            }
        };
        img.src = backgroundImageUrl;
    }, [backgroundImageUrl, width, height, isClient]);

    useEffect(() => {
        if (!isClient || !konvaComponents) return;
        
        // Update transformer when selection changes
        if (transformerRef.current) {
            const stage = stageRef.current;
            if (stage && selectedId) {
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
    }, [selectedId, isClient, konvaComponents]);

    const addTextElement = () => {
        const newElement: TextElement = {
            id: `text-${Date.now()}`,
            text: 'New Text',
            x: stageSize.width / 2 / scale - 50,
            y: stageSize.height / 2 / scale - 20,
            fontSize: 48,
            fontFamily: 'Arial',
            fill: '#000000',
            fontStyle: 'normal',
            align: 'center',
            rotation: 0,
            scaleX: 1,
            scaleY: 1
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

    const handleTextChange = (attrs: any) => {
        if (selectedId) {
            updateTextElement(selectedId, attrs);
        }
    };

    const handleStageClick = (e: any) => {
        // Deselect when clicking on empty area
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }
    };

    const exportImage = () => {
        if (stageRef.current) {
            // Temporarily scale to original size for export
            const stage = stageRef.current;
            const originalScale = stage.scaleX();
            
            stage.scale({ x: 1, y: 1 });
            stage.size({ width, height });
            
            const dataURL = stage.toDataURL({
                mimeType: 'image/png',
                quality: 1,
                pixelRatio: 1
            });
            
            // Restore original scale
            stage.scale({ x: scale, y: scale });
            stage.size(stageSize);
            
            if (onSave) {
                onSave(dataURL);
            } else {
                // Download directly
                const link = document.createElement('a');
                link.download = 'poster-with-text.png';
                link.href = dataURL;
                link.click();
            }
        }
    };

    const selectedElement = textElements.find(el => el.id === selectedId);

    if (!isClient || !konvaComponents) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Loading editor...</p>
                </div>
            </div>
        );
    }

    const { Stage, Layer, Text, KonvaImage, Transformer } = konvaComponents;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Text Overlay Editor
                </h3>
                <div className="flex gap-2">
                    <Button onClick={addTextElement} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Text
                    </Button>
                    <Button onClick={exportImage} size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-4">
                            <div 
                                ref={containerRef}
                                className="flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden"
                                style={{ minHeight: '400px' }}
                            >
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
                                                width={width}
                                                height={height}
                                            />
                                        )}
                                        
                                        {textElements.map((element) => (
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
                                                align={element.align}
                                                rotation={element.rotation}
                                                scaleX={element.scaleX}
                                                scaleY={element.scaleY}
                                                draggable
                                                onClick={() => setSelectedId(element.id)}
                                                onTap={() => setSelectedId(element.id)}
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
                                        
                                        <Transformer
                                            ref={transformerRef}
                                            boundBoxFunc={(oldBox: any, newBox: any) => {
                                                // Limit resize
                                                if (newBox.width < 5 || newBox.height < 5) {
                                                    return oldBox;
                                                }
                                                return newBox;
                                            }}
                                        />
                                    </Layer>
                                </Stage>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls Panel */}
                <div className="space-y-4">
                    {selectedElement ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center justify-between">
                                    Edit Text Element
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTextElement(selectedElement.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs defaultValue="content" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="content">Content</TabsTrigger>
                                        <TabsTrigger value="style">Style</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="content" className="space-y-4">
                                        <div>
                                            <Label htmlFor="text-content">Text</Label>
                                            <Input
                                                id="text-content"
                                                value={selectedElement.text}
                                                onChange={(e) => handleTextChange({ text: e.target.value })}
                                                placeholder="Enter text..."
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label>Font Family</Label>
                                            <Select
                                                value={selectedElement.fontFamily}
                                                onValueChange={(value) => handleTextChange({ fontFamily: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fontFamilies.map(font => (
                                                        <SelectItem key={font} value={font}>
                                                            {font}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div>
                                            <Label>Font Size: {selectedElement.fontSize}px</Label>
                                            <Slider
                                                value={[selectedElement.fontSize]}
                                                onValueChange={([value]) => handleTextChange({ fontSize: value })}
                                                min={12}
                                                max={200}
                                                step={1}
                                                className="mt-2"
                                            />
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="style" className="space-y-4">
                                        <div>
                                            <Label htmlFor="text-color">Color</Label>
                                            <Input
                                                id="text-color"
                                                type="color"
                                                value={selectedElement.fill}
                                                onChange={(e) => handleTextChange({ fill: e.target.value })}
                                                className="h-10"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label>Font Style</Label>
                                            <Select
                                                value={selectedElement.fontStyle}
                                                onValueChange={(value) => handleTextChange({ fontStyle: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fontStyles.map(style => (
                                                        <SelectItem key={style} value={style}>
                                                            {style}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div>
                                            <Label>Text Alignment</Label>
                                            <div className="flex gap-1 mt-2">
                                                {alignments.map(align => (
                                                    <Button
                                                        key={align}
                                                        variant={selectedElement.align === align ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleTextChange({ align })}
                                                    >
                                                        {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                                        {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                                        {align === 'right' && <AlignRight className="w-4 h-4" />}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label>Rotation: {Math.round(selectedElement.rotation)}°</Label>
                                            <Slider
                                                value={[selectedElement.rotation]}
                                                onValueChange={([value]) => handleTextChange({ rotation: value })}
                                                min={-180}
                                                max={180}
                                                step={1}
                                                className="mt-2"
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-gray-500">
                                <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Select a text element to edit</p>
                                <p className="text-sm">or add a new one</p>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* Text Elements List */}
                    {textElements.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Text Elements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {textElements.map((element) => (
                                    <div
                                        key={element.id}
                                        className={`p-2 rounded border cursor-pointer transition-colors ${
                                            selectedId === element.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedId(element.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate">
                                                {element.text || 'Empty Text'}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTextElement(element.id);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {element.fontFamily} • {element.fontSize}px
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 