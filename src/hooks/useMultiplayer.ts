"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import {
  createMultiplayerRoomAction,
  joinMultiplayerRoomAction,
  requestRematchAction,
  type PlaySession,
  type PlaySessionRole,
} from "@/features/game/actions";
import { createClient } from "@/lib/supabase/client";
import type { GameStatus, Move } from "@/types/database";

const DISCONNECT_FORFEIT_MS = 60_000;

type PlayerColor = "white" | "black";

type PresencePayload = {
  userId: string;
  role: PlaySessionRole;
  color: PlayerColor | null;
  onlineAt: string;
};

export type MultiplayerMovePayload = {
  gameId: string;
  playerId: string;
  moveNumber: number;
  notation: string;
  fen: string;
  pgn: string;
  whiteTimeMs: number;
  blackTimeMs: number;
};

export type MultiplayerClockPayload = {
  gameId: string;
  playerId: string;
  whiteTimeMs: number;
  blackTimeMs: number;
  turn: PlayerColor;
};

export type MultiplayerRematchPayload =
  | {
      type: "requested";
      requesterId: string;
    }
  | {
      type: "created";
      gameId: string;
      requesterId: string;
    };

export type MultiplayerNotification = {
  id: string;
  tone: "info" | "warning" | "success";
  message: string;
};

type UseMultiplayerOptions = {
  enabled: boolean;
  gameId?: string;
  userId?: string;
  role?: PlaySessionRole;
  playerColor?: PlayerColor | null;
  whitePlayerId?: string;
  blackPlayerId?: string | null;
  gameStatus?: GameStatus;
  onRemoteMove?: (payload: MultiplayerMovePayload) => void;
  onRemoteClock?: (payload: MultiplayerClockPayload) => void;
  onRemoteRematch?: (payload: MultiplayerRematchPayload) => void;
  onGameUpdated?: (game: {
    current_fen?: string;
    pgn?: string;
    status?: GameStatus;
    black_player_id?: string | null;
    white_time_ms?: number;
    black_time_ms?: number;
    rematch_requested_by?: string | null;
    rematch_game_id?: string | null;
  }) => void;
  onMoveInserted?: (move: Move) => void;
};

type UseMultiplayerResult = {
  channelState: "idle" | "connecting" | "ready" | "error";
  notifications: MultiplayerNotification[];
  opponentOnline: boolean;
  disconnectCountdownMs: number | null;
  presenceCount: number;
  shareUrl: string | null;
  createRoom: () => Promise<PlaySession | null>;
  joinRoom: (gameId: string) => Promise<PlaySession | null>;
  broadcastMove: (payload: MultiplayerMovePayload) => Promise<void>;
  broadcastClock: (payload: MultiplayerClockPayload) => Promise<void>;
  requestRematch: () => Promise<MultiplayerRematchPayload | null>;
  clearNotification: (id: string) => void;
};

