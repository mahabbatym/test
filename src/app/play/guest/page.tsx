import { Suspense } from "react";

import { LocalChessGame } from "@/features/game/components/local-chess-game";

export const metadata = {
  title: "Play instantly",
};

export default function GuestPlayPage() {
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
