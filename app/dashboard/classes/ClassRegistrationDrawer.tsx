"use client"
/**
 * app/dashboard/classes/ClassRegistrationDrawer.tsx
 *
 * A client component for registering or waitlisting a user for a class schedule.
 * We import `supabaseBrowserClient` from `utils/supabase/client.ts`.
 */

import React, { useEffect, useState } from 'react'
import { supabaseBrowserClient } from '@/utils/supabase/client'

type ClassSchedule = {
  id: string
  class_name: string
  start_time: string | null
  end_time: string | null
  max_participants: number
  confirmed_count?: number
}

interface ClassRegistrationDrawerProps {
  /**
   * The parent component will set this to `true` when the drawer should be open,
   * and `false` when it's closed.
   */
  isOpen: boolean

  /** Callback to close/hide the drawer. */
  onClose: () => void

  /** The class schedule details the user is interacting with. */
  classSchedule: ClassSchedule

  /**
   * Optional: If you had a function to refresh the schedules in the parent,
   * you can pass it here. (Include if you want to call it after register/cancel.)
   */
  refreshSchedules?: () => void
}

export default function ClassRegistrationDrawer({
  isOpen,
  onClose,
  classSchedule,
  refreshSchedules,
}: ClassRegistrationDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null)
  const [userStatus, setUserStatus] = useState<'confirmed' | 'waitlisted' | 'none'>('none')

  // Run these effects when the drawer is opened (and we actually have a classSchedule).
  useEffect(() => {
    if (classSchedule && isOpen) {
      fetchConfirmedCount()
      fetchUserStatus()
    }
  }, [classSchedule, isOpen])

  async function fetchConfirmedCount() {
    const { data, error } = await supabaseBrowserClient
      .from('class_registrations')
      .select('id', { count: 'exact' })
      .eq('class_schedule_id', classSchedule.id)
      .eq('status', 'confirmed')

    if (!error && data) {
      setConfirmedCount(data.length)
    }
  }

  async function fetchUserStatus() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseBrowserClient.auth.getUser()

      if (authError || !user) {
        console.error('Auth error or no user found:', authError)
        return
      }

      const { data, error } = await supabaseBrowserClient
        .from('class_registrations')
        .select('status')
        .eq('class_schedule_id', classSchedule.id)
        .eq('user_profile_id', user.id)
        .single()

      if (error) {
        setUserStatus('none')
      } else if (data?.status === 'confirmed') {
        setUserStatus('confirmed')
      } else if (data?.status === 'waitlisted') {
        setUserStatus('waitlisted')
      } else {
        setUserStatus('none')
      }
    } catch (err) {
      console.error('fetchUserStatus: Unexpected error:', err)
    }
  }

  async function handleRegister() {
    setLoading(true)
    try {
      const res = await fetch('/api/classes/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_schedule_id: classSchedule.id }),
      })

      const result = await res.json()
      if (res.ok) {
        setUserStatus(result.status)
        refreshSchedules?.() // If a refresh function was provided, call it
        fetchConfirmedCount() // update local display
      } else {
        alert(result.error || 'Failed to register.')
      }
    } catch (err) {
      console.error('handleRegister: Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch('/api/classes/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_schedule_id: classSchedule.id }),
      })

      const result = await res.json()
      if (res.ok) {
        setUserStatus('none')
        refreshSchedules?.()
        fetchConfirmedCount()
      } else {
        alert(result.error || 'Failed to cancel.')
      }
    } catch (err) {
      console.error('handleCancel: Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  const spotsAvailable =
    confirmedCount !== null && confirmedCount < classSchedule.max_participants

  /**
   * If the drawer is not open, we can return null or do any other "closed" logic.
   * This ensures it won't render in the DOM at all unless open.
   */
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer Pane */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-2">{classSchedule.class_name}</h2>
        <p className="text-sm text-gray-600">
          {classSchedule.start_time
            ? new Date(classSchedule.start_time).toLocaleString()
            : 'No start time'}
        </p>
        {confirmedCount !== null && (
          <p>
            {confirmedCount} / {classSchedule.max_participants} confirmed
          </p>
        )}

        {/* Registration Logic */}
        {userStatus === 'none' && (
          <div className="mt-4">
            {spotsAvailable ? (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="bg-pink-500 text-white px-3 py-1 rounded"
              >
                {loading ? 'Joining Waitlist...' : 'Join Waitlist'}
              </button>
            )}
          </div>
        )}

        {userStatus === 'confirmed' && (
          <div className="mt-4">
            <p className="mb-2 text-green-600">You are confirmed!</p>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              {loading ? 'Cancelling...' : 'Cancel Registration'}
            </button>
          </div>
        )}

        {userStatus === 'waitlisted' && (
          <div className="mt-4">
            <p className="mb-2 text-gray-600">You are waitlisted.</p>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              {loading ? 'Cancelling...' : 'Cancel Registration'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}