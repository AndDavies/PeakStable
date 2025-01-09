// utils/supabase/middleware.ts

/**
 * This file provides a function to update the session within a Next.js middleware.
 * By default, Next.js middleware runs in an Edge environment, but we can still
 * use @supabase/ssr with careful cookie handling below.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * updateSession() uses Supabase to check the user's auth state in the middleware layer.
 * - We read/write cookies from the request/response to maintain session.
 */
export async function updateSession(request: NextRequest) {
  // NextResponse.next() builds a response that continues the request flow.
  // We must pass the request object for correct cookie management.
  let supabaseResponse = NextResponse.next({ request })

  try {
    // This createServerClient is specialized for the Next.js "middleware" environment.
    // We do manual cookie operations to ensure everything is in sync.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Reading cookies from the request
          getAll() {
            return request.cookies.getAll()
          },
          // Writing cookies to the response
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Update the request cookies first
              request.cookies.set(name, value)
            })

            // Re-create the response to ensure it has the updated cookie state
            supabaseResponse = NextResponse.next({ request })

            // Write cookies to the response
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // IMPORTANT: Immediately after creating the supabase client, we call .auth.getUser()
    // without other logic that might break or confuse session handling.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // Log any potential error from Supabase (e.g., network issues)
    if (userError) {
      console.error('[Middleware - getUser] Supabase error:', userError)
    }

    // If user is not logged in and isn't accessing a public route (e.g., /login), redirect to /login
    if (!user && !request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // Generic catch-all for unexpected issues in the middleware
    console.error('[Middleware] Unexpected error in updateSession:', error)
  }

  // Return the response object with cookies updated by Supabase
  return supabaseResponse
}