"use client";
import React, { useState } from "react";

interface ClassWizardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentGymId: string;
  refreshSchedules: () => void;
  userRole?: string;
}

/**
 * ClassWizardDrawer
 *
 * Let owners/coaches create new classes. Because we do not want hooking logic in loops,
 * we keep a single wizard approach at the top level, no day-based hooking.
 */
export default function ClassWizardDrawer({
  isOpen,
  onClose,
  currentGymId,
  refreshSchedules,
  userRole,
}: ClassWizardDrawerProps) {
  const [className, setClassName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [duration, setDuration] = useState(60);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isSubmitting, setSubmitting] = useState(false);

  // If user is 'member', we might just block them entirely
  if (userRole === "member") {
    return null;
  }

  if (!isOpen) return null;

  async function handleCreate() {
    setSubmitting(true);
    try {
      const startISO = `${startDate}T${startTime}`;
      const endISO = computeEndISO(startISO, duration);
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
      refreshSchedules();
      onClose();
    } catch (err) {
      console.error("[handleCreate] error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function computeEndISO(startISO: string, durationMins: number) {
    const start = new Date(startISO);
    const end = new Date(start.getTime() + durationMins * 60000);
    return end.toISOString();
  }

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed right-0 top-0 w-full max-w-md h-full bg-gray-900 text-gray-200 p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Create New Class</h2>

        <label className="block mb-1 text-sm">Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-gray-800"
        />

        <label className="block mb-1 text-sm">Date (YYYY-MM-DD)</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-gray-800"
        />

        <label className="block mb-1 text-sm">Start Time (HH:mm)</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-gray-800"
        />

        <label className="block mb-1 text-sm">Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          min={15}
          step={15}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full mb-2 p-2 rounded bg-gray-800"
        />

        <label className="block mb-1 text-sm">Max Participants</label>
        <input
          type="number"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(Number(e.target.value))}
          className="w-full mb-2 p-2 rounded bg-gray-800"
        />

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="bg-pink-600 hover:bg-pink-500 px-4 py-1 rounded"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}