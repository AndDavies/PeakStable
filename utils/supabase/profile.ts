import { createSupabaseClient } from './supabaseClient';

export async function getProfile(userId: string) {
  const supabase = await createSupabaseClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, profile_picture, current_gym_id, role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[getProfile] Error fetching profile:', error);
    return null;
  }

  return profile;
}

export async function getProfileWithRoleAndGym(userId: string) {
  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role, current_gym_id')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    console.error('[getProfileWithRoleAndGym] error:', error)
    return null
  }
  return data
}