// lib/supabaseServerClient.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export function createSupabaseServerClient() {
  console.log("[supabaseServerClient.ts] Creating server Supabase client...");
  return createServerComponentClient({ cookies });
}
