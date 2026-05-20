"use client";

import {
  Brain,
  Crown,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAiCoachAnalysis } from "@/hooks/useAiCoachAnalysis";
import { cn } from "@/lib/utils/cn";
import type { GameResult } from "@/types/database";
import type {
  CoachMoveQuality,
  CoachMoveReview,
  CoachSideSummary,
} from "@/utils/chess/aiCoach";

export type GameOverState = {
  result: GameResult;
  title: string;
  subtitle: string;
  pgn: string;
  userElo?: {
    previous: number;
    next: number;
    delta: number;
  } | null;
};

type GameOverModalProps = {
  state: GameOverState;
  onNewGame: () => void;
  loading?: boolean;
  showRematch?: boolean;
  onRematch?: () => void;
  rematchLoading?: boolean;
  rematchStatus?: "idle" | "requested" | "received" | "starting";
};

function qualityTone(quality: CoachMoveQuality): string {
  switch (quality) {
    case "blunder":
      return "border-red-500 bg-red-500/10 text-red-100";
    case "mistake":
      return "border-orange-400/60 bg-orange-500/10 text-orange-100";
    case "inaccuracy":
      return "border-amber-400/50 bg-amber-500/10 text-amber-100";
    case "best":
      return "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
    case "excellent":
      return "border-sky-400/40 bg-sky-500/10 text-sky-100";
  }
}

function SummaryCard({
  title,
  summary,
}: {
  title: string;
  summary: CoachSideSummary;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-white/55 uppercase">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {summary.accuracy.toFixed(1)}%
          </p>
          <p className="text-xs text-white/50">{summary.movesAnalyzed} moves analyzed</p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
          Accuracy
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-white/45">Blunders</p>
          <p className="mt-1 text-lg font-semibold text-white">{summary.blunders}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-white/45">Mistakes</p>
          <p className="mt-1 text-lg font-semibold text-white">{summary.mistakes}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-white/45">Inaccuracies</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {summary.inaccuracies}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-white/45">Best / Ex.</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {summary.bestMoves + summary.excellentMoves}
          </p>
        </div>
      </div>
    </div>
  );
}

function CriticalMoveCard({ move }: { move: CoachMoveReview }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        qualityTone(move.quality),
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">
            Move {move.moveNumber}
            {move.color === "w" ? ". " : "... "}
            {move.san}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-current/75">
            {move.qualityLabel} • {move.qualityLabelKz}
          </p>
        </div>
        <div className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium text-current/85">
          -{move.scoreDropPawns.toFixed(1)}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-current/90">{move.explanation}</p>
      <p className="mt-3 text-sm font-medium text-white/90">{move.recommendation}</p>
    </div>
  );
}

