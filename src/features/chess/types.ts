import type { Color, PieceSymbol, Square } from "chess.js";

export type PromotionPiece = "q" | "r" | "b" | "n";

export type MoveInput =
  | {
      from: Square;
      to: Square;
      promotion?: PromotionPiece;
    }
  | {
      san: string;
    };

export type MoveFlags = {
  isCapture: boolean;
  isPromotion: boolean;
  isEnPassant: boolean;
  isCastle: boolean;
  isKingsideCastle: boolean;
  isQueensideCastle: boolean;
};

export type PlayedMove = {
  san: string;
  from: Square;
  to: Square;
  color: Color;
  captured?: PieceSymbol;
  flags: MoveFlags;
  fenAfter: string;
};

export type LegalMove = {
  san: string;
  from: Square;
  to: Square;
  color: Color;
  promotion?: PromotionPiece;
  flags: MoveFlags;
};

export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw";

export type GameState = {
  fen: string;
  pgn: string;
  turn: Color;
  status: GameStatus;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  moveNumber: number;
  halfmoveClock: number;
  history: string[];
  lastMove: PlayedMove | null;
};

export type MoveSuccess = {
  ok: true;
  move: PlayedMove;
  state: GameState;
};

export type MoveFailure = {
  ok: false;
  error: string;
};

export type MoveResult = MoveSuccess | MoveFailure;

export type UndoResult = MoveSuccess | { ok: false; error: string };
