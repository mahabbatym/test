import type { Metadata } from "next";
import { Crown, Medal, Trophy } from "lucide-react";

import { MotionPage } from "@/components/ui/motion-page";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/db/leaderboard";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

import { LeaderboardCityFilter } from "./leaderboard-city-filter";

export const metadata: Metadata = {
  title: "Leaderboard",
};

type LeaderboardPageProps = {
  searchParams?: Promise<{
    city?: string | string[];
  }>;
};

const podiumAccents = [
  {
    label: "1",
    icon: Crown,
    className: "border-amber-400/70 bg-amber-500/5",
    badge: "bg-amber-400 text-neutral-950",
  },
  {
    label: "2",
    icon: Trophy,
    className: "border-zinc-300 bg-zinc-500/5 dark:border-zinc-500",
    badge: "bg-zinc-200 text-neutral-950 dark:bg-zinc-300",
  },
  {
    label: "3",
    icon: Medal,
    className: "border-orange-400/60 bg-orange-500/5",
    badge: "bg-orange-300 text-neutral-950",
  },
] as const;

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getInitials(username: string) {
  return username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PlayerAvatar({ username, rank }: { username: string; rank: number }) {
  return (
    <div className="bg-cherry/10 text-cherry flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
      {rank <= 3 ? rank : getInitials(username)}
    </div>
  );
}

function PodiumCard({
  entry,
  podiumIndex,
}: {
  entry: LeaderboardEntry;
  podiumIndex: number;
}) {
  const accent = podiumAccents[podiumIndex];
  const Icon = accent.icon;

  return (
    <article
      className={cn(
        "border-border bg-card rounded-lg border p-5 shadow-sm",
        accent.className,
        entry.isCurrentUser && "bg-red-500/10 ring-cherry/30 ring-1",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlayerAvatar username={entry.username} rank={entry.rank} />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight">
              {entry.username}
            </h2>
            <p className="text-muted mt-0.5 text-sm">
              {entry.city ?? "Қала көрсетілмеген"}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            accent.badge,
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            ELO
          </p>
          <p className="text-3xl font-semibold tracking-tight">
            {entry.eloRating}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            W / L
          </p>
          <p className="text-sm font-semibold">
            {entry.wins} / {entry.losses}
          </p>
        </div>
      </div>
    </article>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <tr
      className={cn(
        "border-border border-b transition-colors last:border-0",
        entry.isCurrentUser ? "bg-red-500/10" : "hover:bg-foreground/[0.03]",
      )}
    >
      <td className="w-20 px-4 py-4 text-sm font-semibold">#{entry.rank}</td>
      <td className="px-4 py-4">
        <div className="flex min-w-48 items-center gap-3">
          <PlayerAvatar username={entry.username} rank={entry.rank} />
          <span className="truncate text-sm font-medium">{entry.username}</span>
        </div>
      </td>
      <td className="text-muted px-4 py-4 text-sm">
        {entry.city ?? "Қала көрсетілмеген"}
      </td>
      <td className="px-4 py-4 text-sm font-medium">
        {entry.wins} / {entry.losses}
      </td>
      <td className="text-cherry px-4 py-4 text-right text-sm font-semibold">
        {entry.eloRating}
      </td>
    </tr>
  );
}

function CurrentRankCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <section className="border-cherry/30 bg-red-500/10 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlayerAvatar username={entry.username} rank={entry.rank} />
          <div>
            <p className="text-sm font-semibold">{entry.username}</p>
            <p className="text-muted text-sm">
              #{entry.rank} · {entry.city ?? "Қала көрсетілмеген"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            Your ELO
          </p>
          <p className="text-cherry text-xl font-semibold">
            {entry.eloRating}
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const params = await searchParams;
  const selectedCity = getParam(params?.city) ?? null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const leaderboard = await getLeaderboard(supabase, {
    city: selectedCity,
    currentUserId: user?.id,
  });

  const podium = leaderboard.entries.slice(0, 3);
  const tableRows = leaderboard.entries.slice(3);
  const currentPlayer = leaderboard.currentPlayer;
  const currentPlayerOutsideList =
    currentPlayer &&
    !leaderboard.entries.some((entry) => entry.id === currentPlayer.id);

  return (
    <MotionPage className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-cherry text-sm font-medium">
              {leaderboard.scope === "city"
                ? "Қалалар бойынша рейтинг"
                : "Бүкіл әлемдік рейтинг"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Leaderboard
            </h1>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
              Top Cherry Chess players ranked by live ELO.
            </p>
          </div>

          <LeaderboardCityFilter
            cities={leaderboard.cityOptions}
            selectedCity={leaderboard.selectedCity}
          />
        </section>

        {podium.length > 0 ? (
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {podium.map((entry, index) => (
              <PodiumCard key={entry.id} entry={entry} podiumIndex={index} />
            ))}
          </section>
        ) : null}

        {currentPlayerOutsideList && currentPlayer ? (
          <div className="mt-6">
            <CurrentRankCard entry={currentPlayer} />
          </div>
        ) : null}

        <section className="border-border bg-card mt-6 overflow-hidden rounded-lg border shadow-sm">
          <div className="border-border flex items-center justify-between border-b px-4 py-4">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              Rankings
            </h2>
            <span className="text-muted text-sm">
              {leaderboard.entries.length} players
            </span>
          </div>

          {leaderboard.entries.length > 3 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-border bg-foreground/[0.02] border-b text-left text-xs font-medium tracking-wide text-muted uppercase">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Wins / Losses</th>
                    <th className="px-4 py-3 text-right">ELO</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((entry) => (
                    <LeaderboardRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-muted text-sm">
                Rankings will appear as more players join this scope.
              </p>
            </div>
          )}
        </section>
      </div>
    </MotionPage>
  );
}
