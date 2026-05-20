import type { Square } from "chess.js";
import { create } from "zustand";

import {
  ChessEngine,
  createChessEngine,
  type GameState,
  type LegalMove,
  type MoveInput,
  type MoveResult,
} from "@/features/chess";

type ChessStoreState = {
  engine: ChessEngine;
  gameState: GameState;
  reset: () => void;
  loadFen: (fen: string) => MoveResult | { ok: true };
  loadPgn: (pgn: string) => MoveResult | { ok: true };
  makeMove: (input: MoveInput) => MoveResult;
  undoMove: () => void;
  getLegalMoves: (square?: Square) => LegalMove[];
};

const initialEngine = createChessEngine();

export const useChessStore = create<ChessStoreState>((set, get) => ({
  engine: initialEngine,
  gameState: initialEngine.getGameState(),

  reset: () => {
    const engine = createChessEngine();
    set({ engine, gameState: engine.getGameState() });
  },

  loadFen: (fen) => {
    const { engine } = get();
    const result = engine.loadFen(fen);
    if (result.ok) {
      set({ gameState: engine.getGameState() });
    }
    return result;
  },

  loadPgn: (pgn) => {
    const { engine } = get();
    const result = engine.loadPgn(pgn);
    if (result.ok) {
      set({ gameState: engine.getGameState() });
    }
    return result;
  },

  makeMove: (input) => {
    const { engine } = get();
    const result = engine.makeMove(input);
    if (result.ok) {
      set({ gameState: result.state });
    }
    return result;
  },

  undoMove: () => {
    const { engine } = get();
    const result = engine.undoMove();
    if (result.ok) {
      set({ gameState: result.state });
    }
  },

  getLegalMoves: (square) => get().engine.getLegalMoves(square),
}));
