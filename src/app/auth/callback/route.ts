import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/db/games";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/?auth=not-configured`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const displayName =
          (user.user_metadata?.display_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "Player";

        try {
          await ensureUserProfile(supabase, user.id, displayName);
        } catch {
          // Profile creation may fail if RLS blocks it — non-fatal
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
