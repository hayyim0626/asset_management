"use server";

import { createServerClient } from "@/shared/api/supabase/server"; // 방금 만든 util
import { redirect } from "next/navigation";
import { env } from "@/shared/config/env";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Login error:", error.message);
    throw new Error("로그인 실패");
  }

  redirect("/");
}

export async function loginWithGoogle() {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  });

  if (error) {
    console.error("Google login error:", error.message);
    throw new Error("Google 로그인 실패");
  }

  // 이 경우 data.url 로 구글 로그인 페이지가 반환됨
  return data.url;
}

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
