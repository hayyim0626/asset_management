import { createServerClient as libCreateServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/shared/config/env";

export const createServerClient = async () => {
  const cookieStore = await cookies();

  return libCreateServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          console.error("CreateServerClient Error:");
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      }
    }
  });
};
