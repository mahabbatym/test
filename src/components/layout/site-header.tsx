import { CherryLogo } from "@/components/auth/cherry-logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <CherryLogo href="/" size="sm" variant="inline" />
        <nav className="text-muted flex items-center gap-4 text-sm">
          <span
            className={
              isSupabaseConfigured()
                ? "text-emerald-600 dark:text-emerald-400"
                : undefined
            }
          >
            Supabase {isSupabaseConfigured() ? "ready" : "not configured"}
          </span>
        </nav>
      </div>
    </header>
  );
}
