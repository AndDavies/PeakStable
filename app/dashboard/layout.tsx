// app/dashboard/layout.tsx

import { ReactNode } from "react"
import DashboardHeader from "./components/dashboard-header"
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: "PeakMetrix Dashboard",
  description: "Manage your workouts, classes, and goals."
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-200 font-sans">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main 
        className="
          flex-1 w-full 
          overflow-hidden
          "
      >
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </main>

      {/* Footer (optional) */}
      {/* <DashboardFooter /> */}
    </div>
  )
}
