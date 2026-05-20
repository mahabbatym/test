"use client";

import { useEffect, useState } from "react";

import { useStockfish } from "@/hooks/useStockfish";
import {
  analyzeGameWithEngine,
  type CoachReport,
} from "@/utils/chess/aiCoach";

type UseAiCoachAnalysisParams = {
  enabled: boolean;
  pgn: string;
  initialFen?: string;
};

type UseAiCoachAnalysisResult = {
  status: "idle" | "loading" | "ready" | "error";
  report: CoachReport | null;
  progress: number;
  error: string | null;
};

export function useAiCoachAnalysis({
  enabled,
  pgn,
  initialFen,
}: UseAiCoachAnalysisParams): UseAiCoachAnalysisResult {
  const [status, setStatus] = useState<UseAiCoachAnalysisResult["status"]>("idle");
  const [report, setReport] = useState<CoachReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { isReady, analyzePosition, stop } = useStockfish();

  useEffect(() => {
    if (!enabled || !pgn) {
      setStatus("idle");
      setReport(null);
      setProgress(0);
      setError(null);
      return;
    }

    if (!isReady) {
      setStatus("loading");
      return;
    }

    let cancelled = false;

    const runAnalysis = async () => {
      setStatus("loading");
      setReport(null);
      setProgress(0);
      setError(null);

      try {
        const nextReport = await analyzeGameWithEngine({
          pgn,
          initialFen,
          analyzePosition,
          onProgress: (nextProgress) => {
            if (!cancelled) {
              setProgress(nextProgress);
            }
          },
        });

        if (cancelled) return;

        setReport(nextReport);
        setProgress(1);
        setStatus("ready");
      } catch (analysisError) {
        if (cancelled) return;

        const message =
          analysisError instanceof Error
            ? analysisError.message
            : "Cherry AI Coach could not analyze this game.";

        setError(message);
        setStatus("error");
      }
    };

    void runAnalysis();

    return () => {
      cancelled = true;
      stop();
    };
  }, [analyzePosition, enabled, initialFen, isReady, pgn, stop]);

  return {
    status,
    report,
    progress,
    error,
  };
}
