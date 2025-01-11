// File: app/dashboard/classes/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/utils/supabase/supabaseClient'
import { getProfile } from '@/utils/supabase/profile' // or your custom function
import { startOfWeek, addDays } from 'date-fns'
import VerticalCalendar from './VerticalCalendar'

/**
 * Interface matching your 'class_schedules' table + an optional 'confirmed_count'.
 */
interface ClassSchedule {
  id: string
  class_name: string
  start_time: string
  end_time: string
  max_participants: number
  class_type_id?: string | null
  // We add confirmed_count for later usage
  confirmed_count?: number
}

export default async function ClassesPage() {
  // 1) Create SSR Supabase client & get session
  const supabase = await createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const userId = session.user.id

  // 2) Fetch user profile (with role, gym_id, etc.)
  const profile = await getProfile(userId)
  if (!profile?.current_gym_id) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
        <p>No gym found in your profile. Please update your account.</p>
      </div>
    )
  }
  const { role, current_gym_id } = profile

  // 3) Compute date range for the current week
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 })
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 7)

  // 4) Fetch rows from 'class_schedules' for the user's current gym
  const { data: schedulesData, error: schedulesError } = await supabase
    .from('class_schedules')
    .select('id, class_name, start_time, end_time, max_participants, class_type_id')
    .eq('current_gym_id', current_gym_id)
    .gte('start_time', startOfCurrentWeek.toISOString())
    .lte('start_time', endOfCurrentWeek.toISOString())

  if (schedulesError) {
    console.error('[ClassesPage] schedules fetch error:', schedulesError)
  }

  // 5) Convert raw rows into our ClassSchedule interface, defaulting confirmed_count to 0
  let initialSchedules: ClassSchedule[] = []
  if (schedulesData) {
    initialSchedules = schedulesData.map((row) => ({
      ...row,
      confirmed_count: 0,
    }))
  }

  // 6) Optionally compute actual confirmed counts
  if (initialSchedules.length > 0) {
    const classIds = initialSchedules.map((cls) => cls.id)
    const { data: regData, error: regError } = await supabase
      .from('class_registrations')
      .select('class_schedule_id')
      .eq('status', 'confirmed')
      .in('class_schedule_id', classIds)

    if (!regError && regData) {
      // Build a map of (classId -> count of confirmed)
      const countsMap = new Map<string, number>()
      for (const row of regData) {
        countsMap.set(row.class_schedule_id, (countsMap.get(row.class_schedule_id) || 0) + 1)
      }

      // Update each schedule's confirmed_count in place
      initialSchedules = initialSchedules.map((cls) => ({
        ...cls,
        confirmed_count: countsMap.get(cls.id) || 0,
      }))
    }
  }

  // 7) Pass data + user role to your VerticalCalendar
  return (
    <section className="min-h-screen bg-gray-900 text-gray-200 p-6 space-y-4">
      <h1 className="text-3xl font-extrabold">Classes</h1>
      <p className="text-sm text-gray-400">
        Welcome to your weekly class schedule
      </p>
      <VerticalCalendar
        initialSchedules={initialSchedules}
        currentGymId={current_gym_id}
        userId={userId}
        userRole={role}
      />
    </section>
  )
}