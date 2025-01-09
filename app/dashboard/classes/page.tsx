/**
 * app/dashboard/classes/page.tsx
 *
 * Server Component that:
 * 1) Creates a Supabase server client (SSR).
 * 2) Fetches the user's session & weekly class schedules for the current gym.
 * 3) Passes the data (including userId) to the ClassCalendar client component.
 */

import { createClient } from '@/utils/supabase/server'
import { format, startOfWeek, addDays } from 'date-fns'
import Link from 'next/link'
import ClassCalendar from './ClassCalendar'

// Define a type for the schedules we fetch from Supabase
type ClassSchedule = {
  id: string
  class_name: string
  start_time: string
  end_time: string
  max_participants: number
  class_type_id: string
  confirmed_count?: number // We compute on the server if we like
}

export default async function ClassesPage() {
  // 1) Create Supabase client (server-side)
  const supabase = await createClient()

  // 2) Verify user session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('[ClassesPage] Error retrieving session:', sessionError)
  }
  if (!session) {
    // In theory, your middleware should redirect, but just in case:
    return <div>Please log in to view classes.</div>
  }

  // 3) Fetch user profile to confirm current_gym_id, role, etc.
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, current_gym_id')
    .eq('user_id', session.user.id)
    .single()

  if (!profileData?.current_gym_id) {
    console.log('No gym selected for user ID:', session.user.id)
    return <div>Error: No gym selected in your profile.</div>
  }

  const currentGymId = profileData.current_gym_id
  const userRole = profileData.role
  const userId = session.user.id // We'll pass this to the calendar

  // 4) Compute start/end of the current week
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }) // Sunday
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 7)

  // 5) Fetch the class schedules for the current gym within this week range
  const { data: schedulesData, error: schedulesError } = await supabase
    .from('class_schedules')
    .select('id, class_name, start_time, end_time, max_participants, class_type_id')
    .eq('current_gym_id', currentGymId)
    .gte('start_time', startOfCurrentWeek.toISOString())
    .lte('start_time', endOfCurrentWeek.toISOString())

  if (schedulesError) {
    console.error('[ClassesPage] Error fetching schedules:', schedulesError)
  }

  // 6) Store schedules or fallback to empty array
  const schedules: ClassSchedule[] = schedulesData || []

  // 7) Optionally compute confirmed_count server-side
  const classIds = schedules.map((cls) => cls.id)
  if (classIds.length > 0) {
    const { data: regData, error: regError } = await supabase
      .from('class_registrations')
      .select('class_schedule_id')
      .eq('status', 'confirmed')
      .in('class_schedule_id', classIds)

    if (!regError && regData) {
      const countsMap = new Map<string, number>()
      regData.forEach((row) => {
        const prevCount = countsMap.get(row.class_schedule_id) || 0
        countsMap.set(row.class_schedule_id, prevCount + 1)
      })
      schedules.forEach((cls) => {
        cls.confirmed_count = countsMap.get(cls.id) || 0
      })
    }
  }

  // 8) Render UI
  return (
    <section className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Classes</h1>
      <p className="text-sm text-gray-500">
        Welcome to your weekly schedule. Select a class to register or manage.
      </p>

      {/* Link back to main dashboard (optional) */}
      <Link href="/dashboard" className="underline text-sm text-pink-600">
        &larr; Back to Dashboard
      </Link>

      {/* Pass the fetched schedules, userRole, currentGymId, and userId to the client component */}
      <ClassCalendar
        schedules={schedules}
        userRole={userRole}
        currentGymId={currentGymId}
        userId={userId}
      />
    </section>
  )
}