"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Copy,
  Flag,
  Handshake,
  Loader2,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Square as ChessSquare, PieceSymbol } from "chess.js";

import { CherryLogo } from "@/components/auth/cherry-logo";
import { Button } from "@/components/ui/button";
import {
  coordsToSquare,
  findKingSquare,
  getBoardMatrix,
  squareToCoords,
  type BoardCell,
  type PromotionPiece,
} from "@/features/chess";
import {
  finishGameAction,
  persistMoveAction,
} from "@/features/game/actions";
import {
  GameOverModal,
  type GameOverState,
} from "@/features/game/components/game-over-modal";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useHearts } from "@/hooks/use-hearts";
import { useStockfish } from "@/hooks/useStockfish";
import { BOT_DISPLAY_NAME, BOT_PLAYER_ID } from "@/lib/db/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import type { GameResult, GameStatus } from "@/types/database";
import { useChessStore } from "@/stores/chess-store";
import { useI18n } from "@/providers/i18n-provider";
import type { GameState } from "@/features/chess";
import {
  parseDifficultyLevel,
  STOCKFISH_DEFAULT_LEVEL,
  STOCKFISH_DIFFICULTY_LEVELS,
  STOCKFISH_DIFFICULTY_SETTINGS,
  type StockfishDifficultyLevel,
  type StockfishEvaluation,
} from "@/utils/chess/stockfish";

// UI piece types (SVG rendering)
type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
type PieceColor = "white" | "black";
type Piece = { type: PieceType; color: PieceColor };

const PIECE_SYMBOL_MAP: Record<PieceSymbol, PieceType> = {
  k: "K",
  q: "Q",
  r: "R",
  b: "B",
  n: "N",
  p: "P",
};

function toUIPiece(cell: BoardCell): Piece | null {
  if (!cell) return null;
  return {
    type: PIECE_SYMBOL_MAP[cell.type],
    color: cell.color === "w" ? "white" : "black",
  };
}

function turnToColor(turn: "w" | "b"): PieceColor {
  return turn === "w" ? "white" : "black";
}

