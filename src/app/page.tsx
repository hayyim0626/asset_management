import { getUser, signOut } from "@/shared/api/auth/functions";
import { LandingPage } from "./entities/home/ui";

export default async function Home() {
  const { email, name, error } = await getUser();

  if (error || !name) {
    return <LandingPage />;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <p className="text-lg">안녕하세요, {email}님 👋</p>
      <button
        onClick={signOut}
        className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer"
      >
        로그아웃
      </button>
    </div>
  );
}
