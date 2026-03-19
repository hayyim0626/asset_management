"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { usePathname } from "next/navigation";

interface AuthSessionContextValue {
  user: string | null;
  setUser: (name: string | null) => void;
  syncUserFromCookie: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

const readUserNameFromCookie = () => {
  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("sb-user="));

  if (!cookieEntry) {
    return null;
  }

  const rawValue = cookieEntry.slice("sb-user=".length);

  try {
    const parsedValue = JSON.parse(decodeURIComponent(rawValue));
    return typeof parsedValue?.name === "string" ? parsedValue.name : null;
  } catch {
    return null;
  }
};

export function AuthSessionProvider({
  initialUser,
  children
}: {
  initialUser: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<string | null>(initialUser);

  const syncUserFromCookie = useCallback(() => {
    setUser(readUserNameFromCookie());
  }, []);

  useEffect(() => {
    syncUserFromCookie();
  }, [pathname, syncUserFromCookie]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      syncUserFromCookie
    }),
    [syncUserFromCookie, user]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return context;
};
