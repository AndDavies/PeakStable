// utils/supabase/client.ts

/**
 * This file creates a Supabase client for client-side (browser) usage.
 * It is used in 'use client' components to interact with Supabase directly.
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * createClient() returns a Supabase browser client:
 * - Automatically sends JWT access tokens in the header or uses cookies based on Supabase config.
 */
export function createClient() {
  try {
    // The createBrowserClient function does not need any custom cookie handling.
    // It's just a standard client that runs in the user's browser.
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    console.error('[Supabase Browser Client] Error initializing:', error)
    throw error
  }
}