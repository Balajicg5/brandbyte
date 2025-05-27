# Environment Setup for BrandByte

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=brandbyte-db
NEXT_PUBLIC_APPWRITE_BRANDS_COLLECTION_ID=brands
NEXT_PUBLIC_APPWRITE_CAMPAIGNS_COLLECTION_ID=campaigns
NEXT_PUBLIC_APPWRITE_BUCKET_ID=brand-assets

# Together.ai API Configuration
TOGETHER_API_KEY=your-together-ai-api-key
```

## Appwrite Database Setup

### 1. Create Database
- Database ID: `brandbyte-db`
- Database Name: `BrandByte Database`

### 2. Create Collections

#### Brands Collection
- Collection ID: `brands`
- Collection Name: `Brands`

**Attributes:**
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `userId` | String | 36 | ✅ Yes | - |
| `name` | String | 100 | ✅ Yes | - |
| `description` | String | 500 | ✅ Yes | - |
| `logo` | String | 36 | ❌ No | - |
| `logoUrl` | String | 500 | ❌ No | - |
| `primaryColor` | String | 7 | ✅ Yes | `#7A7FEE` |
| `secondaryColor` | String | 7 | ✅ Yes | `#00D4FF` |
| `accentColor` | String | 7 | ✅ Yes | `#FF6B6B` |
| `createdAt` | String | 50 | ✅ Yes | - |
| `updatedAt` | String | 50 | ✅ Yes | - |

#### Campaigns Collection
- Collection ID: `campaigns`
- Collection Name: `Campaigns`

**Attributes:**
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `userId` | String | 36 | ✅ Yes | - |
| `brandId` | String | 36 | ✅ Yes | - |
| `name` | String | 100 | ✅ Yes | - |
| `description` | String | 500 | ✅ Yes | - |
| `status` | String | 20 | ✅ Yes | `draft` |
| `productName` | String | 100 | ✅ Yes | - |
| `productDescription` | String | 1000 | ✅ Yes | - |
| `productPrice` | String | 50 | ❌ No | - |
| `productCategory` | String | 50 | ✅ Yes | - |
| `campaignGoals` | String | 1000 | ✅ Yes | - |
| `targetAudience` | String | 1000 | ✅ Yes | - |
| `callToAction` | String | 100 | ✅ Yes | - |
| `targetPlatforms` | String | 500 | ✅ Yes | - |
| `generatedPrompt` | String | 2000 | ❌ No | - |
| `generatedImageUrl` | String | 1000 | ❌ No | - |
| `createdAt` | String | 50 | ✅ Yes | - |
| `updatedAt` | String | 50 | ✅ Yes | - |

### 3. Create Storage Bucket
- Bucket ID: `brand-assets`
- Bucket Name: `Brand Assets`
- File Security: Enabled
- Maximum File Size: `5MB` (5242880 bytes)
- Allowed File Extensions: `jpg,jpeg,png,gif,webp,svg`

### 4. Permissions Setup

**For Collections (Brands & Campaigns):**
```
Create: users
Read: user:[USER_ID]
Update: user:[USER_ID]
Delete: user:[USER_ID]
```

**For Storage Bucket:**
```
Create: users
Read: users
Update: user:[USER_ID]
Delete: user:[USER_ID]
```

## Together.ai API Setup

### 1. Get API Key
1. Go to [Together.ai](https://together.ai)
2. Sign up or log in to your account
3. Navigate to API settings
4. Generate a new API key
5. Copy the API key to your `.env.local` file

### 2. API Features Used
- **LLM for Prompt Generation**: `meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo`
- **Image Generation**: `black-forest-labs/FLUX.1-schnell-Free`

### 3. Usage Limits
- Check your Together.ai account for current usage limits
- The free tier includes limited API calls
- Monitor usage in your Together.ai dashboard

## Features Overview

### Campaign Management
- **Product Details**: Name, description, category, pricing
- **Campaign Goals**: Multiple selectable objectives
- **Target Audience**: Detailed audience descriptions
- **Target Platforms**: Multi-platform selection
- **Call to Action**: Customizable CTA text

### AI Ad Creative Generation
1. **Prompt Generation**: Uses LLM to create detailed image generation prompts
2. **Image Generation**: Uses Flux Schnell to create ad creatives
3. **Brand Integration**: Incorporates brand colors, identity, and guidelines
4. **Platform Optimization**: Tailors creatives for selected platforms

### Dashboard Features
- **Brand Management**: Create, edit, delete brands with logo upload
- **Campaign Management**: Full CRUD operations for campaigns
- **Status Management**: Draft, Active, Paused, Completed statuses
- **Image Management**: View, download generated ad creatives
- **Search & Filter**: Find campaigns by name, status, or product

## Getting Started

1. Set up your Appwrite project with the database structure above
2. Get your Together.ai API key
3. Configure your `.env.local` file
4. Run the application: `npm run dev`
5. Sign up/Sign in to start creating brands and campaigns
6. Generate your first AI-powered ad creative!

## Troubleshooting

### Common Issues
1. **Database Attribute Errors**: Ensure all attributes are created with correct types and sizes
2. **Permission Errors**: Verify collection and bucket permissions are set correctly
3. **API Key Errors**: Check that your Together.ai API key is valid and has sufficient credits
4. **Image Generation Fails**: Verify your Together.ai account has image generation access

### Support
- Check Appwrite documentation for database setup
- Review Together.ai documentation for API usage
- Ensure all environment variables are correctly set 