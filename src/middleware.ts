import { NextRequest, NextResponse } from "next/server";
import { env } from "@/shared/config/env";

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/auth/callback") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("sb-access-token")?.value;
  const refreshToken = request.cookies.get("sb-refresh-token")?.value;

  if (!accessToken) {
    console.log(
      "어머나 accessToken이 없어졌네요? 현재 라우트: ",
      request.nextUrl.pathname
    );

    if (!refreshToken) {
      if (request.nextUrl.pathname === "/") {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return await handleTokenRefresh(request, refreshToken);
  }

  if (isTokenExpired(accessToken)) {
    console.log("토큰이 만료되어 refreshToken으로 다시 교체를 진행합니다.");
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return await handleTokenRefresh(request, refreshToken);
  }

  return NextResponse.next();
}

async function handleTokenRefresh(request: NextRequest, refreshToken: string) {
  console.log("Token Refresh 함수가 실행되었습니다.");
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: env.SUPABASE_ANON_KEY!
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      }
    );

    if (!response.ok) {
      const loginResponse = NextResponse.redirect(
        new URL("/login", request.url)
      );
      loginResponse.cookies.delete("sb-access-token");
      loginResponse.cookies.delete("sb-refresh-token");
      loginResponse.cookies.delete("sb-user");
      return loginResponse;
    }

    const data = await response.json();

    console.log(data);

    const nextResponse = NextResponse.next();
    nextResponse.cookies.set("sb-access-token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.expires_in || 3600,
      path: "/"
    });

    if (data.refresh_token) {
      nextResponse.cookies.set("sb-refresh-token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      });
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

function isTokenExpired(token: string): boolean {
  try {
    // JWT 디코딩 (jose 라이브러리 사용 권장)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // 디코딩 실패 시 만료된 것으로 간주
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
