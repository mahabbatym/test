import type { Move } from "chess.js";

import type {
  LegalMove,
  MoveFlags,
  PlayedMove,
  PromotionPiece,
} from "../types";

export function toMoveFlags(move: Move): MoveFlags {
  return {
    isCapture: move.isCapture(),
    isPromotion: move.isPromotion(),
    isEnPassant: move.isEnPassant(),
    isKingsideCastle: move.isKingsideCastle(),
    isQueensideCastle: move.isQueensideCastle(),
    isCastle: move.isKingsideCastle() || move.isQueensideCastle(),
  };
}

function toPromotionPiece(
  promotion: string | undefined,
): PromotionPiece | undefined {
  if (promotion === "q" || promotion === "r" || promotion === "b" || promotion === "n") {
    return promotion;
  }
  return undefined;
}

export function toPlayedMove(move: Move, fenAfter: string): PlayedMove {
  return {
    san: move.san,
    from: move.from,
    to: move.to,
    color: move.color,
    captured: move.captured,
    flags: toMoveFlags(move),
    fenAfter,
  };
}

export function toLegalMove(move: Move): LegalMove {
  return {
    san: move.san,
    from: move.from,
    to: move.to,
    color: move.color,
    promotion: toPromotionPiece(move.promotion),
    flags: toMoveFlags(move),
  };
}

export function parseHalfmoveClock(fen: string): number {
  const parts = fen.split(" ");
  const halfmove = Number(parts[4]);
  return Number.isFinite(halfmove) ? halfmove : 0;
}
