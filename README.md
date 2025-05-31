# 🎨 BrandByte

**AI-Powered Ad Creative Generation Platform**

BrandByte is a modern web application that leverages cutting-edge AI technology to generate professional advertising creatives. Built with Next.js 15, it combines the power of LangChain for intelligent prompt generation and FLUX.1 for high-quality image generation, creating stunning ad creatives tailored to your brand and campaign goals.

## ✨ Features

### 🎯 **Core Features**
- **AI-Powered Ad Generation**: Generate professional ad creatives using FLUX.1 Schnell AI model
- **Intelligent Prompt Engineering**: LangChain-powered prompt generation with Meta Llama 3.3 70B
- **Brand Management**: Create and manage multiple brands with custom colors and logos
- **Campaign Management**: Full CRUD operations for advertising campaigns
- **Multi-Platform Optimization**: Tailored creatives for Instagram, Facebook, Google Ads, LinkedIn, and more

### 🖼️ **Advanced Image Editor**
- **Interactive Poster Editor**: React Konva-powered text overlay system
- **Real-time Text Editing**: Add, edit, and style text elements with live preview
- **Image Cropping**: Advanced crop functionality with preset aspect ratios
- **Platform-Specific Sizing**: Automatic resizing for different social media platforms
- **High-Quality Export**: Export final posters in multiple formats and sizes

### 🎨 **Design & Customization**
- **Text-Free AI Generation**: AI generates clean backgrounds perfect for text overlay
- **Professional Typography**: 20+ web-safe fonts with full styling controls
- **Color Palette System**: Brand-consistent color schemes and palettes
- **Transform Controls**: Drag, resize, rotate, and position text elements
- **Layer Management**: Organize and manage multiple text layers

### 📊 **Dashboard & Management**
- **Beautiful Gallery View**: Browse all generated ad creatives in an organized grid
- **Campaign Status Tracking**: Draft, Active, Paused, and Completed status management
- **Search & Filter**: Find campaigns and creatives quickly
- **Download Management**: Bulk download and export options
- **User Authentication**: Secure user accounts with Appwrite Auth

## 🛠️ **Technology Stack**

