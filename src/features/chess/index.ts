export { ChessEngine, createChessEngine } from "./engine/chess-engine";

export {
  coordsToSquare,
  findKingSquare,
  getBoardMatrix,
  squareToCoords,
  type BoardCell,
  type BoardCoords,
} from "./utils/board";

export type {
  GameState,
  GameStatus,
  LegalMove,
  MoveFailure,
  MoveFlags,
  MoveInput,
  MoveResult,
  MoveSuccess,
  PlayedMove,
  PromotionPiece,
  UndoResult,
} from "./types";
