"use client";

import {
  BarChart3,
  Crown,
  LayoutDashboard,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CherryLogo } from "@/components/auth/cherry-logo";
import { FeedbackWidget } from "@/components/layout/feedback-widget";
import { Button } from "@/components/ui/button";
import { locales } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { useTheme } from "@/providers/theme-provider";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/leaderboard", label: t("leaderboard"), icon: BarChart3 },
    { href: "/profile", label: t("profile"), icon: UserCircle },
    { href: "/store", label: t("store"), icon: Crown },
  ];

  return (
    <div className="bg-background min-h-screen text-foreground">
      <aside className="border-border bg-card/88 fixed inset-y-0 left-0 z-40 hidden w-64 border-r px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <CherryLogo href="/" size="md" variant="inline" />

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname.startsWith("/play"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted hover:text-foreground hover:bg-foreground/5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active &&
                    "border border-red-500/20 bg-red-500/10 text-cherry shadow-sm",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="border-border rounded-xl border p-2">
            <label className="text-muted px-2 text-xs font-medium">
              {t("language")}
            </label>
            <select
              value={locale}
              onChange={(event) =>
                setLocale(event.target.value as typeof locale)
              }
              className="bg-background text-foreground mt-1 w-full rounded-lg border border-transparent px-2 py-2 text-sm"
            >
              {locales.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-2"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {t("theme")}
          </Button>
          <FeedbackWidget />
        </div>
      </aside>

      <header className="border-border bg-card/88 sticky top-0 z-30 border-b backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <CherryLogo href="/" size="sm" variant="inline" />
          <div className="flex items-center gap-2">
            <select
              aria-label={t("language")}
              value={locale}
              onChange={(event) =>
                setLocale(event.target.value as typeof locale)
              }
              className="border-border bg-background rounded-lg border px-2 py-1.5 text-xs"
            >
              {locales.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code.toUpperCase()}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="size-9 p-0"
              aria-label={t("theme")}
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname.startsWith("/play"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                  active && "bg-red-500/10 text-cherry",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
