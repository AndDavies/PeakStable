/**
 * app/dashboard/plans/page.tsx
 *
 * Server Component that:
 * 1) Creates a Supabase server client (SSR).
 * 2) Fetches the user's session & scheduled workouts for the current gym and individual user.
 * 3) Passes the data (including userId) to the PlansCalendar client component.
 *
 * Updated for a dark theme & pink highlights. 
 * We wrap the final return in a dark container with matching text.
 */

import { createClient } from '@/utils/supabase/server'
import PlansCalendar from './PlansCalendar'

// Define a type for the workouts we fetch from Supabase
type ScheduledWorkout = {
  id: string
  user_id: string
  date: string
  workout_details: {
    type: string
    notes: string[]
    warmUp: string
    workout: { name: string; reps: number }[]
    coolDown: string
  }
  status: string
  created_at: string
  track_id: string
  gym_id: string
  name: string
}

export default async function PlansPage() {
  // 1) Create Supabase client (server-side)
  const supabase = await createClient()

  // 2) Verify user session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('[PlansPage] Error retrieving session:', sessionError)
  }
  if (!session) {
    // In theory, your middleware should redirect, but just in case:
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
        Please log in to view your planned workouts.
      </div>
    )
  }

  // 3) Fetch user profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('current_gym_id')
    .eq('user_id', session.user.id)
    .single()

  const currentGymId = profileData?.current_gym_id
  const userId = session.user.id

  // 4) Fetch user's tracks
  const { data: userTracksData, error: userTracksError } = await supabase
    .from('tracks')
    .select('id')
    .eq('user_id', userId)

  if (userTracksError) {
    console.error('[PlansPage] Error fetching user tracks:', userTracksError)
  }

  const userTrackIds = userTracksData?.map(track => track.id) || []

  // 5) Fetch individual user workouts
  const { data: userWorkoutsData, error: userWorkoutsError } = await supabase
    .from('scheduled_workouts')
    .select('*')
    .in('track_id', userTrackIds)

  if (userWorkoutsError) {
    console.error('[PlansPage] Error fetching user workouts:', userWorkoutsError)
  }

  const userWorkouts: ScheduledWorkout[] = userWorkoutsData || []

  // 6) Fetch gym workouts if current_gym_id is available
  let gymWorkouts: ScheduledWorkout[] = []
  if (currentGymId) {
    const { data: gymTracksData, error: gymTracksError } = await supabase
      .from('tracks')
      .select('id')
      .eq('gym_id', currentGymId)

    if (gymTracksError) {
      console.error('[PlansPage] Error fetching gym tracks:', gymTracksError)
    }

    const gymTrackIds = gymTracksData?.map(track => track.id) || []

    const { data: gymWorkoutsData, error: gymWorkoutsError } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .in('track_id', gymTrackIds)

    if (gymWorkoutsError) {
      console.error('[PlansPage] Error fetching gym workouts:', gymWorkoutsError)
    }

    gymWorkouts = gymWorkoutsData || []
  }

  // Combine user and gym workouts
  const workouts = [...userWorkouts, ...gymWorkouts]

  // 7) Render UI in a dark container
  return (
    <section className="bg-gray-900 text-gray-200 min-h-screen p-6 space-y-4">
      <h1 className="text-3xl font-extrabold">Planned Workouts</h1>
      <p className="text-sm text-gray-400">
        View your planned workouts and gym workouts.
      </p>

      <div className="mt-6">
        <PlansCalendar workouts={workouts} />
      </div>
    </section>
  )
}