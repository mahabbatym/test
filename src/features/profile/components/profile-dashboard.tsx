"use client";

import { Camera, CheckCircle2, Loader2, Lock, Medal, Trophy } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sendPasswordResetAction,
  updateProfileAction,
  type ProfileActionResult,
} from "@/features/profile/actions";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type ProfileDashboardProps = {
  userId: string;
  profile: Profile;
  stats: {
    wins: number;
    losses: number;
    games: number;
  };
};

const badges = [
  { label: "First Win", unlockedAt: 1 },
  { label: "Cherry Streak", unlockedAt: 5 },
  { label: "City Climber", unlockedAt: 10 },
  { label: "Pro Strategist", unlockedAt: 25 },
];

export function ProfileDashboard({
  userId,
  profile,
  stats,
}: ProfileDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ProfileActionResult | null>(null);
  const [passwordResult, setPasswordResult] =
    useState<ProfileActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  async function uploadAvatar(file: File) {
    setUploading(true);
    setResult(null);

    const supabase = createClient();
    const extension = file.name.split(".").pop() ?? "png";
    const path = `${userId}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (error) {
      setResult({ ok: false, message: error.message });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  }

  function handleSubmit(formData: FormData) {
    formData.set("avatar_url", avatarUrl);
    startTransition(async () => {
      setResult(await updateProfileAction(formData));
    });
  }

  function handlePasswordReset() {
    startTransition(async () => {
      setPasswordResult(await sendPasswordResetAction());
    });
  }

  const winRate =
    stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <form
        action={handleSubmit}
        className="border-border bg-card rounded-xl border p-5 shadow-sm"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-border bg-background relative flex size-24 items-center justify-center overflow-hidden rounded-xl border"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <Camera className="text-muted size-7" />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-xs text-white">
              {uploading ? "Uploading" : "Avatar"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadAvatar(file);
            }}
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Profile Management
            </h2>
            <p className="text-muted mt-2 text-sm">
              Update your public Cherry Chess identity and location.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display_name">Username</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile.display_name ?? ""}
              placeholder="CherryMaster"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              defaultValue={profile.country ?? ""}
              placeholder="Kazakhstan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={profile.city ?? ""}
              placeholder="Алматы"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={profile.bio ?? ""}
              className="border-border bg-card text-foreground placeholder:text-muted focus-visible:ring-cherry/40 w-full resize-none rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              placeholder="A calm positional player with a taste for endgames."
            />
          </div>
        </div>

        {result ? (
          <p className="text-muted mt-4 flex items-center gap-2 text-sm">
            {result.ok ? <CheckCircle2 className="text-cherry size-4" /> : null}
            {result.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending || uploading} className="mt-6">
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Save profile
        </Button>
      </form>

      <aside className="space-y-5">
        <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
          <h2 className="font-semibold tracking-tight">Achievements & Stats</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-background rounded-xl p-3">
              <p className="text-muted text-xs">ELO</p>
              <p className="text-xl font-semibold">{profile.elo_rating}</p>
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-muted text-xs">W/L</p>
              <p className="text-xl font-semibold">
                {stats.wins}/{stats.losses}
              </p>
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-muted text-xs">Win%</p>
              <p className="text-xl font-semibold">{winRate}%</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {badges.map((badge) => {
              const unlocked = stats.wins >= badge.unlockedAt;
              return (
                <div
                  key={badge.label}
                  className="border-border flex items-center justify-between rounded-xl border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {unlocked ? (
                      <Trophy className="text-cherry size-4" />
                    ) : (
                      <Medal className="text-muted size-4" />
                    )}
                    <span className="text-sm">{badge.label}</span>
                  </div>
                  <span className="text-muted text-xs">
                    {unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-cherry/10 text-cherry flex size-10 items-center justify-center rounded-xl">
              <Lock className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold tracking-tight">Security</h2>
              <p className="text-muted text-sm">Send a password reset email.</p>
            </div>
          </div>
          {passwordResult ? (
            <p className="text-muted mt-4 text-sm">{passwordResult.message}</p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={handlePasswordReset}
            disabled={isPending}
            className="mt-5 w-full"
          >
            Reset password
          </Button>
        </section>
      </aside>
    </div>
  );
}
