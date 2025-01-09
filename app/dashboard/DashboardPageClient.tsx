"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
// If you have `@/components/ui/avatar` from shadcn:
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type DashboardPageClientProps = {
  userName: string
  avatarUrl?: string | null
}

export default function DashboardPageClient({ userName, avatarUrl }: DashboardPageClientProps) {
  // Let's parse just the "first letter" from userName for fallback
  const initial = userName?.charAt(0).toUpperCase() || "U"

  return (
    <div className="space-y-12 bg-gray-50 min-h-screen w-full flex flex-col p-4 sm:p-8">
      {/* Welcome Section */}
      <div className="space-y-2 flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="h-16 w-16">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={userName} />
          ) : (
            <AvatarFallback>{initial}</AvatarFallback>
          )}
        </Avatar>

        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome, {userName}!
          </h1>
          <p className="text-sm text-gray-600">
            Track your progress, view today's workout, manage programs, and stay on top of your goals.
          </p>
        </div>
      </div>

      {/* Cards: Grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card 1 */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">My Upcoming Classes</CardTitle>
            <CardDescription className="text-gray-600">
              No upcoming classes
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Card 2 */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Goal Tracker</CardTitle>
            <CardDescription className="text-gray-600">
              Monitor progress towards personal records.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Card 3 */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Programs Marketplace</CardTitle>
            <CardDescription className="text-gray-600">
              Explore and purchase new training programs.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Card 4 */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Recently Logged Workouts</CardTitle>
            <CardDescription className="text-gray-600">
              View a snapshot of your latest sessions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Calendar Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Workout Calendar</CardTitle>
            <CardDescription className="text-gray-600">
              View your scheduled workouts for the week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">[Calendar placeholder...]</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Classes Calendar</CardTitle>
            <CardDescription className="text-gray-600">
              Upcoming gym classes & events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">[Classes calendar placeholder...]</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
