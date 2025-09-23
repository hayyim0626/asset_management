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
          <div className="w-20 h-6 bg-slate-700 rounded animate-pulse"></div>
        </div>
      ) : user ? (
        <div className="flex items-center gap-4 text-sm text-slate-300 font-medium">
          <p>
            안녕하세요, <span className="text-white font-semibold">{user}</span>
            님
          </p>
          <button
            onClick={signOut}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <GoogleLoginButton />
      )}
    </div>
  );
}
