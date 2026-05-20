import { type SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_GAME_TIME_MS,
  BOT_ELO_RATING,
  BOT_PLAYER_ID,
  DEFAULT_USER_ELO,
  STARTING_FEN,
} from "@/lib/db/constants";
import { computeEloUpdate, type EloScore } from "@/lib/db/elo";
import type {
  Database,
  Game,
  GameResult,
  Move,
  Profile,
} from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<Database, "public", any>;

export type GameWithPlayers = Game & {
  white_profile: Pick<Profile, "id" | "display_name" | "elo_rating"> | null;
  black_profile: Pick<Profile, "id" | "display_name" | "elo_rating"> | null;
};

export type FinishGameResult = {
  game: Game;
  whiteElo: { previous: number; next: number; delta: number } | null;
  blackElo: { previous: number; next: number; delta: number } | null;
};

export type UserGameHistoryItem = Game & {
  opponent_name: string | null;
  user_color: "white" | "black";
  user_elo_delta: number | null;
};

function getTurnFromFen(fen: string): "w" | "b" {
  const [, turn] = fen.split(" ");
  return turn === "b" ? "b" : "w";
}

async function ensureBotProfile(supabase: Client) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: BOT_PLAYER_ID,
      display_name: "Magnus",
      elo_rating: BOT_ELO_RATING,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}

export async function ensureUserProfile(
  supabase: Client,
  userId: string,
  displayName?: string | null,
) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    if (displayName) {
      await supabase
        .from("profiles")
        .update({
          display_name: displayName,
        })
        .eq("id", userId);
    }
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    display_name: displayName ?? null,
    elo_rating: DEFAULT_USER_ELO,
  });

  if (error) throw error;
}