export function GameOverModal({
  state,
  onNewGame,
  loading = false,
  showRematch = false,
  onRematch,
  rematchLoading = false,
  rematchStatus = "idle",
}: GameOverModalProps) {
  const { userElo } = state;
  const hasCoachPgn = state.pgn.trim().length > 0;
  const gained = userElo && userElo.delta > 0;
  const lost = userElo && userElo.delta < 0;
  const coach = useAiCoachAnalysis({
    enabled: hasCoachPgn,
    pgn: state.pgn,
  });
  const criticalMoments =
    coach.report?.moves.filter(
      (move) => move.quality === "blunder" || move.quality === "mistake",
    ) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#14070a] p-8 shadow-2xl shadow-black/40"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_30%)]" />

        <div className="relative grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/15">
                  <Trophy className="text-cherry size-8" />
                </div>
                <h2
                  id="game-over-title"
                  className="text-2xl font-semibold tracking-tight text-white"
                >
                  {state.title}
                </h2>
                <p className="mt-2 text-sm text-white/65">{state.subtitle}</p>
              </div>

              {userElo ? (
                <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-center text-xs font-medium tracking-[0.24em] text-white/50 uppercase">
                    Your rating
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-lg text-white/55 tabular-nums">
                      {userElo.previous}
                    </span>
                    <span className="text-white/35">→</span>
                    <span className="text-2xl font-bold text-white tabular-nums">
                      {userElo.next}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums",
                        gained && "bg-emerald-500/15 text-emerald-300",
                        lost && "bg-red-500/15 text-red-200",
                        !gained && !lost && "bg-white/10 text-white/55",
                      )}
                    >
                      {gained ? (
                        <Plus className="size-3.5" />
                      ) : lost ? (
                        <Minus className="size-3.5" />
                      ) : null}
                      {userElo.delta > 0 ? "+" : ""}
                      {userElo.delta}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={onNewGame}
                  disabled={loading}
                  className="bg-cherry hover:bg-cherry-dark w-full gap-2 text-white"
                >
                  <Crown className="size-4" />
                  {loading ? "Starting…" : "New game"}
                </Button>
                <Link href="/" className="w-full">
                  <Button variant="secondary" className="w-full">
                    Back to home
                  </Button>
                </Link>
                {showRematch ? (
                  <Button
                    variant="secondary"
                    onClick={onRematch}
                    disabled={rematchLoading || loading}
                    className="w-full"
                  >
                    {rematchLoading
                      ? "Preparing rematch…"
                      : rematchStatus === "requested"
                        ? "Rematch requested"
                        : rematchStatus === "received"
                          ? "Accept rematch"
                          : "Қайта ойнау"}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-red-500/14 via-red-500/6 to-transparent p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/15">
                    <Brain className="size-6 text-red-200" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-red-300/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium tracking-[0.18em] text-red-100 uppercase">
                      Premium
                    </span>
                    <span className="text-xs text-white/45">Cherry AI Coach</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    Your futuristic trainer is reviewing every critical moment.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    High-depth Stockfish analysis tracks blunders, mistakes,
                    inaccuracies, and the best practical improvements move by move.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-red-200" />
                  <p className="text-xs font-medium tracking-[0.22em] text-white/55 uppercase">
                    Cherry AI Coach
                  </p>
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Post-game dashboard
                </h3>
              </div>
              {coach.status === "loading" ? (
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  {Math.round(coach.progress * 100)}%
                </div>
              ) : null}
            </div>

            {!hasCoachPgn ? (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
                <p className="text-sm font-medium text-white">
                  No PGN was available for coach review.
                </p>
                <p className="mt-2 text-sm text-white/55">
                  Cherry AI Coach needs a saved move list to generate the post-game report.
                </p>
              </div>
            ) : null}

            {hasCoachPgn &&
            (coach.status === "loading" || coach.status === "idle") ? (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin text-red-200" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Cherry AI Coach is analyzing this game
                    </p>
                    <p className="text-sm text-white/55">
                      Running deeper Stockfish review on every move without blocking your board.
                    </p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-300 via-red-400 to-red-500 transition-all duration-300"
                    style={{ width: `${Math.max(coach.progress * 100, 6)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {hasCoachPgn && coach.status === "error" ? (
              <div className="rounded-[24px] border border-red-500/50 bg-red-500/10 p-6">
                <p className="text-sm font-medium text-red-100">
                  Cherry AI Coach could not finish the review.
                </p>
                <p className="mt-2 text-sm text-red-100/75">
                  {coach.error ?? "Please try another game or refresh the page."}
                </p>
              </div>
            ) : null}

            {hasCoachPgn && coach.status === "ready" && coach.report ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <SummaryCard title="White" summary={coach.report.white} />
                  <SummaryCard title="Black" summary={coach.report.black} />
                </div>

                {coach.report.worstMove ? (
                  <div className="rounded-[24px] border border-red-500 bg-red-500/10 p-5">
                    <div className="flex items-center gap-2 text-red-100">
                      <Target className="size-4" />
                      <p className="text-xs font-medium tracking-[0.22em] uppercase">
                        Worst move of the game
                      </p>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold text-white">
                      Move {coach.report.worstMove.moveNumber}
                      {coach.report.worstMove.color === "w" ? ". " : "... "}
                      {coach.report.worstMove.san}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-red-50/90">
                      {coach.report.worstMove.explanation}
                    </p>
                    <p className="mt-3 text-sm font-medium text-white">
                      Coach recommendation: {coach.report.worstMove.recommendation}
                    </p>
                  </div>
                ) : null}

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="size-4 text-red-200" />
                    <h4 className="text-lg font-semibold text-white">
                      Critical coach notes
                    </h4>
                  </div>

                  {criticalMoments.length > 0 ? (
                    <div className="space-y-3">
                      {criticalMoments.map((move) => (
                        <CriticalMoveCard key={move.ply} move={move} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                      <p className="text-sm font-medium text-emerald-100">
                        No major blunders or mistakes detected.
                      </p>
                      <p className="mt-2 text-sm text-emerald-100/75">
                        This game stayed clean. Most of the improvement lies in small refinements.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
