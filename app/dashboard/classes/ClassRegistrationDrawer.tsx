"use client";
import React, { useEffect, useState, useCallback } from "react";
// If you have a client-based Supabase approach:
import { supabaseBrowserClient } from "@/utils/supabase/client";

interface ClassSchedule {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  confirmed_count?: number;
}

interface ClassRegistrationDrawerProps {
  /** Controls drawer visibility */
  isOpen: boolean;
  /** Close function for the parent to hide the drawer */
  onClose: () => void;
  /** The class schedule data for which we show registration details */
  classSchedule: ClassSchedule;
  /** The current user ID, used to check if they are registered, etc. */
  currentUserId: string;
  /** A parent callback to refresh schedule data after changes */
  refreshSchedules: () => void;
}

/**
 * ClassRegistrationDrawer
 *
 * A drawer that slides in from the right to display or modify a user’s
 * registration status for a specific class schedule.
 */
export default function ClassRegistrationDrawer({
  isOpen,
  onClose,
  classSchedule,
  currentUserId,
  refreshSchedules,
}: ClassRegistrationDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<"confirmed" | "waitlisted" | "none">("none");

  /**
   * fetchConfirmedCount (wrapped in useCallback)
   *
   * Retrieves how many users are “confirmed” for this classSchedule’s ID.
   * We use useCallback so that the function reference remains stable across renders,
   * enabling us to safely add it to the effect dependency array.
   */
  const fetchConfirmedCount = useCallback(async () => {
    try {
      const { data, error } = await supabaseBrowserClient
        .from("class_registrations")
        .select("*", { count: "exact" })
        .eq("class_schedule_id", classSchedule.id)
        .eq("status", "confirmed");

      if (error) {
        console.error("[fetchConfirmedCount] error:", error);
        setConfirmedCount(null);
        return;
      }
      setConfirmedCount(data?.length ?? 0);
    } catch (err) {
      console.error("[fetchConfirmedCount] unexpected error:", err);
      setConfirmedCount(null);
    }
  }, [classSchedule.id]);

  /**
   * fetchUserStatus (wrapped in useCallback)
   *
   * Fetches the user’s registration status for this class (confirmed, waitlisted, or none).
   * If not found or an error occurs, we assume “none.”
   */
  const fetchUserStatus = useCallback(async () => {
    try {
      if (!currentUserId) {
        setUserStatus("none");
        return;
      }
      const { data, error } = await supabaseBrowserClient
        .from("class_registrations")
        .select("status")
        .eq("class_schedule_id", classSchedule.id)
        .eq("user_profile_id", currentUserId)
        .single();

      if (error || !data) {
        // means user is not registered
        setUserStatus("none");
      } else {
        const statusVal = data.status as "confirmed" | "waitlisted" | "none";
        setUserStatus(statusVal || "none");
      }
    } catch (err) {
      console.error("[fetchUserStatus] error:", err);
      setUserStatus("none");
    }
  }, [classSchedule.id, currentUserId]);

  /**
   * useEffect
   *
   * When the drawer opens, we fetch the confirmed count and the user’s status
   * to display current info. The effect depends on isOpen, classSchedule,
   * and the two fetch functions (both wrapped in useCallback).
   */
  useEffect(() => {
    if (isOpen && classSchedule) {
      fetchConfirmedCount();
      fetchUserStatus();
    }
  }, [isOpen, classSchedule, fetchConfirmedCount, fetchUserStatus]);

  /**
   * handleRegister
   *  - Example flow: call an endpoint to confirm the user in the class.
   *  - Then refresh parent schedules and local counts/status.
   */
  async function handleRegister() {
    setLoading(true);
    try {
      const res = await fetch("/api/classes/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_schedule_id: classSchedule.id }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      refreshSchedules();
      fetchConfirmedCount();
      fetchUserStatus();
    } catch (err) {
      console.error("[handleRegister] error:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * handleCancel
   *  - Example flow: call an endpoint to remove/cancel the user’s registration.
   */
  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/classes/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_schedule_id: classSchedule.id }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      refreshSchedules();
      fetchConfirmedCount();
      fetchUserStatus();
    } catch (err) {
      console.error("[handleCancel] error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto">
      {/* Overlay that closes the drawer on click */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Drawer container */}
      <div className="fixed right-0 top-0 w-full max-w-md h-full bg-white shadow-xl p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-2">{classSchedule.class_name}</h2>
        <p className="text-sm text-gray-600">
          {classSchedule.start_time
            ? new Date(classSchedule.start_time).toLocaleString()
            : "No start time"}{" "}
          -{" "}
          {classSchedule.end_time
            ? new Date(classSchedule.end_time).toLocaleString()
            : "No end time"}
        </p>

        {confirmedCount !== null && (
          <p className="mt-1 text-gray-700">
            {confirmedCount} / {classSchedule.max_participants} confirmed
          </p>
        )}

        {/* Render different buttons based on the user’s status */}
        <div className="mt-4 space-y-3">
          {userStatus === "none" && (
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          )}

          {userStatus === "confirmed" && (
            <div>
              <p className="text-green-600 mb-2">You are confirmed!</p>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                {loading ? "Cancelling..." : "Cancel Registration"}
              </button>
            </div>
          )}

          {userStatus === "waitlisted" && (
            <div>
              <p className="text-gray-600 mb-2">You are waitlisted.</p>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                {loading ? "Cancelling..." : "Cancel Waitlist"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}