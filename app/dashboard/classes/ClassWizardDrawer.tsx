"use client";

import React, { useState } from "react";
import { addWeeks, format } from "date-fns";

interface ClassWizardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentGymId: string;
  refreshSchedules: () => void;
  userRole?: string; // if you need to double-check role here
}

export default function ClassWizardDrawer({
  isOpen,
  onClose,
  currentGymId,
  refreshSchedules,
  userRole,
}: ClassWizardDrawerProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [className, setClassName] = useState("New Class");
  const [occurrenceType, setOccurrenceType] = useState<"single" | "recurring">(
    "single"
  );

  // Single
  const [singleDate, setSingleDate] = useState("");
  const [singleStartTime, setSingleStartTime] = useState("06:00");
  const [singleDuration, setSingleDuration] = useState(60);

  // Recurring
  const [startDate, setStartDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });
  const [weeksCount, setWeeksCount] = useState(1);
  const [recurringStartTime, setRecurringStartTime] = useState("06:00");
  const [recurringDuration, setRecurringDuration] = useState(60);

  const [maxParticipants, setMaxParticipants] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Track if user has made changes (simple check: step > 1).
  const hasProgress = step > 1;

  if (!isOpen) return null;

  // If user is a member, optionally block the entire wizard flow:
  if (userRole === "member") {
    return (
      <div className="fixed inset-0 z-50 flex pointer-events-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="fixed right-0 top-0 w-full max-w-md h-full bg-gray-900 text-gray-200 p-4 overflow-auto">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 font-bold text-xl"
            >
              ×
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4">Not Allowed</h2>
          <p className="text-sm text-gray-400">
            You do not have permission to create classes.
          </p>
        </div>
      </div>
    );
  }

  // Wizard flow
  function goNext() {
    setError(null);
    if (step < totalSteps) {
      setStep(step + 1);
    }
  }
  function goBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  // Confirm close if they've started filling data.
  function handleCloseClick() {
    if (!hasProgress) {
      onClose();
      return;
    }
    const confirmClose = window.confirm(
      "You have partially filled out this form. Close and lose changes?"
    );
    if (confirmClose) {
      onClose();
    }
  }

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      if (occurrenceType === "single") {
        // Single
        if (!singleDate) {
          setError("Please select a date for the single class.");
          setSubmitting(false);
          return;
        }
        const startISO = `${singleDate}T${singleStartTime}`;
        const endISO = computeEndISO(startISO, singleDuration);

        const payload = {
          currentGymId,
          className,
          startTime: startISO,
          endTime: endISO,
          maxParticipants,
        };
        const res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
      } else {
        // Recurring
        if (!startDate) {
          setError("Please select a start date for recurring classes.");
          setSubmitting(false);
          return;
        }
        const baseStart = new Date(startDate);
        if (Number.isNaN(baseStart.getTime())) {
          setError("Invalid recurring start date.");
          setSubmitting(false);
          return;
        }

        const dayIndexMap: Record<string, number> = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };
        const daysSelected = Object.entries(selectedDays)
          .filter(([, val]) => val)
          .map(([day]) => day);
        if (daysSelected.length === 0) {
          setError("Please select at least one day of the week.");
          setSubmitting(false);
          return;
        }

        const classesToCreate: any[] = [];
        for (let w = 0; w < weeksCount; w++) {
          const base = addWeeks(baseStart, w);
          for (const day of daysSelected) {
            // shift to correct weekday
            const tempDate = new Date(base);
            const offset = dayIndexMap[day] - tempDate.getDay();
            tempDate.setDate(tempDate.getDate() + offset);
            if (Number.isNaN(tempDate.getTime())) {
              setError("Invalid date value for " + day);
              setSubmitting(false);
              return;
            }

            const dateStr = format(tempDate, "yyyy-MM-dd");
            const startISO = `${dateStr}T${recurringStartTime}`;
            const endISO = computeEndISO(startISO, recurringDuration);
            classesToCreate.push({
              className,
              startTime: startISO,
              endTime: endISO,
              maxParticipants,
            });
          }
        }
        const payload = {
          currentGymId,
          classes: classesToCreate,
        };
        const res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
      }

      // Refresh & close
      refreshSchedules();
      onClose();
    } catch (err: any) {
      console.error("[handleCreate] error:", err);
      setError(err.message || "Failed to create classes");
    } finally {
      setSubmitting(false);
    }
  }

  function computeEndISO(startISO: string, durationMins: number) {
    const start = new Date(startISO); // might be invalid if startISO is empty
    const end = new Date(start.getTime() + durationMins * 60000);
    return end.toISOString();
  }

  function renderStep() {
    if (step === 1) {
      return (
        <div>
          <h3 className="text-pink-400 font-semibold mb-2">
            Step 1: Class Name
          </h3>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </div>
      );
    } else if (step === 2) {
      return (
        <div>
          <h3 className="text-pink-400 font-semibold mb-2">
            Step 2: Single or Recurring?
          </h3>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              checked={occurrenceType === "single"}
              onChange={() => setOccurrenceType("single")}
            />
            <span>Single Class</span>
          </label>
          <label className="flex items-center space-x-1 mt-2">
            <input
              type="radio"
              checked={occurrenceType === "recurring"}
              onChange={() => setOccurrenceType("recurring")}
            />
            <span>Recurring Classes</span>
          </label>
        </div>
      );
    } else if (step === 3) {
      if (occurrenceType === "single") {
        return (
          <div>
            <h3 className="text-pink-400 font-semibold mb-2">
              Step 3: Single Class Date/Time
            </h3>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <label className="block text-sm mt-2">Start Time</label>
            <input
              type="time"
              value={singleStartTime}
              onChange={(e) => setSingleStartTime(e.target.value)}
              step={900}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <label className="block text-sm mt-2">Duration (mins)</label>
            <input
              type="number"
              value={singleDuration}
              onChange={(e) => setSingleDuration(Number(e.target.value))}
              min={15}
              step={15}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
          </div>
        );
      } else {
        // recurring
        return (
          <div>
            <h3 className="text-pink-400 font-semibold mb-2">
              Step 3: Recurring Details
            </h3>
            <label className="block text-sm mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <label className="block text-sm mt-2 mb-1">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(selectedDays).map((day) => (
                <label key={day} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={selectedDays[day]}
                    onChange={() =>
                      setSelectedDays((prev) => ({
                        ...prev,
                        [day]: !prev[day],
                      }))
                    }
                  />
                  <span className="capitalize">{day}</span>
                </label>
              ))}
            </div>
            <label className="block text-sm mt-2">Number of Weeks</label>
            <input
              type="number"
              value={weeksCount}
              onChange={(e) => setWeeksCount(Number(e.target.value))}
              min={1}
              className="w-20 p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <label className="block text-sm mt-2">Start Time</label>
            <input
              type="time"
              value={recurringStartTime}
              onChange={(e) => setRecurringStartTime(e.target.value)}
              step={900}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
            <label className="block text-sm mt-2">Duration (mins)</label>
            <input
              type="number"
              value={recurringDuration}
              onChange={(e) => setRecurringDuration(Number(e.target.value))}
              min={15}
              step={15}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
            />
          </div>
        );
      }
    } else if (step === 4) {
      return (
        <div>
          <h3 className="text-pink-400 font-semibold mb-2">
            Step 4: Max Participants
          </h3>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            min={1}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </div>
      );
    } else if (step === 5) {
      return (
        <div>
          <h3 className="text-pink-400 font-semibold mb-2">
            Step 5: Review & Confirm
          </h3>
          <p className="text-sm text-gray-300">
            Click “Create” to finalize your classes.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        // We can force them to use the X button
        // onClick={onClose}
      />
      <div className="fixed right-0 top-0 w-full max-w-md h-full bg-gray-900 text-gray-200 p-4 overflow-auto">
        {/* Close (X) button */}
        <div className="flex justify-end">
          <button
            onClick={handleCloseClick}
            className="text-gray-400 hover:text-gray-300 font-bold text-xl"
          >
            ×
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Create Classes</h2>
        <p className="text-xs text-pink-400 mb-4">
          Step {step} of {totalSteps}
        </p>

        {renderStep()}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              onClick={goBack}
              className="px-3 py-1 bg-gray-700 rounded"
              disabled={submitting}
            >
              Back
            </button>
          )}
          {step < totalSteps && (
            <button
              onClick={goNext}
              className="px-3 py-1 bg-blue-600 rounded"
              disabled={submitting}
            >
              Next
            </button>
          )}
          {step === totalSteps && (
            <button
              onClick={handleCreate}
              className="px-4 py-1 bg-pink-600 rounded"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}