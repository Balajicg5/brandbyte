import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Analytics } from "@vercel/analytics/react"
import "@/components/landing-page/styles.css"
import { Suspense } from "react"

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "BrandByte",
  description:
    "AI-powered ad creative generator that helps you create high-converting ad creatives quickly and easily for your marketing campaigns.",
  icons: {
    icon: [{ url: "/brandbyte-favicon.png", type: "image/png" }],
    apple: [{ url: "/brandbyte-favicon.png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
