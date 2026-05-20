import { Chess, type Color, type Move, type PieceSymbol } from "chess.js";

import type { StockfishAnalysisResult, StockfishBestMove } from "./stockfish";

const CHECKMATE_SCORE_CP = 100000;
const COACH_ANALYSIS_DEPTH = 13;
const COACH_SKILL_LEVEL = 20;

const MATERIAL_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export type CoachMoveQuality =
  | "best"
  | "excellent"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export type CoachMoveReview = {
  ply: number;
  moveNumber: number;
  color: Color;
  san: string;
  playedUci: string;
  bestMoveSan: string | null;
  bestMoveUci: string | null;
  quality: CoachMoveQuality;
  qualityLabel: string;
  qualityLabelKz: string;
  scoreBeforeCp: number;
  scoreAfterCp: number;
  scoreDropCp: number;
  scoreDropPawns: number;
  accuracy: number;
  explanation: string;
  recommendation: string;
};

export type CoachSideSummary = {
  color: Color;
  movesAnalyzed: number;
  bestMoves: number;
  excellentMoves: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  accuracy: number;
};

export type CoachReport = {
  moves: CoachMoveReview[];
  white: CoachSideSummary;
  black: CoachSideSummary;
  worstMove: CoachMoveReview | null;
  analyzedAt: string;
};

export type AnalyzeGameWithEngineParams = {
  pgn?: string;
  moves?: string[];
  initialFen?: string;
  depth?: number;
  skillLevel?: number;
  analyzePosition: (params: {
    fen: string;
    depth: number;
    skillLevel: number;
  }) => Promise<StockfishAnalysisResult>;
  onProgress?: (progress: number, ply: number) => void;
};

type ExplanationContext = {
  move: Move;
  moveNumber: number;
  quality: CoachMoveQuality;
  scoreDropPawns: number;
  materialSwing: number;
  bestMoveSan: string | null;
  bestMove: Move | null;
};

function pause(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function evaluationToCp(result: StockfishAnalysisResult["evaluation"]): number {
  if (!result) return 0;

  if (result.kind === "mate") {
    const distance = Math.abs(result.value);
    return result.normalized >= 0
      ? CHECKMATE_SCORE_CP - distance * 100
      : -CHECKMATE_SCORE_CP + distance * 100;
  }

  return result.normalized;
}

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function qualityLabels(quality: CoachMoveQuality): {
  label: string;
  labelKz: string;
} {
  switch (quality) {
    case "best":
      return { label: "Best Move", labelKz: "Ең дәл жүріс" };
    case "excellent":
      return { label: "Excellent", labelKz: "Өте мықты" };
    case "inaccuracy":
      return { label: "Inaccuracy", labelKz: "Дәлсіздік" };
    case "mistake":
      return { label: "Mistake", labelKz: "Қателік" };
    case "blunder":
      return { label: "Blunder", labelKz: "Өте өрескел қате" };
  }
}

function classifyMoveQuality(params: {
  scoreDropCp: number;
  bestMoveUci: string | null;
  playedUci: string;
}): CoachMoveQuality {
  const dropPawns = params.scoreDropCp / 100;

  if (params.bestMoveUci === params.playedUci) {
    return "best";
  }

  if (dropPawns >= 2) return "blunder";
  if (dropPawns >= 1) return "mistake";
  if (dropPawns >= 0.5) return "inaccuracy";
  if (dropPawns < 0.2) return "excellent";
  return "excellent";
}

function scoreAccuracy(quality: CoachMoveQuality, scoreDropCp: number): number {
  const dropPawns = scoreDropCp / 100;

  switch (quality) {
    case "best":
      return 100;
    case "excellent":
      return Math.max(96, 100 - dropPawns * 10);
    case "inaccuracy":
      return Math.max(82, 94 - dropPawns * 10);
    case "mistake":
      return Math.max(58, 78 - dropPawns * 12);
    case "blunder":
      return Math.max(20, 52 - dropPawns * 10);
  }
}

function getMoveList(params: Pick<AnalyzeGameWithEngineParams, "pgn" | "moves" | "initialFen">) {
  if (params.moves?.length) {
    return params.moves;
  }

  const chess = new Chess(params.initialFen);
  if (params.pgn) {
    chess.loadPgn(params.pgn, { strict: false });
  }

  return chess.history();
}

function moveToUci(move: Move): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function toSanMove(fen: string, bestMove: StockfishBestMove | null): {
  san: string | null;
  move: Move | null;
} {
  if (!bestMove) {
    return { san: null, move: null };
  }

  const chess = new Chess(fen);
  const move = chess.move({
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion,
  });

  if (!move) {
    return { san: null, move: null };
  }

  return { san: move.san, move };
}

function getMaterialBalance(chess: Chess, color: Color): number {
  let own = 0;
  let enemy = 0;

  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const value = MATERIAL_VALUES[cell.type];
      if (cell.color === color) {
        own += value;
      } else {
        enemy += value;
      }
    }
  }

  return own - enemy;
}

