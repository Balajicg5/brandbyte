import Image from "next/image"
import ContactFormButton from "./contact-form-button"

export default function Hero() {
  return (
    <section id="hero" className="card my-8 relative overflow-hidden shadow-md">
      <div className="p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-start">
        {/* Text content - takes full width on mobile */}
        <div className="w-full md:w-3/5 z-10">
          <h1 className="text-black dark:text-white">
            BrandByte: AI-Powered
            <span className="block text-[#7A7FEE] dark:text-[#7A7FEE]">Ad Creatives,</span>
            Instantly
          </h1>
          <p className="my-6 text-sm md:text-base max-w-md text-gray-700 dark:text-gray-300">
            Stop guessing what works. BrandByte uses artificial intelligence to design and write compelling ad
            creatives that get results. Launch campaigns faster and smarter.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ContactFormButton />
            <a href="#features" className="btn-secondary text-black dark:text-white">
              See How It Works
            </a>
          </div>
        </div>

        {/* Image - hidden on mobile, visible on md and up */}
        <div className="hidden md:block md:w-2/5 md:absolute md:right-0 md:top-0 md:bottom-0 md:flex md:items-center">
          <Image
            src="/placeholder-ai-ad-creative.png"
            alt="AI generating ad creatives"
            width={100}
            height={100}
            className="w-full h-auto md:h-full md:w-auto md:object-cover md:object-left"
          />
        </div>
      </div>
    </section>
  )
}
