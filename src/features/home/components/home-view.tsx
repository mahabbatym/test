"use client";

import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MotionPage } from "@/components/ui/motion-page";
import { useI18n } from "@/providers/i18n-provider";

export function HomeView() {
  const { t } = useI18n();

  return (
    <MotionPage className="bg-background flex min-h-screen flex-col transition-colors">
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="bg-cherry/10 text-cherry mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
          <Sparkles className="size-4" />
          {t("home_badge")}
        </div>

        <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
          {t("home_title_prefix")} {" "}
          <span className="text-cherry">{t("home_title_highlight")}</span>
        </h1>
        <p className="text-muted mt-4 max-w-lg text-lg leading-relaxed">
          {t("home_subtitle")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/play/guest">
            <Button
              size="lg"
              className="bg-cherry hover:bg-cherry-dark gap-2 text-white"
            >
              <Crown className="size-4" />
              {t("home_play_now")}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">
              {t("home_open_dashboard")}
            </Button>
          </Link>
        </div>
      </main>
    </MotionPage>
  );
}