// Chess piece SVG components
const ChessPiece = ({
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
        <g
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22.5 11.63V6M20 8h5" />
          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
          <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" />
        </g>
      </svg>
    ),
    Q: (
      <svg viewBox="0 0 45 45" className={className}>
        <g
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="12" r="2.75" />
          <circle cx="14" cy="9" r="2.75" />
          <circle cx="22.5" cy="8" r="2.75" />
          <circle cx="31" cy="9" r="2.75" />
          <circle cx="39" cy="12" r="2.75" />
          <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-7-5.5 9.5-5.5-9.5-3.5 7-7.5-12.5L9 26z" />
          <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
          <path
            d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"
            fill="none"
          />
        </g>
      </svg>
    ),
    R: (
      <svg viewBox="0 0 45 45" className={className}>
        <g
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
        <g
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g fillRule="evenodd">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <circle cx="22.5" cy="8" r="2.5" />
          </g>
          <path
            d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"
            fill="none"
            stroke={stroke}
            strokeLinejoin="miter"
          />
        </g>
      </svg>
    ),
    N: (
      <svg viewBox="0 0 45 45" className={className}>
        <g
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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

const PlayerCard = ({
  name,
  rating,
  time,
  isActive,
  capturedPieces,
  isLowTime,
  statusText,
}: {
  name: string;
  rating: number;
  time: string;
  isActive: boolean;
  capturedPieces: Piece[];
  isLowTime: boolean;
  statusText?: string;
}) => (
  <div
    className={cn(
      "bg-card border-border flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-all duration-300",
      isActive && "ring-cherry/50 ring-2",
    )}
  >
    <div className="flex items-center gap-3">
      <div className="border-border bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full border text-sm font-medium">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex flex-col">
        <span className="text-foreground text-sm font-medium">{name}</span>
        <span className="text-muted-foreground text-xs">
          {rating}
          {statusText ? ` • ${statusText}` : ""}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex min-w-[60px] items-center gap-0.5">
        {capturedPieces.slice(0, 5).map((piece, i) => (
          <div key={i} className="size-4 opacity-60">
            <ChessPiece type={piece.type} color={piece.color} className="size-full" />
          </div>
        ))}
        {capturedPieces.length > 5 && (
          <span className="text-muted-foreground ml-1 text-xs">
            +{capturedPieces.length - 5}
          </span>
        )}
      </div>

      <div
        className={cn(
          "bg-secondary min-w-[72px] rounded-md px-3 py-1.5 text-center font-mono text-lg font-semibold tabular-nums transition-all",
          isLowTime
            ? "text-primary animate-pulse"
            : "text-foreground dark:text-foreground dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]",
        )}
      >
        {time}
      </div>
    </div>
  </div>
);

const ControlButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={cn(
      "h-auto flex-col gap-1 px-3 py-2",
      variant === "destructive" &&
        "text-destructive hover:text-destructive hover:bg-destructive/10",
    )}
  >
    <Icon className="size-5" />
    <span className="text-xs font-normal">{label}</span>
  </Button>
);

const PROMOTION_LABELS: Record<PromotionPiece, string> = {
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
};

const AI_MOVE_DELAY_MS = {
  min: 300,
  max: 500,
};

function getAiMoveDelay(): number {
  return Math.floor(
    AI_MOVE_DELAY_MS.min +
      Math.random() * (AI_MOVE_DELAY_MS.max - AI_MOVE_DELAY_MS.min),
  );
}

function getEvaluationFill(evaluation: StockfishEvaluation | null): number {
  if (!evaluation) return 50;

  if (evaluation.kind === "mate") {
    return evaluation.normalized > 0 ? 100 : 0;
  }

  const bounded = Math.max(-500, Math.min(500, evaluation.normalized));
  return Math.max(0, Math.min(100, 50 + bounded / 10));
}

function getEvaluationLabel(evaluation: StockfishEvaluation | null): string {
  if (!evaluation) return "Eval 0.0";
  return `Eval ${evaluation.display}`;
}

export type CherryChessboardProps = {
  gameId: string;
  userId: string;
  whitePlayerId: string;
  blackPlayerId: string | null;
  playerColor: "white" | "black" | null;
  role: "player" | "spectator";
  mode: "ai" | "multiplayer";
  roomStatus: GameStatus;
  roomUrl: string;
  initialFen?: string;
  initialPgn?: string;
  initialWhiteTimeMs?: number;
  initialBlackTimeMs?: number;
  userElo?: number;
  opponentElo?: number;
  onNewGame?: () => void;
};

export default function CherryChessboard({
  gameId,
  userId,
  whitePlayerId,
  blackPlayerId,
  playerColor,
  role,
  mode,
  roomStatus,
  roomUrl,
  initialFen,
  initialPgn,
  initialWhiteTimeMs = 600_000,
  initialBlackTimeMs = 600_000,
  userElo = 1200,
  opponentElo = 2850,
  onNewGame,
}: CherryChessboardProps) {
  const router = useRouter();
  const { gameState, makeMove, reset, loadFen, loadPgn, getLegalMoves, engine } =
    useChessStore();
  const { t } = useI18n();

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
  const [legalTargets, setLegalTargets] = useState<ChessSquare[]>([]);
  const [isFlipped, setIsFlipped] = useState(playerColor === "black");
  const [draggedFrom, setDraggedFrom] = useState<ChessSquare | null>(null);
  const [promotionChoice, setPromotionChoice] = useState<{
    from: ChessSquare;
    to: ChessSquare;
    options: PromotionPiece[];
  } | null>(null);
  const [liveRoomStatus, setLiveRoomStatus] = useState<GameStatus>(roomStatus);
  const [liveBlackPlayerId, setLiveBlackPlayerId] = useState<string | null>(
    blackPlayerId,
  );
  const [whiteTimeMs, setWhiteTimeMs] = useState(initialWhiteTimeMs);
  const [blackTimeMs, setBlackTimeMs] = useState(initialBlackTimeMs);
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [gameOver, setGameOver] = useState<GameOverState | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [hasDbFinished, setHasDbFinished] = useState(false);
  const [aiLevel, setAiLevel] = useState<StockfishDifficultyLevel>(
    STOCKFISH_DEFAULT_LEVEL,
  );
  const [rematchState, setRematchState] = useState<
    "idle" | "requested" | "received" | "starting"
  >("idle");
  const [isCopyingRoomUrl, setIsCopyingRoomUrl] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [captureSquare, setCaptureSquare] = useState<ChessSquare | null>(null);
  const [showHeartLossModal, setShowHeartLossModal] = useState(false);

  const aiMoveTokenRef = useRef(0);
  const aiDelayTimeoutRef = useRef<number | null>(null);
  const captureHighlightTimeoutRef = useRef<number | null>(null);
  const disconnectForfeitHandledRef = useRef(false);
  const {
    status: stockfishStatus,
    isThinking: isAiThinking,
    evaluation: aiEvaluation,
    error: stockfishError,
    getBestMove,
    stop: stopStockfish,
    resetEvaluation,
  } = useStockfish();
  const { hearts, maxHearts, isPremium, consumeHeart } = useHearts();

  const currentTurn = turnToColor(gameState.turn);
  const whitePlayerName =
    whitePlayerId === userId
      ? "You"
      : whitePlayerId === BOT_PLAYER_ID
        ? BOT_DISPLAY_NAME
        : "Opponent";
  const blackPlayerName =
    !liveBlackPlayerId
      ? "Waiting..."
      : liveBlackPlayerId === userId
      ? "You"
      : liveBlackPlayerId === BOT_PLAYER_ID
        ? BOT_DISPLAY_NAME
        : "Opponent";
  const whitePlayerRating = playerColor === "black" ? opponentElo : userElo;
  const blackPlayerRating = playerColor === "black" ? userElo : opponentElo;
  const aiColor = mode === "ai" ? "black" : null;
  const isAiMatch = mode === "ai";
  const isWaitingRoom = mode === "multiplayer" && liveRoomStatus === "waiting";
  const isPlayerTurn =
    role === "player" && playerColor !== null && currentTurn === playerColor;
  const isGameActive =
    liveRoomStatus === "active" &&
    !gameState.isGameOver &&
    !gameOver &&
    !hasDbFinished &&
    !isFinishing;
  const isInteractive =
    role === "player" && isGameActive && isPlayerTurn && !isAiThinking;
  const evaluationFill = useMemo(
    () => getEvaluationFill(aiEvaluation),
    [aiEvaluation],
  );
  const activeAiDifficulty = STOCKFISH_DIFFICULTY_SETTINGS[aiLevel];
  const aiStatusText = stockfishError
    ? "Engine unavailable"
    : isAiThinking
      ? "Thinking..."
      : stockfishStatus === "loading"
        ? "Loading engine..."
        : `Level ${aiLevel}`;

  const boardMatrix = getBoardMatrix(engine.getChess());
  const uiBoard = boardMatrix.map((row) => row.map(toUIPiece));

  const kingInCheckSquare = gameState.isCheck
    ? findKingSquare(engine.getChess(), gameState.turn)
    : null;

  const lastMoveCoords = useMemo(() => {
    if (!gameState.lastMove) return null;
    return {
      from: squareToCoords(gameState.lastMove.from),
      to: squareToCoords(gameState.lastMove.to),
    };
  }, [gameState.lastMove]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isGameActive) return;
      if (gameState.turn === "w") {
        setWhiteTimeMs((timeLeft) => Math.max(0, timeLeft - 1000));
      } else {
        setBlackTimeMs((timeLeft) => Math.max(0, timeLeft - 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.turn, isGameActive]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

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

  const playSoundCue = useCallback(
    (cue: "move" | "capture" | "check" | "game-over") => {
      if (!soundEnabled) return;
      void cue;
      // Future premium sound pack hook: route this cue to Web Audio assets.
    },
    [soundEnabled],
  );

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

  useEffect(() => {
    if (initialPgn) {
      loadPgn(initialPgn);
    } else if (initialFen) {
      loadFen(initialFen);
    }
    setLiveRoomStatus(roomStatus);
    setLiveBlackPlayerId(blackPlayerId);
    setWhiteTimeMs(initialWhiteTimeMs);
    setBlackTimeMs(initialBlackTimeMs);
  }, [
    blackPlayerId,
    gameId,
    initialBlackTimeMs,
    initialFen,
    initialPgn,
    initialWhiteTimeMs,
    loadFen,
    loadPgn,
    roomStatus,
  ]);

  const resolvePlayerId = useCallback(
    (color: "w" | "b") => (color === "w" ? whitePlayerId : liveBlackPlayerId ?? ""),
    [whitePlayerId, liveBlackPlayerId],
  );

  const finishGameOnServer = useCallback(
    async (result: GameResult, winnerId: string | null, state: GameState) => {
      if (hasDbFinished) return;
      setIsFinishing(true);
      setSyncError(null);

      const response = await finishGameAction({
        gameId,
        result,
        winnerId,
      });

      setIsFinishing(false);

      if (!response.ok) {
        setSyncError(response.error);
        return;
      }

      setHasDbFinished(true);
      setLiveRoomStatus("finished");

      if (mode === "ai" && winnerId && winnerId !== userId && result !== "draw") {
        consumeHeart();
        setShowHeartLossModal(true);
      }

      const userEloChange =
        playerColor === "white" ? response.data.whiteElo : response.data.blackElo;

      let title = "Game over";
      let subtitle = "Well played.";

      if (state.isCheckmate) {
        const winner =
          result === "white"
            ? "White"
            : result === "black"
              ? "Black"
              : "Nobody";
        title = "Checkmate";
        subtitle = `${winner} wins.`;
      } else if (state.isStalemate) {
        title = "Stalemate";
        subtitle = "The game is drawn.";
      } else if (result === "draw") {
        title = "Draw";
        subtitle = "Agreement or dead position.";
      } else if (winnerId === userId) {
        title = "Victory";
        subtitle = "You won the game.";
      } else {
        title = "Defeat";
        subtitle = "Better luck next time.";
      }

      setGameOver({
        result,
        title,
        subtitle,
        pgn: state.pgn,
        userElo: userEloChange
          ? {
              previous: userEloChange.previous,
              next: userEloChange.next,
              delta: userEloChange.delta,
            }
          : null,
      });
    },
    [consumeHeart, gameId, hasDbFinished, mode, playerColor, userId],
  );

  const handleEngineGameOver = useCallback(
    async (state: GameState) => {
      if (state.isCheckmate) {
        const result: GameResult = state.turn === "w" ? "black" : "white";
        const winnerId = result === "white" ? whitePlayerId : liveBlackPlayerId;
        if (!winnerId) return;
        await finishGameOnServer(result, winnerId, state);
        return;
      }

      if (state.isStalemate || state.isDraw) {
        await finishGameOnServer("draw", null, state);
      }
    },
    [finishGameOnServer, whitePlayerId, liveBlackPlayerId],
  );

  const persistMoveToDb = useCallback(
    async (
      state: GameState,
      notation: string,
      moverColor: "w" | "b",
    ) => {
      setIsSyncing(true);
      setSyncError(null);

      const playerId = resolvePlayerId(moverColor);
      const moveNumber = state.history.length;

      const response = await persistMoveAction({
        gameId,
        pgn: state.pgn,
        fen: state.fen,
        nextMoveNumber: moveNumber,
        notation,
        playerId,
        whiteTimeMs,
        blackTimeMs,
      });

      setIsSyncing(false);

      if (!response.ok) {
        setSyncError(response.error);
        return false;
      }

      return true;
    },
    [blackTimeMs, gameId, resolvePlayerId, whiteTimeMs],
  );

  const formatTime = (timeMs: number) => {
    const totalSeconds = Math.ceil(timeMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRemoteMove = useCallback(
    (payload: {
      playerId: string;
      moveNumber: number;
      pgn: string;
      whiteTimeMs: number;
      blackTimeMs: number;
    }) => {
      if (payload.playerId === userId) return;
      if (payload.moveNumber <= gameState.history.length) return;

      loadPgn(payload.pgn);
      setWhiteTimeMs(payload.whiteTimeMs);
      setBlackTimeMs(payload.blackTimeMs);
    },
    [gameState.history.length, loadPgn, userId],
  );

  const handleRemoteClock = useCallback(
    (payload: {
      playerId: string;
      whiteTimeMs: number;
      blackTimeMs: number;
    }) => {
      if (payload.playerId === userId) return;
      setWhiteTimeMs(payload.whiteTimeMs);
      setBlackTimeMs(payload.blackTimeMs);
    },
    [userId],
  );

  const handleRemoteRematch = useCallback(
    (payload: { type: "requested" | "created"; requesterId: string; gameId?: string }) => {
      if (payload.type === "requested") {
        if (payload.requesterId !== userId) {
          setRematchState("received");
        }
        return;
      }

      setRematchState("starting");
      router.push(`/play/${payload.gameId}`);
    },
    [router, userId],
  );

  const handleGameUpdate = useCallback(
    (row: {
      current_fen?: string;
      pgn?: string;
      status?: GameStatus;
      black_player_id?: string | null;
      white_time_ms?: number;
      black_time_ms?: number;
      rematch_requested_by?: string | null;
      rematch_game_id?: string | null;
    }) => {
      if (row.status) {
        setLiveRoomStatus(row.status);
        if (row.status === "finished") {
          setHasDbFinished(true);
        }
      }

      if (typeof row.black_player_id !== "undefined") {
        setLiveBlackPlayerId(row.black_player_id);
      }

      if (typeof row.white_time_ms === "number") {
        setWhiteTimeMs(row.white_time_ms);
      }

      if (typeof row.black_time_ms === "number") {
        setBlackTimeMs(row.black_time_ms);
      }

      if (row.pgn && row.status === "active" && row.pgn !== gameState.pgn) {
        loadPgn(row.pgn);
      } else if (row.current_fen && row.status === "active" && row.current_fen !== gameState.fen) {
        loadFen(row.current_fen);
      }

      if (row.rematch_game_id) {
        setRematchState("starting");
        router.push(`/play/${row.rematch_game_id}`);
      } else if (row.rematch_requested_by && row.rematch_requested_by !== userId) {
        setRematchState("received");
      }
    },
    [gameState.fen, gameState.pgn, loadFen, loadPgn, router, userId],
  );

  const {
    channelState,
    notifications,
    opponentOnline,
    disconnectCountdownMs,
    shareUrl,
    broadcastMove,
    broadcastClock,
    requestRematch,
    clearNotification,
  } = useMultiplayer({
    enabled: mode === "multiplayer",
    gameId,
    userId,
    role,
    playerColor,
    whitePlayerId,
    blackPlayerId: liveBlackPlayerId,
    gameStatus: liveRoomStatus,
    onRemoteMove: handleRemoteMove,
    onRemoteClock: handleRemoteClock,
    onRemoteRematch: handleRemoteRematch,
    onGameUpdated: handleGameUpdate,
  });

  const disconnectLabel =
    disconnectCountdownMs !== null
      ? `${Math.ceil(disconnectCountdownMs / 1000)}s to forfeit`
      : "Offline";
  const multiplayerStatusText =
    role === "spectator"
      ? "Spectating"
      : isWaitingRoom
        ? "Waiting for opponent"
        : opponentOnline
          ? channelState === "ready"
            ? "Online"
            : "Connecting..."
          : disconnectLabel;

  useEffect(() => {
    if (
      mode !== "multiplayer" ||
      role !== "player" ||
      !playerColor ||
      liveRoomStatus !== "active"
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      if (turnToColor(gameState.turn) !== playerColor) {
        return;
      }

      void broadcastClock({
        gameId,
        playerId: userId,
        whiteTimeMs,
        blackTimeMs,
        turn: playerColor,
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    blackTimeMs,
    broadcastClock,
    gameId,
    gameState.turn,
    liveRoomStatus,
    mode,
    playerColor,
    role,
    userId,
    whiteTimeMs,
  ]);

  useEffect(() => {
    if (
      mode !== "multiplayer" ||
      role !== "player" ||
      !playerColor ||
      opponentOnline ||
      disconnectCountdownMs !== 0 ||
      disconnectForfeitHandledRef.current ||
      !isGameActive
    ) {
      return;
    }

    disconnectForfeitHandledRef.current = true;
    void finishGameOnServer(playerColor, userId, gameState);
  }, [
    disconnectCountdownMs,
    finishGameOnServer,
    gameState,
    isGameActive,
    mode,
    opponentOnline,
    playerColor,
    role,
    userId,
  ]);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalTargets([]);
  }, []);

  const selectSquare = useCallback(
    (square: ChessSquare) => {
      const moves = getLegalMoves(square);
      setSelectedSquare(square);
      setLegalTargets(moves.map((m) => m.to));
    },
    [getLegalMoves],
  );

  const commitMove = useCallback(
    async (from: ChessSquare, to: ChessSquare, promotion?: PromotionPiece) => {
      const result = makeMove({ from, to, promotion });
      if (!result.ok) return false;

      if (result.move.flags.isCapture && result.move.captured) {
        const victim: Piece = {
          type: PIECE_SYMBOL_MAP[result.move.captured],
          color: result.move.color === "w" ? "black" : "white",
        };
        if (result.move.color === "w") {
          setCapturedByWhite((prev) => [...prev, victim]);
        } else {
          setCapturedByBlack((prev) => [...prev, victim]);
        }
        flashCaptureSquare(to);
        playSoundCue("capture");
      } else {
        playSoundCue("move");
      }

      clearSelection();
      setPromotionChoice(null);
      setDraggedFrom(null);

      const saved = await persistMoveToDb(
        result.state,
        result.move.san,
        result.move.color,
      );
      if (!saved) return false;

      if (mode === "multiplayer") {
        await broadcastMove({
          gameId,
          playerId: resolvePlayerId(result.move.color),
          moveNumber: result.state.history.length,
          notation: result.move.san,
          fen: result.state.fen,
          pgn: result.state.pgn,
          whiteTimeMs,
          blackTimeMs,
        });
      }

      if (result.state.isGameOver) {
        playSoundCue("game-over");
        await handleEngineGameOver(result.state);
      } else if (result.state.isCheck) {
        playSoundCue("check");
      }

      return true;
    },
    [
      makeMove,
      clearSelection,
      persistMoveToDb,
      mode,
      broadcastMove,
      gameId,
      resolvePlayerId,
      whiteTimeMs,
      blackTimeMs,
      handleEngineGameOver,
      flashCaptureSquare,
      playSoundCue,
    ],
  );

  useEffect(() => {
    if (
      !isAiMatch ||
      !aiColor ||
      currentTurn !== aiColor ||
      gameState.isGameOver ||
      gameOver ||
      hasDbFinished ||
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

        if (cancelled || aiMoveTokenRef.current !== requestToken) {
          return;
        }

        aiDelayTimeoutRef.current = window.setTimeout(() => {
          aiDelayTimeoutRef.current = null;

          if (cancelled || aiMoveTokenRef.current !== requestToken) {
            return;
          }

          void commitMove(
            result.move.from,
            result.move.to,
            result.move.promotion,
          );
        }, getAiMoveDelay());
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : "Stockfish could not calculate a move.";

        if (
          message !== "Stockfish search stopped" &&
          message !== "Stockfish worker terminated"
        ) {
          setSyncError(message);
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
    hasDbFinished,
    isAiMatch,
    promotionChoice,
    stopStockfish,
  ]);

  const attemptMove = useCallback(
    (from: ChessSquare, to: ChessSquare) => {
      if (!isInteractive) return;

      const candidates = getLegalMoves(from).filter((m) => m.to === to);
      if (candidates.length === 0) return;

      const promotions = candidates.filter((m) => m.flags.isPromotion);
      if (promotions.length > 1) {
        const options = promotions
          .map((m) => m.promotion)
          .filter((p): p is PromotionPiece => p !== undefined);
        setPromotionChoice({ from, to, options });
        return;
      }

      const promotion = candidates[0]?.promotion;
      void commitMove(from, to, promotion);
    },
    [commitMove, getLegalMoves, isInteractive],
  );

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (!isInteractive) return;

      const square = coordsToSquare(row, col);
      const cell = boardMatrix[row][col];
      const uiPiece = toUIPiece(cell);

      if (selectedSquare && legalTargets.includes(square)) {
        attemptMove(selectedSquare, square);
        return;
      }

      if (uiPiece && uiPiece.color === currentTurn) {
        selectSquare(square);
        return;
      }

      clearSelection();
    },
    [
      attemptMove,
      boardMatrix,
      clearSelection,
      currentTurn,
      isInteractive,
      legalTargets,
      selectSquare,
      selectedSquare,
    ],
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
      if (!isInteractive) return;

      const square = coordsToSquare(row, col);
      const cell = boardMatrix[row][col];
      const uiPiece = toUIPiece(cell);

      if (uiPiece && uiPiece.color === currentTurn) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", square);
        setDraggedFrom(square);
        selectSquare(square);
      }
    },
    [boardMatrix, currentTurn, isInteractive, selectSquare],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedFrom(null);
  }, []);

  const handleDrop = useCallback(
    (row: number, col: number) => {
      if (!draggedFrom || !isInteractive) return;
      const to = coordsToSquare(row, col);
      if (legalTargets.includes(to)) {
        attemptMove(draggedFrom, to);
      } else {
        clearSelection();
      }
      setDraggedFrom(null);
    },
    [
      attemptMove,
      clearSelection,
      draggedFrom,
      isInteractive,
      legalTargets,
    ],
  );

  const handleResign = useCallback(async () => {
    if (!isGameActive || role !== "player" || !playerColor) return;
    const result: GameResult = playerColor === "white" ? "black" : "white";
    const winnerId = playerColor === "white" ? liveBlackPlayerId : whitePlayerId;
    if (!winnerId) return;
    await finishGameOnServer(result, winnerId, gameState);
  }, [
    isGameActive,
    playerColor,
    liveBlackPlayerId,
    whitePlayerId,
    finishGameOnServer,
    gameState,
    role,
  ]);

  const handleOfferDraw = useCallback(async () => {
    if (!isGameActive || role !== "player") return;
    await finishGameOnServer("draw", null, gameState);
  }, [finishGameOnServer, gameState, isGameActive, role]);

  const handleNewGame = useCallback(() => {
    aiMoveTokenRef.current += 1;
    disconnectForfeitHandledRef.current = false;
    if (aiDelayTimeoutRef.current !== null) {
      window.clearTimeout(aiDelayTimeoutRef.current);
      aiDelayTimeoutRef.current = null;
    }
    stopStockfish();
    resetEvaluation();
    setGameOver(null);
    setHasDbFinished(false);
    setSyncError(null);
    reset();
    clearSelection();
    setPromotionChoice(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setCaptureSquare(null);
    setShowHeartLossModal(false);
    setWhiteTimeMs(initialWhiteTimeMs);
    setBlackTimeMs(initialBlackTimeMs);
    setLiveRoomStatus(roomStatus);
    setLiveBlackPlayerId(blackPlayerId);
    setRematchState("idle");
    onNewGame?.();
  }, [
    blackPlayerId,
    clearSelection,
    initialBlackTimeMs,
    initialWhiteTimeMs,
    onNewGame,
    reset,
    resetEvaluation,
    roomStatus,
    stopStockfish,
  ]);

  const handleCopyRoomUrl = useCallback(async () => {
    const urlToCopy =
      shareUrl ??
      (typeof window !== "undefined" ? `${window.location.origin}${roomUrl}` : roomUrl);
    setIsCopyingRoomUrl(true);
    await navigator.clipboard.writeText(urlToCopy);
    window.setTimeout(() => setIsCopyingRoomUrl(false), 1200);
  }, [roomUrl, shareUrl]);

  const handleRequestRematch = useCallback(async () => {
    setRematchState("starting");
    const result = await requestRematch();
    if (!result) {
      setRematchState("idle");
      return;
    }

    if (result.type === "requested") {
      setRematchState("requested");
      return;
    }

    router.push(`/play/${result.gameId}`);
  }, [requestRematch, router]);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const renderBoard = () => {
    const displayBoard = isFlipped
      ? [...uiBoard].reverse().map((row) => [...row].reverse())
      : uiBoard;
    const displayFiles = isFlipped ? [...files].reverse() : files;
    const displayRanks = isFlipped ? [...ranks].reverse() : ranks;

    return (
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

        <div className="border-border grid grid-cols-8 overflow-hidden rounded-lg border shadow-lg shadow-black/10 dark:shadow-black/40">
          {displayBoard.map((row, rowIdx) =>
            row.map((piece, colIdx) => {
              const actualRow = isFlipped ? 7 - rowIdx : rowIdx;
              const actualCol = isFlipped ? 7 - colIdx : colIdx;
              const square = coordsToSquare(actualRow, actualCol);
              const isLight = (rowIdx + colIdx) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isLegalTarget = legalTargets.includes(square);
              const isLastMoveSquare =
                lastMoveCoords &&
                ((lastMoveCoords.from.row === actualRow &&
                  lastMoveCoords.from.col === actualCol) ||
                  (lastMoveCoords.to.row === actualRow &&
                    lastMoveCoords.to.col === actualCol));
              const isKingInCheckSquare =
                kingInCheckSquare === square;
              const isDragging =
                draggedFrom === square;
              const hasEnemy = Boolean(piece && isLegalTarget);
              const isCaptureSquare = captureSquare === square;

              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  layout
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className={cn(
                    "relative flex aspect-square cursor-pointer items-center justify-center transition-all duration-200",
                    isLight ? "bg-board-light" : "bg-board-dark",
                    isSelected && "ring-primary ring-2 ring-inset brightness-105",
                    isLastMoveSquare && "bg-board-last-move",
                    isKingInCheckSquare && "check-glow",
                    isCaptureSquare &&
                      "ring-cherry/80 bg-cherry/25 ring-4 ring-inset",
                    !isInteractive && "cursor-not-allowed opacity-90",
                  )}
                  onClick={() => handleSquareClick(actualRow, actualCol)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(actualRow, actualCol)}
                >
                  {isLegalTarget && !hasEnemy && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="bg-board-legal-move/80 size-3 rounded-full shadow-[0_0_18px_rgba(220,38,38,0.38)]" />
                    </div>
                  )}

                  {hasEnemy && (
                    <div className="ring-board-highlight/70 pointer-events-none absolute inset-1 rounded-full ring-2 shadow-[inset_0_0_18px_rgba(220,38,38,0.28)]" />
                  )}

                  {piece && (
                    <motion.div
                      layout
                      whileHover={
                        isInteractive && piece.color === currentTurn
                          ? { scale: 1.08 }
                          : undefined
                      }
                      whileTap={
                        isInteractive && piece.color === currentTurn
                          ? { scale: 0.96 }
                          : undefined
                      }
                      draggable={isInteractive && piece.color === currentTurn}
                      onDragStartCapture={(event) =>
                        handleDragStart(event, actualRow, actualCol)
                      }
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "h-[80%] w-[80%] transform-gpu transition-[opacity,filter] duration-150 select-none will-change-transform",
                        piece.color === currentTurn &&
                          "cursor-grab active:cursor-grabbing",
                        isDragging && "opacity-35 blur-[0.5px]",
                      )}
                    >
                      <ChessPiece
                        type={piece.type}
                        color={piece.color}
                        className="size-full drop-shadow-md"
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            }),
          )}
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="bg-background flex min-h-screen items-center justify-center p-4 md:p-8"
    >
      <div className="flex w-full max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CherryLogo href="/" size="sm" variant="inline" />
            {isSyncing ? (
              <span className="text-muted text-xs">Saving…</span>
            ) : null}
            {gameState.isCheck && !gameState.isGameOver && (
              <span className="text-destructive text-xs font-medium uppercase">
                {t("check")}!
              </span>
            )}
            {gameState.isCheckmate && (
              <span className="text-destructive text-xs font-medium uppercase">
                {t("checkmate")}
              </span>
            )}
            {gameState.isStalemate && (
              <span className="text-muted-foreground text-xs font-medium uppercase">
                {t("stalemate")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled((value) => !value)}
              className="size-9 p-0"
              aria-label={soundEnabled ? "Disable sound effects" : "Enable sound effects"}
            >
              {soundEnabled ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDark((d) => !d)}
              className="size-9 p-0"
              aria-label={isDark ? "Use light theme" : "Use dark theme"}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </div>

        {syncError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            {syncError}
          </p>
        ) : null}

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => clearNotification(notification.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-sm",
                  notification.tone === "warning" &&
                    "border-amber-400/40 bg-amber-500/10 text-amber-100",
                  notification.tone === "success" &&
                    "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
                  notification.tone === "info" &&
                    "border-white/10 bg-white/5 text-white/70",
                )}
              >
                {notification.message}
              </button>
            ))}
          </div>
        ) : null}

        {isAiMatch ? (
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
                    Stockfish {activeAiDifficulty.label} • Depth{" "}
                    {activeAiDifficulty.depth}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground uppercase tracking-[0.18em]">
                  Difficulty
                </span>
                <select
                  value={aiLevel}
                  onChange={(event) =>
                    setAiLevel(parseDifficultyLevel(event.target.value))
                  }
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
                <span className="text-muted-foreground">
                  {getEvaluationLabel(aiEvaluation)}
                </span>
                <span className="text-muted-foreground">White</span>
              </div>
              <div className="border-border bg-background mt-3 grid gap-2 rounded-xl border p-3 text-xs sm:grid-cols-2">
                <span className="text-muted-foreground">
                  Reward: +{activeAiDifficulty.rewardCoins} coins / +
                  {activeAiDifficulty.rewardElo} ELO
                </span>
                <span className="text-muted-foreground sm:text-right">
                  {isPremium ? "Infinite hearts" : `${hearts}/${maxHearts} hearts`}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {mode === "multiplayer" ? (
          <div className="rounded-[22px] border border-white/10 bg-[#14070a] p-4 text-white shadow-xl shadow-black/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-cherry/15 flex size-11 items-center justify-center rounded-2xl">
                  {channelState === "connecting" ? (
                    <Loader2 className="text-cherry size-5 animate-spin" />
                  ) : (
                    <Users className="text-cherry size-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {role === "spectator" ? "Spectator mode" : "Multiplayer room"}
                  </p>
                  <p className="text-xs text-white/55">
                    {isWaitingRoom
                      ? "Room is live and waiting for a second player."
                      : opponentOnline
                        ? "Realtime sync is active."
                        : "Opponent connection is currently offline."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  {multiplayerStatusText}
                </span>
                <Button variant="secondary" size="sm" onClick={() => void handleCopyRoomUrl()}>
                  <Copy className="size-4" />
                  {isCopyingRoomUrl ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>

            {disconnectCountdownMs !== null && !opponentOnline && liveRoomStatus === "active" ? (
              <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Opponent disconnected. If they do not return in{" "}
                {Math.ceil(disconnectCountdownMs / 1000)} seconds, the game will be
                forfeited automatically.
              </div>
            ) : null}
          </div>
        ) : null}

        <PlayerCard
          name={blackPlayerName}
          rating={blackPlayerRating}
          time={formatTime(blackTimeMs)}
          isActive={currentTurn === "black" && isGameActive}
          capturedPieces={capturedByWhite}
          isLowTime={blackTimeMs < 10_000}
          statusText={
            aiColor === "black"
              ? aiStatusText
              : mode === "multiplayer" && playerColor !== "black"
                ? multiplayerStatusText
                : undefined
          }
        />

        <div className="px-6 py-2">{renderBoard()}</div>

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
                onClick={() =>
                  void commitMove(
                    promotionChoice.from,
                    promotionChoice.to,
                    piece,
                  )
                }
              >
                {PROMOTION_LABELS[piece]}
              </Button>
            ))}
          </div>
        )}

        <PlayerCard
          name={whitePlayerName}
          rating={whitePlayerRating}
          time={formatTime(whiteTimeMs)}
          isActive={currentTurn === "white" && isGameActive}
          capturedPieces={capturedByBlack}
          isLowTime={whiteTimeMs < 10_000}
          statusText={
            mode === "multiplayer" && playerColor !== "white"
              ? multiplayerStatusText
              : undefined
          }
        />

        <div className="bg-card border-border flex items-center justify-center gap-2 rounded-lg border p-2">
          {role === "player" && liveRoomStatus === "active" ? (
            <>
              <ControlButton
              icon={Flag}
              label={t("resign")}
                onClick={() => void handleResign()}
                variant="destructive"
              />
              <ControlButton
                icon={Handshake}
                label={t("draw")}
                onClick={() => void handleOfferDraw()}
              />
            </>
          ) : null}
          {mode === "multiplayer" ? (
            <ControlButton
              icon={Copy}
              label={isCopyingRoomUrl ? t("copied") : t("invite")}
              onClick={() => void handleCopyRoomUrl()}
            />
          ) : null}
          <ControlButton
            icon={RotateCcw}
            label={t("flip")}
            onClick={() => setIsFlipped((f) => !f)}
          />
          <ControlButton icon={LogOut} label={t("signOut")} onClick={handleSignOut} />
        </div>

        {gameOver ? (
          <GameOverModal
            state={gameOver}
            onNewGame={handleNewGame}
            loading={isFinishing}
            showRematch={mode === "multiplayer" && role === "player"}
            onRematch={() => void handleRequestRematch()}
            rematchLoading={rematchState === "starting"}
            rematchStatus={rematchState}
          />
        ) : null}

        {showHeartLossModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="border-border bg-card w-full max-w-sm rounded-xl border p-6 shadow-2xl">
              <h2 className="text-xl font-semibold tracking-tight">
                One heart consumed
              </h2>
              <p className="text-muted mt-2 text-sm leading-6">
                AI losses consume a heart on the free tier. Hearts regenerate every
                2 hours, or Cherry Pro unlocks infinite AI play.
              </p>
              <div className="mt-6 grid gap-3">
                <Link href="/store">
                  <Button className="w-full">Upgrade to Cherry Pro</Button>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowHeartLossModal(false)}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
