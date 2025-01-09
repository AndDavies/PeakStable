"use client"

/**
 * app/dashboard/classes/ClassCalendar.tsx
 *
 * This client component receives class schedules from the server
 * and displays them in a minimal calendar-like layout.
 * Users can click on a class for more info (e.g., registration).
 */

import React, { useState } from 'react'
import { format, parseISO, isValid, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'
import ClassRegistrationDrawer from './ClassRegistrationDrawer'

type ClassSchedule = {
  id: string
  class_name: string
  start_time: string
  end_time: string
  max_participants: number
  class_type_id: string
  confirmed_count?: number
}

interface CalendarProps {
  schedules: ClassSchedule[]
  userRole: string
  currentGymId: string
}

export default function ClassCalendar({ schedules, userRole, currentGymId }: CalendarProps) {
  // State to handle which week we are displaying
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  )

  // State for class the user clicked on
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null)
  const [isRegistrationOpen, setRegistrationOpen] = useState(false)

  // Generate an array of 7 days for the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i))

  // Utility: get the day name (sunday, monday, etc.) from a date
  function getDayName(date: Date) {
    return format(date, 'EEEE').toLowerCase()
  }

  // Filter out schedules for the selected week
  // In a real scenario, you might re-fetch from server when switching weeks,
  // or handle that logic differently if you want SSR for each week. 
  // For now, let's filter client-side as an example.
  const filteredSchedules = schedules.filter((cls) => {
    if (!cls.start_time) return false
    const st = parseISO(cls.start_time)
    return (
      isValid(st) &&
      st >= weekStartDate &&
      st < addDays(weekStartDate, 7)
    )
  })

  // Group by day of the week
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

  return (
    <div className="space-y-4">
      {/* WEEK NAVIGATION */}
      <div className="flex items-center justify-between">
        <button 
          onClick={handlePreviousWeek} 
          className="text-sm bg-muted px-3 py-1 rounded"
        >
          Previous
        </button>
        <div className="text-center">
          <div className="font-bold">{format(weekStartDate, 'MMMM yyyy')}</div>
          <div className="text-xs text-muted-foreground">
            Week of {format(weekStartDate, 'MM/dd')}
          </div>
        </div>
        <button 
          onClick={handleNextWeek} 
          className="text-sm bg-muted px-3 py-1 rounded"
        >
          Next
        </button>
      </div>
      <button 
        onClick={handleToday} 
        className="text-sm text-accentPink underline"
      >
        Today
      </button>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, idx) => {
          const dayName = getDayName(date)
          const dayClasses = groupedSchedules[dayName] || []
          return (
            <div
              key={idx}
              className="border border-muted p-2 rounded bg-card"
            >
              <h3 className="font-semibold text-sm mb-2">
                {format(date, 'EEE, MM/dd')}
              </h3>
              {/* List classes for this day */}
              {dayClasses.length === 0 && (
                <p className="text-xs text-muted-foreground">No classes</p>
              )}
              {dayClasses.map((cls) => {
                return (
                  <div
                    key={cls.id}
                    className="mb-2 p-2 rounded bg-muted hover:bg-primary hover:text-primary-foreground cursor-pointer"
                    onClick={() => handleClassClick(cls)}
                  >
                    <p className="text-sm font-medium">{cls.class_name}</p>
                    <p className="text-xs">
                      {format(parseISO(cls.start_time), 'h:mm a')} - {format(parseISO(cls.end_time), 'h:mm a')}
                    </p>
                    {cls.confirmed_count !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {cls.confirmed_count} / {cls.max_participants} confirmed
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* CLASS REGISTRATION DRAWER */}
      {selectedClass && (
        <ClassRegistrationDrawer
        isOpen={isRegistrationOpen}
        onClose={() => setRegistrationOpen(false)}
        classSchedule={selectedClass}
        />
      )}
    </div>
  )
}