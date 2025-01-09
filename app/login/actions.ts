'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  console.log("Creating client for login:", supabase);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  //console.log("Login data:", data);

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    //console.error("Login error:", error);
    redirect('/error')
  }

  //console.log("Login successful");

  revalidatePath('/', 'layout')
  // console.log("Revalidating path '/'");
  // console.log("Redirecting to dashboard");
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  console.log("Creating client for signup:", supabase);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  //console.log("Signup data:", data);

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    //console.error("Signup error:", error);
    redirect('/error')
  }

  // console.log("Signup successful");

  revalidatePath('/', 'layout')
  // console.log("Revalidating path '/'");
  // console.log("Redirecting to home page");
  redirect('/')
}