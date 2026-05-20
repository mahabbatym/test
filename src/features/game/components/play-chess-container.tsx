"use client";

import { motion } from "framer-motion";
import { Copy, Loader2, Radio, Swords, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import CherryChessboard from "@/components/ui/cherry-chessboard";
import { Button } from "@/components/ui/button";
import { CherryLogo } from "@/components/auth/cherry-logo";
import { MotionPage } from "@/components/ui/motion-page";
import {
  initializePlaySessionAction,
  type PlaySession,
} from "@/features/game/actions";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useHearts } from "@/hooks/use-hearts";

type PlayChessContainerProps = {
  initialGameId?: string | null;
};

function normalizeGameId(value: string): string {
  return value.trim().replace(/^\/play\//, "");
}

export function PlayChessContainer({
  initialGameId = null,
}: PlayChessContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryGameId = searchParams.get("gameId");
  const activeGameId = initialGameId ?? queryGameId;
  const [loading, setLoading] = useState(Boolean(activeGameId));
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<PlaySession | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [showHeartLimit, setShowHeartLimit] = useState(false);
  const [lobbyBusy, setLobbyBusy] = useState<"ai" | "multiplayer" | "join" | null>(
    null,
  );
  const { hearts, maxHearts, isPremium } = useHearts();
  const {
    createRoom,
    joinRoom,
    notifications,
    clearNotification,
    shareUrl,
  } = useMultiplayer({
    enabled: false,
  });

  const roomShareUrl = useMemo(
    () => session?.mode === "multiplayer" ? shareUrl ?? session.roomUrl : null,
    [session?.mode, session?.roomUrl, shareUrl],
  );

  const openSession = useCallback(
    (nextSession: PlaySession) => {
      setSession(nextSession);
      setError(null);
      setLoading(false);
      router.replace(nextSession.roomUrl, { scroll: false });
    },
    [router],
  );

  const loadSession = useCallback(
    async (gameId?: string | null) => {
      if (!gameId) {
        setSession(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await initializePlaySessionAction(gameId);

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.data.canJoin) {
        const joined = await joinRoom(gameId);
        if (joined) {
          openSession(joined);
          return;
        }
      }

      setSession(result.data);
      setLoading(false);
    },
    [joinRoom, openSession],
  );

  useEffect(() => {
    void loadSession(activeGameId);
  }, [activeGameId, loadSession]);

  const handleStartAi = useCallback(async () => {
    if (!isPremium && hearts <= 0) {
      setShowHeartLimit(true);
      return;
    }

    setLobbyBusy("ai");
    setError(null);

    const result = await initializePlaySessionAction(null);
    setLobbyBusy(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    openSession(result.data);
  }, [hearts, isPremium, openSession]);

  const handleCreateRoom = useCallback(async () => {
    setLobbyBusy("multiplayer");
    setError(null);

    const created = await createRoom();
    setLobbyBusy(null);

    if (!created) {
      return;
    }

    openSession(created);
  }, [createRoom, openSession]);

  const handleJoin = useCallback(async () => {
    const trimmed = normalizeGameId(joinCode);
    if (!trimmed) {
      setError("Paste a game link or room id to join.");
      return;
    }

    setLobbyBusy("join");
    setError(null);

    const joined = await joinRoom(trimmed);
    setLobbyBusy(null);

    if (!joined) {
      return;
    }

    openSession(joined);
  }, [joinCode, joinRoom, openSession]);

  const copyShareLink = useCallback(async () => {
    if (!roomShareUrl) return;
    const value =
      roomShareUrl.startsWith("http") || typeof window === "undefined"
        ? roomShareUrl
        : `${window.location.origin}${roomShareUrl}`;
    await navigator.clipboard.writeText(value);
  }, [roomShareUrl]);

  if (loading) {
    return (
      <MotionPage className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="cherry-skeleton h-10 w-36 rounded-lg" />
            <div className="cherry-skeleton h-9 w-9 rounded-lg" />
          </div>
          <div className="cherry-skeleton h-16 rounded-lg" />
          <div className="cherry-skeleton aspect-square rounded-lg" />
          <div className="cherry-skeleton h-16 rounded-lg" />
          <p className="text-muted text-center text-sm">Loading your game…</p>
        </div>
      </MotionPage>
    );
  }

  if (!session) {
    return (
      <MotionPage className="bg-background flex min-h-screen items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#14070a] p-8 shadow-2xl shadow-black/30">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_40%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <CherryLogo
                href="/"
                size="sm"
                variant="inline"
                className="mb-8 [--foreground:#fff] [--muted:rgba(255,255,255,0.62)]"
              />
              <p className="text-cherry text-xs font-medium tracking-[0.25em] uppercase">
                Cherry Play
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Real-time chess rooms with polished multiplayer flow.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                Start an AI session, create a private room, or join a shared link.
                Multiplayer rooms open instantly, support spectators, and stay synced
                over Supabase Realtime.
              </p>

              {error ? (
                <p className="mt-5 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              ) : null}

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <motion.button
                  type="button"
                  onClick={() => void handleStartAi()}
                  disabled={lobbyBusy !== null}
                  whileHover={lobbyBusy === null ? { scale: 1.02 } : undefined}
                  whileTap={lobbyBusy === null ? { scale: 0.98 } : undefined}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-left transition hover:border-red-300/30 hover:bg-white/8 disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-cherry/15 flex size-11 items-center justify-center rounded-2xl">
                      {lobbyBusy === "ai" ? (
                        <Loader2 className="text-cherry size-5 animate-spin" />
                      ) : (
                        <Swords className="text-cherry size-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">Play vs AI</p>
                      <p className="text-sm text-white/55">
                        Instant solo game with Stockfish
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => void handleCreateRoom()}
                  disabled={lobbyBusy !== null}
                  whileHover={lobbyBusy === null ? { scale: 1.02 } : undefined}
                  whileTap={lobbyBusy === null ? { scale: 0.98 } : undefined}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="rounded-[24px] border border-white/10 bg-gradient-to-br from-red-500/14 via-red-500/8 to-transparent p-5 text-left transition hover:border-red-300/30 hover:bg-red-500/10 disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-cherry/15 flex size-11 items-center justify-center rounded-2xl">
                      {lobbyBusy === "multiplayer" ? (
                        <Loader2 className="text-cherry size-5 animate-spin" />
                      ) : (
                        <Users className="text-cherry size-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">Create room</p>
                      <p className="text-sm text-white/55">
                        Share a private multiplayer link
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                <Radio className="text-cherry size-4" />
                {isPremium ? "Infinite hearts" : `${hearts}/${maxHearts} hearts`}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-cherry/15 flex size-11 items-center justify-center rounded-2xl">
                  <Radio className="text-cherry size-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Join room</p>
                  <p className="text-sm text-white/55">
                    Paste a full invite link or room id
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="https://…/play/room-id or room-id"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-red-300/40"
                />
                <Button
                  onClick={() => void handleJoin()}
                  disabled={lobbyBusy !== null}
                  className="bg-cherry hover:bg-cherry-dark w-full text-white"
                >
                  {lobbyBusy === "join" ? "Joining…" : "Join room"}
                </Button>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
                Spectators can still open a full room link and watch live if both
                seats are already taken.
              </div>
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="relative mt-6 flex flex-col gap-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => clearNotification(notification.id)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/70"
                >
                  {notification.message}
                </button>
              ))}
            </div>
          ) : null}

          {showHeartLimit ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#14070a] p-6 text-white shadow-2xl">
                <Radio className="text-cherry size-10" />
                <h2 className="mt-4 text-xl font-semibold tracking-tight">
                  Hearts depleted
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Free players regenerate 1 heart every 2 hours. Cherry Pro
                  unlocks infinite AI games.
                </p>
                <div className="mt-6 grid gap-3">
                  <Link href="/store">
                    <Button className="w-full">Upgrade to Cherry Pro</Button>
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowHeartLimit(false)}
                    className="w-full border-white/10 text-white"
                  >
                    Maybe later
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </MotionPage>
    );
  }

  return (
    <MotionPage className="relative">
      {session.mode === "multiplayer" && roomShareUrl ? (
        <div className="fixed top-4 right-4 z-40 hidden max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-[#14070a]/95 px-4 py-3 shadow-xl backdrop-blur md:flex">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.2em] text-white/45 uppercase">
              Room Link
            </p>
            <p className="truncate text-sm text-white/75">{roomShareUrl}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void copyShareLink()}>
            <Copy className="size-4" />
          </Button>
        </div>
      ) : null}

      <CherryChessboard
        key={`${session.game.id}-${session.role}`}
        gameId={session.game.id}
        userId={session.userId}
        whitePlayerId={session.game.white_player_id}
        blackPlayerId={session.game.black_player_id}
        playerColor={session.playerColor}
        role={session.role}
        mode={session.mode}
        roomStatus={session.game.status}
        roomUrl={session.roomUrl}
        initialFen={session.game.current_fen}
        initialPgn={session.game.pgn}
        initialWhiteTimeMs={session.game.white_time_ms}
        initialBlackTimeMs={session.game.black_time_ms}
        userElo={
          session.playerColor === "black"
            ? (session.game.black_profile?.elo_rating ?? 1200)
            : (session.game.white_profile?.elo_rating ?? 1200)
        }
        opponentElo={
          session.playerColor === "black"
            ? (session.game.white_profile?.elo_rating ?? 1200)
            : (session.game.black_profile?.elo_rating ?? 1200)
        }
        onNewGame={() => {
          setSession(null);
          router.replace("/play");
        }}
      />
    </MotionPage>
  );
}
