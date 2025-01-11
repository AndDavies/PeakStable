/**
 * app/dashboard/classes/page.tsx
 *
 * Server component for rendering the classes calendar.
 * 1) Fetches the user's session & profile (SSR).
 * 2) Computes a default weekly date range, fetches schedules from DB.
 * 3) Computes confirmed_count if needed.
 * 4) Returns a dark container with a client component (VerticalCalendar) for the interactive display.
 */

import { Metadata } from 'next';
import { getSession } from '@/utils/supabase/session';
import { getProfile } from '@/utils/supabase/profile';
import { createSupabaseClient } from '@/utils/supabase/supabaseClient';
import { startOfWeek, addDays } from 'date-fns';
import VerticalCalendar from './VerticalCalendar'; // <-- Your client component

export const metadata: Metadata = {
  title: 'Classes Calendar',
};

export default async function ClassesPage() {
  try {
    // 1) Fetch current session via SSR
    const session = await getSession();
    if (!session) {
      // If no session, user is redirected to /login by getSession(), but just in case:
      return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
          Please log in to view classes.
        </div>
      );
    }

    const user = session.user;

    // 2) Fetch user profile
    const profile = await getProfile(user.id);
    if (!profile) {
      return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
          Error loading profile data.
        </div>
      );
    }

    const currentGymId = profile.current_gym_id;
    if (!currentGymId) {
      return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
          You have no current gym selected. Please update your profile.
        </div>
      );
    }

    // 3) Prepare date range (SSR)
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 7);

    // 4) Create a Supabase client to fetch schedules from DB
    const supabase = await createSupabaseClient();
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('class_schedules')
      .select('id, class_name, start_time, end_time, max_participants, class_type_id')
      .eq('current_gym_id', currentGymId)
      .gte('start_time', startOfCurrentWeek.toISOString())
      .lte('start_time', endOfCurrentWeek.toISOString());

    if (schedulesError) {
      console.error('Error fetching class_schedules:', schedulesError);
      return (
        <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
          Error loading class schedules.
        </div>
      );
    }

    // Convert null result to empty array
    let initialSchedules = schedulesData || [];

    // 5) Optionally compute confirmed_count from class_registrations
    if (initialSchedules.length > 0) {
      const classIds = initialSchedules.map(cls => cls.id);

      // Fetch all 'confirmed' registrations for these schedules
      const { data: regData, error: regError } = await supabase
        .from('class_registrations')
        .select('class_schedule_id')
        .eq('status', 'confirmed')
        .in('class_schedule_id', classIds);

      if (!regError && regData) {
        const countsMap = new Map<string, number>();
        regData.forEach(row => {
          countsMap.set(row.class_schedule_id, (countsMap.get(row.class_schedule_id) || 0) + 1);
        });
        // Attach confirmed_count to each schedule
        initialSchedules = initialSchedules.map(cls => ({
          ...cls,
          confirmed_count: countsMap.get(cls.id) || 0,
        }));
      }
    }

    // 6) Return SSR container with your client component
    //    passing user role, user ID, gym ID, and initialSchedules
    return (
      <section className="bg-gray-900 text-gray-200 min-h-screen p-6 sm:p-8 md:p-10">
        <VerticalCalendar
          initialSchedules={initialSchedules}
          currentGymId={currentGymId}
          userId={user.id}
          userRole={profile.role} // e.g. 'member', 'coach', 'owner'
        />
      </section>
    );
  } catch (error) {
    console.error('[ClassesPage] Unexpected error:', error);
    return (
      <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
        Unexpected error occurred.
      </div>
    );
  }
}