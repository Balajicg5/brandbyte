import { Bot, ImageIcon, Share2, BarChart2 } from "lucide-react"

const features = [
  {
    id: 1,
    title: "AI-Powered Copywriting",
    description: "Generate compelling ad headlines and body text in seconds, tailored to your audience.",
    icon: Bot,
    color: "bg-[#7A7FEE]",
  },
  {
    id: 2,
    title: "Smart Visual Suggestions",
    description: "Get AI recommendations for images, layouts, and designs that capture attention and drive clicks.",
    icon: ImageIcon,
    color: "bg-[#7A7FEE]",
  },
  {
    id: 3,
    title: "Multi-Platform Optimization",
    description: "Instantly create ad variations optimized for Facebook, Instagram, Google Ads, and more.",
    icon: Share2,
    color: "bg-[#7A7FEE]",
  },
]

export default function Features() {
  return (
    <section id="features" className="my-20">
      <h2 className="text-black dark:text-white mb-6">
        Transform Your Ad Creation
        <span className="block text-[#7A7FEE] dark:text-[#7A7FEE]">With AI</span>
      </h2>
      <p className="mb-12 max-w-2xl text-gray-700 dark:text-gray-300">
        BrandByte empowers you with intelligent tools to create high-performing ad creatives faster than ever before.
        Discover the features that will revolutionize your marketing campaigns.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.id} className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{feature.title}</h3>
            <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
