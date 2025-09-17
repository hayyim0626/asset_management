"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleLoginButton } from "@/features/auth/login/ui/googleLogin";
import { signOut } from "@/shared/api/auth/functions";

export function Navbar() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserFromCookie = () => {
      const cookies = document.cookie.split(";");
      const userCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("sb-user=")
      );

      if (!userCookie) return null;

      try {
        const userJson = decodeURIComponent(userCookie.split("=")[1]);
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    };

    const userData = getUserFromCookie();
    setUser(userData);
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[52px]">
          <Link href="/" className="flex gap-2 items-center">
            <Image src={"/icon.png"} alt="logo" width={32} height={32} />
            <Image src={"/logo.png"} alt="logo" width={80} height={20} />
          </Link>
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <div className="w-20 h-6 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-black">
                  안녕하세요, {user.name}님
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <GoogleLoginButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
