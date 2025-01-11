"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { format, parseISO, isValid, startOfWeek, addDays, addMinutes, differenceInMinutes } from 'date-fns'
import ClassRegistrationDrawer from './ClassRegistrationDrawer'
import ClassWizardDrawer from './ClassWizardDrawer'

/** The shape of each class schedule row from SSR. */
interface ClassSchedule {
  id: string
  class_name: string
  start_time: string
  end_time: string
  max_participants: number
  confirmed_count?: number
  class_type_id?: string | null
}

interface VerticalCalendarProps {
  initialSchedules: ClassSchedule[]
  currentGymId: string
  userId: string
  userRole: 'owner' | 'coach' | 'member'
}

export default function VerticalCalendar({
  initialSchedules,
  currentGymId,
  userId,
  userRole,
}: VerticalCalendarProps) {
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  )
  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules)
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null)
  const [isRegistrationOpen, setRegistrationOpen] = useState(false)
  const [isWizardOpen, setWizardOpen] = useState(false)

  const DAY_START_HOUR = 5
  const DAY_END_HOUR = 22
  const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60

  // Fetch new week’s data from client if user changes week
  const refreshSchedules = useCallback(async () => {
    try {
      const startISO = weekStartDate.toISOString()
      const endISO = addDays(weekStartDate, 7).toISOString()
      const res = await fetch(`/api/classes?start=${startISO}&end=${endISO}`)
      if (!res.ok) {
        console.error(await res.text())
        return
      }
      const data: ClassSchedule[] = await res.json()
      setSchedules(data)
    } catch (err) {
      console.error('[refreshSchedules] error:', err)
    }
  }, [weekStartDate])

  useEffect(() => {
    refreshSchedules()
  }, [weekStartDate, refreshSchedules])

  const onPrevWeek = () => setWeekStartDate((prev) => addDays(prev, -7))
  const onNextWeek = () => setWeekStartDate((prev) => addDays(prev, 7))
  const onToday = () => setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 0 }))

  function handleClassClick(cls: ClassSchedule) {
    setSelectedClass(cls)
    setRegistrationOpen(true)
  }

  // DRAG & DROP
  function onDragStart(e: React.DragEvent<HTMLDivElement>, cls: ClassSchedule) {
    // Only allow if user is not a member
    if (userRole === 'member') return
    e.dataTransfer.setData('text/plain', JSON.stringify(cls))
  }
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    // If user is a member, block DnD
    if (userRole === 'member') return
    e.preventDefault()
  }
  async function onDrop(e: React.DragEvent<HTMLDivElement>, dayIndex: number) {
    if (userRole === 'member') return
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    if (!data) return
    const cls: ClassSchedule = JSON.parse(data)

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const offsetY = e.clientY - rect.top

    // 1px => 1 min
    const minutesFromStart = Math.floor(offsetY)
    const newStart = addMinutes(
      weekStartDate,
      dayIndex * 1440 + DAY_START_HOUR * 60 + minutesFromStart
    )

    const oldStart = parseISO(cls.start_time)
    const oldEnd = parseISO(cls.end_time)
    const duration = differenceInMinutes(oldEnd, oldStart)
    const newEnd = addMinutes(newStart, duration)

    const payload = {
      classId: cls.id,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
    }
    try {
      const res = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.error('[onDrop] error:', await res.text())
        return
      }
      refreshSchedules()
    } catch (err) {
      console.error('[onDrop] update error:', err)
    }
  }

  // TIME LABELS (30-min increments)
  const timeLabels: string[] = []
  for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
    timeLabels.push(`${String(hour).padStart(2, '0')}:00`)
    timeLabels.push(`${String(hour).padStart(2, '0')}:30`)
  }
  timeLabels.push(`${DAY_END_HOUR}:00`)

  // Filter current week's schedules
  const displayed = schedules.filter((s) => {
    const st = parseISO(s.start_time)
    return isValid(st) && st >= weekStartDate && st < addDays(weekStartDate, 7)
  })

  // Group by day offset
  const byDay: Record<number, ClassSchedule[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  displayed.forEach((s) => {
    const st = parseISO(s.start_time)
    const dayDiff = Math.floor(differenceInMinutes(st, weekStartDate) / (60 * 24))
    if (dayDiff >= 0 && dayDiff < 7) {
      byDay[dayDiff].push(s)
    }
  })

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevWeek}
          className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          Previous
        </button>
        <div className="text-center">
          <div className="font-bold">{format(weekStartDate, 'MMMM yyyy')}</div>
          <div className="text-xs text-gray-400">
            Week of {format(weekStartDate, 'MM/dd')}
          </div>
        </div>
        <button
          onClick={onNextWeek}
          className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          Next
        </button>
      </div>
      <button onClick={onToday} className="text-sm text-pink-500 underline">
        Today
      </button>

      {/* Only show create button if role != member */}
      {userRole !== 'member' && (
        <button
          onClick={() => setWizardOpen(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          + Create Classes
        </button>
      )}

      {/* Horizontal Grid for left axis + day columns */}
      <div className="relative">
        {/* Lines that extend from left axis across 7 columns */}
        <div className="absolute w-full h-full top-0 left-14 pointer-events-none">
          {timeLabels.map((lbl, idx) => {
            const topPos = idx * 30 // each label is 30px tall
            return (
              <div
                key={lbl}
                style={{ top: `${topPos}px` }}
                className="absolute left-0 right-0 border-t border-gray-700"
              />
            )
          })}
        </div>

        <div className="flex">
          {/* Left axis for times */}
          <div className="w-14 flex flex-col">
            {timeLabels.map((lbl, i) => (
              <div
                key={lbl}
                style={{ height: '30px' }}
                className="text-xs text-gray-400 border-b border-gray-700 flex items-end justify-center"
              >
                {lbl}
              </div>
            ))}
          </div>

          {/* 7 day columns */}
          {Array.from({ length: 7 }, (_, dayIndex) => {
            const dayDate = addDays(weekStartDate, dayIndex)
            const daySchedules = byDay[dayIndex] || []
            return (
              <div
                key={dayIndex}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, dayIndex)}
                className="flex-1 border-l border-gray-700 relative"
                style={{ minHeight: `${TOTAL_MINUTES}px` }}
              >
                <div className="text-center text-xs text-gray-300 border-b border-gray-700">
                  {format(dayDate, 'EEE, MM/dd')}
                </div>

                {daySchedules.map((cls) => {
                  const st = parseISO(cls.start_time)
                  const et = parseISO(cls.end_time)
                  if (!isValid(st) || !isValid(et)) return null

                  const topOffset =
                    differenceInMinutes(st, addDays(weekStartDate, dayIndex)) -
                    DAY_START_HOUR * 60
                  const duration = differenceInMinutes(et, st)

                  // Overlap logic omitted; single column display
                  return (
                    <div
                      key={cls.id}
                      draggable={userRole !== 'member'}
                      onDragStart={(e) => onDragStart(e, cls)}
                      style={{
                        top: `${topOffset}px`,
                        height: `${duration}px`,
                        left: '0%',
                        width: '100%',
                      }}
                      className="absolute bg-pink-600 text-white text-xs p-1 rounded cursor-move shadow hover:bg-pink-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClassClick(cls)
                      }}
                    >
                      <div className="font-semibold">{cls.class_name}</div>
                      <div className="text-[10px]">
                        {format(st, 'h:mm a')} - {format(et, 'h:mm a')}
                      </div>
                      {typeof cls.confirmed_count === 'number' && (
                        <div className="text-[10px]">
                          {cls.confirmed_count} / {cls.max_participants}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
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

      {/* Wizard Drawer */}
      {isWizardOpen && userRole !== 'member' && (
        <ClassWizardDrawer
          isOpen={isWizardOpen}
          onClose={() => setWizardOpen(false)}
          currentGymId={currentGymId}
          refreshSchedules={refreshSchedules}
          userRole={userRole} // pass role if needed
        />
      )}
    </div>
  )
}