### **Frontend**
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### **Canvas & Image Processing**
- **[React Konva](https://konvajs.org/docs/react/)** - 2D canvas library for interactive graphics
- **[Konva](https://konvajs.org/)** - High-performance 2D canvas library
- **[Pica](https://github.com/nodeca/pica)** - High-quality image resizing
- **[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** - Native canvas manipulation

### **AI & Machine Learning**
- **[LangChain](https://langchain.com/)** - Framework for developing AI applications
- **[Together AI](https://together.ai/)** - AI model hosting and inference
- **[FLUX.1 Schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell)** - State-of-the-art image generation
- **[Meta Llama 3.3 70B](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)** - Large language model for prompt generation

### **Backend & Database**
- **[Appwrite](https://appwrite.io/)** - Backend-as-a-Service platform
- **[Node.js](https://nodejs.org/)** - Server-side JavaScript runtime
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### **Development Tools**
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[PostCSS](https://postcss.org/)** - CSS transformation tool
- **[Autoprefixer](https://autoprefixer.github.io/)** - CSS vendor prefixing

### **UI Components & Libraries**
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with easy validation
- **[Date-fns](https://date-fns.org/)** - Modern JavaScript date utility library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[Embla Carousel](https://www.embla-carousel.com/)** - Lightweight carousel library

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- Appwrite account
- Together AI account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/brandbyte.git
   cd brandbyte
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Appwrite Configuration
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=brandbyte-db
   NEXT_PUBLIC_APPWRITE_BRANDS_COLLECTION_ID=brands
   NEXT_PUBLIC_APPWRITE_CAMPAIGNS_COLLECTION_ID=campaigns
   NEXT_PUBLIC_APPWRITE_BUCKET_ID=brand-assets
   NEXT_PUBLIC_APPWRITE_AD_CREATIVES_COLLECTION_ID=ad-creatives
   APPWRITE_API_KEY=your-appwrite-api-key

   # Together AI API Configuration  
   TOGETHER_API_KEY=your-together-ai-api-key
   ```

4. **Database Setup**
   
   Follow the detailed setup guide in [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) to configure your Appwrite database.

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 **Usage**

### **Creating Your First Ad Creative**

1. **Sign Up/Login** - Create an account or sign in
2. **Create a Brand** - Set up your brand with colors and logo
3. **Create a Campaign** - Define your product, audience, and goals
4. **Generate Creative** - Let AI create your ad background
5. **Add Text** - Use the poster editor to add headlines and CTAs
6. **Export** - Download your professional ad creative

### **Poster Editor Features**

- **Text Elements**: Add headlines, subheadings, body text, and CTAs
- **Font Customization**: Choose from 20+ fonts with size, color, and style controls
- **Positioning**: Drag and drop text elements anywhere on the canvas
- **Transform**: Resize, rotate, and scale text elements
- **Crop Tool**: Crop background images with preset aspect ratios
- **Platform Sizing**: Automatically resize for different social platforms

## 📁 **Project Structure**

```
brandbyte/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility libraries
│   ├── appwrite.ts       # Appwrite client configuration
│   ├── langchain.ts      # AI prompt generation
│   └── together-ai.ts    # Together AI integration
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── styles/               # Global styles
└── public/               # Static assets
```

## 🎯 **Key Features Deep Dive**

### **AI Prompt Engineering**
- **Context-Aware Generation**: Prompts consider brand identity, product details, and target audience
- **Platform Optimization**: Tailored prompts for different advertising platforms
- **Text-Free Generation**: AI generates clean backgrounds perfect for text overlay
- **Brand Consistency**: Incorporates brand colors and aesthetic guidelines

### **Interactive Poster Editor**
- **Real-Time Preview**: See changes instantly as you edit
- **Professional Typography**: Web-safe fonts optimized for advertising
- **Transform Controls**: Visual handles for resizing and rotating
- **Layer Management**: Organize multiple text elements
- **Export Options**: High-quality PNG export with custom dimensions

### **Campaign Management**
- **Multi-Brand Support**: Manage multiple brands and campaigns
- **Status Tracking**: Track campaign progress from draft to completion
- **Gallery View**: Beautiful grid layout for browsing creatives
- **Search & Filter**: Quickly find specific campaigns or creatives

## 🔮 **Future Features & Roadmap**

### **🎨 Enhanced Design Tools**
- [ ] **Advanced Text Effects**: Shadows, outlines, gradients, and 3D effects
- [ ] **Shape & Icon Library**: Add geometric shapes, icons, and design elements
- [ ] **Template System**: Pre-designed templates for different industries
- [ ] **Brand Style Guides**: Automated brand guideline enforcement
- [ ] **Vector Graphics Support**: SVG import and editing capabilities

### **🤖 AI & Automation**
- [ ] **A/B Testing Generator**: Automatically generate multiple creative variations
- [ ] **Performance Prediction**: AI-powered creative performance scoring
- [ ] **Auto-Optimization**: Automatically optimize creatives based on platform best practices
- [ ] **Smart Cropping**: AI-powered intelligent image cropping
- [ ] **Content-Aware Scaling**: Intelligent resizing that preserves important elements

### **📊 Analytics & Insights**
- [ ] **Creative Analytics**: Track performance metrics for generated creatives
- [ ] **Trend Analysis**: Identify trending design patterns and styles
- [ ] **ROI Tracking**: Connect creative performance to business outcomes
- [ ] **Competitor Analysis**: Analyze competitor creatives for insights
- [ ] **Brand Consistency Scoring**: Measure brand guideline adherence

### **🔗 Platform Integrations**
- [ ] **Social Media APIs**: Direct publishing to Facebook, Instagram, LinkedIn
- [ ] **Google Ads Integration**: Seamless ad campaign creation
- [ ] **Figma Plugin**: Export designs directly to Figma
- [ ] **Canva Integration**: Import/export with Canva designs
- [ ] **Stock Photo APIs**: Integration with Unsplash, Shutterstock, Getty Images

### **👥 Collaboration Features**
- [ ] **Team Workspaces**: Multi-user collaboration on campaigns
- [ ] **Comment System**: Feedback and approval workflows
- [ ] **Version Control**: Track creative iterations and changes
- [ ] **Role-Based Permissions**: Designer, reviewer, and admin roles
- [ ] **Client Portal**: Share creatives with clients for approval

### **🎯 Advanced Targeting**
- [ ] **Audience Personas**: Create detailed audience profiles
- [ ] **Demographic Optimization**: Tailor creatives for specific demographics
- [ ] **Behavioral Targeting**: Generate creatives based on user behavior data
- [ ] **Geographic Customization**: Location-specific creative variations
- [ ] **Seasonal Optimization**: Automatically adjust for holidays and seasons

### **📱 Mobile & Accessibility**
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Offline Mode**: Work on creatives without internet connection
- [ ] **Accessibility Features**: Screen reader support, keyboard navigation
- [ ] **Voice Commands**: Voice-controlled creative editing
- [ ] **Touch Gestures**: Advanced touch controls for mobile editing

### **🔧 Technical Enhancements**
- [ ] **Real-Time Collaboration**: Live collaborative editing
- [ ] **Advanced Caching**: Faster loading and better performance
- [ ] **CDN Integration**: Global content delivery for faster access
- [ ] **API Webhooks**: Real-time notifications and integrations
- [ ] **GraphQL API**: More efficient data fetching

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **[Together AI](https://together.ai/)** for providing powerful AI model hosting
- **[Appwrite](https://appwrite.io/)** for the excellent backend-as-a-service platform
- **[Vercel](https://vercel.com/)** for seamless deployment and hosting
- **[Radix UI](https://www.radix-ui.com/)** for accessible component primitives
- **[Tailwind CSS](https://tailwindcss.com/)** for the utility-first CSS framework


---

<div align="center">
  <p>Made with ❤️ by the BrandByte Team</p>
  <p>
    <a href="https://brandbyte.com">Website</a> •
    <a href="https://docs.brandbyte.com">Documentation</a> •
    <a href="https://twitter.com/brandbyte">Twitter</a> •
    <a href="https://linkedin.com/company/brandbyte">LinkedIn</a>
  </p>
</div> 
