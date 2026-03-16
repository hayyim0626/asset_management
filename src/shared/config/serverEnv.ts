import "server-only";

interface ServerEnv {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  CRON_SECRET: string;
}

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
};

let cachedServerEnv: ServerEnv | null = null;

export const getServerEnv = (): ServerEnv => {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = {
    SUPABASE_URL: requireEnv(
      "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    SUPABASE_SECRET_KEY: requireEnv(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    CRON_SECRET: requireEnv("CRON_SECRET", process.env.CRON_SECRET)
  };

  return cachedServerEnv;
};
