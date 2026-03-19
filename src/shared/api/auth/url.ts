export const buildOAuthAuthorizeUrl = (
  provider: "github" | "google",
  redirectTo?: string
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }

  const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : null;
  const callbackBaseUrl = appUrl || fallbackOrigin;

  if (!redirectTo && !callbackBaseUrl) {
    throw new Error("OAuth callback URL is not configured");
  }

  const callbackUrl = redirectTo || `${callbackBaseUrl}/auth/callback`;
  const authUrl = new URL("/auth/v1/authorize", supabaseUrl);

  authUrl.search = new URLSearchParams({
    provider,
    redirect_to: callbackUrl
  }).toString();

  return authUrl.toString();
};
