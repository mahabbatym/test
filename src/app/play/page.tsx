import { Suspense } from "react";

import { PlayChessContainer } from "@/features/game/components/play-chess-container";

export const metadata = {
  title: "Play",
};

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <p className="text-muted text-sm">Loading…</p>
        </div>
      }
    >
      <PlayChessContainer initialGameId={null} />
    </Suspense>
  );
}
