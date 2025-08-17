"use client";

import { loginWithGoogle } from "@/features/auth/login/model/actions";

export function GoogleLoginButton() {
  const handleLogin = async () => {
    const url = await loginWithGoogle();
    console.log("받아온 url", url);
    if (url) window.location.href = url; // 실제 이동은 클라이언트에서
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Sign in with Google
    </button>
  );
}
