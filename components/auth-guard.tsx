"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { LoginPage } from "./login-page"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return <>{children}</>
}
