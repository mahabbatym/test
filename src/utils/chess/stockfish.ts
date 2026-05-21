import type { Square } from "chess.js";

import type { PromotionPiece } from "@/features/chess";

export const STOCKFISH_WORKER_URL = "/workers/stockfish-lite.js";

export const STOCKFISH_DEFAULT_LEVEL = 4;

export type StockfishDifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type StockfishDifficultySetting = {
  level: StockfishDifficultyLevel;
  skillLevel: number;
  depth: number;
  label: string;
  rewardCoins: number;
  rewardElo: number;
};

export const STOCKFISH_DIFFICULTY_LEVELS: StockfishDifficultyLevel[] = [
  1, 2, 3, 4, 5, 6, 7, 8,
];

export const STOCKFISH_DIFFICULTY_SETTINGS: Record<
  StockfishDifficultyLevel,
  StockfishDifficultySetting
> = {
  1: {
    level: 1,
    skillLevel: 0,
    depth: 4,
    label: "Novice Cherry",
    rewardCoins: 10,
    rewardElo: 4,
  },
  2: {
    level: 2,
    skillLevel: 3,
    depth: 6,
    label: "Garden Tactician",
    rewardCoins: 16,
    rewardElo: 6,
  },
  3: {
    level: 3,
    skillLevel: 6,
    depth: 8,
    label: "Crimson Apprentice",
    rewardCoins: 24,
    rewardElo: 8,
  },
  4: {
    level: 4,
    skillLevel: 9,
    depth: 10,
    label: "Club Strategist",
    rewardCoins: 34,
    rewardElo: 10,
  },
  5: {
    level: 5,
    skillLevel: 12,
    depth: 12,
    label: "Velvet Attacker",
    rewardCoins: 46,
    rewardElo: 12,
  },
  6: {
    level: 6,
    skillLevel: 15,
    depth: 14,
    label: "Master Candidate",
    rewardCoins: 60,
    rewardElo: 14,
  },
  7: {
    level: 7,
    skillLevel: 18,
    depth: 16,
    label: "Obsidian Master",
    rewardCoins: 78,
    rewardElo: 16,
  },
  8: {
    level: 8,
    skillLevel: 20,
    depth: 18,
    label: "Grandmaster",
    rewardCoins: 100,
    rewardElo: 20,
  },
};

export type StockfishEvaluation =
  | {
      kind: "cp";
      value: number;
      normalized: number;
      display: string;
    }
  | {
      kind: "mate";
      value: number;
      normalized: number;
      display: string;
    };

export type StockfishBestMove = {
  uci: string;
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
};

export type StockfishBestMoveResult = {
  move: StockfishBestMove;
  evaluation: StockfishEvaluation | null;
};

export type StockfishAnalysisResult = {
  bestMove: StockfishBestMove | null;
  evaluation: StockfishEvaluation | null;
};

export function parseDifficultyLevel(value: string): StockfishDifficultyLevel {
  const level = Number.parseInt(value, 10);

  if (level >= 1 && level <= 8) {
    return level as StockfishDifficultyLevel;
  }

  return STOCKFISH_DEFAULT_LEVEL;
}

export function parseUciMove(uci: string): StockfishBestMove | null {
  const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci.trim());

  if (!match?.[1] || !match[2]) {
    return null;
  }

  return {
    uci: uci.trim(),
    from: match[1] as Square,
    to: match[2] as Square,
    promotion: match[3] as PromotionPiece | undefined,
  };
}