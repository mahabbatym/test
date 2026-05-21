import type { SupabaseClient } from "@supabase/supabase-js";

import { getLeaderboard } from "@/lib/db/leaderboard";
import { getUserGameHistory } from "@/lib/db/games";
import type { Database } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<Database, "public", any>;

type StreakKind = "win" | "loss" | "draw" | null;

export type DashboardSummary = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  activeGames: number;
  streak: {
    kind: StreakKind;
    count: number;
  };
  lastPlayedAt: string | null;
  favouriteColor: "white" | "black" | "mixed";
};

export type DashboardRecentMatch = {
  id: string;
  opponent: string;
  createdAt: string;
  result: "win" | "loss" | "draw";
  color: "white" | "black";
};

export type DashboardData = {
  profile: {
    displayName: string | null;
    eloRating: number;
    createdAt: string | null;
  };
  summary: DashboardSummary;
  recentMatches: DashboardRecentMatch[];
  rank: {
    position: number | null;
    eloRating: number | null;
  };
};

function computeStreak(
  games: Array<{ result: string | null; winner_id: string | null }>,
  userId: string,
): { kind: StreakKind; count: number } {
  let kind: StreakKind = null;
  let count = 0;

  for (const game of games) {
    const gameKind: StreakKind =
      game.result === "draw"
        ? "draw"
        : game.winner_id === userId
          ? "win"
          : game.winner_id
            ? "loss"
            : null;

    if (!gameKind) {
      break;
    }

    if (kind === null) {
      kind = gameKind;
      count = 1;
      continue;
    }

    if (gameKind === kind) {
      count += 1;
    } else {
      break;
    }
  }

  return { kind, count };
}

function resolveMatchResult(
  result: string | null,
  winnerId: string | null,
  userId: string,
): "win" | "loss" | "draw" {
  if (result === "draw") return "draw";
  if (!winnerId) return "draw";
  return winnerId === userId ? "win" : "loss";
}

export async function getDashboardData(
  supabase: Client,
  userId: string,
): Promise<DashboardData> {
  const profilePromise = supabase
    .from("profiles")
    .select("display_name, elo_rating, created_at")
    .eq("id", userId)
    .maybeSingle();

  const totalFinishedPromise = supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("status", "finished")
    .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`);

  const winsPromise = supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("status", "finished")
    .eq("winner_id", userId);

  const drawsPromise = supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("status", "finished")
    .eq("result", "draw")
    .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`);

  const activeGamesPromise = supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .in("status", ["active", "waiting"])
    .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`);

  const recentFinishedPromise = supabase
    .from("games")
    .select("result, winner_id")
    .eq("status", "finished")
    .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const recentMatchesPromise = getUserGameHistory(supabase, userId, 6);

  const leaderboardPromise = getLeaderboard(supabase, {
    currentUserId: userId,
    limit: 25,
  });

  const [
    { data: profile, error: profileError },
    totalFinishedResult,
    winsResult,
    drawsResult,
    activeResult,
    { data: recentFinishedData, error: recentFinishedError },
    recentMatches,
    leaderboard,
  ] = await Promise.all([
    profilePromise,
    totalFinishedPromise,
    winsPromise,
    drawsPromise,
    activeGamesPromise,
    recentFinishedPromise,
    recentMatchesPromise,
    leaderboardPromise,
  ]);

  if (profileError) throw profileError;
  if (recentFinishedError) throw recentFinishedError;

  const totalGames = totalFinishedResult.count ?? 0;
  const wins = winsResult.count ?? 0;
  const draws = drawsResult.count ?? 0;
  const activeGames = activeResult.count ?? 0;
  const losses = Math.max(totalGames - wins - draws, 0);
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const streak = computeStreak(recentFinishedData ?? [], userId);

  const recent = recentMatches.map((game) => ({
    id: game.id,
    opponent: game.opponent_name ?? "Opponent",
    createdAt: game.created_at,
    result: resolveMatchResult(game.result, game.winner_id, userId),
    color: game.user_color,
  } satisfies DashboardRecentMatch));

  const lastPlayedAt = recent[0]?.createdAt ?? null;

  const colourCounts = recentMatches.reduce(
    (acc, game) => {
      if (game.user_color === "white") acc.white += 1;
      else acc.black += 1;
      return acc;
    },
    { white: 0, black: 0 },
  );

  let favouriteColor: "white" | "black" | "mixed" = "mixed";
  if (colourCounts.white > colourCounts.black) favouriteColor = "white";
  else if (colourCounts.black > colourCounts.white) favouriteColor = "black";

  const profileData = profile ?? {
    display_name: null,
    elo_rating: 1200,
    created_at: null,
  };

  const summary: DashboardSummary = {
    totalGames,
    wins,
    losses,
    draws,
    winRate,
    activeGames,
    streak,
    lastPlayedAt,
    favouriteColor,
  };

  const currentPlayer = leaderboard.currentPlayer;
  const rank = {
    position: currentPlayer?.rank ?? null,
    eloRating: currentPlayer?.eloRating ?? profileData.elo_rating ?? null,
  };

  return {
    profile: {
      displayName: profileData.display_name,
      eloRating: profileData.elo_rating ?? 1200,
      createdAt: profileData.created_at ?? null,
    },
    summary,
    recentMatches: recent,
    rank,
  };
}
