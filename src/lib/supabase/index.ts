/**
 * Supabase SSR utilities for Next.js App Router.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 *
 * Prefer path-specific imports (same `createClient` name, different modules):
 * - `@/lib/supabase/client`   — Client Components (browser)
 * - `@/lib/supabase/server`   — Server Components, Actions, Route Handlers
 * - `@/lib/supabase/admin`    — Service role (server-only)
 * - `@/lib/supabase/middleware` — `updateSession` for root middleware
 */

export { createClient } from "./client";
export { createAdminClient } from "./admin";
export {
  createMiddlewareClient,
  updateSession,
} from "./middleware";
export {
  getSupabaseAnonKey,
  getSupabaseEnv,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./env";
