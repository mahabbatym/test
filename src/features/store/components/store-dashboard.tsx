"use client";

import { Check, Crown, Heart, Palette, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHearts } from "@/hooks/use-hearts";
import { cn } from "@/lib/utils/cn";

const boardSkins = [
  {
    id: "walnut",
    label: "Walnut Classic",
    swatches: ["#f4e4cf", "#a96d47"],
  },
  {
    id: "obsidian",
    label: "Midnight Obsidian",
    swatches: ["#283040", "#080b12"],
  },
  {
    id: "crimson",
    label: "Vibrant Crimson Cherry",
    swatches: ["#ffd9d9", "#b91c1c"],
  },
];

const pieceSkins = [
  "Minimalist Vector",
  "Heavy Metal Metallic",
  "3D Retro",
  "Geometric Anime",
];

export function StoreDashboard() {
  const { hearts, maxHearts, isPremium, nextHeartInMs, setPremium } = useHearts();
  const [boardSkin, setBoardSkin] = useState("walnut");
  const [pieceSkin, setPieceSkin] = useState("Minimalist Vector");

  useEffect(() => {
    setBoardSkin(window.localStorage.getItem("cherry-board-skin") ?? "walnut");
    setPieceSkin(
      window.localStorage.getItem("cherry-piece-skin") ?? "Minimalist Vector",
    );
  }, []);

  function saveBoardSkin(value: string) {
    setBoardSkin(value);
    window.localStorage.setItem("cherry-board-skin", value);
  }

  function savePieceSkin(value: string) {
    setPieceSkin(value);
    window.localStorage.setItem("cherry-piece-skin", value);
  }

  const nextHeartMinutes = Math.ceil(nextHeartInMs / 60000);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-cherry text-sm font-medium">Premium Plan</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Cherry Pro
            </h2>
            <p className="text-muted mt-3 text-sm leading-6">
              Infinite AI hearts, visual customization, and future premium sound
              packs.
            </p>
          </div>
          <div className="bg-cherry/10 text-cherry flex size-12 items-center justify-center rounded-xl">
            <Crown className="size-6" />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {isPremium ? "Cherry Pro active" : "Free tier"}
            </span>
            <span className="text-cherry text-xl font-semibold">
              {isPremium ? "∞" : `${hearts}/${maxHearts}`}
            </span>
          </div>
          <p className="text-muted mt-2 text-sm">
            {isPremium
              ? "AI mode is unlimited."
              : nextHeartInMs > 0
                ? `Next heart in about ${nextHeartMinutes} min.`
                : "Hearts regenerate every 2 hours."}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {["Infinite AI games", "Custom board skins", "Custom piece themes"].map(
            (item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <Check className="text-cherry size-4" />
                {item}
              </div>
            ),
          )}
        </div>

        <Button
          type="button"
          onClick={() => setPremium(!isPremium)}
          className="mt-6 w-full gap-2"
        >
          <Heart className="size-4" />
          {isPremium ? "Manage Cherry Pro" : "Upgrade to Cherry Pro"}
        </Button>
      </section>

      <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-cherry/10 text-cherry flex size-10 items-center justify-center rounded-xl">
            <Palette className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">Visual Skins</h2>
            <p className="text-muted text-sm">
              Premium-ready configuration saved locally.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Board Colors</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {boardSkins.map((skin) => (
              <button
                key={skin.id}
                type="button"
                onClick={() => saveBoardSkin(skin.id)}
                className={cn(
                  "border-border rounded-xl border p-3 text-left transition",
                  boardSkin === skin.id &&
                    "border-red-500/40 bg-red-500/10 text-cherry",
                )}
              >
                <div className="flex gap-1">
                  {skin.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-8 flex-1 rounded-lg"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm font-medium">{skin.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Piece Themes</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {pieceSkins.map((skin) => (
              <button
                key={skin}
                type="button"
                onClick={() => savePieceSkin(skin)}
                className={cn(
                  "border-border flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition",
                  pieceSkin === skin &&
                    "border-red-500/40 bg-red-500/10 text-cherry",
                )}
              >
                <span>{skin}</span>
                <Sparkles className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