function describeIssue(context: ExplanationContext): string {
  const { move, moveNumber, materialSwing } = context;

  if (materialSwing <= -3) {
    return "It drops material without enough compensation.";
  }

  if (move.piece === "k" && !move.isKingsideCastle() && !move.isQueensideCastle()) {
    return "It exposes your king and makes it harder to stay safe.";
  }

  if (
    move.piece === "p" &&
    ["f", "g", "h"].includes(move.from[0] ?? "") &&
    moveNumber >= 8
  ) {
    return "It loosens the pawns around your king and weakens king safety.";
  }

  if (move.piece === "q" && moveNumber <= 10) {
    return "It brings the queen out too early and gives your opponent easy targets.";
  }

  if (move.isCapture()) {
    return "The capture looks active, but it gives away the initiative.";
  }

  return "It hands the initiative to your opponent and leaves your pieces less coordinated.";
}

function describeRecommendation(bestMoveSan: string | null, bestMove: Move | null): string {
  if (!bestMoveSan || !bestMove) {
    return "Look for a calmer improving move that keeps your pieces coordinated.";
  }

  if (bestMove.isKingsideCastle() || bestMove.isQueensideCastle()) {
    return `${bestMoveSan} to castle and secure your king.`;
  }

  if (bestMove.piece === "n" || bestMove.piece === "b") {
    return `${bestMoveSan} to develop a piece and finish mobilizing your army.`;
  }

  if (bestMove.piece === "p" && ["d", "e"].includes(bestMove.to[0] ?? "")) {
    return `${bestMoveSan} to fight for the center and keep space.`;
  }

  if (bestMove.isCapture()) {
    return `${bestMoveSan} to simplify safely and keep the better balance.`;
  }

  if (bestMove.san.includes("+")) {
    return `${bestMoveSan} to keep the initiative with an immediate threat.`;
  }

  return `${bestMoveSan} to improve your position while keeping the pressure on.`;
}

function buildExplanation(context: ExplanationContext): {
  explanation: string;
  recommendation: string;
} {
  const label = qualityLabels(context.quality);
  const movePrefix =
    context.move.color === "w"
      ? `${context.moveNumber}. ${context.move.san}`
      : `${context.moveNumber}... ${context.move.san}`;
  const issue = describeIssue(context);
  const recommendation = describeRecommendation(context.bestMoveSan, context.bestMove);

  return {
    explanation: `${movePrefix} was a ${label.label.toLowerCase()}. ${issue} Better was ${
      context.bestMoveSan ?? "a calmer move"
    }.`,
    recommendation,
  };
}

function buildSideSummary(
  color: Color,
  moves: CoachMoveReview[],
): CoachSideSummary {
  const sideMoves = moves.filter((move) => move.color === color);
  const accuracyTotal = sideMoves.reduce((total, move) => total + move.accuracy, 0);

  return {
    color,
    movesAnalyzed: sideMoves.length,
    bestMoves: sideMoves.filter((move) => move.quality === "best").length,
    excellentMoves: sideMoves.filter((move) => move.quality === "excellent").length,
    inaccuracies: sideMoves.filter((move) => move.quality === "inaccuracy").length,
    mistakes: sideMoves.filter((move) => move.quality === "mistake").length,
    blunders: sideMoves.filter((move) => move.quality === "blunder").length,
    accuracy:
      sideMoves.length > 0
        ? Math.round((accuracyTotal / sideMoves.length) * 10) / 10
        : 100,
  };
}

