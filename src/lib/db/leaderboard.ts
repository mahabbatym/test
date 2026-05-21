import type { SupabaseClient } from "@supabase/supabase-js";

import { BOT_PLAYER_ID } from "@/lib/db/constants";
import type { Database, Game, Profile } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<Database, "public", any>;

type LeaderboardProfile = Pick<
  Profile,
  "id" | "display_name" | "city" | "elo_rating" | "created_at"
>;

type FinishedGameForStats = Pick<
  Game,
  "id" | "white_player_id" | "black_player_id" | "winner_id" | "result"
>;

export type LeaderboardScope = "global" | "city";

export type LeaderboardEntry = {
  id: string;
  rank: number;
  username: string;
  city: string | null;
  eloRating: number;
  wins: number;
  losses: number;
  isCurrentUser: boolean;
  isSample: boolean;
};

export type LeaderboardData = {
  scope: LeaderboardScope;
  selectedCity: string | null;
  cityOptions: string[];
  entries: LeaderboardEntry[];
  currentPlayer: LeaderboardEntry | null;
  hasSampleEntries: boolean;
};

export type GetLeaderboardOptions = {
  city?: string | null;
  currentUserId?: string | null;
  limit?: number;
};

type PlayerStats = {
  wins: number;
  losses: number;
};

const DEFAULT_LIMIT = 50;
const DEFAULT_CITY_OPTIONS = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Қарағанды",
  "Ақтөбе",
  "Тараз",
];
const MISSING_COLUMN_CODE = "42703";

const SAMPLE_LEADERBOARD: Array<
  Pick<LeaderboardEntry, "id" | "username" | "city" | "eloRating" | "wins" | "losses">
> = [
  {
    id: "demo-aurora",
    username: "Aurora Serik",
    city: "Алматы",
    eloRating: 2120,
    wins: 48,
    losses: 12,
  },
  {
    id: "demo-mura",
    username: "Murat Han",
    city: "Астана",
    eloRating: 2055,
    wins: 36,
    losses: 9,
  },
  {
    id: "demo-jade",
    username: "Jade Kim",
    city: "Сеул",
    eloRating: 1990,
    wins: 31,
    losses: 11,
  },
  {
    id: "demo-roman",
    username: "Roman Petrov",
    city: "Москва",
    eloRating: 1920,
    wins: 28,
    losses: 14,
  },
  {
    id: "demo-ayan",
    username: "Ayan K.",
    city: "Шымкент",
    eloRating: 1885,
    wins: 25,
    losses: 15,
  },
  {
    id: "demo-samira",
    username: "Samira Noor",
    city: "Алматы",
    eloRating: 1860,
    wins: 22,
    losses: 13,
  },
];

function normalizeCity(city?: string | null) {
  const value = city?.trim();
  return value ? value : null;
}

function getDisplayName(profile: LeaderboardProfile) {
  return profile.display_name?.trim() || `Player ${profile.id.slice(0, 6)}`;
}

function isMissingColumnError(error: { code?: string } | null) {
  return error?.code === MISSING_COLUMN_CODE;
}

function withProfileDefaults(
  profile: Partial<LeaderboardProfile> &
    Pick<LeaderboardProfile, "id" | "elo_rating" | "created_at">,
): LeaderboardProfile {
  return {
    id: profile.id,
    display_name: profile.display_name ?? null,
    city: profile.city ?? null,
    elo_rating: profile.elo_rating,
    created_at: profile.created_at,
  };
}

function createEmptyStats(playerIds: string[]) {
  return new Map<string, PlayerStats>(
    playerIds.map((playerId) => [playerId, { wins: 0, losses: 0 }]),
  );
}

async function getPlayerStats(
  supabase: Client,
  playerIds: string[],
): Promise<Map<string, PlayerStats>> {
  const stats = createEmptyStats(playerIds);

  if (playerIds.length === 0) {
    return stats;
  }

  const idList = playerIds.join(",");
  const { data, error } = await supabase
    .from("games")
    .select("id, white_player_id, black_player_id, winner_id, result")
    .eq("status", "finished")
    .or(`white_player_id.in.(${idList}),black_player_id.in.(${idList})`);

  if (error) throw error;

  const seenGames = new Set<string>();

  for (const game of (data ?? []) as FinishedGameForStats[]) {
    if (seenGames.has(game.id)) continue;
    seenGames.add(game.id);

    for (const playerId of playerIds) {
      const playedGame =
        game.white_player_id === playerId || game.black_player_id === playerId;

      if (!playedGame || !game.winner_id || game.result === "draw") {
        continue;
      }

      const playerStats = stats.get(playerId);
      if (!playerStats) continue;

      if (game.winner_id === playerId) {
        playerStats.wins += 1;
      } else {
        playerStats.losses += 1;
      }
    }
  }

  return stats;
}

