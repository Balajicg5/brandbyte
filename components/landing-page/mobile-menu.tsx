"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { useTheme } from "next-themes"
import SignInButton from "@/components/auth/sign-in-button"
import { useAuth } from "@/lib/auth-context"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const { isAuthenticated } = useAuth()

  // Ensure component is mounted before rendering theme-dependent elements
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = mounted && resolvedTheme === "dark"

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Determine which logo to show based on theme
  const logoSrc = isDarkMode ? "/brandbyte-logo-light.png" : "/brandbyte-logo-dark.png"

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 md:hidden" style={{ display: isOpen ? "block" : "none" }}>
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#111111] shadow-xl overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111]">
          <Link href="/" className="flex items-center" onClick={onClose}>
            {mounted ? (
              <Image
                src={logoSrc || "/placeholder.svg"}
                alt="BrandByte Logo"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            ) : (
              <div className="h-8 w-[150px]" />
            )}
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className={`flex items-center py-3 px-4 rounded-lg text-base ${
                  pathname === "/"
                    ? "bg-[#7A7FEE]/10 text-[#7A7FEE]"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={onClose}
              >
                Home
              </Link>
            </li>

            {!isAuthenticated && (
              <li>
                <Link
                  href="/auth/signin"
                  className={`flex items-center py-3 px-4 rounded-lg text-base ${
                    pathname === "/auth/signin" || pathname === "/signup" || pathname === "/start"
                      ? "bg-[#7A7FEE]/10 text-[#7A7FEE]"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={onClose}
                >
                  Get Started
                </Link>
              </li>
            )}

            {/* Sign In Button for Mobile */}
            <li className="pt-2">
              <div className="px-4">
                <SignInButton />
              </div>
            </li>
          </ul>
        </nav>

        <div className="p-4 mt-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/#features"
            className="flex items-center justify-center w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg text-base font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}
