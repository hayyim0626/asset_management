import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/shared/config/env";

const requireServerValue = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
};

export const createAuthenticatedSupabaseServerClient = (accessToken: string) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

export const createServiceRoleSupabaseClient = () => {
  const supabaseUrl = requireServerValue(
    "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceRoleKey = requireServerValue(
    "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};
