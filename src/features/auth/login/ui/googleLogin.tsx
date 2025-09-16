"use client";

import { signInWithOAuth } from "@/shared/api/auth/functions";

export function GoogleLoginButton() {
  const handleLogin = async () => {
    const { data } = await signInWithOAuth("google");

    if (data.url) window.location.href = data.url;
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
    >
      구글 로그인
    </button>
  );
}