function buildEntry(
  profile: LeaderboardProfile,
  rank: number,
  stats: PlayerStats | undefined,
  currentUserId?: string | null,
): LeaderboardEntry {
  return {
    id: profile.id,
    rank,
    username: getDisplayName(profile),
    city: profile.city,
    eloRating: profile.elo_rating,
    wins: stats?.wins ?? 0,
    losses: stats?.losses ?? 0,
    isCurrentUser: profile.id === currentUserId,
    isSample: false,
  };
}

async function getCityOptions(supabase: Client) {
  const { data, error } = await supabase
    .from("profiles")
    .select("city")
    .neq("id", BOT_PLAYER_ID)
    .not("city", "is", null)
    .order("city", { ascending: true });

  if (isMissingColumnError(error)) {
    return DEFAULT_CITY_OPTIONS;
  }

  if (error) throw error;

  return Array.from(
    new Set(
      [
        ...DEFAULT_CITY_OPTIONS,
        ...(data ?? [])
        .map((row) => row.city?.trim())
        .filter((city): city is string => Boolean(city)),
      ],
    ),
  );
}

async function getTopProfiles(
  supabase: Client,
  selectedCity: string | null,
  limit: number,
) {
  let fullQuery = supabase
    .from("profiles")
    .select("id, display_name, city, elo_rating, created_at")
    .neq("id", BOT_PLAYER_ID)
    .order("elo_rating", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (selectedCity) {
    fullQuery = fullQuery.eq("city", selectedCity);
  }

  const fullResult = await fullQuery;
  if (!fullResult.error) {
    return {
      profiles: (fullResult.data ?? []) as LeaderboardProfile[],
      supportsCity: true,
    };
  }
  if (!isMissingColumnError(fullResult.error)) throw fullResult.error;

  let withoutDisplayNameQuery = supabase
    .from("profiles")
    .select("id, city, elo_rating, created_at")
    .neq("id", BOT_PLAYER_ID)
    .order("elo_rating", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (selectedCity) {
    withoutDisplayNameQuery = withoutDisplayNameQuery.eq("city", selectedCity);
  }

  const withoutDisplayNameResult = await withoutDisplayNameQuery;
  if (!withoutDisplayNameResult.error) {
    return {
      profiles: (withoutDisplayNameResult.data ?? []).map(withProfileDefaults),
      supportsCity: true,
    };
  }
  if (!isMissingColumnError(withoutDisplayNameResult.error)) {
    throw withoutDisplayNameResult.error;
  }

  if (selectedCity) {
    return { profiles: [], supportsCity: false };
  }

  const withoutCityResult = await supabase
    .from("profiles")
    .select("id, display_name, elo_rating, created_at")
    .neq("id", BOT_PLAYER_ID)
    .order("elo_rating", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (!withoutCityResult.error) {
    return {
      profiles: (withoutCityResult.data ?? []).map(withProfileDefaults),
      supportsCity: false,
    };
  }
  if (!isMissingColumnError(withoutCityResult.error)) {
    throw withoutCityResult.error;
  }

  const minimalResult = await supabase
    .from("profiles")
    .select("id, elo_rating, created_at")
    .neq("id", BOT_PLAYER_ID)
    .order("elo_rating", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (minimalResult.error) throw minimalResult.error;

  return {
    profiles: (minimalResult.data ?? []).map(withProfileDefaults),
    supportsCity: false,
  };
}

async function getCurrentProfile(
  supabase: Client,
  currentUserId: string | null,
) {
  if (!currentUserId) return null;

  const fullResult = await supabase
    .from("profiles")
    .select("id, display_name, city, elo_rating, created_at")
    .eq("id", currentUserId)
    .maybeSingle();

  if (!fullResult.error) {
    return fullResult.data as LeaderboardProfile | null;
  }
  if (!isMissingColumnError(fullResult.error)) throw fullResult.error;

  const withoutDisplayNameResult = await supabase
    .from("profiles")
    .select("id, city, elo_rating, created_at")
    .eq("id", currentUserId)
    .maybeSingle();

  if (!withoutDisplayNameResult.error) {
    return withoutDisplayNameResult.data
      ? withProfileDefaults(withoutDisplayNameResult.data)
      : null;
  }
  if (!isMissingColumnError(withoutDisplayNameResult.error)) {
    throw withoutDisplayNameResult.error;
  }

  const withoutCityResult = await supabase
    .from("profiles")
    .select("id, display_name, elo_rating, created_at")
    .eq("id", currentUserId)
    .maybeSingle();

  if (!withoutCityResult.error) {
    return withoutCityResult.data
      ? withProfileDefaults(withoutCityResult.data)
      : null;
  }
  if (!isMissingColumnError(withoutCityResult.error)) {
    throw withoutCityResult.error;
  }

  const minimalResult = await supabase
    .from("profiles")
    .select("id, elo_rating, created_at")
    .eq("id", currentUserId)
    .maybeSingle();

  if (minimalResult.error) throw minimalResult.error;

  return minimalResult.data ? withProfileDefaults(minimalResult.data) : null;
}

async function getCurrentPlayerRank(
  supabase: Client,
  profile: LeaderboardProfile,
  selectedCity: string | null,
) {
  let higherRatedQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .neq("id", BOT_PLAYER_ID)
    .gt("elo_rating", profile.elo_rating);

  let earlierTieQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .neq("id", BOT_PLAYER_ID)
    .eq("elo_rating", profile.elo_rating)
    .lt("created_at", profile.created_at);

  if (selectedCity) {
    higherRatedQuery = higherRatedQuery.eq("city", selectedCity);
    earlierTieQuery = earlierTieQuery.eq("city", selectedCity);
  }

  const [higherRated, earlierTies] = await Promise.all([
    higherRatedQuery,
    earlierTieQuery,
  ]);

  if (higherRated.error) throw higherRated.error;
  if (earlierTies.error) throw earlierTies.error;

  return (higherRated.count ?? 0) + (earlierTies.count ?? 0) + 1;
}

export async function getLeaderboard(
  supabase: Client,
  options: GetLeaderboardOptions = {},
): Promise<LeaderboardData> {
  const selectedCity = normalizeCity(options.city);
  const limit = options.limit ?? DEFAULT_LIMIT;
  const currentUserId = options.currentUserId ?? null;

  const [profilesResult, cityOptions, currentProfile] = await Promise.all([
    getTopProfiles(supabase, selectedCity, limit),
    getCityOptions(supabase),
    getCurrentProfile(supabase, currentUserId),
  ]);

  const profiles = profilesResult.profiles;
  const currentProfileMatchesScope =
    currentProfile &&
    currentProfile.id !== BOT_PLAYER_ID &&
    (!selectedCity ||
      (profilesResult.supportsCity && currentProfile.city === selectedCity));

  const currentProfileAlreadyVisible = profiles.some(
    (profile) => profile.id === currentProfile?.id,
  );
  const statsIds = Array.from(
    new Set(
      [
        ...profiles.map((profile) => profile.id),
        currentProfileMatchesScope && !currentProfileAlreadyVisible
          ? currentProfile.id
          : null,
      ].filter((playerId): playerId is string => Boolean(playerId)),
    ),
  );

  const [stats, currentRank] = await Promise.all([
    getPlayerStats(supabase, statsIds),
    currentProfileMatchesScope
      ? getCurrentPlayerRank(
          supabase,
          currentProfile,
          profilesResult.supportsCity ? selectedCity : null,
        )
      : Promise.resolve(null),
  ]);

  const entries = profiles.map((profile, index) =>
    buildEntry(profile, index + 1, stats.get(profile.id), currentUserId),
  );

  let hasSampleEntries = false;

  if (!selectedCity && entries.length < 8) {
    hasSampleEntries = true;
    const needed = 8 - entries.length;
    const sampleEntries = SAMPLE_LEADERBOARD.slice(0, needed).map((sample, index) => ({
      id: sample.id,
      rank: entries.length + index + 1,
      username: sample.username,
      city: sample.city,
      eloRating: sample.eloRating,
      wins: sample.wins,
      losses: sample.losses,
      isCurrentUser: false,
      isSample: true,
    }));

    entries.push(...sampleEntries);
  }

  const visibleCurrentEntry = entries.find((entry) => entry.isCurrentUser);
  const currentPlayer =
    visibleCurrentEntry ??
    (currentProfileMatchesScope && currentRank
      ? buildEntry(
          currentProfile,
          currentRank,
          stats.get(currentProfile.id),
          currentUserId,
        )
      : null);

  return {
    scope: selectedCity ? "city" : "global",
    selectedCity,
    cityOptions,
    entries,
    currentPlayer,
    hasSampleEntries,
  };
}
