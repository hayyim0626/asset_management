"use client";

import { loginWithGoogle } from "@/features/auth/login/model/actions";

export function GoogleLoginButton() {
  const handleLogin = async () => {
    const url = await loginWithGoogle();
    if (url) window.location.href = url;
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
