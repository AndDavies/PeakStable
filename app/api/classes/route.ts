import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/utils/supabase/supabaseClient'
import { z } from 'zod'
import { parseISO, isValid } from 'date-fns'

/** Basic row interface, plus optional confirmed_count. */
interface ClassScheduleRow {
  id: string
  class_name: string
  start_time: string
  end_time: string
  max_participants: number
  class_type_id?: string | null
  confirmed_count?: number
}

/** Single-create schema */
const singleCreateSchema = z.object({
  currentGymId: z.string().uuid(),
  className: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  maxParticipants: z.number().min(1),
  classTypeId: z.string().optional(),
})

/** Bulk-create schema */
const bulkCreateSchema = z.object({
  currentGymId: z.string().uuid(),
  classes: z.array(
    z.object({
      className: z.string().min(1),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      maxParticipants: z.number().min(1),
      classTypeId: z.string().optional(),
    })
  ),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // Optional: you can check session here if needed
    const url = new URL(request.url)
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    if (!start || !end) {
      return NextResponse.json({ error: 'Missing start/end' }, { status: 400 })
    }
    if (!isValid(parseISO(start)) || !isValid(parseISO(end))) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const { data: schedulesData, error: schedulesError } = await supabase
      .from('class_schedules')
      .select('id, class_name, start_time, end_time, max_participants, class_type_id')
      .gte('start_time', start)
      .lte('start_time', end)

    if (schedulesError) {
      return NextResponse.json({ error: schedulesError.message }, { status: 500 })
    }
    const schedules: ClassScheduleRow[] = (schedulesData ?? []).map((row) => ({
      ...row,
      confirmed_count: 0,
    }))

    // Confirmed counts
    const ids = schedules.map((s) => s.id)
    if (ids.length > 0) {
      const { data: regData, error: regError } = await supabase
        .from('class_registrations')
        .select('class_schedule_id')
        .eq('status', 'confirmed')
        .in('class_schedule_id', ids)

      if (!regError && regData) {
        const counts = new Map<string, number>()
        for (const r of regData) {
          counts.set(r.class_schedule_id, (counts.get(r.class_schedule_id) || 0) + 1)
        }
        schedules.forEach((s) => {
          s.confirmed_count = counts.get(s.id) || 0
        })
      }
    }

    return NextResponse.json(schedules)
  } catch (err: any) {
    console.error('[GET /api/classes] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // 1) Verify user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2) Fetch user role from profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile fetch error' }, { status: 500 })
    }
    if (profileData.role === 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3) Parse body with Zod
    const body = await request.json()
    const singleResult = singleCreateSchema.safeParse(body)
    const bulkResult = bulkCreateSchema.safeParse(body)

    if (bulkResult.success) {
      // Bulk
      const { currentGymId, classes } = bulkResult.data
      const insertPayload = classes.map((c) => ({
        current_gym_id: currentGymId,
        class_name: c.className,
        start_time: c.startTime,
        end_time: c.endTime,
        max_participants: c.maxParticipants,
        class_type_id: c.classTypeId ?? null,
      }))

      const { error: insertError } = await supabase
        .from('class_schedules')
        .insert(insertPayload)

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    } else if (singleResult.success) {
      // Single
      const {
        currentGymId,
        className,
        startTime,
        endTime,
        maxParticipants,
        classTypeId,
      } = singleResult.data

      const { error: insertError } = await supabase
        .from('class_schedules')
        .insert({
          current_gym_id: currentGymId,
          class_name: className,
          start_time: startTime,
          end_time: endTime,
          max_participants: maxParticipants,
          class_type_id: classTypeId ?? null,
        })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    } else {
      // Invalid parse
      // For debugging, you could console.log(singleResult.error || bulkResult.error)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
  } catch (err: any) {
    console.error('[POST /api/classes] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { classId, startTime, endTime, className, maxParticipants } = body
    if (!classId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Optionally check if user is “member” => disallow
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    if (profileData?.role === 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: updateError } = await supabase
      .from('class_schedules')
      .update({
        class_name: className,
        start_time: startTime,
        end_time: endTime,
        max_participants: maxParticipants,
      })
      .eq('id', classId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[PUT /api/classes] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If needed, confirm user role is not “member” to allow deletion
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    if (profileData?.role === 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { classId } = body
    if (!classId) {
      return NextResponse.json({ error: 'classId missing' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', classId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[DELETE /api/classes] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}