function createNotification(
  tone: MultiplayerNotification["tone"],
  message: string,
): MultiplayerNotification {
  return {
    id: `${tone}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tone,
    message,
  };
}

function normalizePresenceState(state: Record<string, PresencePayload[]>) {
  return Object.values(state).flat().filter(Boolean);
}

export function useMultiplayer({
  enabled,
  gameId,
  userId,
  role = "spectator",
  playerColor = null,
  whitePlayerId,
  blackPlayerId,
  gameStatus,
  onRemoteMove,
  onRemoteClock,
  onRemoteRematch,
  onGameUpdated,
  onMoveInserted,
}: UseMultiplayerOptions): UseMultiplayerResult {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const disconnectDeadlineRef = useRef<number | null>(null);
  const [channelState, setChannelState] = useState<
    UseMultiplayerResult["channelState"]
  >("idle");
  const [notifications, setNotifications] = useState<MultiplayerNotification[]>([]);
  const [presenceCount, setPresenceCount] = useState(0);
  const [opponentOnline, setOpponentOnline] = useState(true);
  const [disconnectCountdownMs, setDisconnectCountdownMs] = useState<number | null>(
    null,
  );

  const shareUrl = useMemo(() => {
    if (!gameId || typeof window === "undefined") {
      return null;
    }

    return `${window.location.origin}/play/${gameId}`;
  }, [gameId]);

  const pushNotification = useCallback((notification: MultiplayerNotification) => {
    setNotifications((current) => {
      const withoutDuplicate = current.filter(
        (item) => item.message !== notification.message,
      );
      return [...withoutDuplicate.slice(-3), notification];
    });
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const createRoom = useCallback(async () => {
    const result = await createMultiplayerRoomAction();
    if (!result.ok) {
      pushNotification(createNotification("warning", result.error));
      return null;
    }

    pushNotification(
      createNotification("success", "Multiplayer room created. Share the link."),
    );
    return result.data;
  }, [pushNotification]);

  const joinRoom = useCallback(
    async (roomGameId: string) => {
      const result = await joinMultiplayerRoomAction(roomGameId);
      if (!result.ok) {
        pushNotification(createNotification("warning", result.error));
        return null;
      }

      if (result.data.role === "spectator") {
        pushNotification(
          createNotification(
            "info",
            "This room is full, so you joined as a spectator.",
          ),
        );
      } else {
        pushNotification(createNotification("success", "Joined the room."));
      }

      return result.data;
    },
    [pushNotification],
  );

  const broadcastMove = useCallback(
    async (payload: MultiplayerMovePayload) => {
      const channel = channelRef.current;
      if (!channel) return;

      await channel.send({
        type: "broadcast",
        event: "move",
        payload,
      });
    },
    [],
  );

  const broadcastClock = useCallback(
    async (payload: MultiplayerClockPayload) => {
      const channel = channelRef.current;
      if (!channel) return;

      await channel.send({
        type: "broadcast",
        event: "clock",
        payload,
      });
    },
    [],
  );

  const requestRematch = useCallback(async () => {
    if (!gameId) return null;

    const result = await requestRematchAction(gameId);
    if (!result.ok) {
      pushNotification(createNotification("warning", result.error));
      return null;
    }

    const channel = channelRef.current;

    if (result.data.status === "requested") {
      const payload: MultiplayerRematchPayload = {
        type: "requested",
        requesterId: result.data.requesterId,
      };
      if (channel) {
        await channel.send({
          type: "broadcast",
          event: "rematch",
          payload,
        });
      }
      pushNotification(
        createNotification("info", "Rematch request sent. Waiting for opponent."),
      );
      return payload;
    }

    const payload: MultiplayerRematchPayload = {
      type: "created",
      gameId: result.data.gameId,
      requesterId: userId ?? "",
    };

    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "rematch",
        payload,
      });
    }

    pushNotification(createNotification("success", "Rematch is ready."));
    return payload;
  }, [gameId, pushNotification, userId]);

  useEffect(() => {
    if (!enabled || !gameId || !userId) {
      setChannelState("idle");
      return;
    }

    const supabase = createClient();
    const channel = supabase.channel(`game_${gameId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: userId },
      },
    });

    channelRef.current = channel;
    setChannelState("connecting");

    const updateOpponentPresence = () => {
      const state = normalizePresenceState(
        channel.presenceState<PresencePayload>() as Record<string, PresencePayload[]>,
      );
      setPresenceCount(state.length);

      if (role !== "player" || !playerColor) {
        setOpponentOnline(true);
        setDisconnectCountdownMs(null);
        disconnectDeadlineRef.current = null;
        return;
      }

      const opponentId =
        playerColor === "white" ? blackPlayerId ?? null : whitePlayerId ?? null;

      if (!opponentId) {
        setOpponentOnline(false);
        return;
      }

      const isOnline = state.some((entry) => entry.userId === opponentId);
      setOpponentOnline(isOnline);

      if (isOnline) {
        disconnectDeadlineRef.current = null;
        setDisconnectCountdownMs(null);
        return;
      }

      if (!disconnectDeadlineRef.current && gameStatus === "active") {
        disconnectDeadlineRef.current = Date.now() + DISCONNECT_FORFEIT_MS;
        pushNotification(
          createNotification(
            "warning",
            "Opponent disconnected. Forfeit countdown has started.",
          ),
        );
      }
    };

    channel
      .on("broadcast", { event: "move" }, ({ payload }) => {
        onRemoteMove?.(payload as MultiplayerMovePayload);
      })
      .on("broadcast", { event: "clock" }, ({ payload }) => {
        onRemoteClock?.(payload as MultiplayerClockPayload);
      })
      .on("broadcast", { event: "rematch" }, ({ payload }) => {
        onRemoteRematch?.(payload as MultiplayerRematchPayload);
      })
      .on("presence", { event: "sync" }, updateOpponentPresence)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        ({ new: next }) => {
          onGameUpdated?.(next as {
            current_fen?: string;
            pgn?: string;
            status?: GameStatus;
            black_player_id?: string | null;
            white_time_ms?: number;
            black_time_ms?: number;
            rematch_requested_by?: string | null;
            rematch_game_id?: string | null;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "moves",
          filter: `game_id=eq.${gameId}`,
        },
        ({ new: next }) => {
          onMoveInserted?.(next as Move);
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setChannelState("ready");
          await channel.track({
            userId,
            role,
            color: playerColor,
            onlineAt: new Date().toISOString(),
          } satisfies PresencePayload);
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setChannelState("error");
          pushNotification(
            createNotification(
              "warning",
              "Realtime connection is unstable. Sync may lag briefly.",
            ),
          );
        }
      });

    return () => {
      disconnectDeadlineRef.current = null;
      setDisconnectCountdownMs(null);
      void channel.untrack();
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [
    blackPlayerId,
    enabled,
    gameId,
    gameStatus,
    onGameUpdated,
    onMoveInserted,
    onRemoteClock,
    onRemoteMove,
    onRemoteRematch,
    playerColor,
    pushNotification,
    role,
    userId,
    whitePlayerId,
  ]);

  useEffect(() => {
    if (!disconnectDeadlineRef.current) {
      return;
    }

    const timer = window.setInterval(() => {
      const remaining = disconnectDeadlineRef.current
        ? Math.max(0, disconnectDeadlineRef.current - Date.now())
        : 0;

      setDisconnectCountdownMs(remaining);

      if (remaining === 0) {
        disconnectDeadlineRef.current = null;
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [opponentOnline]);

  return {
    channelState,
    notifications,
    opponentOnline,
    disconnectCountdownMs,
    presenceCount,
    shareUrl,
    createRoom,
    joinRoom,
    broadcastMove,
    broadcastClock,
    requestRematch,
    clearNotification,
  };
}
