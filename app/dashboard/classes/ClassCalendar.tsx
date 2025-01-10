"use client"
import React, { useState } from 'react'
import { format, parseISO, isValid, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'
import ClassRegistrationDrawer from './ClassRegistrationDrawer'
import { supabaseBrowserClient } from '@/utils/supabase/client'

// 1) Make sure your interface includes 'confirmed_count?: number'
type ClassSchedule = {
  id: string
  class_name: string
  start_time: string
  end_time: string
  max_participants: number
  class_type_id: string
  confirmed_count?: number // We want TS to allow this property
}

interface CalendarProps {
  schedules: ClassSchedule[]
  currentGymId: string
  userId: string
}

export default function ClassCalendar({
  schedules,
  currentGymId,
  userId,
}: CalendarProps) {
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  )

  // 2) We store the SSR schedules in state, typed as ClassSchedule[]
  const [currentSchedules, setCurrentSchedules] = useState<ClassSchedule[]>(schedules)

  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null)
  const [isRegistrationOpen, setRegistrationOpen] = useState(false)

  // Generate the array of 7 days for the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i))

  // Utility
  function getDayName(date: Date) {
    return format(date, 'EEEE').toLowerCase()
  }

  // Filter out schedules for the chosen week
  const filteredSchedules = currentSchedules.filter((cls) => {
    const st = parseISO(cls.start_time)
    return (
      isValid(st) &&
      st >= weekStartDate &&
      st < addDays(weekStartDate, 7)
    )
  })

  // Group by day
  const groupedSchedules: Record<string, ClassSchedule[]> = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  }
  filteredSchedules.forEach((cls) => {
    const dayName = getDayName(parseISO(cls.start_time)) as keyof typeof groupedSchedules
    groupedSchedules[dayName].push(cls)
  })

  // Week navigation
  const handlePreviousWeek = () => setWeekStartDate((prev) => subWeeks(prev, 1))
  const handleNextWeek = () => setWeekStartDate((prev) => addWeeks(prev, 1))
  const handleToday = () => setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 0 }))

  // Class click
  const handleClassClick = (cls: ClassSchedule) => {
    setSelectedClass(cls)
    setRegistrationOpen(true)
  }

  /**
   * refreshSchedules()
   * 
   * Re-fetch schedules for the currentGymId & the displayed week. 
   * Then compute confirmed_count, and update our local 'currentSchedules' state.
   */
  async function refreshSchedules() {
    try {
      // Start + end of the displayed week
      const startDate = startOfWeek(weekStartDate, { weekStartsOn: 0 })
      const endDate = addDays(startDate, 7)

      const { data: newSchedulesRaw, error: fetchError } = await supabaseBrowserClient
        .from('class_schedules')
        .select('id, class_name, start_time, end_time, max_participants, class_type_id')
        .eq('current_gym_id', currentGymId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())

      if (fetchError) {
        console.error('[refreshSchedules] Error:', fetchError)
        return
      }

      // 3) Force the new data to match ClassSchedule[] so we can add confirmed_count
      let newSchedules = (newSchedulesRaw ?? []) as ClassSchedule[]

      // Now fetch the confirmed counts
      const classIds = newSchedules.map((s) => s.id)
      if (classIds.length > 0) {
        const { data: regData, error: regError } = await supabaseBrowserClient
          .from('class_registrations')
          .select('class_schedule_id')
          .eq('status', 'confirmed')
          .in('class_schedule_id', classIds)
        
        if (!regError && regData) {
          const countsMap = new Map<string, number>()
          regData.forEach((row) => {
            countsMap.set(row.class_schedule_id, (countsMap.get(row.class_schedule_id) || 0) + 1)
          })
          // Attach confirmed_count to each new schedule
          newSchedules = newSchedules.map((cls) => ({
            ...cls,
            confirmed_count: countsMap.get(cls.id) || 0,
          }))
        }
      }

      // Finally, update state
      setCurrentSchedules(newSchedules)
    } catch (err) {
      console.error('[refreshSchedules] Unexpected error:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={handlePreviousWeek} className="text-sm bg-gray-700 text-white px-3 py-1 rounded">
          Previous
        </button>
        <div className="text-center">
          <div className="font-bold">{format(weekStartDate, 'MMMM yyyy')}</div>
          <div className="text-xs text-gray-400">
            Week of {format(weekStartDate, 'MM/dd')}
          </div>
        </div>
        <button onClick={handleNextWeek} className="text-sm bg-gray-700 text-white px-3 py-1 rounded">
          Next
        </button>
      </div>
      <button onClick={handleToday} className="text-sm text-pink-500 underline">
        Today
      </button>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, idx) => {
          const dayName = getDayName(date)
          const dayClasses = groupedSchedules[dayName] || []
          return (
            <div key={idx} className="border border-gray-600 p-2 rounded bg-gray-800">
              <h3 className="font-semibold text-sm mb-2 text-white">
                {format(date, 'EEE, MM/dd')}
              </h3>
              {dayClasses.length === 0 && (
                <p className="text-xs text-gray-400">No classes</p>
              )}
              {dayClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="mb-2 p-2 rounded bg-gray-700 hover:bg-pink-700/50 cursor-pointer text-white"
                  onClick={() => handleClassClick(cls)}
                >
                  <p className="text-sm font-medium">{cls.class_name}</p>
                  <p className="text-xs">
                    {format(parseISO(cls.start_time), 'h:mm a')} -{' '}
                    {format(parseISO(cls.end_time), 'h:mm a')}
                  </p>
                  {/* 4) TypeScript now knows cls.confirmed_count is allowed */}
                  {typeof cls.confirmed_count === 'number' && (
                    <p className="text-xs text-gray-200">
                      {cls.confirmed_count} / {cls.max_participants} confirmed
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Registration Drawer */}
      {selectedClass && (
        <ClassRegistrationDrawer
          isOpen={isRegistrationOpen}
          onClose={() => setRegistrationOpen(false)}
          classSchedule={selectedClass}
          currentUserId={userId}
          refreshSchedules={refreshSchedules}
        />
      )}
    </div>
  )
}