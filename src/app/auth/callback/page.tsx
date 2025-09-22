"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      const error = searchParams.get("error") || hashParams.get("error");
      if (error) {
        console.error("OAuth error:", error);
        router.replace("/login");
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const expiresIn = hashParams.get("expires_in");

      if (accessToken) {
        try {
          // API Route
          const response = await fetch("/api/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              accessToken,
              refreshToken,
              expiresIn: expiresIn ? parseInt(expiresIn) : 3600
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Token save failed");
          }

          window.location.href = "/";
        } catch (error) {
          console.error("토큰 저장 실패:", error);
          alert("로그인 처리 중 오류가 발생했습니다.");
          router.replace("/login?error=token_save_failed");
        }
      } else {
        console.error("No access token found");
        router.replace("/login?error=no_token");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
}
