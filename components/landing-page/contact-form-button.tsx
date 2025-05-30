"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import type React from "react"

interface ContactFormButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function ContactFormButton({ className = "", children }: ContactFormButtonProps) {
  const { user, isLoading } = useAuth()
  
  console.log("ContactFormButton Debug:", { user: !!user, isLoading, userId: user?.$id })

  if (isLoading) {
    return (
      <div className={className || "btn-primary"}>
        Loading...
      </div>
    )
  }

  if (user) {
    return (
      <Link href="/dashboard" className={className || "btn-primary"}>
        {children || "Go to Dashboard"}
      </Link>
    )
  }

  return (
    <Link href="/auth/signin" className={className || "btn-primary"}>
      {children || "Get Started"}
    </Link>
  )
}
