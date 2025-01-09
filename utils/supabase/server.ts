// utils/supabase/server.ts

/**
 * This file creates a Supabase server client using @supabase/ssr.
 * In Next.js 15, the cookies() function is asynchronous, so we must await it.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * createClient() is marked 'async' so we can await cookies().
 * The calling code in a Server Component will also need to do `await createClient()`.
 */
export async function createClient() {
  try {
    // In Next.js 15, cookies() returns a Promise<ReadonlyRequestCookies>.
    // We await it to get the actual cookie store object.
    const cookieStore = await cookies()

    // Now cookieStore has .getAll(), .set(), etc.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          /**
           * getAll() is called by Supabase to read cookies from the incoming request.
           * We now have the real cookie store, so we can call cookieStore.getAll().
           */
          getAll() {
            return cookieStore.getAll()
          },
          /**
           * setAll() is called by Supabase to set cookies in the response.
           * In a Server Component context, this might be partially restricted by Next.js,
           * but for SSR usage (like route handlers or middleware), it's valid.
           */
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // Write cookies to the response
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              // Typically happens if this is invoked in a pure Server Component
              // where Next.js blocks direct response manipulation
              console.error('[Supabase - setAll] Error setting cookies:', error)
            }
          },
        },
      }
    )

    return supabase
  } catch (error) {
    // Log and re-throw so your calling code sees the error
    console.error('[createClient] Failed to initialize Supabase server client:', error)
    throw error
  }
}