/**
 * app/dashboard/workout-builder/page.tsx
 *
 * Server component for building workouts.
 * 1) Creates a DB client, fetches session & profile.
 * 2) Fetches tracks for the user or gym.
 * 3) Renders the WorkoutBuilderForm in a dark container.
 */

import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import WorkoutBuilderForm from './WorkoutBuilderForm'

export const metadata: Metadata = {
  title: 'New Workout Builder',
}

export default async function WorkoutBuilderPage() {
  // 1) Create server DB client, fetch user session
  const db = await createClient()
  const { data: { session }, error: sessionError } = await db.auth.getSession()

  if (sessionError || !session) {
    console.error('Error fetching session:', sessionError)
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
        Please log in to create workouts.
      </div>
    )
  }

  const user = session.user

  // 2) Fetch user profile
  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('current_gym_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError)
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
        Error loading profile data
      </div>
    )
  }

  const currentGymId = profile.current_gym_id

  // 3) Fetch tracks
  const { data: tracks, error: tracksError } = await db
    .from('tracks')
    .select('*')
    .or(`user_id.eq.${user.id},gym_id.eq.${currentGymId}`)

  if (tracksError) {
    console.error('Error fetching tracks:', tracksError)
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
        Error loading tracks
      </div>
    )
  }

  // 4) Render the client form, passing down props
  return (
    <section className="bg-gray-900 text-gray-200 min-h-screen p-6 sm:p-8 md:p-10">
      <WorkoutBuilderForm
        userId={user.id}
        availableTracks={tracks || []}
      />
    </section>
  )
}
