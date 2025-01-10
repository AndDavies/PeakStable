/**
 * lib/workoutParser.ts
 * 
 * Minimal function that splits lines and tries to detect sets.
 */
export function parseWorkoutText(input: string) {
    if (!input || !input.trim()) {
      throw new Error("Input is empty.")
    }
  
    // Example: split by new lines
    const lines = input.split('\n').map((l) => l.trim()).filter(Boolean)
  
    if (lines.length === 0) {
      throw new Error("No valid lines to parse.")
    }
  
    // We'll assume the first line is the movement name, 
    // and subsequent lines might be sets or additional movements
    const workout = lines.map((line) => {
      return { name: line, reps: 10 } // naive example
    })
  
    return {
      type: "Custom",
      workout,
      notes: []
      // add more structure if you like
    }
  }
  