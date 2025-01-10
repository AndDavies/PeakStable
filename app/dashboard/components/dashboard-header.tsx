"use client"

import { useRouter } from "next/navigation"
import { supabaseBrowserClient } from "@/utils/supabase/client"
import { useState } from "react"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"


export default function DashboardHeader() {
  const router = useRouter()
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
        w-full border-b border-gray-700
        bg-gray-900 text-gray-200
        px-6 py-4 sm:px-8 
        flex items-center justify-between
        shadow-md
      "
    >
      {/* Logo / Branding */}
      <div className="flex items-center space-x-4">
        <img
          src="/peakmetrix_logo.png"
          alt="PeakMetrix Logo"
          className="h-24 w-auto" 
          /* Adjust height to fit your new dark theme design */
        />
      </div>

      {/* Nav links */}
      <NavigationMenu>
        <NavigationMenuList className="hidden sm:flex space-x-6 text-sm font-medium">
          <NavigationMenuItem>
            <NavigationMenuLink href="/dashboard" className="transition-colors hover:text-pink-400">
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/dashboard/plans" className="transition-colors hover:text-pink-400">
              Program Calendar
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/dashboard/classes" className="transition-colors hover:text-pink-400">
              Classes
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/dashboard/workout-builder" className="transition-colors hover:text-pink-400">
              Workout Builder
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* User Info + Logout */}
      <div className="flex items-center space-x-6">
        {/* User Avatar */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Michael</span>
          <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-100">M</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="
            bg-pink-600 hover:bg-pink-500
            text-gray-50 px-4 py-2 
            rounded-md font-medium
            transition-all
            focus:outline-none focus:ring-2 focus:ring-pink-400
            disabled:opacity-50
          "
        >
          {loading ? "Logging Out..." : "Log Out"}
        </button>
      </div>
    </header>
  )
}