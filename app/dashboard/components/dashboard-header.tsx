"use client"

import { useRouter } from "next/navigation"
import { supabaseBrowserClient } from "@/utils/supabase/client"
import { useState } from "react"

export default function DashboardHeader() {
  const router = useRouter()
  // We now reference the named export from client.ts
  const supabase = supabaseBrowserClient
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    if (error) {
      console.error("Sign out error:", error)
      return
    }
    router.push("/login")
  }

  return (
    <header
      className="
        w-full border-b border-gray-200 
        bg-white text-gray-800 
        px-6 py-4 sm:px-8 
        flex items-center justify-between
        shadow-sm
      "
    >
      {/* Logo / Branding */}
      <div className="flex items-center space-x-4">
        <img
          src="/peakmetrix_logo.png"
          alt="PeakMetrix Logo"
          className="h-24 w-auto" /* Adjusted for better alignment */
        />
        
      </div>

      {/* Nav links */}
      <nav className="hidden sm:flex space-x-8 text-sm font-medium">
        <a
          href="/dashboard"
          className="hover:text-accentPink transition-colors"
        >
          Home
        </a>
        <a
          href="/dashboard/classes"
          className="hover:text-accentPink transition-colors"
        >
          Classes
        </a>
        <a
          href="/dashboard/workouts"
          className="hover:text-accentPink transition-colors"
        >
          Workouts
        </a>
      </nav>

      {/* User Info + Logout */}
      <div className="flex items-center space-x-6">
        {/* User Avatar */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Michael</span>
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-800">M</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="
            bg-accentPink hover:brightness-110 
            text-white px-4 py-2 
            rounded-md font-medium
            shadow-sm hover:shadow-md
            transition-all
          "
        >
          {loading ? "Logging Out..." : "Log Out"}
        </button>
      </div>
    </header>
  )
}
