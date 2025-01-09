/**
 * app/dashboard/classes/page.tsx
 *
 * This file is a Next.js Server Component. It handles:
 * 1) Securely creating a Supabase client via SSR.
 * 2) Fetching the user's data and the weekly class schedules.
 * 3) Rendering a minimal UI that includes a client component
 *    for the interactive calendar (ClassCalendar).
 *
 * Next.js automatically treats files in app/ as Server Components
 * unless marked with "use client".
 */

import { createClient } from '@/utils/supabase/server'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import ClassCalendar from './ClassCalendar'
import Link from 'next/link' // Example: link back to main dashboard if needed

// We'll define a simple type for the classes as fetched from Supabase
type ClassSchedule = {
  id: string
  class_name: string
  start_time: string // stored in ISO
  end_time: string // stored in ISO
  max_participants: number
  class_type_id: string
  confirmed_count?: number // We can compute on the server if we like
}

export default async function ClassesPage() {
  // 1) Create supabase client
  const supabase = await createClient()

  // 2) Verify user session or user roles if needed (middleware should also protect this route)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // This should rarely happen since our middleware will typically redirect them, 
    // but just in case:
    return <div>Please log in to view classes.</div>
  }

  // 3) Retrieve user profile or role if needed
  //    For instance, to check if they are "admin" or "coach".
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, current_gym_id')
    .eq('user_id', session.user.id)
    .single()

  // Just in case the user has no profile or an error occurred:
  if (!profileData?.current_gym_id) {
    return <div>Error: No gym selected in your profile.</div>
  }

  const currentGymId = profileData.current_gym_id
  const userRole = profileData.role

  // 4) (Optional) Decide the date range for classes we want to fetch.
  //    For example, we can focus on the current week. You can accept URL params
  //    or handle in the client if you prefer. For simplicity, let's do "this week."
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }) // Sunday
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 7)

  // 5) Fetch the class schedules for the current gym and date range
  const { data: schedulesData, error: schedulesError } = await supabase
    .from('class_schedules')
    .select('id, class_name, start_time, end_time, max_participants, class_type_id')
    .eq('current_gym_id', currentGymId)
    .gte('start_time', startOfCurrentWeek.toISOString())
    .lte('start_time', endOfCurrentWeek.toISOString())

  if (schedulesError) {
    console.error('[ClassesPage] Error fetching schedules:', schedulesError)
  }

  const schedules: ClassSchedule[] = schedulesData || []

  // 6) If you'd like to fetch the "confirmed_count" on the server, you can do so:
  //    (Alternatively, handle it in a client component if real-time updates are desired.)
  const classIds = schedules.map((cls) => cls.id)
  let countsMap = new Map<string, number>()

  if (classIds.length > 0) {
    const { data: regData, error: regError } = await supabase
      .from('class_registrations')
      .select('class_schedule_id')
      .eq('status', 'confirmed')
      .in('class_schedule_id', classIds)

    if (!regError && regData) {
      // Tally up confirmed registrations
      regData.forEach((row) => {
        const prev = countsMap.get(row.class_schedule_id) || 0
        countsMap.set(row.class_schedule_id, prev + 1)
      })
      // Attach confirmed counts back to the schedule objects
      schedules.forEach((cls) => {
        cls.confirmed_count = countsMap.get(cls.id) || 0
      })
    }
  }

  // 7) Render minimal UI (Server side). We pass the data to a client component for interactivity.
  return (
    <section className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Classes</h1>
      <p className="text-sm text-muted-foreground">
        Welcome to your weekly schedule. Select a class to register or manage.
      </p>

      {/* Link back to main dashboard (optional) */}
      <Link href="/dashboard" className="underline text-sm text-accentPink">
        &larr; Back to Dashboard
      </Link>

      {/* 
        We pass the schedule data and user role as props to the client component.
        The ClassCalendar can handle user interactions (click events, etc.).
      */}
      <ClassCalendar 
        schedules={schedules} 
        userRole={userRole} 
        currentGymId={currentGymId}
      />
    </section>
  )
}