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
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Sign in with Google
    </button>
  );
}
