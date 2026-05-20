import { Suspense } from "react";

import { LocalChessGame } from "@/features/game/components/local-chess-game";

export const metadata = {
  title: "Play vs AI",
};

export default function LocalPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <p className="text-muted text-sm">Loading chess board…</p>
        </div>
      }
    >
      <LocalChessGame />
    </Suspense>
  );
}
