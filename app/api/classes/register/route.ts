/**
 * app/api/classes/register/route.ts
 *
 * POST /api/classes/register
 * Body: { class_schedule_id: string }
 */

import { NextRequest, NextResponse } from 'next/server'
// 1) Import your existing createClient from 'utils/supabase/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // 2) Parse the incoming JSON from the request body
    const { class_schedule_id } = await req.json()

    // 3) Create a Supabase server client using your custom function
    //    This uses the manual cookies approach you have in server.ts
    const supabase = await createClient()

    // 4) Check user auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 5) Fetch the class schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('class_schedules')
      .select('id, max_participants')
      .eq('id', class_schedule_id)
      .single()

    if (scheduleError || !scheduleData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 400 })
    }

    // 6) Count how many are already confirmed
    const { count, error: countError } = await supabase
      .from('class_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('class_schedule_id', class_schedule_id)
      .eq('status', 'confirmed')

    if (countError) {
      return NextResponse.json(
        { error: 'Error counting participants' },
        { status: 500 }
      )
    }

    // 7) Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('class_registrations')
      .select('id, status')
      .eq('class_schedule_id', class_schedule_id)
      .eq('user_profile_id', user.id)
      .single()

    if (existingRegistration) {
      return NextResponse.json({
        error: 'You are already registered or waitlisted for this class.',
      }, { status: 400 })
    }

    // 8) Decide the registration status
    let newStatus: 'confirmed' | 'waitlisted' = 'confirmed'
    if (count !== null && count >= scheduleData.max_participants) {
      newStatus = 'waitlisted'
    }

    // 9) Insert new registration
    const { error: insertError } = await supabase
      .from('class_registrations')
      .insert({
        class_schedule_id,
        user_profile_id: user.id,
        status: newStatus,
        created_at: new Date().toISOString(), // optional
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // 10) Return success response
    return NextResponse.json({ status: newStatus })
  } catch (error) {
    console.error('[RegisterRoute] Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}