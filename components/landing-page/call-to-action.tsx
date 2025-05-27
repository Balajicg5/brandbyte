import Image from "next/image"
import Link from "next/link"

export default function CallToAction() {
  return (
    <section id="get-started" className="card my-20 relative overflow-hidden shadow-md">
      <div className="p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-start">
        {/* Text content - takes full width on mobile */}
        <div className="w-full md:w-3/5 z-10">
          <h2 className="text-black dark:text-white mb-6">
            Ready to Revolutionize
            <span className="block text-[#7A7FEE] dark:text-[#7A7FEE]">Your Ad Creatives?</span>
          </h2>
          <p className="my-6 text-sm md:text-base max-w-md text-gray-700 dark:text-gray-300">
            Stop wasting time and budget on underperforming ads. Experience the power of AI with BrandByte and start
            creating ad creatives that convert.
          </p>
          <p className="mb-6 text-sm md:text-base max-w-md text-gray-700 dark:text-gray-300">
            Sign up for your free trial or explore our features to see how BrandByte can elevate your marketing.
          </p>
          <div>
            <Link href="/auth/signin" className="btn-primary mr-4">
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Image - hidden on mobile, visible on md and up */}
        <div className="hidden md:block md:w-2/5 md:absolute md:right-0 md:top-0 md:bottom-0 md:flex md:items-center">
          <Image
            src="/placeholder-ai-ad-creative.png"
            alt="BrandByte AI Ad Creative Generation"
            width={500}
            height={500}
            className="w-full h-auto md:h-full md:w-auto md:object-cover md:object-left"
          />
        </div>
      </div>
    </section>
  )
}
