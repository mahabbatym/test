"use client";

import Link from "next/link";
import { BarChart3, Bot, Crown, Flame, Sparkles, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MotionPage } from "@/components/ui/motion-page";
import type { DashboardData } from "@/lib/db/dashboard";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";

type DashboardScreenProps = {
  data: DashboardData;
};

const intlDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const resultStyles = {
  win: "bg-emerald-500/10 text-emerald-500",
  loss: "bg-rose-500/10 text-rose-500",
  draw: "bg-amber-500/10 text-amber-500",
} as const;

export function DashboardScreen({ data }: DashboardScreenProps) {
  const { t } = useI18n();
  const { profile, summary, recentMatches, rank } = data;

  const favouriteColorLabel =
    summary.favouriteColor === "white"
      ? t("dashboard_color_white")
      : summary.favouriteColor === "black"
        ? t("dashboard_color_black")
        : t("dashboard_color_mixed");

  const streakLabel = summary.streak.count
    ? summary.streak.kind === "win"
      ? t("dashboard_streak_win").replace("{count}", String(summary.streak.count))
      : summary.streak.kind === "loss"
        ? t("dashboard_streak_loss").replace("{count}", String(summary.streak.count))
        : t("dashboard_streak_draw").replace("{count}", String(summary.streak.count))
    : t("dashboard_streak_none");

  const stats = [
    {
      label: t("dashboard_stat_games"),
      value: summary.totalGames.toString(),
      hint: t("dashboard_stat_games_hint")
        .replace("{wins}", String(summary.wins))
        .replace("{losses}", String(summary.losses))
        .replace("{draws}", String(summary.draws)),
    },
    {
      label: t("dashboard_stat_winrate"),
      value: `${summary.winRate}%`,
      hint: t("dashboard_stat_winrate_hint"),
    },
    {
      label: t("dashboard_stat_active"),
      value: summary.activeGames.toString(),
      hint: t("dashboard_stat_active_hint"),
    },
    {
      label: t("dashboard_stat_streak"),
      value: summary.streak.count ? `${summary.streak.count}×` : "—",
      hint: streakLabel,
      icon: <Flame className="size-4" />,
    },
    {
      label: t("dashboard_stat_favorite"),
      value: favouriteColorLabel,
      hint: t("dashboard_stat_favorite_hint"),
    },
    {
      label: t("dashboard_stat_last"),
      value: summary.lastPlayedAt
        ? intlDate.format(new Date(summary.lastPlayedAt))
        : t("dashboard_stat_last_empty"),
      hint: summary.lastPlayedAt ? t("dashboard_stat_last_hint") : "",
    },
  ];

  return (
    <MotionPage className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-cherry text-sm font-medium">{t("dashboard_tagline")}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {t("dashboard")}
            </h1>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
              {t("dashboard_subtitle")}
              <span className="text-muted ml-2 inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em]">
                <Sparkles className="size-3" />
                {profile.displayName ?? t("dashboard_stat_guest")}
              </span>
            </p>
          </div>
          <Link href="/play/guest">
            <Button className="gap-2">
              <Swords className="size-4" />
              {t("home_play_now")}
            </Button>
          </Link>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="border-border bg-card rounded-xl border p-4 shadow-sm"
            >
              <p className="text-muted text-xs font-medium uppercase tracking-wide">
                {stat.label}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {stat.icon ?? null}
                <span className="text-foreground text-2xl font-semibold">
                  {stat.value}
                </span>
              </div>
              {stat.hint ? (
                <p className="text-muted mt-2 text-xs leading-relaxed">
                  {stat.hint}
                </p>
              ) : null}
            </article>
          ))}
          <article className="border-cherry/30 bg-red-500/10 rounded-xl border p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-cherry">
              {t("dashboard_rank_title")}
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-cherry">
                {rank.position ? `#${rank.position}` : t("dashboard_rank_unknown")}
              </span>
              <span className="text-muted text-sm">
                {t("dashboard_rank_elo").replace("{elo}", String(rank.eloRating ?? "—"))}
              </span>
            </div>
            <p className="text-muted mt-2 text-xs leading-relaxed">
              {t("dashboard_rank_hint")}
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: t("dashboard_card_ai_title"),
              text: t("dashboard_card_ai_text"),
              icon: Bot,
              href: "/play/guest",
            },
            {
              title: t("dashboard_card_leaderboard_title"),
              text: t("dashboard_card_leaderboard_text"),
              icon: BarChart3,
              href: "/leaderboard",
            },
            {
              title: t("dashboard_card_store_title"),
              text: t("dashboard_card_store_text"),
              icon: Crown,
              href: "/store",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="border-border bg-card hover:border-red-500/30 rounded-xl border p-5 shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-cherry/10 text-cherry flex size-10 items-center justify-center rounded-xl">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-lg font-semibold tracking-tight">
                      {item.title}
                    </h2>
                    <p className="text-muted mt-1 text-sm leading-6">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="border-border bg-card mt-8 overflow-hidden rounded-xl border shadow-sm">
          <div className="border-border flex items-center justify-between border-b px-4 py-4">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              {t("dashboard_recent_heading")}
            </h2>
            <span className="text-muted text-sm">
              {recentMatches.length} {t("dashboard_recent_count")}
            </span>
          </div>

          {recentMatches.length > 0 ? (
            <div className="divide-border divide-y">
              {recentMatches.map((match) => (
                <article
                  key={match.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                        resultStyles[match.result],
                      )}
                    >
                      {t(`dashboard_result_${match.result}`)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        {match.opponent}
                      </p>
                      <p className="text-muted text-xs">
                        {t("dashboard_recent_color")}
                        {": "}
                        {match.color === "white"
                          ? t("dashboard_color_white")
                          : t("dashboard_color_black")}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted text-xs">
                    {intlDate.format(new Date(match.createdAt))}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted">
              {t("dashboard_recent_empty")}
            </div>
          )}
        </section>
      </div>
    </MotionPage>
  );
}
