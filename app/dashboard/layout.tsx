// app/dashboard/layout.tsx
import { ReactNode } from "react"
import DashboardHeader from "./components/dashboard-header"
import DashboardFooter from "./components/dashboard-footer"

export const metadata = {
  title: "PeakMetrix Dashboard",
  description: "Manage your workouts, classes, and goals."
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <DashboardHeader />
      <main className="flex-1 w-full min-h-screen bg-gray-50 px-4 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        {children}
      </main>
      <DashboardFooter />
    </div>
  )
}
