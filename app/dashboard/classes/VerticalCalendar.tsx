"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  parseISO,
  isValid,
  startOfWeek,
  addDays,
  addMinutes,
  differenceInMinutes,
  format,
} from "date-fns";
import ClassRegistrationDrawer from "./ClassRegistrationDrawer";
import ClassWizardDrawer from "./ClassWizardDrawer";

/**
 * Interface for your 'class_schedules' records,
 * including optional confirmed_count for display.
 */
interface ClassSchedule {
  id: string;
  class_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  confirmed_count?: number;
  class_type_id?: string | null;
}

/**
 * Props for the VerticalCalendar component.
 * 'userRole' is no longer hardcoded; we accept the real role passed in from the parent.
 */
interface VerticalCalendarProps {
  initialSchedules: ClassSchedule[];
  currentGymId: string;
  userId: string;
  userRole: string; // e.g. 'member', 'coach', 'owner'
}

/**
 * VerticalCalendar
 *
 * Renders a weekly time-based grid for classes. If userRole !== 'member',
 * the user can drag-and-drop classes or create new ones. The code ensures
 * no hooks are used inside loops, satisfying the Rules of Hooks.
 */
export default function VerticalCalendar({
  initialSchedules,
  currentGymId,
  userId,
  userRole,
}: VerticalCalendarProps) {
  // 1) Define top-level Hooks (no loops/conditionals).
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules);

  // For the registration drawer
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);

  // For the “create classes” wizard
  const [isWizardOpen, setWizardOpen] = useState(false);

  /**
   * 2) We define a callback to refresh schedules for the displayed week.
   *    Use top-level useCallback, not in any loops or conditionals.
   */
  const refreshSchedules = useCallback(async () => {
    try {
      const startISO = weekStartDate.toISOString();
      const endISO = addDays(weekStartDate, 7).toISOString();

      const res = await fetch(`/api/classes?start=${startISO}&end=${endISO}`);
      if (!res.ok) {
        console.error("[refreshSchedules] fetch error:", await res.text());
        return;
      }
      const data: ClassSchedule[] = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error("[refreshSchedules] unexpected error:", err);
    }
  }, [weekStartDate]);

  /**
   * 3) useEffect top-level: once weekStartDate changes, we refresh.
   *    No loops or conditionals around this hook.
   */
  useEffect(() => {
    refreshSchedules();
  }, [refreshSchedules]);

  // 4) Utility functions for navigation
  function handlePreviousWeek() {
    setWeekStartDate((prev) => addDays(prev, -7));
  }
  function handleNextWeek() {
    setWeekStartDate((prev) => addDays(prev, 7));
  }
  function handleToday() {
    setWeekStartDate(startOfWeek(new Date(), { weekStartsOn: 0 }));
  }

  // 5) Clicking a class => open the registration drawer
  function handleClassClick(cls: ClassSchedule) {
    setSelectedClass(cls);
    setRegistrationOpen(true);
  }

//   // 6) DRAG & DROP: only active if userRole !== 'member'.
//   //    Hooks remain top-level; these are just event handlers.
//   function onDragStart(e: React.DragEvent<HTMLDivElement>, cls: ClassSchedule) {
//     if (userRole === "member") return; // members can't drag
//     e.dataTransfer.setData("text/plain", JSON.stringify(cls));
//   }

