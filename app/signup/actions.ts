"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("firstName") as string;
  const lastName = (formData.get("lastName") as string) || "";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !email || !password) {
    return redirect("/error");
  }

  // 1) Create the user
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
    return redirect("/error");
  }

  // 2) Insert into 'profiles' table
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: signUpData.user.id,
      first_name: firstName,
      last_name: lastName,
      email
    });

  if (profileError) {
    return redirect("/error");
  }

  // 3) If success, revalidate the page and redirect
  revalidatePath("/signup");
  return redirect("/signup/success");
}
