import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-only Supabase client. The session lives in localStorage, so this
 * must never be used during SSR — call it from effects, event handlers or
 * TanStack Query functions (which only run in the browser here).
 */
let client: SupabaseClient | null = null;

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getSupabase() was called during SSR. Use it only in the browser.");
  }
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase isn't configured. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        // /auth/callback exchanges the code explicitly.
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** Base URL used in magic-link emails. Falls back to the current origin. */
export function siteUrl() {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  return (configured || window.location.origin).replace(/\/$/, "");
}
