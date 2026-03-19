"use server";

import { cookieUtils } from "../supabase/cookie";

export const signOut = async () => {
  const { clearTokenCookies } = await cookieUtils();
  clearTokenCookies();

  return { success: true };
};

export const getUser = async () => {
  const { getAccessToken, getUserFromCookie } = await cookieUtils();
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: { message: "No access token" }, data: { user: null } };
  }
  return getUserFromCookie();
};
