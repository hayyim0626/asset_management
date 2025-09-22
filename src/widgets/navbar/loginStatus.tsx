"use client";

import { useState } from "react";
import { GoogleLoginButton } from "@/features/auth/login/ui/googleLogin";
import { signOut } from "@/shared/api/auth/functions";
import { useMount } from "@/shared/hooks";
import { wait } from "@/shared/utils";

interface PropType {
  user: string;
}

export default function LoginStatus(props: PropType) {
  const { user } = props;
  const [isLoading, setIsLoading] = useState(true);

  useMount(async () => {
    await wait(300);
    setIsLoading(false);
  });

  return (
    <div className="flex items-center space-x-4">
      {isLoading ? (
        <div className="flex items-center space-x-4">
          <div className="w-20 h-6 bg-gray-300 rounded animate-pulse"></div>
        </div>
      ) : user ? (
        <button
          onClick={signOut}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
        >
          로그아웃
        </button>
      ) : (
        <GoogleLoginButton />
      )}
    </div>
  );
}
