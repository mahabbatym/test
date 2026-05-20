import {
  Chess,
  validateFen,
  type Move,
  type Square,
} from "chess.js";

import type {
  GameState,
  GameStatus,
  LegalMove,
  MoveInput,
  MoveResult,
  UndoResult,
} from "../types";
import {
  parseHalfmoveClock,
  toLegalMove,
  toPlayedMove,
} from "../utils/move";

export class ChessEngine {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  makeMove(input: MoveInput): MoveResult {
    if (!this.isLegalMove(input)) {
      return { ok: false, error: "Illegal move" };
    }

    const move = this.applyMove(input);
    if (!move) {
      return { ok: false, error: "Illegal move" };
    }

    return {
      ok: true,
      move: toPlayedMove(move, this.chess.fen()),
      state: this.getGameState(),
    };
  }

  undoMove(): UndoResult {
    const move = this.chess.undo();
    if (!move) {
      return { ok: false, error: "No moves to undo" };
    }

    return {
      ok: true,
      move: toPlayedMove(move, this.chess.fen()),
      state: this.getGameState(),
    };
  }

  getGameState(): GameState {
    const history = this.chess.history();
    const verboseHistory = this.chess.history({ verbose: true });
    const lastVerbose = verboseHistory.at(-1);

    return {
      fen: this.chess.fen(),
      pgn: this.chess.pgn(),
      turn: this.chess.turn(),
      status: this.resolveStatus(),
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isStalemate: this.chess.isStalemate(),
      isDraw: this.chess.isDraw(),
      isGameOver: this.chess.isGameOver(),
      moveNumber: this.chess.moveNumber(),
      halfmoveClock: parseHalfmoveClock(this.chess.fen()),
      history,
      lastMove: lastVerbose
        ? toPlayedMove(lastVerbose, lastVerbose.after)
        : null,
    };
  }

  getLegalMoves(square?: Square): LegalMove[] {
    const moves = square
      ? this.chess.moves({ square, verbose: true })
      : this.chess.moves({ verbose: true });

    return moves.map(toLegalMove);
  }

  isLegalMove(input: MoveInput): boolean {
    if ("san" in input) {
      try {
        const moves = this.chess.moves({ verbose: true });
        return moves.some((m) => m.san === input.san);
      } catch {
        return false;
      }
    }

    const { from, to, promotion } = input;
    return this.chess
      .moves({ square: from, verbose: true })
      .some(
        (m) =>
          m.from === from &&
          m.to === to &&
          (promotion === undefined || m.promotion === promotion),
      );
  }

  loadFen(fen: string): MoveResult | { ok: true } {
    const validation = validateFen(fen);
    if (!validation.ok) {
      return { ok: false, error: validation.error ?? "Invalid FEN" };
    }

    this.chess.load(fen);
    return { ok: true };
  }

  getFen(): string {
    return this.chess.fen();
  }

  loadPgn(pgn: string, options?: { strict?: boolean }): MoveResult | { ok: true } {
    try {
      this.chess.loadPgn(pgn, { strict: options?.strict ?? false });
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid PGN";
      return { ok: false, error: message };
    }
  }

  getPgn(options?: { maxWidth?: number }): string {
    return this.chess.pgn({ maxWidth: options?.maxWidth });
  }

  reset(): void {
    this.chess.reset();
  }

  getChess(): Chess {
    return this.chess;
  }

  private resolveStatus(): GameStatus {
    if (this.chess.isCheckmate()) return "checkmate";
    if (this.chess.isStalemate()) return "stalemate";
    if (this.chess.isDraw()) return "draw";
    if (this.chess.inCheck()) return "check";
    return "playing";
  }

  private applyMove(input: MoveInput): Move | null {
    try {
      if ("san" in input) {
        return this.chess.move(input.san, { strict: true });
      }

      return this.chess.move(
        { from: input.from, to: input.to, promotion: input.promotion },
        { strict: true },
      );
    } catch {
      return null;
    }
  }
}

export function createChessEngine(fen?: string): ChessEngine {
  return new ChessEngine(fen);
}
