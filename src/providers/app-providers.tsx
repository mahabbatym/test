"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

import { getQueryClient } from "@/lib/react-query/query-client";
import {
  applyThemeToDocument,
  DEFAULT_BOARD_SKIN,
  DEFAULT_PIECE_SKIN,
  isBoardSkinId,
  isPieceSkinId,
  VISUAL_THEME_EVENT,
  type VisualThemeDetail,
} from "@/lib/visuals";
import { I18nProvider } from "@/providers/i18n-provider";
import { ThemeProvider } from "@/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const queryClient = getQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedBoard = window.localStorage.getItem("cherry-board-skin");
    const storedPiece = window.localStorage.getItem("cherry-piece-skin");

    const theme: VisualThemeDetail = {
      boardSkin: isBoardSkinId(storedBoard) ? storedBoard : DEFAULT_BOARD_SKIN,
      pieceSkin: isPieceSkinId(storedPiece) ? storedPiece : DEFAULT_PIECE_SKIN,
    };

    applyThemeToDocument(theme);

    const handler = (event: Event) => {
      const custom = event as CustomEvent<VisualThemeDetail>;
      applyThemeToDocument(custom.detail);
    };

    window.addEventListener(VISUAL_THEME_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(VISUAL_THEME_EVENT, handler as EventListener);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
