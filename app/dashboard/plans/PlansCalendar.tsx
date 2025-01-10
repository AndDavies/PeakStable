"use client"
import React, { useState } from 'react'
import { format, parseISO, isValid, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'

// Define a type for the workouts we fetch from Supabase
type ScheduledWorkout = {
  id: string
  user_id: string
  date: string
  workout_details: {
    type: string
    notes: string[]
    warmUp: string
    workout: { name: string; reps: number }[]
    coolDown: string
  }
  status: string
  created_at: string
  track_id: string
  gym_id: string
  name: string
}

interface CalendarProps {
  workouts: ScheduledWorkout[]
}

export default function PlansCalendar({ workouts }: CalendarProps) {
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  )

  // Generate the array of 7 days for the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i))

  // Utility
  function getDayName(date: Date) {
    return format(date, 'EEEE').toLowerCase()
  }

  // Filter out workouts for the chosen week
  const filteredWorkouts = workouts.filter((workout) => {
    const workoutDate = parseISO(workout.date)
    return (
      isValid(workoutDate) &&
      workoutDate >= weekStartDate &&
      workoutDate < addDays(weekStartDate, 7)
    )
  })

  // Group by day
  const groupedWorkouts: Record<string, ScheduledWorkout[]> = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  }
  filteredWorkouts.forEach((workout) => {
    const dayName = getDayName(parseISO(workout.date)) as keyof typeof groupedWorkouts
    groupedWorkouts[dayName].push(workout)
  })

  // Week navigation
  const handlePreviousWeek = () => setWeekStartDate((prev) => subWeeks(prev, 1))
  const handleNextWeek = () => setWeekStartDate((prev) => addWeeks(prev, 1))
  const handleToday = () => setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 0 }))

  // Workout click
  const handleWorkoutClick = (workout: ScheduledWorkout) => {
    alert(`Workout: ${workout.name}\nDetails: ${JSON.stringify(workout.workout_details, null, 2)}`)
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
          const dayWorkouts = groupedWorkouts[dayName] || []
          return (
            <div key={idx} className="border border-gray-600 p-2 rounded bg-gray-800">
              <h3 className="font-semibold text-sm mb-2 text-white">
                {format(date, 'EEE, MM/dd')}
              </h3>
              {dayWorkouts.length === 0 && (
                <p className="text-xs text-gray-400">No workouts</p>
              )}
              {dayWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="mb-2 p-2 rounded bg-gray-700 hover:bg-pink-700/50 cursor-pointer text-white"
                  onClick={() => handleWorkoutClick(workout)}
                >
                  <p className="text-sm font-medium">{workout.name}</p>
                  <p className="text-xs">
                    {workout.workout_details.workout.map((w, i) => (
                      <span key={i}>{w.name} ({w.reps} reps)<br /></span>
                    ))}
                  </p>
                  <a href="#" className="text-xs text-pink-400 underline mt-2 inline-block">
                    View Details
                  </a>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}