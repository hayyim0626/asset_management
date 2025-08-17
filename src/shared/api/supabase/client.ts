import { createBrowserClient as libCreateBrowserClient } from "@supabase/ssr";
import { env } from "@/shared/config/env";

const createBrowserClient = () =>
  libCreateBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export { createBrowserClient };
