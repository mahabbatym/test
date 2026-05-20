"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  parseUciMove,
  STOCKFISH_DEFAULT_LEVEL,
  STOCKFISH_DIFFICULTY_SETTINGS,
  STOCKFISH_WORKER_URL,
  type StockfishAnalysisResult,
  type StockfishBestMoveResult,
  type StockfishDifficultyLevel,
  type StockfishEvaluation,
} from "@/utils/chess/stockfish";

type StockfishStatus = "loading" | "ready" | "thinking" | "error";

type AnalyzeParams = {
  fen: string;
  depth?: number;
  level?: StockfishDifficultyLevel;
  skillLevel?: number;
};

type PendingRequest = {
  fenTurn: "w" | "b";
  resolve: (result: StockfishAnalysisResult) => void;
  reject: (error: Error) => void;
};

type UseStockfishResult = {
  status: StockfishStatus;
  isReady: boolean;
  isThinking: boolean;
  evaluation: StockfishEvaluation | null;
  error: string | null;
  analyzePosition: (params: AnalyzeParams) => Promise<StockfishAnalysisResult>;
  getBestMove: (params: AnalyzeParams) => Promise<StockfishBestMoveResult>;
  stop: () => void;
  resetEvaluation: () => void;
};

function extractTurnFromFen(fen: string): "w" | "b" {
  const [, turn] = fen.split(" ");
  return turn === "b" ? "b" : "w";
}

function normalizeCpScore(value: number, turn: "w" | "b"): number {
  return turn === "w" ? value : -value;
}

function normalizeMateScore(value: number, turn: "w" | "b"): number {
  return turn === "w" ? value : -value;
}

function createCpEvaluation(value: number, turn: "w" | "b"): StockfishEvaluation {
  const normalized = normalizeCpScore(value, turn);

  return {
    kind: "cp",
    value,
    normalized,
    display: `${normalized > 0 ? "+" : ""}${(normalized / 100).toFixed(1)}`,
  };
}

function createMateEvaluation(
  value: number,
  turn: "w" | "b",
): StockfishEvaluation {
  const normalized = normalizeMateScore(value, turn);

  return {
    kind: "mate",
    value,
    normalized,
    display: `${normalized > 0 ? "+" : ""}M${normalized}`,
  };
}

function parseEvaluation(line: string, turn: "w" | "b"): StockfishEvaluation | null {
  const mateMatch = /score mate (-?\d+)/.exec(line);
  if (mateMatch) {
    return createMateEvaluation(Number.parseInt(mateMatch[1] ?? "0", 10), turn);
  }

  const cpMatch = /score cp (-?\d+)/.exec(line);
  if (cpMatch) {
    return createCpEvaluation(Number.parseInt(cpMatch[1] ?? "0", 10), turn);
  }

  return null;
}

