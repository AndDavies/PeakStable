"use client"
/**
 * ClassRegistrationDrawer.tsx
 *
 * Receives:
 *   - isOpen: whether the drawer is visible
 *   - onClose: function to close the drawer
 *   - classSchedule: the class details
 *   - currentUserId: user ID passed from SSR
 *   - refreshSchedules: function to re-fetch classes in ClassCalendar
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
  isOpen: boolean
  onClose: () => void
  classSchedule: ClassSchedule
  currentUserId: string
  refreshSchedules: () => void
}

export default function ClassRegistrationDrawer({
  isOpen,
  onClose,
  classSchedule,
  currentUserId,
  refreshSchedules,
}: ClassRegistrationDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null)
  const [userStatus, setUserStatus] = useState<'confirmed' | 'waitlisted' | 'none'>('none')

  // When the drawer opens, fetch counts and user's status
  useEffect(() => {
    if (isOpen && classSchedule) {
      fetchConfirmedCount()
      fetchUserStatus()
    }
  }, [isOpen, classSchedule])

  /**
   * 1) fetchConfirmedCount
   *    How many are confirmed for this class?
   */
  async function fetchConfirmedCount() {
    try {
      const { data, error } = await supabaseBrowserClient
        .from('class_registrations')
        .select('id', { count: 'exact' })
        .eq('class_schedule_id', classSchedule.id)
        .eq('status', 'confirmed')

      if (!error && data) {
        setConfirmedCount(data.length)
      }
    } catch (err) {
      console.error('fetchConfirmedCount error:', err)
    }
  }

  /**
   * 2) fetchUserStatus
   *    Check if currentUserId is 'confirmed', 'waitlisted', or 'none'
   */
  async function fetchUserStatus() {
    try {
      if (!currentUserId) {
        setUserStatus('none')
        return
      }

      const { data, error } = await supabaseBrowserClient
        .from('class_registrations')
        .select('status')
        .eq('class_schedule_id', classSchedule.id)
        .eq('user_profile_id', currentUserId)
        .single()

      if (error) {
        // Not found => user not registered
        setUserStatus('none')
      } else if (data?.status === 'confirmed') {
        setUserStatus('confirmed')
      } else if (data?.status === 'waitlisted') {
        setUserStatus('waitlisted')
      } else {
        setUserStatus('none')
      }
    } catch (err) {
      console.error('fetchUserStatus error:', err)
    }
  }

  /**
   * 3) handleRegister
   *    POST /api/classes/register => sets user status to confirmed or waitlisted,
   *    then refreshSchedules to update the parent calendar.
   */
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
        setUserStatus(result.status)  // 'confirmed' or 'waitlisted'
        // Refresh the main calendar to update displayed counts
        refreshSchedules()
        // Also refresh local count
        fetchConfirmedCount()
      } else {
        alert(result.error || 'Failed to register.')
      }
    } catch (err) {
      console.error('handleRegister error:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 4) handleCancel
   *    POST /api/classes/cancel => removes user registration,
   *    then refreshSchedules to update the parent calendar.
   */
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
        refreshSchedules()
        fetchConfirmedCount()
      } else {
        alert(result.error || 'Failed to cancel registration.')
      }
    } catch (err) {
      console.error('handleCancel error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Spots available if confirmedCount < max_participants
  const spotsAvailable =
    confirmedCount !== null && confirmedCount < classSchedule.max_participants

  // If the drawer is not open, don't render
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
          {' '} - {' '}
          {classSchedule.end_time
            ? new Date(classSchedule.end_time).toLocaleString()
            : 'No end time'}
        </p>

        {confirmedCount !== null && (
          <p className="mt-1">
            {confirmedCount} / {classSchedule.max_participants} confirmed
          </p>
        )}

        <div className="mt-4 space-y-3">
          {/* If user not registered, show register/waitlist button */}
          {userStatus === 'none' && (
            spotsAvailable ? (
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
                {loading ? 'Joining waitlist...' : 'Join Waitlist'}
              </button>
            )
          )}

          {/* If confirmed, show cancel button */}
          {userStatus === 'confirmed' && (
            <div>
              <p className="text-green-600 mb-2">You are confirmed!</p>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                {loading ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            </div>
          )}

          {/* If waitlisted, show cancel button */}
          {userStatus === 'waitlisted' && (
            <div>
              <p className="text-gray-600 mb-2">You are waitlisted.</p>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                {loading ? 'Cancelling...' : 'Cancel Waitlist'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}