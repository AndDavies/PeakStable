/**
 * utils/supabase/client.ts
 *
 * This file provides a Supabase client for **client-side** usage in React components.
 * 
 * 1. We import the standard `createClient` function from '@supabase/supabase-js',
 *    which is used in the browser (not the SSR-specific version).
 * 2. We export a named constant: `supabaseBrowserClient`.
 * 3. Wherever we need to query Supabase in a Client Component (like a drawer),
 *    we import `supabaseBrowserClient`.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * supabaseBrowserClient
 * 
 * A single shared client for the browser side. This means
 * any Next.js **Client Component** can import this.
 */
export const supabaseBrowserClient = createClient(
  // Supabase project URL
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Supabase public anon key
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)