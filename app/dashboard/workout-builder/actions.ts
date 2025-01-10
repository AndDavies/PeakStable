/**
 * app/dashboard/workout-builder/actions.ts
 *
 * Server actions for inserting/updating scheduled workouts.
 */

"use server"

import { createClient } from '@/utils/supabase/server'

export interface SaveWorkoutParams {
  userId: string
  trackId: string
  date: string
  title: string
  workoutDetails: any
}

/**
 * createOrUpdateScheduledWorkout
 * 
 * Insert or update a row in scheduled_workouts. 
 * In this example, we always insert a new row with status 'draft'.
 * Modify if you want to handle updates or different statuses.
 */
export async function createOrUpdateScheduledWorkout(params: SaveWorkoutParams) {
  const { userId, trackId, date, title, workoutDetails } = params
  const db = await createClient()

  // Basic validation
  if (!trackId || !date) {
    return { error: "Missing required fields (trackId or date)." }
  }

  try {
    // Example: always inserting a new scheduled workout
    const { data, error } = await db
      .from("scheduled_workouts")
      .insert({
        user_id: userId,
        track_id: trackId,
        date: date,
        name: title,             // or 'title'
        workout_details: workoutDetails,
        status: 'draft',         // or 'published', depending on your logic
      })
      .select()
      .single()

    if (error) {
      console.error("[createOrUpdateScheduledWorkout] DB error:", error)
      return { error: error.message }
    }

    return { data }
  } catch (err: any) {
    console.error("[createOrUpdateScheduledWorkout] Unexpected error:", err)
    return { error: err.message }
  }
}
