"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthSession } from "@/shared/auth/sessionContext";

export default function AuthCallback() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("인증 정보를 확인하는 중...");
  const { setUser, syncUserFromCookie } = useAuthSession();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      const error = searchParams.get("error") || hashParams.get("error");
      if (error) {
        console.error("OAuth error:", error);
        toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
        router.replace("/");
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const expiresIn = hashParams.get("expires_in");

      if (accessToken) {
        try {
          setStatusMessage("세션을 저장하는 중...");
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

          const responseData = await response.json();
          setUser(responseData.user?.user_metadata?.full_name ?? null);
          syncUserFromCookie();
          setStatusMessage("대시보드로 이동하는 중...");
          router.replace("/");
        } catch (error) {
          console.error("토큰 저장 실패:", error);
          toast.error("로그인 처리 중 오류가 발생했습니다.");
          router.replace("/");
        }
      } else {
        console.error("No access token found");
        toast.error("로그인 토큰을 확인하지 못했습니다.");
        router.replace("/");
      }
    };

    handleAuthCallback();
  }, [router, setUser, syncUserFromCookie]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{statusMessage}</p>
      </div>
    </div>
  );
}
