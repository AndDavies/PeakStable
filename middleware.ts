// middleware.ts

/**
 * This root middleware is used by Next.js to guard routes.
 * It calls our custom updateSession() from utils/supabase/middleware.ts.
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// The main middleware function is invoked on each request that matches the "matcher" routes below.
export async function middleware(request: NextRequest) {
  try {
    // We pass the request object to updateSession to refresh or verify the user's session.
    return await updateSession(request)
  } catch (error) {
    // If something unexpected happens, we log it here.
    console.error('[Root Middleware] Error:', error)
    // Fallback: Continue the request instead of crashing the site.
    return new Response('An unexpected error occurred in middleware.', { status: 500 })
  }
}

/**
 * Configuration object that determines which routes the middleware should protect.
 * In this example, all routes under /dashboard require authentication.
 * Public pages (like homepage, blog, etc.) remain unprotected.
 */
export const config = {
  matcher: ['/dashboard/:path*'],
}