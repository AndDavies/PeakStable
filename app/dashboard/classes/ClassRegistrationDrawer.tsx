"use client";
import React, { useEffect, useState, useCallback } from "react";
import { supabaseBrowserClient } from "@/utils/supabase/client"; // Adjust import as needed

interface ClassSchedule {
  id: string;
  class_name: string;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  confirmed_count?: number;
}

interface ClassRegistrationDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Function to close the drawer */
  onClose: () => void;
  /** Data for the class in question */
  classSchedule: ClassSchedule;
  /** Current user ID (from session) */
  currentUserId: string;
  /** Parent callback to refresh schedules after changes */
  refreshSchedules: () => void;
}

/**
 * ClassRegistrationDrawer
 *
 * A right-side drawer allowing a user to register or cancel for a specific class_schedules row.
 * We do NOT rely on /api/classes/stats or /api/classes/user-status. Instead, we do direct
 * Supabase queries in the client. For now, we assume 'confirmed' is the only status besides 'none'.
 * If your logic uses waitlisted, we show how you might handle that too.
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
  const [userStatus, setUserStatus] = useState<"none" | "confirmed" | "waitlisted">("none");

  /**
   * fetchConfirmedCount:
   *  Queries 'class_registrations' to see how many have status='confirmed' for this class.
   *  Then sets 'confirmedCount' in state.
   */
  const fetchConfirmedCount = useCallback(async () => {
    try {
      const { data, error, count } = await supabaseBrowserClient
        .from("class_registrations")
        .select("*", { count: "exact" })
        .eq("class_schedule_id", classSchedule.id)
        .eq("status", "confirmed");

      if (error) {
        console.error("[fetchConfirmedCount] error:", error);
        return;
      }
      // data.length or 'count' should reflect how many are confirmed
      const totalConfirmed = count ?? data?.length ?? 0;
      setConfirmedCount(totalConfirmed);
    } catch (err) {
      console.error("[fetchConfirmedCount] unexpected error:", err);
    }
  }, [classSchedule.id]);

  /**
   * fetchUserStatus:
   *  Check if the current user is 'confirmed', 'waitlisted', or not in 'class_registrations'.
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
        .maybeSingle();

      if (error) {
        console.error("[fetchUserStatus] error:", error);
        setUserStatus("none");
      } else if (!data) {
        // means user not registered
        setUserStatus("none");
      } else {
        // data.status might be 'confirmed', 'waitlisted', etc.
        const statusVal = data.status as "confirmed" | "waitlisted" | "none";
        setUserStatus(statusVal ?? "none");
      }
    } catch (err) {
      console.error("[fetchUserStatus] unexpected error:", err);
      setUserStatus("none");
    }
  }, [classSchedule.id, currentUserId]);

  /**
   * On open, fetch the confirmed count and user status
   */
  useEffect(() => {
    if (isOpen && classSchedule?.id) {
      fetchConfirmedCount();
      fetchUserStatus();
    }
  }, [isOpen, classSchedule?.id, fetchConfirmedCount, fetchUserStatus]);

  /**
   * handleRegister:
   *  Insert or upsert a row in 'class_registrations' for user => 'confirmed'.
   *  Then re-fetch schedules and local data.
   */
  async function handleRegister() {
    setLoading(true);
    try {
      // If you have waitlist logic, you might check if the class is full, etc.
      // For now, we skip that. We just do a single 'confirmed' insert.
      const { error } = await supabaseBrowserClient.from("class_registrations").upsert({
        class_schedule_id: classSchedule.id,
        user_profile_id: currentUserId,
        status: "confirmed",
      });

      if (error) {
        throw new Error(error.message);
      }
      // Re-fetch parent schedules + local count, user status
      refreshSchedules();
      await fetchConfirmedCount();
      await fetchUserStatus();
    } catch (err) {
      console.error("[handleRegister] error:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * handleCancel:
   *  Remove the row from 'class_registrations' or update status to 'none'.
   *  We'll do a .delete() for simplicity. Then re-fetch parent data.
   */
  async function handleCancel() {
    setLoading(true);
    try {
      const { error } = await supabaseBrowserClient
        .from("class_registrations")
        .delete()
        .eq("class_schedule_id", classSchedule.id)
        .eq("user_profile_id", currentUserId);

      if (error) {
        throw new Error(error.message);
      }
      refreshSchedules();
      await fetchConfirmedCount();
      await fetchUserStatus();
    } catch (err) {
      console.error("[handleCancel] error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto">
      {/* Overlay that closes the drawer */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Drawer */}
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

        {/* Confirmed Count */}
        {confirmedCount !== null && (
          <p className="mt-1 text-gray-700">
            {confirmedCount} / {classSchedule.max_participants} confirmed
          </p>
        )}

        {/* Registration Buttons */}
        <div className="mt-4 space-y-3">
          {userStatus === "none" && (
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded"
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
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {loading ? "Cancelling..." : "Cancel Registration"}
              </button>
            </div>
          )}

          {userStatus === "waitlisted" && (
            <div>
              <p className="text-orange-700 mb-2">You are waitlisted.</p>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded"
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