export async function createNewGame(
  supabase: Client,
  whitePlayerId: string,
  blackPlayerId: string,
): Promise<Game> {
  await ensureBotProfile(supabase);
  await ensureUserProfile(supabase, whitePlayerId);

  if (blackPlayerId !== BOT_PLAYER_ID) {
    await ensureUserProfile(supabase, blackPlayerId);
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("games")
    .insert({
      white_player_id: whitePlayerId,
      black_player_id: blackPlayerId,
      status: "active",
      current_fen: STARTING_FEN,
      pgn: "",
      move_count: 0,
      white_time_ms: DEFAULT_GAME_TIME_MS,
      black_time_ms: DEFAULT_GAME_TIME_MS,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMultiplayerRoom(
  supabase: Client,
  whitePlayerId: string,
): Promise<Game> {
  await ensureUserProfile(supabase, whitePlayerId);

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("games")
    .insert({
      white_player_id: whitePlayerId,
      black_player_id: null,
      status: "waiting",
      current_fen: STARTING_FEN,
      pgn: "",
      move_count: 0,
      white_time_ms: DEFAULT_GAME_TIME_MS,
      black_time_ms: DEFAULT_GAME_TIME_MS,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function fetchProfileSummary(supabase: Client, playerId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, elo_rating")
    .eq("id", playerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function fetchOptionalProfileSummary(
  supabase: Client,
  playerId: string | null,
) {
  if (!playerId) {
    return null;
  }

  return fetchProfileSummary(supabase, playerId);
}

export async function getGameById(
  supabase: Client,
  gameId: string,
): Promise<GameWithPlayers | null> {
  const { data: game, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();

  if (error) throw error;
  if (!game) return null;

  const [white_profile, black_profile] = await Promise.all([
    fetchProfileSummary(supabase, game.white_player_id),
    fetchOptionalProfileSummary(supabase, game.black_player_id),
  ]);

  return { ...game, white_profile, black_profile };
}

export async function updateGameMove(
  supabase: Client,
  params: {
    gameId: string;
    pgn: string;
    fen: string;
    nextMoveNumber: number;
    notation: string;
    playerId: string;
    whiteTimeMs?: number;
    blackTimeMs?: number;
  },
): Promise<{ game: Game; move: Move }> {
  const {
    gameId,
    pgn,
    fen,
    nextMoveNumber,
    notation,
    playerId,
    whiteTimeMs,
    blackTimeMs,
  } = params;

  const { data: game, error: gameFetchError } = await supabase
    .from("games")
    .select("id, status, white_player_id, black_player_id, current_fen")
    .eq("id", gameId)
    .single();

  if (gameFetchError) throw gameFetchError;
  if (game.status !== "active") {
    throw new Error("Game is already finished");
  }

  const isParticipant =
    playerId === game.white_player_id || playerId === game.black_player_id;
  if (!isParticipant) {
    throw new Error("Player is not part of this game");
  }

  const expectedPlayerId =
    getTurnFromFen(game.current_fen) === "w"
      ? game.white_player_id
      : game.black_player_id;

  if (expectedPlayerId !== playerId) {
    throw new Error("It is not this player's turn");
  }

  const now = new Date().toISOString();

  const { data: updatedGame, error: gameError } = await supabase
    .from("games")
    .update({
      pgn,
      current_fen: fen,
      move_count: nextMoveNumber,
      white_time_ms: whiteTimeMs,
      black_time_ms: blackTimeMs,
      updated_at: now,
    })
    .eq("id", gameId)
    .select()
    .single();

  if (gameError) throw gameError;

  const { data: move, error: moveError } = await supabase
    .from("moves")
    .insert({
      game_id: gameId,
      move_number: nextMoveNumber,
      notation,
      fen,
      player_id: playerId,
    })
    .select()
    .single();

  if (moveError) throw moveError;

  return { game: updatedGame, move };
}

export async function finishGame(
  supabase: Client,
  gameId: string,
  result: GameResult,
  winnerId: string | null,
): Promise<FinishGameResult> {
  const { data: game, error: fetchError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (fetchError) throw fetchError;
  if (game.status === "finished") {
    return {
      game,
      whiteElo: null,
      blackElo: null,
    };
  }

  const now = new Date().toISOString();

  const { data: finishedGame, error: updateError } = await supabase
    .from("games")
    .update({
      status: "finished",
      result,
      winner_id: winnerId,
      updated_at: now,
    })
    .eq("id", gameId)
    .select()
    .single();

  if (updateError) throw updateError;

  const whiteElo = await updatePlayerEloIfHuman(
    supabase,
    game.white_player_id,
    game.black_player_id ?? BOT_PLAYER_ID,
    result === "white" ? 1 : result === "draw" ? 0.5 : 0,
  );

  const blackElo = game.black_player_id
    ? await updatePlayerEloIfHuman(
        supabase,
        game.black_player_id,
        game.white_player_id,
        result === "black" ? 1 : result === "draw" ? 0.5 : 0,
      )
    : null;

  return {
    game: finishedGame,
    whiteElo,
    blackElo,
  };
}

export async function joinMultiplayerRoom(
  supabase: Client,
  gameId: string,
  userId: string,
): Promise<GameWithPlayers> {
  await ensureUserProfile(supabase, userId);

  const game = await getGameById(supabase, gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  if (game.white_player_id === userId || game.black_player_id === userId) {
    return game;
  }

  if (game.status !== "waiting") {
    throw new Error("This room is no longer open");
  }

  if (game.black_player_id) {
    throw new Error("This room is already full");
  }

  const { error } = await supabase
    .from("games")
    .update({
      black_player_id: userId,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId)
    .is("black_player_id", null);

  if (error) throw error;

  const joined = await getGameById(supabase, gameId);
  if (!joined) {
    throw new Error("Failed to load joined room");
  }

  return joined;
}

export async function createRematchGame(
  supabase: Client,
  previousGameId: string,
): Promise<GameWithPlayers> {
  const previousGame = await getGameById(supabase, previousGameId);
  if (!previousGame) {
    throw new Error("Game not found");
  }

  if (!previousGame.black_player_id) {
    throw new Error("This game does not have two players");
  }

  await ensureUserProfile(supabase, previousGame.white_player_id);
  await ensureUserProfile(supabase, previousGame.black_player_id);

  const now = new Date().toISOString();

  const { data: created, error: createError } = await supabase
    .from("games")
    .insert({
      white_player_id: previousGame.black_player_id,
      black_player_id: previousGame.white_player_id,
      status: "active",
      current_fen: STARTING_FEN,
      pgn: "",
      move_count: 0,
      white_time_ms: DEFAULT_GAME_TIME_MS,
      black_time_ms: DEFAULT_GAME_TIME_MS,
      updated_at: now,
    })
    .select()
    .single();

  if (createError) throw createError;

  const { error: updateError } = await supabase
    .from("games")
    .update({
      rematch_game_id: created.id,
      updated_at: now,
    })
    .eq("id", previousGameId);

  if (updateError) throw updateError;

  const rematch = await getGameById(supabase, created.id);
  if (!rematch) {
    throw new Error("Failed to load rematch game");
  }

  return rematch;
}

export async function setRematchRequester(
  supabase: Client,
  gameId: string,
  requesterId: string | null,
): Promise<Game> {
  const { data, error } = await supabase
    .from("games")
    .update({
      rematch_requested_by: requesterId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updatePlayerEloIfHuman(
  supabase: Client,
  playerId: string,
  opponentId: string,
  score: EloScore,
): Promise<{ previous: number; next: number; delta: number } | null> {
  if (playerId === BOT_PLAYER_ID) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("elo_rating")
    .eq("id", playerId)
    .single();

  if (profileError) throw profileError;

  const opponentRating =
    opponentId === BOT_PLAYER_ID
      ? BOT_ELO_RATING
      : (
          await supabase
            .from("profiles")
            .select("elo_rating")
            .eq("id", opponentId)
            .single()
        ).data?.elo_rating ?? DEFAULT_USER_ELO;

  const { previousRating, newRating, delta } = computeEloUpdate(
    profile.elo_rating,
    opponentRating,
    score,
  );

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      elo_rating: newRating,
      updated_at: new Date().toISOString(),
    })
    .eq("id", playerId);

  if (updateError) throw updateError;

  return { previous: previousRating, next: newRating, delta };
}

export async function getUserGameHistory(
  supabase: Client,
  userId: string,
  limit = 20,
): Promise<UserGameHistoryItem[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
    .eq("status", "finished")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const items: UserGameHistoryItem[] = [];

  for (const game of data ?? []) {
    const isWhite = game.white_player_id === userId;
    const opponentId = isWhite ? game.black_player_id : game.white_player_id;
    const opponent =
      opponentId === BOT_PLAYER_ID
        ? { display_name: "Magnus", elo_rating: BOT_ELO_RATING }
        : opponentId
          ? await fetchProfileSummary(supabase, opponentId)
          : null;

    items.push({
      ...game,
      opponent_name: opponent?.display_name ?? "Opponent",
      user_color: isWhite ? "white" : "black",
      user_elo_delta: null,
    });
  }

  return items;
}

export async function getMovesForGame(
  supabase: Client,
  gameId: string,
): Promise<Move[]> {
  const { data, error } = await supabase
    .from("moves")
    .select("*")
    .eq("game_id", gameId)
    .order("move_number", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
