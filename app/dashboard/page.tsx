// app/dashboard/page.tsx

/**
 * This DashboardPage is a Next.js Server Component. 
 * We fetch secure Supabase data here before rendering.
 */

import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'


// Make the component async because we need to await createClient() and any subsequent data fetching.
export default async function DashboardPage() {
  try {
    // 1) Await the creation of the Supabase client. 
    //    createClient() is async in Next.js 15 due to cookies() being async.
    const supabase = await createClient()

    // 2) Fetch the current session. 
    //    Now we can call supabase.auth.*, because supabase is no longer a Promise.
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('[DashboardPage] Error getting session:', sessionError)
    }

    // 3) If there's no session, optionally redirect to /login (the middleware should handle this too).
    // if (!session) {
    //   redirect('/login')
    // }

    // 4) Fetch profile data for the logged-in user.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, profile_picture')
      .eq('user_id', session?.user?.id)
      .single()

    if (profileError) {
      console.error('[DashboardPage] Error fetching profile:', profileError)
      return <div>Error loading profile.</div>
    }

    // 5) Render the UI with the fetched data.
    return (
      <section>
        <h1>Welcome, {profile?.first_name}!</h1>
        <Image
        src="/dashboard_image.png"
        alt="Dashboard Image"
        width={800}
        height={600}
        className="w-full h-auto"
      />
      </section>
    )
  } catch (error) {
    // Handle any unexpected errors in the server component
    console.error('[DashboardPage] Unexpected Error:', error)
    return <div>Something went wrong. Please try again.</div>
  }
}