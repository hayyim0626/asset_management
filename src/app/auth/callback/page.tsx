"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/shared/api/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();

    // Supabase가 리다이렉트 후 쿠키를 갱신하도록 trigger
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("로그인 성공:", session.user);
      } else {
        console.log("세션 없음, 로그인 실패");
      }
      router.replace("/"); // 홈으로 이동
    });
  }, [router]);

  return <p>로그인 처리 중...</p>;
}
