import { cookies } from "next/headers";

export const cookieUtils = async () => {
  const cookieStore = await cookies();

  const getAccessToken = () => cookieStore.get("sb-access-token")?.value;
  const getRefreshToken = () => cookieStore.get("sb-refresh-token")?.value;

  const setTokenCookies = (
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ) => {
    cookieStore.set("sb-access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn || 3600,
      path: "/"
    });

    if (refreshToken) {
      cookieStore.set("sb-refresh-token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      });
    }
  };
  const clearTokenCookies = () => {
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");
    cookieStore.delete("sb-user");
  };

  const setUserCookie = (user: any, expiresIn?: number) => {
    cookieStore.set(
      "sb-user",
      JSON.stringify({ email: user.email, name: user.user_metadata.full_name }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: expiresIn || 3600,
        path: "/"
      }
    );
  };

  const getUserFromCookie = () => {
    const userCookie = cookieStore.get("sb-user")?.value;
    if (!userCookie) return null;

    try {
      return JSON.parse(userCookie);
    } catch {
      return null;
    }
  };

  return {
    getAccessToken,
    getRefreshToken,
    setTokenCookies,
    clearTokenCookies,
    setUserCookie,
    getUserFromCookie
  };
};
