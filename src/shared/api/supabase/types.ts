/* eslint-disable @typescript-eslint/no-explicit-any */
// types/supabase-auth.ts

export interface SupabaseIdentity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: Record<string, any>;
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface SupabaseUserMetadata {
  avatar_url?: string;
  email?: string;
  email_verified?: boolean;
  full_name?: string;
  iss?: string;
  name?: string;
  phone_verified?: boolean;
  picture?: string;
  provider_id?: string;
  sub?: string;
}

export interface SupabaseAppMetadata {
  provider?: string;
  providers?: string[];
}

export interface SupabaseUser {
  id: string;
  aud: string;
  role: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: SupabaseAppMetadata;
  user_metadata: SupabaseUserMetadata;
  identities?: SupabaseIdentity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}
