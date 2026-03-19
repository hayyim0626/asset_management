"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { buildOAuthAuthorizeUrl } from "@/shared/api/auth/url";

export function GoogleLoginButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogin = () => {
    try {
      setIsPending(true);
      window.location.assign(buildOAuthAuthorizeUrl("google"));
    } catch {
      setIsPending(false);
      toast.error("로그인 준비 중 오류가 발생했습니다.");
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isPending}
      aria-busy={isPending}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500/70 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
    >
      {isPending ? "로그인 중..." : "구글 로그인"}
    </button>
  );
}
