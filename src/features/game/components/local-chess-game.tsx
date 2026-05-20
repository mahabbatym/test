"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Flag,
  Handshake,
  Loader2,
  Moon,
  Plus,
  RotateCcw,
  Sun,
} from "lucide-react";
import { Chess, type PieceSymbol, type Square as ChessSquare } from "chess.js";

import { CherryLogo } from "@/components/auth/cherry-logo";
import { Button } from "@/components/ui/button";
import { ChessgroundBoard } from "@/components/ui/chessground-board";
import type { PromotionPiece } from "@/features/chess";
import { useChessStore } from "@/stores/chess-store";
import { useStockfish } from "@/hooks/useStockfish";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils/cn";
import {
  parseDifficultyLevel,
  STOCKFISH_DEFAULT_LEVEL,
  STOCKFISH_DIFFICULTY_LEVELS,
  STOCKFISH_DIFFICULTY_SETTINGS,
  type StockfishDifficultyLevel,
  type StockfishEvaluation,
} from "@/utils/chess/stockfish";
import type {
  Dests,
  Key as ChessgroundKey,
} from "@/vendor/chessground/src/types";

type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
type PieceColor = "white" | "black";
type Piece = { type: PieceType; color: PieceColor };

type GameOverState = {
  title: string;
  subtitle: string;
};

const PIECE_SYMBOL_MAP: Record<PieceSymbol, PieceType> = {
  k: "K",
  q: "Q",
  r: "R",
  b: "B",
  n: "N",
  p: "P",
};

function turnToColor(turn: "w" | "b"): "white" | "black" {
  return turn === "w" ? "white" : "black";
}

function getCapturedPiecesFromPgn(pgn: string): {
  byWhite: Piece[];
  byBlack: Piece[];
} {
  if (!pgn.trim()) return { byWhite: [], byBlack: [] };
  try {
    const chess = new Chess();
    chess.loadPgn(pgn, { strict: false });
    return chess
      .history({ verbose: true })
      .reduce<{ byWhite: Piece[]; byBlack: Piece[] }>(
        (captured, move) => {
          if (!move.captured) return captured;
          const piece: Piece = {
            type: PIECE_SYMBOL_MAP[move.captured],
            color: move.color === "w" ? "black" : "white",
          };
          if (move.color === "w") {
            captured.byWhite.push(piece);
          } else {
            captured.byBlack.push(piece);
          }
          return captured;
        },
        { byWhite: [], byBlack: [] },
      );
  } catch {
    return { byWhite: [], byBlack: [] };
  }
}

