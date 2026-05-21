"use client";

import { Check, Crown, Heart, Palette, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHearts } from "@/hooks/use-hearts";
import { cn } from "@/lib/utils/cn";
import {
  BOARD_SKIN_CONFIG,
  DEFAULT_BOARD_SKIN,
  DEFAULT_PIECE_SKIN,
  PIECE_SKIN_CONFIG,
  VISUAL_THEME_EVENT,
  type BoardSkinId,
  type PieceSkinId,
  type VisualThemeDetail,
} from "@/lib/visuals";
import { useI18n } from "@/providers/i18n-provider";

export function StoreDashboard() {
  const { hearts, maxHearts, isPremium, nextHeartInMs, setPremium } = useHearts();
  const [boardSkin, setBoardSkin] = useState<BoardSkinId>(DEFAULT_BOARD_SKIN);
  const [pieceSkin, setPieceSkin] = useState<PieceSkinId>(DEFAULT_PIECE_SKIN);
  const { t } = useI18n();

  useEffect(() => {
    const storedBoard = window.localStorage.getItem("cherry-board-skin") as
      | BoardSkinId
      | null;
    const storedPiece = window.localStorage.getItem("cherry-piece-skin") as
      | PieceSkinId
      | null;

    const nextBoard = storedBoard && storedBoard in BOARD_SKIN_CONFIG ? storedBoard : DEFAULT_BOARD_SKIN;
    const nextPiece = storedPiece && storedPiece in PIECE_SKIN_CONFIG ? storedPiece : DEFAULT_PIECE_SKIN;

    setBoardSkin(nextBoard);
    setPieceSkin(nextPiece);
    dispatchVisualTheme(nextBoard, nextPiece);
  }, []);

  function dispatchVisualTheme(board: BoardSkinId, piece: PieceSkinId) {
    const detail: VisualThemeDetail = { boardSkin: board, pieceSkin: piece };
    window.dispatchEvent(new CustomEvent(VISUAL_THEME_EVENT, { detail }));
  }

  function saveBoardSkin(value: BoardSkinId) {
    setBoardSkin(value);
    window.localStorage.setItem("cherry-board-skin", value);
    dispatchVisualTheme(value, pieceSkin);
  }

  function savePieceSkin(value: PieceSkinId) {
    setPieceSkin(value);
    window.localStorage.setItem("cherry-piece-skin", value);
    dispatchVisualTheme(boardSkin, value);
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
            {Object.entries(BOARD_SKIN_CONFIG).map(([id, skin]) => (
              <button
                key={id}
                type="button"
                onClick={() => saveBoardSkin(id as BoardSkinId)}
                className={cn(
                  "border-border rounded-xl border p-3 text-left transition",
                  boardSkin === id &&
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
            {Object.entries(PIECE_SKIN_CONFIG).map(([id, skin]) => (
              <button
                key={id}
                type="button"
                onClick={() => savePieceSkin(id as PieceSkinId)}
                className={cn(
                  "border-border flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition",
                  pieceSkin === id &&
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
