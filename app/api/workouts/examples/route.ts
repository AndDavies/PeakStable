/**
 * app/api/workouts/examples/route.ts
 *
 * Production-ready API route to retrieve "example" workouts from the `workouts` table.
 * 
 * - Checks user session via Supabase. 
 * - Filters out only rows you consider "examples" (decide on your approach).
 * - Defaults category to 'GPP' if null.
 * - Returns a JSON array with keys: { id, category, title, rawText }.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized', details: sessionError?.message }, { status: 401 })
    }

    // 2) Query the workouts table for example workouts
    //    *Pick your own logic for how to identify example rows.*
    //    For instance, you might filter on `is_template = true`,
    //    `is_example = true`, or `origin = 'example'`.
    const { data, error } = await db
      .from('workouts')
      .select(
        `
          workoutid,
          title,
          category,
          movements,
          description
        `
      )
      .eq('is_template', true)  // Example: if "is_template" indicates an "example workout"
      // .eq('origin', 'example') or .eq('is_example', true) — use whichever fits your schema best

       // Log the query result
    console.log('[workouts/examples] Query result:', { data, error })
    
    // Handle DB errors
    if (error) {
      console.error('[workouts/examples] DB error:', error)
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
    }

    // 3) Transform each row into a structure your front-end expects
    //    For "rawText", you might choose to use `movements` or a stringified `description`.
    //    We'll default to using `movements` if it's a string, else fallback to JSON string of `description`.
    const response = (data || []).map((row) => {
      // Category fallback
      const category = row.category || 'GPP'

      // Determine rawText
      let rawText = ''
      if (typeof row.movements === 'string' && row.movements.trim().length > 0) {
        rawText = row.movements
      } else if (row.description) {
        // If `description` is JSON, we could convert it to a nicely formatted text snippet
        // You can do something more sophisticated if needed:
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
  } catch (err: any) {
    console.error('[workouts/examples] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error', details: err.message }, { status: 500 })
  }
}