const ChessPieceSvg = ({
  type,
  color,
  className,
}: {
  type: PieceType;
  color: PieceColor;
  className?: string;
}) => {
  const fill = color === "white" ? "#fafafa" : "#18181b";
  const stroke = color === "white" ? "#27272a" : "#fafafa";
  const strokeWidth = color === "white" ? "1.5" : "1";

  const pieces: Record<PieceType, React.ReactElement> = {
    K: (
      <svg viewBox="0 0 45 45" className={className}>
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 11.63V6M20 8h5" />
          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
          <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" />
        </g>
      </svg>
    ),
    Q: (
      <svg viewBox="0 0 45 45" className={className}>
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="2.75" />
          <circle cx="14" cy="9" r="2.75" />
          <circle cx="22.5" cy="8" r="2.75" />
          <circle cx="31" cy="9" r="2.75" />
          <circle cx="39" cy="12" r="2.75" />
          <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-7-5.5 9.5-5.5-9.5-3.5 7-7.5-12.5L9 26z" />
          <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
          <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
        </g>
      </svg>
    ),
    R: (
      <svg viewBox="0 0 45 45" className={className}>
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
          <path d="M34 14l-3 3H14l-3-3" />
          <path d="M31 17v12.5H14V17" />
          <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
          <path d="M11 14h23" fill="none" />
        </g>
      </svg>
    ),
    B: (
      <svg viewBox="0 0 45 45" className={className}>
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <g fillRule="evenodd">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <circle cx="22.5" cy="8" r="2.5" />
          </g>
          <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none" stroke={stroke} strokeLinejoin="miter" />
        </g>
      </svg>
    ),
    N: (
      <svg viewBox="0 0 45 45" className={className}>
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
          <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
          <circle cx="18.5" cy="16.5" r="1.5" fill={stroke} stroke="none" />
          <path d="M16.5 12s1.5-2 3.5-1" fill="none" />
        </g>
      </svg>
    ),
    P: (
      <svg viewBox="0 0 45 45" className={className}>
        <path
          d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return pieces[type];
};

function getEvaluationFill(evaluation: StockfishEvaluation | null): number {
  if (!evaluation) return 50;
  if (evaluation.kind === "mate") {
    return evaluation.normalized > 0 ? 100 : 0;
  }
  const bounded = Math.max(-500, Math.min(500, evaluation.normalized));
  return Math.max(0, Math.min(100, 50 + bounded / 10));
}

function getEvaluationLabel(evaluation: StockfishEvaluation | null): string {
  if (!evaluation) return "0.0";
  return evaluation.display;
}

const PROMOTION_LABELS: Record<PromotionPiece, string> = {
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
};

export function LocalChessGame() {
  const { gameState, makeMove, reset, getLegalMoves } = useChessStore();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [promotionChoice, setPromotionChoice] = useState<{
    from: ChessSquare;
    to: ChessSquare;
    options: PromotionPiece[];
  } | null>(null);
  const [gameOver, setGameOver] = useState<GameOverState | null>(null);
  const [aiLevel, setAiLevel] = useState<StockfishDifficultyLevel>(STOCKFISH_DEFAULT_LEVEL);
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]);
  const [captureSquare, setCaptureSquare] = useState<ChessSquare | null>(null);

  const aiMoveTokenRef = useRef(0);
  const aiDelayTimeoutRef = useRef<number | null>(null);
  const captureHighlightTimeoutRef = useRef<number | null>(null);

  const {
    status: stockfishStatus,
    isThinking: isAiThinking,
    evaluation: aiEvaluation,
    error: stockfishError,
    getBestMove,
    stop: stopStockfish,
    resetEvaluation,
  } = useStockfish();

  const currentTurn = turnToColor(gameState.turn);
  const playerColor: "white" | "black" = "white";
  const aiColor: "white" | "black" = "black";
  const isPlayerTurn = currentTurn === playerColor;
  const isGameActive = !gameState.isGameOver && !gameOver;
  const isInteractive = isGameActive && isPlayerTurn && !isAiThinking;

  const activeAiDifficulty = STOCKFISH_DIFFICULTY_SETTINGS[aiLevel];
  const evaluationFill = useMemo(() => getEvaluationFill(aiEvaluation), [aiEvaluation]);

  const aiStatusText = stockfishError
    ? "Engine unavailable"
    : isAiThinking
      ? "Thinking..."
      : stockfishStatus === "loading"
        ? "Loading engine..."
        : `Level ${aiLevel}`;

  const legalDests: Dests = new Map();
  for (const move of getLegalMoves()) {
    const from = move.from as ChessgroundKey;
    const to = move.to as ChessgroundKey;
    const targets = legalDests.get(from) ?? [];
    if (!targets.includes(to)) {
      targets.push(to);
    }
    legalDests.set(from, targets);
  }

  const lastMoveSquares = useMemo<[ChessSquare, ChessSquare] | null>(() => {
    if (!gameState.lastMove) return null;
    return [gameState.lastMove.from, gameState.lastMove.to];
  }, [gameState.lastMove]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const captured = getCapturedPiecesFromPgn(gameState.pgn);
    setCapturedByWhite(captured.byWhite);
    setCapturedByBlack(captured.byBlack);
  }, [gameState.pgn]);

  useEffect(() => {
    return () => {
      if (aiDelayTimeoutRef.current !== null) {
        window.clearTimeout(aiDelayTimeoutRef.current);
      }
      if (captureHighlightTimeoutRef.current !== null) {
        window.clearTimeout(captureHighlightTimeoutRef.current);
      }
    };
  }, []);

  const flashCaptureSquare = useCallback((square: ChessSquare) => {
    setCaptureSquare(square);
    if (captureHighlightTimeoutRef.current !== null) {
      window.clearTimeout(captureHighlightTimeoutRef.current);
    }
    captureHighlightTimeoutRef.current = window.setTimeout(() => {
      setCaptureSquare(null);
      captureHighlightTimeoutRef.current = null;
    }, 520);
  }, []);

  const commitMove = useCallback(
    (from: ChessSquare, to: ChessSquare, promotion?: PromotionPiece) => {
      const result = makeMove({ from, to, promotion });
      if (!result.ok) return false;

      if (result.move.flags.isCapture) {
        flashCaptureSquare(to);
      }

      setPromotionChoice(null);

      if (result.state.isGameOver) {
        let title = "Game Over";
        let subtitle = "Well played.";
        if (result.state.isCheckmate) {
          const winner = result.state.turn === "w" ? "Black" : "White";
          title = "Checkmate";
          subtitle = `${winner} wins!`;
        } else if (result.state.isStalemate) {
          title = "Stalemate";
          subtitle = "The game is drawn.";
        } else if (result.state.isDraw) {
          title = "Draw";
          subtitle = "The game ended in a draw.";
        }
        setGameOver({ title, subtitle });
      }

      return true;
    },
    [makeMove, flashCaptureSquare],
  );

  // AI move effect
  useEffect(() => {
    if (
      currentTurn !== aiColor ||
      gameState.isGameOver ||
      gameOver ||
      promotionChoice
    ) {
      return;
    }

    let cancelled = false;
    const requestToken = aiMoveTokenRef.current + 1;
    aiMoveTokenRef.current = requestToken;

    const runAiMove = async () => {
      try {
        const result = await getBestMove({
          fen: gameState.fen,
          depth: activeAiDifficulty.depth,
          level: aiLevel,
        });

        if (cancelled || aiMoveTokenRef.current !== requestToken) return;

        const delay = Math.floor(300 + Math.random() * 200);
        aiDelayTimeoutRef.current = window.setTimeout(() => {
          aiDelayTimeoutRef.current = null;
          if (cancelled || aiMoveTokenRef.current !== requestToken) return;
          commitMove(result.move.from, result.move.to, result.move.promotion);
        }, delay);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "AI error";
        if (message !== "Stockfish search stopped" && message !== "Stockfish worker terminated") {
          console.error("AI move error:", message);
        }
      }
    };

    void runAiMove();

    return () => {
      cancelled = true;
      if (aiDelayTimeoutRef.current !== null) {
        window.clearTimeout(aiDelayTimeoutRef.current);
        aiDelayTimeoutRef.current = null;
      }
      stopStockfish();
    };
  }, [
    aiColor,
    aiLevel,
    activeAiDifficulty.depth,
    commitMove,
    currentTurn,
    gameOver,
    gameState.fen,
    gameState.isGameOver,
    getBestMove,
    promotionChoice,
    stopStockfish,
  ]);

  const attemptMove = useCallback(
    (from: ChessSquare, to: ChessSquare) => {
      if (!isInteractive) return false;

      const candidates = getLegalMoves(from).filter((m) => m.to === to);
      if (candidates.length === 0) return false;

      const promotions = candidates.filter((m) => m.flags.isPromotion);
      if (promotions.length > 1) {
        const options = promotions
          .map((m) => m.promotion)
          .filter((p): p is PromotionPiece => p !== undefined);
        setPromotionChoice({ from, to, options });
        return false;
      }

      const promotion = candidates[0]?.promotion;
      return commitMove(from, to, promotion);
    },
    [commitMove, getLegalMoves, isInteractive],
  );

  const handleResign = useCallback(() => {
    if (!isGameActive) return;
    setGameOver({ title: "Resigned", subtitle: "You resigned the game." });
  }, [isGameActive]);

  const handleOfferDraw = useCallback(() => {
    if (!isGameActive) return;
    setGameOver({ title: "Draw", subtitle: "Game drawn by agreement." });
  }, [isGameActive]);

  const handleNewGame = useCallback(() => {
    aiMoveTokenRef.current += 1;
    if (aiDelayTimeoutRef.current !== null) {
      window.clearTimeout(aiDelayTimeoutRef.current);
      aiDelayTimeoutRef.current = null;
    }
    stopStockfish();
    resetEvaluation();
    setGameOver(null);
    setPromotionChoice(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setCaptureSquare(null);
    reset();
  }, [reset, resetEvaluation, stopStockfish]);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  if (!mounted) return null;

  const displayFiles = isFlipped ? [...files].reverse() : files;
  const displayRanks = isFlipped ? [...ranks].reverse() : ranks;
  const orientation = isFlipped ? "black" : "white";

  // Move history pairs
  const movePairs: { number: number; white: string; black?: string }[] = [];
  for (let i = 0; i < gameState.history.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: gameState.history[i] ?? "",
      black: gameState.history[i + 1],
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="bg-background flex min-h-screen items-center justify-center p-4 md:p-8"
    >
      <div className="flex w-full max-w-lg flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CherryLogo href="/" size="sm" variant="inline" />
            {gameState.isCheck && !gameState.isGameOver && (
              <span className="text-destructive text-xs font-medium uppercase">
                Check!
              </span>
            )}
            {gameState.isCheckmate && (
              <span className="text-destructive text-xs font-medium uppercase">
                Checkmate
              </span>
            )}
            {gameState.isStalemate && (
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Stalemate
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="size-9 p-0"
            aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>

        {/* AI Panel */}
        <div className="bg-card border-border rounded-lg border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-cherry/10 text-cherry flex size-10 items-center justify-center rounded-full">
                {isAiThinking ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Bot className="size-5" />
                )}
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">Play vs AI</p>
                <p className="text-muted-foreground text-xs">
                  Stockfish {activeAiDifficulty.label} • Depth {activeAiDifficulty.depth}
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground uppercase tracking-[0.18em]">
                Difficulty
              </span>
              <select
                value={aiLevel}
                onChange={(event) => setAiLevel(parseDifficultyLevel(event.target.value))}
                disabled={isAiThinking}
                className="border-border bg-background text-foreground rounded-md border px-2 py-1 text-sm"
              >
                {STOCKFISH_DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    L{level} · {STOCKFISH_DIFFICULTY_SETTINGS[level].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground uppercase tracking-[0.18em]">
                Engine
              </span>
              <span className="text-foreground font-medium">{aiStatusText}</span>
            </div>
            <div className="bg-secondary h-2 overflow-hidden rounded-full">
              <div
                className="bg-foreground h-full transition-all duration-300"
                style={{ width: `${evaluationFill}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Black</span>
              <span className="text-muted-foreground">{getEvaluationLabel(aiEvaluation)}</span>
              <span className="text-muted-foreground">White</span>
            </div>
          </div>
        </div>

        {/* Black player card */}
        <div
          className={cn(
            "bg-card border-border flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-all duration-300",
            currentTurn === "black" && isGameActive && "ring-cherry/50 ring-2",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="border-border bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full border text-sm font-medium">
              AI
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">Magnus (AI)</span>
              <span className="text-muted-foreground text-xs">
                {aiStatusText}
              </span>
            </div>
          </div>
          <div className="flex min-w-[60px] items-center gap-0.5">
            {capturedByBlack.slice(0, 8).map((piece, i) => (
              <div key={i} className="size-4 opacity-60">
                <ChessPieceSvg type={piece.type} color={piece.color} className="size-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Chess Board */}
        <div className="px-6 py-2">
          <div className="relative aspect-square w-full">
            <div className="absolute -bottom-6 right-0 left-0 flex justify-around px-[2%]">
              {displayFiles.map((file) => (
                <span
                  key={file}
                  className="text-muted-foreground w-[12.5%] text-center text-xs font-medium"
                >
                  {file}
                </span>
              ))}
            </div>

            <div className="absolute top-0 bottom-0 -left-5 flex flex-col justify-around py-[2%]">
              {displayRanks.map((rank) => (
                <span
                  key={rank}
                  className="text-muted-foreground flex h-[12.5%] items-center text-xs font-medium"
                >
                  {rank}
                </span>
              ))}
            </div>

            <div className="border-border relative aspect-square overflow-hidden rounded-lg border shadow-lg shadow-black/10 dark:shadow-black/40">
              <ChessgroundBoard
                fen={gameState.fen}
                orientation={orientation}
                turnColor={currentTurn}
                movableColor={currentTurn}
                interactive={isInteractive}
                legalDests={legalDests}
                lastMove={lastMoveSquares}
                check={gameState.isCheck ? currentTurn : false}
                captureSquare={captureSquare}
                onMove={attemptMove}
              />
            </div>
          </div>
        </div>

        {/* Promotion Choice */}
        {promotionChoice && (
          <div className="bg-card border-border flex flex-wrap justify-center gap-2 rounded-lg border p-3">
            <p className="text-muted-foreground w-full text-center text-sm">
              Choose promotion
            </p>
            {promotionChoice.options.map((piece) => (
              <Button
                key={piece}
                variant="secondary"
                size="sm"
                onClick={() => commitMove(promotionChoice.from, promotionChoice.to, piece)}
              >
                {PROMOTION_LABELS[piece]}
              </Button>
            ))}
          </div>
        )}

        {/* White player card */}
        <div
          className={cn(
            "bg-card border-border flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-all duration-300",
            currentTurn === "white" && isGameActive && "ring-cherry/50 ring-2",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="border-border bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full border text-sm font-medium">
              YO
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">You</span>
              <span className="text-muted-foreground text-xs">
                {isPlayerTurn && isGameActive ? "Your turn" : "Waiting..."}
              </span>
            </div>
          </div>
          <div className="flex min-w-[60px] items-center gap-0.5">
            {capturedByWhite.slice(0, 8).map((piece, i) => (
              <div key={i} className="size-4 opacity-60">
                <ChessPieceSvg type={piece.type} color={piece.color} className="size-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="bg-card border-border flex items-center justify-center gap-2 rounded-lg border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewGame}
            className="h-auto flex-col gap-1 px-3 py-2"
          >
            <Plus className="size-5" />
            <span className="text-xs font-normal">New Game</span>
          </Button>
          {isGameActive && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResign}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-auto flex-col gap-1 px-3 py-2"
              >
                <Flag className="size-5" />
                <span className="text-xs font-normal">Resign</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOfferDraw}
                className="h-auto flex-col gap-1 px-3 py-2"
              >
                <Handshake className="size-5" />
                <span className="text-xs font-normal">Draw</span>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFlipped((f) => !f)}
            className="h-auto flex-col gap-1 px-3 py-2"
          >
            <RotateCcw className="size-5" />
            <span className="text-xs font-normal">Flip</span>
          </Button>
        </div>

        {/* Move History */}
        {movePairs.length > 0 && (
          <div className="bg-card border-border rounded-lg border p-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-[0.18em]">
              Move History
            </p>
            <div className="scrollbar-thin max-h-36 overflow-y-auto">
              <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
                {movePairs.map((pair) => (
                  <div key={pair.number} className="contents">
                    <span className="text-muted-foreground font-mono text-xs">
                      {pair.number}.
                    </span>
                    <span className="text-foreground font-mono">{pair.white}</span>
                    <span className="text-foreground font-mono">
                      {pair.black ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border-border rounded-xl border p-6 text-center shadow-lg"
          >
            <h2 className="text-foreground text-xl font-semibold">{gameOver.title}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{gameOver.subtitle}</p>
            <Button
              onClick={handleNewGame}
              className="bg-cherry hover:bg-cherry-dark mt-4 text-white"
            >
              <Plus className="mr-2 size-4" />
              New Game
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
