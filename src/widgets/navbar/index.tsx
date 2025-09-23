import Image from "next/image";
import Link from "next/link";
import LoginStatus from "./loginStatus";
import { getUser } from "@/shared/api/auth/functions";

export async function Navbar() {
  const { name } = await getUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[52px]">
          <Link href="/" className="flex gap-2 items-center">
            <Image src={"/icon.png"} alt="logo" width={32} height={32} />
            <Image src={"/logo.png"} alt="logo" width={80} height={20} />
          </Link>
          <LoginStatus user={name} />
        </div>
      </div>
    </nav>
  );
}
