import { NextRequest, NextResponse } from "next/server";
import { cookieUtils } from "@/shared/api/supabase/cookie";
import { env } from "@/shared/config/env";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, expiresIn } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: env.SUPABASE_ANON_KEY
      }
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();

    const { setTokenCookies, setUserCookie } = await cookieUtils();
    setTokenCookies(accessToken, refreshToken, expiresIn);
    setUserCookie(userData, expiresIn);

    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error("Token save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