function pickWorstMove(moves: CoachMoveReview[]): CoachMoveReview | null {
  if (moves.length === 0) return null;

  return [...moves].sort((left, right) => {
    if (right.scoreDropCp !== left.scoreDropCp) {
      return right.scoreDropCp - left.scoreDropCp;
    }

    return left.ply - right.ply;
  })[0] ?? null;
}

export async function analyzeGameWithEngine({
  pgn,
  moves,
  initialFen,
  depth = COACH_ANALYSIS_DEPTH,
  skillLevel = COACH_SKILL_LEVEL,
  analyzePosition,
  onProgress,
}: AnalyzeGameWithEngineParams): Promise<CoachReport> {
  const moveList = getMoveList({ pgn, moves, initialFen });
  const playback = new Chess(initialFen);
  const reviews: CoachMoveReview[] = [];

  for (const [index, san] of moveList.entries()) {
    const beforeFen = playback.fen();
    const beforeTurn = playback.turn();
    const moveNumber = Math.floor(index / 2) + 1;
    const materialBefore = getMaterialBalance(playback, beforeTurn);

    const beforeAnalysis = await analyzePosition({
      fen: beforeFen,
      depth,
      skillLevel,
    });
    const bestMoveMeta = toSanMove(beforeFen, beforeAnalysis.bestMove);

    const playedMove = playback.move(san, { strict: false });
    if (!playedMove) {
      throw new Error(`Could not replay move: ${san}`);
    }

    const playedUci = moveToUci(playedMove);
    const afterFen = playback.fen();
    const materialAfter = getMaterialBalance(playback, playedMove.color);

    let scoreAfterCp: number;
    if (playback.isCheckmate()) {
      scoreAfterCp = CHECKMATE_SCORE_CP;
    } else if (playback.isDraw() || playback.isStalemate()) {
      scoreAfterCp = 0;
    } else {
      const afterAnalysis = await analyzePosition({
        fen: afterFen,
        depth,
        skillLevel,
      });
      scoreAfterCp = -evaluationToCp(afterAnalysis.evaluation);
    }

    const scoreBeforeCp = evaluationToCp(beforeAnalysis.evaluation);
    const scoreDropCp = Math.max(0, scoreBeforeCp - scoreAfterCp);
    const quality = classifyMoveQuality({
      scoreDropCp,
      bestMoveUci: beforeAnalysis.bestMove?.uci ?? null,
      playedUci,
    });
    const labels = qualityLabels(quality);
    const { explanation, recommendation } = buildExplanation({
      move: playedMove,
      moveNumber,
      quality,
      scoreDropPawns: scoreDropCp / 100,
      materialSwing: materialAfter - materialBefore,
      bestMoveSan: bestMoveMeta.san,
      bestMove: bestMoveMeta.move,
    });

    reviews.push({
      ply: index + 1,
      moveNumber,
      color: playedMove.color,
      san: playedMove.san,
      playedUci,
      bestMoveSan: bestMoveMeta.san,
      bestMoveUci: beforeAnalysis.bestMove?.uci ?? null,
      quality,
      qualityLabel: labels.label,
      qualityLabelKz: labels.labelKz,
      scoreBeforeCp,
      scoreAfterCp,
      scoreDropCp,
      scoreDropPawns: roundToSingleDecimal(scoreDropCp / 100),
      accuracy: Math.round(scoreAccuracy(quality, scoreDropCp)),
      explanation,
      recommendation,
    });

    onProgress?.((index + 1) / moveList.length, index + 1);
    await pause();
  }

  return {
    moves: reviews,
    white: buildSideSummary("w", reviews),
    black: buildSideSummary("b", reviews),
    worstMove: pickWorstMove(reviews),
    analyzedAt: new Date().toISOString(),
  };
}
