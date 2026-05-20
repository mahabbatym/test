import { Suspense } from "react";

import { PlayChessContainer } from "@/features/game/components/play-chess-container";

export const metadata = {
  title: "Multiplayer Game",
};

export default async function MultiplayerGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <p className="text-muted text-sm">Loading room…</p>
        </div>
      }
    >
      <PlayChessContainer initialGameId={gameId} />
    </Suspense>
  );
}