export function useStockfish(): UseStockfishResult {
  const workerRef = useRef<Worker | null>(null);
  const readyResolverRef = useRef<(() => void) | null>(null);
  const readyRejecterRef = useRef<((error: Error) => void) | null>(null);
  const readyPromiseRef = useRef<Promise<void> | null>(null);
  const pendingRef = useRef<PendingRequest | null>(null);
  const evaluationRef = useRef<StockfishEvaluation | null>(null);

  const [status, setStatus] = useState<StockfishStatus>("loading");
  const [evaluation, setEvaluation] = useState<StockfishEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    const worker = workerRef.current;

    if (worker) {
      worker.postMessage("stop");
    }

    const pending = pendingRef.current;
    if (pending) {
      pending.reject(new Error("Stockfish search stopped"));
      pendingRef.current = null;
    }

    setStatus((current) =>
      current === "error" || current === "loading" ? current : "ready",
    );
  }, []);

  const resetEvaluation = useCallback(() => {
    evaluationRef.current = null;
    setEvaluation(null);
  }, []);

 useEffect(() => {
    if (typeof window === "undefined" || !STOCKFISH_WORKER_URL) return;

    let worker: Worker;
    try {
      worker = new Worker(STOCKFISH_WORKER_URL);
    } catch {
      // Fallback: load via Blob URL if direct path fails (e.g. CORS)
      try {
        const code = `importScripts("${window.location.origin}${STOCKFISH_WORKER_URL}");`;
        const blob = new Blob([code], { type: "application/javascript" });
        worker = new Worker(URL.createObjectURL(blob));
      } catch (fallbackError) {
        console.error("Failed to create Stockfish worker:", fallbackError);
        setError("Unable to load Stockfish engine.");
        setStatus("error");
        return;
      }
    }
    workerRef.current = worker;

    readyPromiseRef.current = new Promise<void>((resolve, reject) => {
      readyResolverRef.current = resolve;
      readyRejecterRef.current = reject;
    });

    worker.onmessage = (event: MessageEvent<string>) => {
      const line = String(event.data ?? "").trim();
      if (!line) return;

      if (line === "uciok") {
        worker.postMessage("setoption name Threads value 1");
        worker.postMessage("setoption name Hash value 16");
        // Болашақта .wasm файлын қатесіз табуы үшін локальді папканы нұсқаймыз
        worker.postMessage("setoption name WebAssemblyPath value /workers/package/");
        worker.postMessage("isready");
        return;
      }

      if (line === "readyok") {
        readyResolverRef.current?.();
        readyResolverRef.current = null;
        readyRejecterRef.current = null;
        setStatus((current) => (current === "thinking" ? current : "ready"));
        return;
      }

      const pending = pendingRef.current;
      if (!pending) return;

      if (line.startsWith("info")) {
        const nextEvaluation = parseEvaluation(line, pending.fenTurn);
        if (nextEvaluation) {
          evaluationRef.current = nextEvaluation;
          setEvaluation(nextEvaluation);
        }
        return;
      }

      if (!line.startsWith("bestmove")) return;

      const [, moveToken] = line.split(/\s+/);

      if (!moveToken || moveToken === "(none)") {
        pending.resolve({
          bestMove: null,
          evaluation: evaluationRef.current,
        });
        pendingRef.current = null;
        setStatus("ready");
        return;
      }

      const move = parseUciMove(moveToken);

      if (!move) {
        pending.reject(new Error(`Unsupported Stockfish move: ${moveToken}`));
        pendingRef.current = null;
        setStatus("ready");
        return;
      }

      pending.resolve({
        bestMove: move,
        evaluation: evaluationRef.current,
      });
      pendingRef.current = null;
      setStatus("ready");
    };

    worker.onerror = (err) => {
      console.error("Stockfish Worker қатесі:", err);
      setError("Unable to load Stockfish.");
      setStatus("error");
      readyRejecterRef.current?.(new Error("Unable to load Stockfish"));
      readyRejecterRef.current = null;

      const pending = pendingRef.current;
      if (pending) {
        pending.reject(new Error("Unable to load Stockfish"));
        pendingRef.current = null;
      }
    };

    worker.postMessage("uci");

    return () => {
      const pending = pendingRef.current;
      if (pending) {
        pending.reject(new Error("Stockfish worker terminated"));
        pendingRef.current = null;
      }

      worker.terminate();
      workerRef.current = null;
      readyPromiseRef.current = null;
      readyResolverRef.current = null;
      readyRejecterRef.current = null;
    };
  }, []);

  const analyzePosition = useCallback(
    async ({
      fen,
      depth,
      level = STOCKFISH_DEFAULT_LEVEL,
      skillLevel,
    }: AnalyzeParams): Promise<StockfishAnalysisResult> => {
      const worker = workerRef.current;

      if (!worker || !readyPromiseRef.current) {
        throw new Error("Stockfish worker is not available");
      }

      if (pendingRef.current) {
        stop();
      }

      setError(null);
      resetEvaluation();
      setStatus("thinking");

      await readyPromiseRef.current;

      const difficulty = STOCKFISH_DIFFICULTY_SETTINGS[level];
      const searchDepth = depth ?? difficulty.depth;
      const searchSkillLevel = skillLevel ?? difficulty.skillLevel;

      return new Promise<StockfishAnalysisResult>((resolve, reject) => {
        pendingRef.current = {
          fenTurn: extractTurnFromFen(fen),
          resolve,
          reject,
        };

        worker.postMessage(`setoption name Skill Level value ${searchSkillLevel}`);
        worker.postMessage("ucinewgame");
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go depth ${searchDepth}`);
      });
    },
    [resetEvaluation, stop],
  );

  const getBestMove = useCallback(
    async (params: AnalyzeParams): Promise<StockfishBestMoveResult> => {
      const result = await analyzePosition(params);

      if (!result.bestMove) {
        throw new Error("Stockfish did not return a legal move");
      }

      return {
        move: result.bestMove,
        evaluation: result.evaluation,
      };
    },
    [analyzePosition],
  );

  return {
    status,
    isReady: status !== "loading" && status !== "error",
    isThinking: status === "thinking",
    evaluation,
    error,
    analyzePosition,
    getBestMove,
    stop,
    resetEvaluation,
  };
}
