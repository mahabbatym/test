import type { Chess, Color, PieceSymbol, Square } from "chess.js";

export type BoardCoords = { row: number; col: number };

export type BoardCell = { type: PieceSymbol; color: Color } | null;

export function squareToCoords(square: Square): BoardCoords {
  const col = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return { row: 8 - rank, col };
}

export function coordsToSquare(row: number, col: number): Square {
  const file = String.fromCharCode(97 + col);
  const rank = 8 - row;
  return `${file}${rank}` as Square;
}

export function getBoardMatrix(chess: Chess): BoardCell[][] {
  return chess.board();
}

export function findKingSquare(
  chess: Chess,
  color: Color,
): Square | null {
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (cell?.type === "k" && cell.color === color) {
        return coordsToSquare(row, col);
      }
    }
  }
  return null;
}
