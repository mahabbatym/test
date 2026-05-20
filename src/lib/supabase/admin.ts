import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import {
  getSupabaseEnv,
  getSupabaseServiceRoleKey,
  isSupabaseConfigured,
} from "./env";

/**
 * Admin client with service role — bypasses RLS.
 * Server-only. Never import in Client Components.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { url } = getSupabaseEnv();

  return createSupabaseClient<Database>(url, getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
