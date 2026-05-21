import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

import { getSupabaseEnv, isSupabaseConfigured } from "./env";

const PROTECTED_PREFIXES = ["/play"];
const UNPROTECTED_ROUTES = ["/play/guest"];
const AUTH_PATHS = ["/login", "/signup"];

function isProtectedRoute(pathname: string) {
  if (UNPROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return false;
  }

  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthRoute(pathname: string) {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Creates a Supabase client bound to the incoming middleware request/response.
 */
export function createMiddlewareClient(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[],
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response, getResponse: () => response };
}

/**
 * Refreshes the auth session, protects /play, and redirects auth flows.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured()) {
    if (isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "auth-not-configured");
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  const { supabase, getResponse } = createMiddlewareClient(request);

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/play";
    return NextResponse.redirect(url);
  }

  return getResponse();
}
