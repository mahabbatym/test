"use server";

import { revalidatePath } from "next/cache";

import { BOT_PLAYER_ID } from "@/lib/db/constants";
import { dbErr, dbOk, type DbResult } from "@/lib/db/errors";
import {
  createMultiplayerRoom,
  createNewGame,
  createRematchGame,
  finishGame,
  getGameById,
  getUserGameHistory,
  joinMultiplayerRoom,
  setRematchRequester,
  updateGameMove,
  type FinishGameResult,
  type GameWithPlayers,
  type UserGameHistoryItem,
} from "@/lib/db/games";
import { createClient } from "@/lib/supabase/server";
import type { GameResult } from "@/types/database";

export type PlaySessionRole = "player" | "spectator";
export type PlaySessionMode = "ai" | "multiplayer";

export type PlaySession = {
  game: GameWithPlayers;
  userId: string;
  playerColor: "white" | "black" | null;
  role: PlaySessionRole;
  mode: PlaySessionMode;
  roomUrl: string;
  canJoin: boolean;
};

type RematchActionResult =
  | {
      status: "requested";
      requesterId: string;
    }
  | {
      status: "created";
      gameId: string;
    };

function getRoomUrl(gameId: string): string {
  return `/play/${gameId}`;
}

function resolveSession(
  game: GameWithPlayers,
  userId: string,
): PlaySession {
  const mode: PlaySessionMode =
    game.black_player_id === BOT_PLAYER_ID ? "ai" : "multiplayer";
  const roomUrl = getRoomUrl(game.id);

  if (game.white_player_id === userId) {
    return {
      game,
      userId,
      playerColor: "white",
      role: "player",
      mode,
      roomUrl,
      canJoin: false,
    };
  }

  if (game.black_player_id === userId) {
    return {
      game,
      userId,
      playerColor: "black",
      role: "player",
      mode,
      roomUrl,
      canJoin: false,
    };
  }

  return {
    game,
    userId,
    playerColor: null,
    role: "spectator",
    mode,
    roomUrl,
    canJoin: game.status === "waiting" && !game.black_player_id && mode === "multiplayer",
  };
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function initializePlaySessionAction(
  gameId?: string | null,
): Promise<DbResult<PlaySession>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return dbErr("You must be signed in to play");

    const supabase = await createClient();

    if (gameId) {
      const existing = await getGameById(supabase, gameId);
      if (!existing) return dbErr("Game not found");
      return dbOk(resolveSession(existing, userId));
    }

    const game = await createNewGame(supabase, userId, BOT_PLAYER_ID);
    const withPlayers = await getGameById(supabase, game.id);
    if (!withPlayers) return dbErr("Failed to load created game");

    return dbOk(resolveSession(withPlayers, userId));
  } catch (error) {
    return dbErr(error, "Failed to start game");
  }
}

export async function createMultiplayerRoomAction(): Promise<DbResult<PlaySession>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return dbErr("You must be signed in to play");

    const supabase = await createClient();
    const game = await createMultiplayerRoom(supabase, userId);
    const withPlayers = await getGameById(supabase, game.id);
    if (!withPlayers) return dbErr("Failed to load created room");

    revalidatePath("/play");
    return dbOk(resolveSession(withPlayers, userId));
  } catch (error) {
    return dbErr(error, "Failed to create room");
  }
}

export async function joinMultiplayerRoomAction(
  gameId: string,
): Promise<DbResult<PlaySession>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return dbErr("You must be signed in to play");

    const supabase = await createClient();
    const joined = await joinMultiplayerRoom(supabase, gameId, userId);

    revalidatePath("/play");
    revalidatePath(`/play/${gameId}`);

    return dbOk(resolveSession(joined, userId));
  } catch (error) {
    return dbErr(error, "Failed to join room");
  }
}

export async function persistMoveAction(params: {
  gameId: string;
  pgn: string;
  fen: string;
  nextMoveNumber: number;
  notation: string;
  playerId: string;
  whiteTimeMs?: number;
  blackTimeMs?: number;
}): Promise<DbResult<{ moveNumber: number }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return dbErr("Unauthorized");

    const supabase = await createClient();
    const game = await getGameById(supabase, params.gameId);
    if (!game) return dbErr("Game not found");

    const isParticipant =
      game.white_player_id === userId || game.black_player_id === userId;
    if (!isParticipant) return dbErr("Unauthorized");

    const isBotMove = params.playerId === BOT_PLAYER_ID;
    const isValidBotPlayer =
      params.playerId === game.white_player_id ||
      params.playerId === game.black_player_id;

    if (isBotMove) {
      if (!isValidBotPlayer) return dbErr("Invalid player");
    } else if (userId !== params.playerId) {
      return dbErr("Invalid player");
    }

    await updateGameMove(supabase, {
      gameId: params.gameId,
      pgn: params.pgn,
      fen: params.fen,
      nextMoveNumber: params.nextMoveNumber,
      notation: params.notation,
      playerId: params.playerId,
      whiteTimeMs: params.whiteTimeMs,
      blackTimeMs: params.blackTimeMs,
    });

    return dbOk({ moveNumber: params.nextMoveNumber });
  } catch (error) {
    return dbErr(error, "Failed to save move");
  }
}

export async function finishGameAction(params: {
  gameId: string;
  result: GameResult;
  winnerId: string | null;
}): Promise<DbResult<FinishGameResult>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return dbErr("Unauthorized");

    const supabase = await createClient();
    const game = await getGameById(supabase, params.gameId);
    if (!game) return dbErr("Game not found");
    if (
      game.white_player_id !== userId &&
      game.black_player_id !== userId
    ) {
      return dbErr("You do not have access to this game");
    }

    const outcome = await finishGame(
      supabase,
      params.gameId,
      params.result,
      params.winnerId,
    );

    revalidatePath("/play");

    return dbOk(outcome);
  } catch (error) {
    return dbErr(error, "Failed to finish game");
  }
}

export async function requestRematchAction(
  gameId: string,
): Promise<DbResult<RematchActionResult>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return dbErr("Unauthorized");

    const supabase = await createClient();
    const game = await getGameById(supabase, gameId);
    if (!game) return dbErr("Game not found");
    if (
      game.white_player_id !== userId &&
      game.black_player_id !== userId
    ) {
      return dbErr("You do not have access to this game");
    }
    if (game.status !== "finished") {
      return dbErr("Rematch is only available after the game ends");
    }
    if (!game.black_player_id || game.black_player_id === BOT_PLAYER_ID) {
      return dbErr("Rematch is only available for multiplayer games");
    }
    if (game.rematch_game_id) {
      return dbOk({
        status: "created",
        gameId: game.rematch_game_id,
      });
    }

    if (!game.rematch_requested_by || game.rematch_requested_by === userId) {
      await setRematchRequester(supabase, gameId, userId);
      return dbOk({
        status: "requested",
        requesterId: userId,
      });
    }

    const rematch = await createRematchGame(supabase, gameId);
    await setRematchRequester(supabase, gameId, null);

    revalidatePath("/play");
    revalidatePath(`/play/${gameId}`);
    revalidatePath(`/play/${rematch.id}`);

    return dbOk({
      status: "created",
      gameId: rematch.id,
    });
  } catch (error) {
    return dbErr(error, "Failed to create rematch");
  }
}

export async function fetchUserGameHistoryAction(
  limit = 20,
): Promise<DbResult<UserGameHistoryItem[]>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return dbErr("Unauthorized");

    const supabase = await createClient();
    const history = await getUserGameHistory(supabase, userId, limit);
    return dbOk(history);
  } catch (error) {
    return dbErr(error, "Failed to load game history");
  }
}
