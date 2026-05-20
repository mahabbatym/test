import { redirect } from "next/navigation";

import { MotionPage } from "@/components/ui/motion-page";
import { ensureUserProfile } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { Game, Profile } from "@/types/database";

import { ProfileDashboard } from "@/features/profile/components/profile-dashboard";

export const metadata = {
  title: "Profile",
};

function getStats(games: Game[], userId: string) {
  let wins = 0;
  let losses = 0;

  for (const game of games) {
    if (game.winner_id === userId) {
      wins += 1;
    } else if (game.winner_id && game.result !== "draw") {
      losses += 1;
    }
  }

  return { wins, losses, games: games.length };
}

function createFallbackProfile(userId: string): Profile {
  const now = new Date().toISOString();
  return {
    id: userId,
    display_name: null,
    bio: null,
    country: null,
    city: null,
    avatar_url: null,
    elo_rating: 1200,
    coins: 0,
    hearts: 5,
    is_premium: false,
    created_at: now,
    updated_at: now,
  };
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  await ensureUserProfile(
    supabase,
    user.id,
    user.user_metadata.display_name as string | undefined,
  );

  const [{ data: profile }, { data: games }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("games")
      .select("*")
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .eq("status", "finished"),
  ]);

  return (
    <MotionPage className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-cherry text-sm font-medium">Cherry Identity</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            Manage your public chess identity, avatar, security, and progress.
          </p>
        </div>

        <ProfileDashboard
          userId={user.id}
          profile={(profile as Profile | null) ?? createFallbackProfile(user.id)}
          stats={getStats((games ?? []) as Game[], user.id)}
        />
      </div>
    </MotionPage>
  );
}
