import { createSupabaseClient } from './supabaseClient';
import { redirect } from 'next/navigation';

export async function getSession() {
  const supabase = await createSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[getSession] Error getting session:', error);
    return null;
  }

  if (!session) {
    redirect('/login');
    return null;
  }

  return session;
}