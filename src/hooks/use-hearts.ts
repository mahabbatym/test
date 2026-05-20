"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const HEARTS_STORAGE_KEY = "cherry-hearts";
const MAX_HEARTS = 5;
const HEART_REGEN_MS = 2 * 60 * 60 * 1000;

type HeartState = {
  hearts: number;
  lastUpdated: number;
  isPremium: boolean;
};

function readHeartState(): HeartState {
  if (typeof window === "undefined") {
    return { hearts: MAX_HEARTS, lastUpdated: Date.now(), isPremium: false };
  }

  const raw = window.localStorage.getItem(HEARTS_STORAGE_KEY);
  if (!raw) {
    return { hearts: MAX_HEARTS, lastUpdated: Date.now(), isPremium: false };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<HeartState>;
    return {
      hearts: Math.min(MAX_HEARTS, Math.max(0, parsed.hearts ?? MAX_HEARTS)),
      lastUpdated: parsed.lastUpdated ?? Date.now(),
      isPremium: Boolean(parsed.isPremium),
    };
  } catch {
    return { hearts: MAX_HEARTS, lastUpdated: Date.now(), isPremium: false };
  }
}

function regenerate(state: HeartState): HeartState {
  if (state.isPremium || state.hearts >= MAX_HEARTS) return state;

  const now = Date.now();
  const gained = Math.floor((now - state.lastUpdated) / HEART_REGEN_MS);
  if (gained <= 0) return state;

  return {
    ...state,
    hearts: Math.min(MAX_HEARTS, state.hearts + gained),
    lastUpdated: now,
  };
}

function writeHeartState(state: HeartState) {
  window.localStorage.setItem(HEARTS_STORAGE_KEY, JSON.stringify(state));
}

export function useHearts() {
  const [state, setState] = useState<HeartState>({
    hearts: MAX_HEARTS,
    lastUpdated: Date.now(),
    isPremium: false,
  });

  useEffect(() => {
    const next = regenerate(readHeartState());
    setState(next);
    writeHeartState(next);
  }, []);

  const updateState = useCallback((updater: (state: HeartState) => HeartState) => {
    setState((current) => {
      const next = updater(regenerate(current));
      writeHeartState(next);
      return next;
    });
  }, []);

  const consumeHeart = useCallback(() => {
    if (state.isPremium) return true;
    if (state.hearts <= 0) return false;
    updateState((current) => ({
      ...current,
      hearts: Math.max(0, current.hearts - 1),
      lastUpdated: Date.now(),
    }));
    return true;
  }, [state.hearts, state.isPremium, updateState]);

  const setPremium = useCallback(
    (isPremium: boolean) =>
      updateState((current) => ({
        ...current,
        isPremium,
        hearts: isPremium ? MAX_HEARTS : current.hearts,
      })),
    [updateState],
  );

  const nextHeartInMs = useMemo(() => {
    if (state.isPremium || state.hearts >= MAX_HEARTS) return 0;
    return Math.max(0, HEART_REGEN_MS - (Date.now() - state.lastUpdated));
  }, [state.hearts, state.isPremium, state.lastUpdated]);

  return {
    hearts: state.hearts,
    maxHearts: MAX_HEARTS,
    isPremium: state.isPremium,
    nextHeartInMs,
    consumeHeart,
    setPremium,
  };
}
