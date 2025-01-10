/**
 * app/dashboard/workout-builder/WorkoutBuilderForm.tsx
 *
 * Client component that:
 * 1) Displays a form for (Track, Date, Title).
 * 2) Has optional Warm-Up & Cool-Down sections at the bottom.
 * 3) Provides a text area to define the main workout instructions (rawText).
 * 4) Automatically parses rawText on Save (no separate 'Parse' button).
 * 5) Shows a side panel (ExampleWorkoutsPanel) to copy example workouts.
 * 6) Dark theme with bright pink highlight.
 * 7) On successful save, shows a toast & disables the "Save" button until form changes.
 */

"use client"

import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"            //  <-- Import toast
import { parseWorkoutText } from "@/lib/workoutParser"
import { createOrUpdateScheduledWorkout } from "./actions"
import ExampleWorkoutsPanel from "./ExampleWorkoutsPanel"

interface Track {
  id: string
  name: string
  user_id?: string
  gym_id?: string
}

interface WorkoutBuilderFormProps {
  userId: string
  availableTracks: Track[]
}

export default function WorkoutBuilderForm({
  userId,
  availableTracks,
}: WorkoutBuilderFormProps) {
  // -----------------------------
  // Local form data & states
  // -----------------------------
  const [trackId, setTrackId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split("T")[0]
    return today
  })
  const [title, setTitle] = useState<string>("Workout")
  const [rawText, setRawText] = useState<string>("")

  // Warm-Up & Cool-Down toggles + text
  const [showWarmUp, setShowWarmUp] = useState(false)
  const [warmUpText, setWarmUpText] = useState("")
  const [showCoolDown, setShowCoolDown] = useState(false)
  const [coolDownText, setCoolDownText] = useState("")

  // We store parsed details if the user previously parsed manually.
  // But on save, we parse again automatically if needed.
  const [parsedDetails, setParsedDetails] = useState<any>(null)

  // UI flags
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // NEW: Track whether the form has unsaved changes
  const [isDirty, setIsDirty] = useState(true)

  // -----------------------------
  // Mark form as dirty when user modifies anything
  // -----------------------------
  useEffect(() => {
    // Whenever certain fields change, set isDirty to true
    // We do not watch isDirty itself to avoid looping.
  }, [])

  function handleFormChange() {
    // If the form was previously "saved," re-enable
    if (!isDirty) {
      setIsDirty(true)
    }
  }

  // In each onChange, we call handleFormChange
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    handleFormChange()
  }

  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTrackId(e.target.value)
    handleFormChange()
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    handleFormChange()
  }

  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(e.target.value)
    handleFormChange()
  }

  const handleWarmUpToggle = () => {
    setShowWarmUp((prev) => !prev)
    handleFormChange()
  }

  const handleCoolDownToggle = () => {
    setShowCoolDown((prev) => !prev)
    handleFormChange()
  }

  const handleWarmUpTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWarmUpText(e.target.value)
    handleFormChange()
  }

  const handleCoolDownTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCoolDownText(e.target.value)
    handleFormChange()
  }

  // Copy an example from side panel
  const handleExampleSelect = (exampleText: string) => {
    setRawText(exampleText)
    setParsedDetails(null) // Force re-parse on next save
    handleFormChange()
  }

  // -----------------------------
  // Main "Save" automatically does parse
  // -----------------------------
  const handleSave = async () => {
    if (!trackId || !selectedDate || !title) {
      setErrorMessage(
        "Please fill in all mandatory fields: Track, Date, and Title."
      )
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      // If never parsed, parse now:
      const finalParsed = parsedDetails || parseWorkoutText(rawText)

      // Incorporate warm-up & cool-down into final JSON
      const workoutDetails = {
        ...finalParsed,
        warmUp: warmUpText || null,
        coolDown: coolDownText || null,
      }

      const response = await createOrUpdateScheduledWorkout({
        userId,
        trackId,
        date: selectedDate,
        title,
        workoutDetails,
      })

      if (response.error) {
        setErrorMessage(response.error)
      } else {
        // Indicate success with a toast
        toast.success("Workout saved successfully!", {
          style: {
            background: "#333333",
            color: "#ffffff",
          },
        })

        // Mark form as not dirty
        setIsDirty(false)
      }
    } catch (err: any) {
      setErrorMessage("An error occurred while saving the workout.")
    } finally {
      setIsSaving(false)
    }
  }

  // -----------------------------
  // Rendering
  // -----------------------------
  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-8 lg:px-10 py-8 bg-gray-900 text-gray-200 min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">
        Create a New Workout
      </h1>

      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        {/* Main Form Container */}
        <form
          className="flex-1 rounded-lg shadow-lg bg-gray-800 p-6 md:p-8 lg:p-10 space-y-6"
          // no onSubmit to avoid default
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block font-semibold mb-2 text-sm md:text-base"
            >
              Title <span className="text-pink-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Strength Friday"
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 placeholder-gray-500 
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Track Selector */}
          <div>
            <label
              htmlFor="track"
              className="block font-semibold mb-2 text-sm md:text-base"
            >
              Track <span className="text-pink-400">*</span>
            </label>
            <select
              id="track"
              value={trackId || ""}
              onChange={handleTrackChange}
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 placeholder-gray-500 
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select a track
              </option>
              {availableTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block font-semibold mb-2 text-sm md:text-base"
            >
              Date <span className="text-pink-400">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 placeholder-gray-500 
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Workout Description */}
          <div>
            <label
              htmlFor="rawText"
              className="block font-semibold mb-2 text-sm md:text-base"
            >
              Workout Description
            </label>
            <textarea
              id="rawText"
              rows={5}
              value={rawText}
              onChange={handleRawTextChange}
              placeholder="e.g., Back Squats\n5-5-4-4-3-3"
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Warm-Up Section */}
          <div className="border-t border-gray-600 pt-4">
            <button
              type="button"
              onClick={handleWarmUpToggle}
              className="text-sm md:text-base font-semibold text-pink-400 hover:text-pink-300"
            >
              {showWarmUp ? "Hide Warm-Up" : "Add Warm-Up"}
            </button>
            {showWarmUp && (
              <textarea
                className="mt-2 w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 placeholder-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your warm-up..."
                value={warmUpText}
                onChange={handleWarmUpTextChange}
              />
            )}
          </div>

          {/* Cool-Down Section */}
          <div className="border-t border-gray-600 pt-4">
            <button
              type="button"
              onClick={handleCoolDownToggle}
              className="text-sm md:text-base font-semibold text-pink-400 hover:text-pink-300"
            >
              {showCoolDown ? "Hide Cool-Down" : "Add Cool-Down"}
            </button>
            {showCoolDown && (
              <textarea
                className="mt-2 w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your cool-down..."
                value={coolDownText}
                onChange={handleCoolDownTextChange}
              />
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-sm md:text-base font-medium border border-pink-500 rounded p-3 bg-gray-700 text-pink-500 mt-2">
              {errorMessage}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="inline-flex items-center px-6 py-2 text-sm font-semibold rounded-md shadow-sm 
                bg-pink-600 text-gray-50 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? "Saving..."
                : isDirty
                ? "Save Workout"
                : "Saved!"}
            </button>
          </div>
        </form>

        {/* Example Workouts Side Panel */}
        <ExampleWorkoutsPanel onExampleSelect={handleExampleSelect} />
      </div>

      {/* If we want to display the parsed details */}
      {parsedDetails && (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg md:text-xl font-bold mb-3">
            Parsed Workout Preview
          </h2>
          <pre className="text-sm whitespace-pre-wrap text-gray-200 overflow-auto border border-gray-600 rounded p-4 bg-gray-700">
            {JSON.stringify(parsedDetails, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
