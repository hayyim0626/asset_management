"use server";

import { env } from "@/shared/config/env";
import { cookieUtils } from "../supabase/cookie";

export const signInWithOAuth = async (
  provider: "github" | "google",
  redirectTo?: string
) => {
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

  return { error: null };
};

export const refreshAccessToken = async () => {
  const { getRefreshToken, clearTokenCookies, setTokenCookies } =
    await cookieUtils();
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return { error: { message: "No refresh token" } };
  }

  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: env.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      }
    );

    if (!response.ok) {
      clearTokenCookies();
      return { error: { message: "Token refresh failed" } };
    }

    const data = await response.json();
    setTokenCookies(data.access_token, data.refresh_token, data.expires_in);

    return { error: null, data };
  } catch (error) {
    return { error: { message: "Network error" } };
  }
};

export const getUser = async () => {
  const { getAccessToken, getUserFromCookie } = await cookieUtils();
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: { message: "No access token" }, data: { user: null } };
  }
  return getUserFromCookie();
};
