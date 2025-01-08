"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  console.log("Creating client:", supabase);

  const firstName = formData.get("firstName") as string;
  const lastName = (formData.get("lastName") as string) || "";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Form data received:", { firstName, lastName, email, password });

  if (!firstName || !email || !password) {
    console.error("Missing required fields");
    return redirect("/error");
  }

  // 1) Create the user
  console.log("Attempting to sign up user with email:", email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });

  if (signUpError || !signUpData?.user) {
    console.error("Sign up error:", signUpError);
    return redirect("/error");
  }

  console.log("User signed up successfully:", signUpData.user);

  // 2) Insert into 'profiles' table
  console.log("Inserting profile data for user:", signUpData.user.id);
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: signUpData.user.id,
      first_name: firstName,
      last_name: lastName,
      email
    });

  if (profileError) {
    console.error("Profile insertion error:", profileError);
    return redirect("/error");
  }

  console.log("Profile inserted successfully");

  // 3) If success, revalidate the page and redirect
  console.log("Revalidating path /signup");
  revalidatePath("/signup");
  console.log("Redirecting to success page");
  return redirect("/signup/success");
}