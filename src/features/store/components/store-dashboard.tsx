"use client";

import { Check, Crown, Heart, Palette, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHearts } from "@/hooks/use-hearts";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";

const boardSkins = [
  {
    id: "walnut",
    swatches: ["#f4e4cf", "#a96d47"],
    labelKey: "store_board_walnut" as const,
  },
  {
    id: "obsidian",
    swatches: ["#283040", "#080b12"],
    labelKey: "store_board_obsidian" as const,
  },
  {
    id: "crimson",
    swatches: ["#ffd9d9", "#b91c1c"],
    labelKey: "store_board_crimson" as const,
  },
];

const pieceSkins = [
  { id: "Minimalist Vector", labelKey: "store_piece_minimal" as const },
  { id: "Heavy Metal Metallic", labelKey: "store_piece_metal" as const },
  { id: "3D Retro", labelKey: "store_piece_retro" as const },
  { id: "Geometric Anime", labelKey: "store_piece_geometric" as const },
];

export function StoreDashboard() {
  const { hearts, maxHearts, isPremium, nextHeartInMs, setPremium } = useHearts();
  const [boardSkin, setBoardSkin] = useState("walnut");
  const [pieceSkin, setPieceSkin] = useState("Minimalist Vector");
  const { t } = useI18n();

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
            <p className="text-cherry text-sm font-medium">{t("store_plan_label")}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Cherry Pro
            </h2>
            <p className="text-muted mt-3 text-sm leading-6">{t("store_plan_text")}</p>
          </div>
          <div className="bg-cherry/10 text-cherry flex size-12 items-center justify-center rounded-xl">
            <Crown className="size-6" />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {isPremium ? t("store_status_active") : t("store_status_free")}
            </span>
            <span className="text-cherry text-xl font-semibold">
              {isPremium ? "∞" : `${hearts}/${maxHearts}`}
            </span>
          </div>
          <p className="text-muted mt-2 text-sm">
            {isPremium
              ? t("store_status_unlimited")
              : nextHeartInMs > 0
                ? t("store_status_next_heart").replace("{minutes}", String(nextHeartMinutes))
                : t("store_status_regen")}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {[
            t("store_feature_infinite"),
            t("store_feature_board"),
            t("store_feature_pieces"),
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <Check className="text-cherry size-4" />
              {item}
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={() => setPremium(!isPremium)}
          className="mt-6 w-full gap-2"
        >
          <Heart className="size-4" />
          {isPremium ? t("store_button_manage") : t("store_button_upgrade")}
        </Button>
      </section>

      <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-cherry/10 text-cherry flex size-10 items-center justify-center rounded-xl">
            <Palette className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold tracking-tight">{t("store_visual_title")}</h2>
            <p className="text-muted text-sm">{t("store_visual_subtitle")}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">{t("store_board_colors")}</p>
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
                <p className="mt-3 text-sm font-medium">{t(skin.labelKey)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">{t("store_piece_themes")}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {pieceSkins.map((skin) => (
              <button
                key={skin.id}
                type="button"
                onClick={() => savePieceSkin(skin.id)}
                className={cn(
                  "border-border flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition",
                  pieceSkin === skin.id &&
                    "border-red-500/40 bg-red-500/10 text-cherry",
                )}
              >
                <span>{t(skin.labelKey)}</span>
                <Sparkles className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
