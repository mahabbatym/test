import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

/**
 * Server Supabase client for Server Components, Server Actions, and Route Handlers.
 * Reads/writes auth cookies via Next.js `cookies()`.
 *
 * @example
 * import { createClient } from "@/lib/supabase/server";
 * const supabase = await createClient();
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — cookies are read-only.
          // Session refresh is handled by middleware `updateSession`.
        }
      },
    },
  });
}
