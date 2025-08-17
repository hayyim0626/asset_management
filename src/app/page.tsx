import { GoogleLoginButton } from "@/features/auth/login/ui/googleLogin";
import { logoutAction } from "@/features/auth/login/model/actions";
import { createServerClient } from "@/shared/api/supabase/server";

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  console.log("세션이당", session);

  if (!session) {
    // 로그인 안 된 상태 → 버튼 보여주기
    return (
      <div className="flex justify-center items-center h-screen">
        <GoogleLoginButton />
      </div>
    );
  }

  // 로그인 된 상태 → 유저 정보 + 로그아웃 버튼
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <p className="text-lg">안녕하세요, {session.user.email}님 👋</p>
      <form action={logoutAction}>
        <button className="px-4 py-2 bg-gray-700 text-white rounded">
          로그아웃
        </button>
      </form>
    </div>
  );
}
