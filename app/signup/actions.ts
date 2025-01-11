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
  const defaultRole = "member";
  const testGymId = "f5731c57-4206-43a7-bce1-583f2a72238e"; // For testing purposes

  console.log("Inserting profile data for user:", signUpData.user.id);
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: signUpData.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      role: defaultRole,
      current_gym_id: testGymId // For testing purposes, remove this later
    });

  if (profileError) {
    console.error("Profile insertion error:", profileError);
    return redirect("/error");
  }

  console.log("Profile inserted successfully");

  // 3) Create default track for the user
const trackName = `${firstName}'s Personal Track`;
console.log("Creating default track for user:", signUpData.user.id);
const { error: trackError } = await supabase
.from("tracks")
.insert({

name: trackName,
description: "Default personal track",
is_public: false,
user_id: signUpData.user.id,
created_at: new Date().toISOString(),
gym_id: null // Assuming gym_id is optional and can be null
});

if (trackError) {
console.error("Track creation error:", trackError);
return redirect("/error");
}

  // 4) If success, revalidate the page and redirect
  console.log("Revalidating path /signup");
  revalidatePath("/signup");
  console.log("Redirecting to success page");
  return redirect("/signup/success");
}