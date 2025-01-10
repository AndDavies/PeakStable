/**
 * app/api/workouts/examples/route.ts
 *
 * Production-ready API route to retrieve "example" workouts from the `workouts` table.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    // 1) Create a Supabase server client, fetch user session
    const db = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await db.auth.getSession()

    // If no session or an error, return 401
    if (sessionError || !session) {
      console.error('[workouts/examples] Auth session error:', sessionError)
      return NextResponse.json(
        { error: 'Unauthorized', details: sessionError?.message },
        { status: 401 }
      )
    }

    // 2) Query the workouts table for example workouts
    const { data, error } = await db
      .from('workouts')
      .select('workoutid, title, category, movements, description')
      .eq('is_template', true) // Example: if "is_template" indicates an "example workout"
      // .eq('is_example', true) or .eq('origin', 'example') — adapt as needed

    console.log('[workouts/examples] Query result:', { data, error })

    // Handle DB errors
    if (error) {
      console.error('[workouts/examples] DB error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    // 3) Transform each row into the structure your front-end expects
    const response = (data || []).map((row) => {
      // Category fallback
      const category = row.category || 'GPP'

      // Determine rawText
      let rawText = ''
      if (typeof row.movements === 'string' && row.movements.trim().length > 0) {
        rawText = row.movements
      } else if (row.description) {
        rawText = JSON.stringify(row.description, null, 2)
      } else {
        rawText = 'No movements or description found.'
      }

      return {
        id: row.workoutid,
        category,
        title: row.title || 'Untitled Workout',
        rawText,
      }
    })

    // 4) Return the final list in JSON
    return NextResponse.json(response, { status: 200 })
  } catch (err: unknown) {
    // Use a type guard or cast to safely access err.message
    let message = 'Unknown error'
    if (err instanceof Error) {
      message = err.message
    }

    console.error('[workouts/examples] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Unexpected error', details: message },
      { status: 500 }
    )
  }
}
