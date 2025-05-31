# AI Poster Generation with Text Overlay

This document explains the enhanced poster generation system that follows the Flux poster generation approach and uses React Konva for text overlay.

## Overview

The system has been updated to generate poster backgrounds without text, then add text using React Konva for better control and customization.

## Key Changes

### 1. Enhanced Prompt Generation (`lib/langchain.ts`)

- **System Prompt**: Updated to focus on generating backgrounds and visual elements only
- **No Text Generation**: Explicitly prevents AI from generating any text, letters, or typography
- **Composition Focus**: Emphasizes layout and spacing for text overlay areas
- **Brand Alignment**: Uses brand colors and aesthetic for professional poster design

### 2. Text Overlay Editor (`components/ui/text-overlay-editor.tsx`)

- **React Konva Integration**: Uses Konva for interactive text editing
- **Multiple Text Elements**: Support for adding multiple text layers
- **Font Customization**: Font family, size, color, style, and alignment controls
- **Transform Controls**: Drag, resize, and rotate text elements
- **Export Functionality**: Exports final poster with text as PNG

### 3. Campaign Form Integration (`components/dashboard/campaign-form.tsx`)

- **Text Editor Section**: Added after image generation
- **State Management**: Tracks text editor visibility and final image
- **Download Options**: Separate downloads for background and final poster

## Workflow

1. **Campaign Setup**: User fills campaign details (brand, product, audience, etc.)
2. **Background Generation**: AI generates poster background without text using enhanced prompts
3. **Text Addition**: User opens text overlay editor to add headlines, descriptions, CTAs
4. **Customization**: User customizes text appearance, position, and styling
5. **Export**: User downloads final poster with text overlay

## Prompt Structure

The enhanced prompts follow this structure:

```
Type: [poster/ad type]
Background: [detailed background description]
Product/Subject: [main visual elements]
Composition: [layout and spacing for text areas]
Style: [aesthetic and brand alignment]
Colors: [specific color palette]
```

## Text Overlay Features

- **Interactive Canvas**: Click and drag text elements
- **Font Controls**: Family, size, color, style selection
- **Alignment Options**: Left, center, right text alignment
- **Rotation**: 360-degree text rotation
- **Transform Handles**: Visual resize and rotate controls
- **Layer Management**: List view of all text elements

## Technical Implementation

### Dependencies Added
- `konva`: 2D canvas library
- `react-konva`: React bindings for Konva
- `@radix-ui/react-slider`: Slider component for controls

### Key Components
- `TextOverlayEditor`: Main text editing interface
- `Slider`: Range input for font size and rotation
- Enhanced `CampaignForm`: Integrated workflow

### API Integration
- Uses existing `/api/generate-ad` endpoint
- Enhanced prompts automatically applied via `langchainService`
- No breaking changes to existing API

## Benefits

1. **Better Text Quality**: No AI-generated text artifacts or spelling errors
2. **Full Control**: Complete customization of text appearance and positioning
3. **Professional Output**: Clean separation of background and text layers
4. **Flexible Workflow**: Edit text without regenerating background
5. **Brand Consistency**: Precise control over typography and layout

## Usage Example

```typescript
// Generate background
const result = await togetherAI.generateAdCreative(request);

// Add text overlay
<TextOverlayEditor
  backgroundImageUrl={result.imageUrl}
  onSave={handleTextOverlaySave}
  width={1024}
  height={1024}
/>
```

## Future Enhancements

- Template text layouts for different poster types
- Brand-specific font presets
- Advanced text effects (shadows, outlines, gradients)
- Batch text generation for A/B testing
- Integration with brand style guides 