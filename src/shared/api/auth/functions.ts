"use server";

import { env } from "@/shared/config/env";
import { redirect } from "next/navigation";
import { cookieUtils } from "../supabase/cookie";

export const signInWithOAuth = async (provider: "github" | "google", redirectTo?: string) => {
  const authUrl =
    `${env.SUPABASE_URL}/auth/v1/authorize?` +
    new URLSearchParams({
      provider,
      redirect_to: redirectTo || `${env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }).toString();

  return {
    error: null,
    data: { url: authUrl }
  };
};

export const signOut = async () => {
  const { getAccessToken, clearTokenCookies } = await cookieUtils();
  const accessToken = getAccessToken();

  if (accessToken) {
    try {
      await fetch(`${env.SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: env.SUPABASE_ANON_KEY
        }
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  }

  clearTokenCookies();
  redirect("/");
};

export const getUser = async () => {
  const { getAccessToken, getUserFromCookie } = await cookieUtils();
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: { message: "No access token" }, data: { user: null } };
  }
  return getUserFromCookie();
};
