import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/shared/config/serverEnv";

export const createServiceRoleClient = () => {
  const serverEnv = getServerEnv();

  return createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};
