/**
 * app/dashboard/workout-builder/components/ExampleWorkoutsPanel.tsx
 *
 * A production-ready, category-based panel of example workouts in a dark UI.
 * Features:
 *  - Fetches data from an API route or server action on mount
 *  - Allows the user to filter by category or text search
 *  - Displays each example in a clickable card
 *  - Calls onExampleSelect when a user picks an example
 * 
 * Dark-themed with pink highlights, matching your new tailwind config and
 * the style from the updated WorkoutBuilderForm.
 */

"use client"

import React, { useEffect, useState, useMemo } from "react"

// Types
interface WorkoutExample {
  id: number | string
  category: string
  title?: string        // e.g., "Fran" or "Row, Box Jumps, Burpees"
  description?: string  // Could contain a short summary
  rawText: string       // The actual snippet to copy to the builder
}

interface ExampleWorkoutsPanelProps {
  onExampleSelect: (text: string) => void
}

export default function ExampleWorkoutsPanel({
  onExampleSelect,
}: ExampleWorkoutsPanelProps) {
  // -----------------------------
  // 1) Local state
  // -----------------------------
  const [examples, setExamples] = useState<WorkoutExample[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // -----------------------------
  // 2) Fetch example workouts on mount
  // -----------------------------
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    // Example: Fetch from an API route. Adjust to your real endpoint or server action.
    fetch("/api/workouts/examples/")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch examples: ${res.status}`)
        }
        return await res.json()
      })
      .then((data: WorkoutExample[]) => {
        if (isMounted) {
          setExamples(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error loading example workouts:", err)
          setError(err.message)
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // -----------------------------
  // 3) Derived data (filtered examples)
  // -----------------------------
  const filteredExamples = useMemo(() => {
    // 1) Category filter
    let items =
      selectedCategory === "All"
        ? examples
        : examples.filter((ex) => ex.category === selectedCategory)

    // 2) Text search
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      items = items.filter(
        (ex) =>
          ex.title?.toLowerCase().includes(lowerSearch) ||
          ex.rawText.toLowerCase().includes(lowerSearch)
      )
    }

    return items
  }, [examples, searchTerm, selectedCategory])

  // Gather unique categories from the data
  const categories = useMemo(() => {
    const unique = new Set<string>()
    examples.forEach((ex) => unique.add(ex.category))
    return ["All", ...Array.from(unique)]
  }, [examples])

  // -----------------------------
  // 4) Render
  // -----------------------------
  return (
    <aside className="w-80 p-4 bg-gray-800 border-l border-gray-700 flex-shrink-0 text-gray-200 rounded-lg shadow-md">
      <h2 className="font-bold text-lg mb-4">Example Workouts</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Search examples..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Selector */}
      <div className="mb-4">
        <select
          className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-sm text-gray-400">Loading examples...</p>
      )}
      {error && (
        <p className="text-sm text-pink-400 mb-2">
          Error loading examples: {error}
        </p>
      )}

      {/* Display the filtered examples */}
      {!loading && !error && (
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {filteredExamples.length === 0 ? (
            <p className="text-sm text-gray-400">No examples found.</p>
          ) : (
            filteredExamples.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onExampleSelect(ex.rawText)}
                className="p-3 bg-gray-700 border border-gray-600 rounded cursor-pointer 
                  hover:bg-gray-600 transition-colors"
              >
                {ex.title && (
                  <p className="font-semibold text-sm text-gray-100">
                    {ex.title}
                  </p>
                )}
                {/* 'description' can be used if you want a short summary,
                    or you can just rely on ex.rawText */}
                {ex.description && (
                  <p className="text-xs text-gray-400 mb-1">
                    {ex.description}
                  </p>
                )}
                <pre className="text-xs whitespace-pre-wrap text-gray-200">
                  {ex.rawText}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  )
}
