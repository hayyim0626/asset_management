"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GoogleLoginButton } from "@/features/auth/login/ui/googleLogin";
import { signOut } from "@/shared/api/auth/functions";
import { useAuthSession } from "@/shared/auth/sessionContext";

interface PropType {
  user: string | null;
}

export default function LoginStatus(props: PropType) {
  const { user } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setUser } = useAuthSession();

  const handleSignOut = () => {
    setUser(null);
    startTransition(async () => {
      try {
        await signOut();
        router.replace("/");
        router.refresh();
      } catch {
        setUser(user);
        toast.error("로그아웃 처리 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <div className="flex items-center gap-4 text-sm text-slate-300 font-medium">
          <p>
            안녕하세요, <span className="text-white font-semibold">{user}</span>님
          </p>
          <button
            onClick={handleSignOut}
            disabled={isPending}
            aria-busy={isPending}
            className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/70 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            {isPending ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      ) : (
        <GoogleLoginButton />
      )}
    </div>
  );
}
