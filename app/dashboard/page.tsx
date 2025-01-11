// app/dashboard/page.tsx

/**
 * This DashboardPage is a Next.js Server Component. 
 * We fetch secure Supabase data here before rendering.
 */

import { getSession } from "@/utils/supabase/session";
import { getProfile } from "@/utils/supabase/profile";
import Image from 'next/image'


export default async function DashboardPage() {
  try {
    
    // 1) Fetch current session
    const session = await getSession();

    if (!session) {
      return <div className="text-white bg-black">Redirecting to login...</div>;
    }

    // 2) Fetch profile data
    const profile = await getProfile(session.user.id);

    if (!profile) {
      return <div className="text-white bg-black">Error loading profile.</div>;
    }

    // 5) Render the UI with placeholders
    return (
      <section className="w-full min-h-screen bg-black text-white font-sans">
        {/* Profile Banner */}
        <div className="relative w-full bg-neutral-900 border-b border-neutral-800 p-6 flex items-center space-x-6">
          {/* User Avatar */}
          <Image
            src={profile?.profile_picture ?? '/images/default-avatar.png'}
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full object-cover border border-pink-500"
          />
          {/* User Info */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-100">
              Welcome, {profile?.first_name || 'Athlete'}!
            </h1>
            <p className="text-gray-400">@YourUsername</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Greeting & Info */}
          <div>
            <h2 className="text-3xl font-bold text-white">
              Your Holistic Dashboard
            </h2>
            <p className="text-gray-400 mt-1">
              Mind, Body, and Community—track it all in one place.
            </p>
          </div>

          {/* Grid Layout: Mindful, Body, Community */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mind Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xl font-bold text-pink-500">
                Mindfulness
              </h3>
              <p className="text-gray-300">
                Explore daily breathwork, meditation, and recovery insights.
              </p>
              <div className="rounded bg-black p-4 flex flex-col space-y-2">
                {/* Example: Sub-widget (Breathwork Timer Placeholder) */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Breathwork Timer</span>
                  <button className="text-pink-500 hover:text-pink-400 font-semibold">
                    Start
                  </button>
                </div>
                {/* Example: Sub-widget (Meditation Streak) */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Meditation Streak</span>
                  <span className="text-gray-300 font-semibold">3 days</span>
                </div>
              </div>
            </div>

            {/* Body Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xl font-bold text-pink-500">
                Body
              </h3>
              <p className="text-gray-300">
                Track daily sessions, strength workouts, and progress metrics.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {/* Today's Session Card */}
                <div className="bg-black rounded p-4 text-gray-300">
                  <h4 className="font-semibold text-gray-100 mb-1">
                    Today’s Sessions
                  </h4>
                  <p className="text-sm text-gray-400">
                    Nothing planned for today. Let’s get you moving!
                  </p>
                  <button className="mt-3 px-3 py-2 bg-pink-500 rounded text-white hover:bg-pink-600">
                    Discover Programs
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-black rounded p-4 text-gray-300">
                  <h4 className="font-semibold text-gray-100 mb-2">
                    Weekly Activity Goal
                  </h4>
                  <div className="w-full bg-neutral-800 rounded-full h-3">
                    <div
                      className="bg-pink-500 h-3 rounded-full"
                      style={{ width: '45%' }} // Placeholder
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    You’re nearly halfway to your goal!
                  </p>
                </div>
              </div>
            </div>

            {/* Community Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xl font-bold text-pink-500">
                Community
              </h3>
              <p className="text-gray-300">
                Stay connected with peers and coaches.
              </p>
              {/* Notifications / Community Updates */}
              <div className="bg-black rounded p-4">
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>- Jane posted a new workout challenge.</li>
                  <li>- Coach Mark commented on your progress.</li>
                  <li>- You have 3 new friend requests.</li>
                </ul>
                <button className="mt-3 px-3 py-2 bg-pink-500 rounded text-white hover:bg-pink-600">
                  View All
                </button>
              </div>
            </div>
          </div>

          {/* “Holistic Highlights” (e.g., ice baths, recommended articles, etc.) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ice Bath / Recovery Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xl font-bold text-pink-500">
                Recovery & Ice Baths
              </h3>
              <p className="text-gray-300">
                Schedule your next cold plunge or sauna session.
              </p>
              <div className="bg-black rounded p-4 text-gray-300">
                <h4 className="font-semibold text-gray-100 mb-1">
                  Next Ice Bath
                </h4>
                <p className="text-sm text-gray-400">
                  Saturday, 8 AM
                </p>
                <button className="mt-3 px-3 py-2 border border-pink-500 text-pink-500 rounded hover:bg-pink-500 hover:text-white">
                  Edit Schedule
                </button>
              </div>
            </div>

            {/* Articles / Education */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xl font-bold text-pink-500">
                Recommended Articles
              </h3>
              <p className="text-gray-300">
                Holistic tips on training, nutrition, and mindfulness.
              </p>
              <div className="bg-black rounded p-4 text-gray-300 space-y-3">
                {/* Article #1 */}
                <div className="border-b border-neutral-800 pb-2">
                  <h4 className="font-semibold text-gray-100">
                    Effective Breathwork Drills
                  </h4>
                  <p className="text-sm text-gray-400">
                    Explore advanced breathing techniques to boost performance.
                  </p>
                </div>
                {/* Article #2 */}
                <div>
                  <h4 className="font-semibold text-gray-100">
                    Mindful Nutrition Basics
                  </h4>
                  <p className="text-sm text-gray-400">
                    Learn how to fuel your body with mindful eating.
                  </p>
                </div>
              </div>
              <button className="px-3 py-2 bg-pink-500 rounded text-white hover:bg-pink-600">
                See More Articles
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('[DashboardPage] Unexpected Error:', error)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        Something went wrong. Please try again.
      </div>
    )
  }
}