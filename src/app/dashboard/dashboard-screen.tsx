"use client";

import Link from "next/link";
import { BarChart3, Bot, Crown, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MotionPage } from "@/components/ui/motion-page";
import { useI18n } from "@/providers/i18n-provider";

export function DashboardScreen() {
  const { t } = useI18n();

  return (
    <MotionPage className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-cherry text-sm font-medium">{t("dashboard_tagline")}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {t("dashboard")}
            </h1>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
              {t("dashboard_subtitle")}
            </p>
          </div>
          <Link href="/play/local">
            <Button className="gap-2">
              <Swords className="size-4" />
              {t("home_play_now")}
            </Button>
          </Link>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: t("dashboard_card_ai_title"),
              text: t("dashboard_card_ai_text"),
              icon: Bot,
              href: "/play/local",
            },
            {
              title: t("dashboard_card_leaderboard_title"),
              text: t("dashboard_card_leaderboard_text"),
              icon: BarChart3,
              href: "/leaderboard",
            },
            {
              title: t("dashboard_card_store_title"),
              text: t("dashboard_card_store_text"),
              icon: Crown,
              href: "/store",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="border-border bg-card hover:border-red-500/30 rounded-xl border p-5 shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-cherry/10 text-cherry flex size-10 items-center justify-center rounded-xl">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-lg font-semibold tracking-tight">
                      {item.title}
                    </h2>
                    <p className="text-muted mt-1 text-sm leading-6">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </MotionPage>
  );
}
