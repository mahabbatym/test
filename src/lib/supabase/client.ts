import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

/**
 * Browser Supabase client for Client Components.
 * Uses a singleton — safe to call `createClient()` multiple times.
 *
 * @example
 * import { createClient } from "@/lib/supabase/client";
 * const supabase = createClient();
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient<Database>(url, anonKey);
}