//   function onDragOver(e: React.DragEvent<HTMLDivElement>) {
//     // Only allow if user is not 'member'
//     if (userRole !== "member") {
//       e.preventDefault();
//     }
//   }

  async function onDrop(e: React.DragEvent<HTMLDivElement>, dayIndex: number) {
    if (userRole === "member") return;
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;
    const cls: ClassSchedule = JSON.parse(data);

    // Calc new start time
    const boundingRect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - boundingRect.top;
    const DAY_START_HOUR = 5;
    const minutesFromStart = Math.floor(offsetY);
    const newStart = addMinutes(
      weekStartDate,
      dayIndex * 1440 + DAY_START_HOUR * 60 + minutesFromStart
    );
    // Keep same duration
    const oldStart = parseISO(cls.start_time);
    const oldEnd = parseISO(cls.end_time);
    const duration = differenceInMinutes(oldEnd, oldStart);
    const newEnd = addMinutes(newStart, duration);

    try {
      const res = await fetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: cls.id,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
        }),
      });
      if (!res.ok) {
        console.error("[onDrop] update error:", await res.text());
        return;
      }
      refreshSchedules();
    } catch (err) {
      console.error("[onDrop] unexpected error:", err);
    }
  }

  // 7) Build time labels (30-min increments) for the left axis
  const DAY_START_HOUR = 5;
  const DAY_END_HOUR = 22;
  const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;

  const timeLabels: string[] = [];
  for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
    timeLabels.push(`${String(hour).padStart(2, "0")}:00`);
    timeLabels.push(`${String(hour).padStart(2, "0")}:30`);
  }
  timeLabels.push(`${DAY_END_HOUR}:00`);

  // 8) Filter schedules for the current displayed week
  const displayed = schedules.filter((s) => {
    const st = parseISO(s.start_time);
    return isValid(st) && st >= weekStartDate && st < addDays(weekStartDate, 7);
  });

  // 9) Group by day index 0..6, but do not define hooks here
  const groupedByDay: Record<number, ClassSchedule[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  displayed.forEach((cls) => {
    const st = parseISO(cls.start_time);
    const dayDiff = Math.floor(differenceInMinutes(st, weekStartDate) / (60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      groupedByDay[dayDiff].push(cls);
    }
  });

  return (
    <div className="space-y-4">
      {/*  WEEK NAVIGATION  */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousWeek}
          className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          Previous
        </button>
        <div className="text-center">
          <div className="font-bold">{format(weekStartDate, "MMMM yyyy")}</div>
          <div className="text-xs text-gray-400">
            Week of {format(weekStartDate, "MM/dd")}
          </div>
        </div>
        <button
          onClick={handleNextWeek}
          className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          Next
        </button>
      </div>

      <button onClick={handleToday} className="text-sm text-pink-500 underline">
        Today
      </button>

      {/* Show create button if userRole != 'member' */}
      {userRole !== "member" && (
        <button
          onClick={() => setWizardOpen(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          + Create Classes
        </button>
      )}

      {/* Container that includes horizontal lines (behind) + columns (front) */}
      <div className="relative">
        {/* Horizontal lines behind day columns */}
        <div className="absolute w-full h-full top-0 left-14 pointer-events-none">
          {timeLabels.map((lbl, idx) => {
            const topPos = idx * 30;
            return (
              <div
                key={lbl}
                style={{ top: `${topPos}px` }}
                className="absolute left-0 right-0 border-t border-gray-700"
              />
            );
          })}
        </div>

        <div className="flex">
          {/* Left axis for time labels */}
          <div className="w-14 flex flex-col">
            {timeLabels.map((lbl) => (
              <div
                key={lbl}
                style={{ height: "30px" }}
                className="text-xs text-gray-400 border-b border-gray-700 flex items-end justify-center"
              >
                {lbl}
              </div>
            ))}
          </div>

          {/* 7 day columns */}
          {Array.from({ length: 7 }, (_, dayIndex) => {
            const dayDate = addDays(weekStartDate, dayIndex);
            const daySchedules = groupedByDay[dayIndex] || [];

            return (
              <div
                key={dayIndex}
                //onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, dayIndex)}
                className="flex-1 border-l border-gray-700 relative"
                style={{ minHeight: `${TOTAL_MINUTES}px` }}
              >
                <div className="text-center text-xs text-gray-300 border-b border-gray-700">
                  {format(dayDate, "EEE, MM/dd")}
                </div>

                {daySchedules.map((cls) => {
                  const st = parseISO(cls.start_time);
                  const et = parseISO(cls.end_time);
                  if (!isValid(st) || !isValid(et)) return null;

                  const minutesFromStart =
                    differenceInMinutes(st, addDays(weekStartDate, dayIndex)) - DAY_START_HOUR * 60;
                  const duration = differenceInMinutes(et, st);

                  return (
                    <div
                      key={cls.id}
                      draggable={userRole !== "member"}
                      //onDragStart={(evt) => onDragStart(evt, cls)}
                      style={{
                        top: `${minutesFromStart}px`,
                        height: `${duration}px`,
                        left: "0%",
                        width: "100%",
                      }}
                      className="absolute bg-pink-600 text-white text-xs p-1 rounded cursor-move shadow hover:bg-pink-500"
                      onClick={(evt) => {
                        evt.stopPropagation();
                        handleClassClick(cls);
                      }}
                    >
                      <div className="font-semibold">{cls.class_name}</div>
                      <div className="text-[10px]">
                        {format(st, "h:mm a")} - {format(et, "h:mm a")}
                      </div>
                      {typeof cls.confirmed_count === "number" && (
                        <div className="text-[10px]">
                          {cls.confirmed_count} / {cls.max_participants}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
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

      {/* Wizard Drawer (create classes). Only if not a member */}
      {isWizardOpen && userRole !== "member" && (
        <ClassWizardDrawer
          isOpen={isWizardOpen}
          onClose={() => setWizardOpen(false)}
          currentGymId={currentGymId}
          refreshSchedules={refreshSchedules}
          userRole={userRole} // if you want checks in the wizard
        />
      )}
    </div>
  );
}