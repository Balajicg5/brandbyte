import { Rss, BookOpen, Sparkles, MessageCircleQuestion } from "lucide-react"
import type { SubNavItem } from "./nav-dropdown"
import { iconColors } from "./color-utils"

// Resources dropdown data for BrandByte
export const resourcesDropdownData: SubNavItem[][] = [
  [
    {
      title: "Blog",
      description: "Tips, trends, and insights on AI in advertising.",
      href: "/blog",
      icon: Rss,
      color: iconColors.resources.blog,
      external: false,
    },
    {
      title: "Guides & Tutorials",
      description: "Learn how to get the most out of BrandByte.",
      href: "/guides",
      icon: BookOpen,
      color: iconColors.resources.tutorials,
      external: false,
    },
    {
      title: "Case Studies",
      description: "See how BrandByte helps businesses succeed.",
      href: "/ad-gallery",
      icon: Sparkles,
      color: iconColors.resources.community,
      external: false,
    },
    {
      title: "FAQ",
      description: "Answers to your common questions about BrandByte.",
      href: "/#faq",
      icon: MessageCircleQuestion,
      color: iconColors.resources.blog,
      external: false,
    },
  ],
]
