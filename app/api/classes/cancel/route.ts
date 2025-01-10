/**
 * app/api/classes/cancel/route.ts
 *
 * POST /api/classes/cancel
 * Body: { class_schedule_id: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { class_schedule_id } = await req.json()

    // Use your custom server-side client
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Delete or mark the registration as canceled
    const { error } = await supabase
      .from('class_registrations')
      .delete()
      .eq('class_schedule_id', class_schedule_id)
      .eq('user_profile_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Optionally, you can promote the next waitlisted user here
    // or just return success.
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CancelRoute] Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}