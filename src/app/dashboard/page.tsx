import Link from "next/link";
import { BarChart3, Bot, Crown, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MotionPage } from "@/components/ui/motion-page";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <MotionPage className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-cherry text-sm font-medium">Cherry Command</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
              Start a match, review progression, and jump into premium systems.
            </p>
          </div>
          <Link href="/play/local">
            <Button className="gap-2">
              <Swords className="size-4" />
              Play now
            </Button>
          </Link>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Solo AI Ladder",
              text: "Eight explicit Stockfish stages with escalating rewards.",
              icon: Bot,
              href: "/play/local",
            },
            {
              title: "Leaderboard",
              text: "Track global and city ELO movement.",
              icon: BarChart3,
              href: "/leaderboard",
            },
            {
              title: "Cherry Pro",
              text: "Infinite hearts and custom visual skins.",
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
                <div className="bg-cherry/10 text-cherry flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-5 font-semibold">{item.title}</h2>
                <p className="text-muted mt-2 text-sm leading-6">{item.text}</p>
              </Link>
            );
          })}
        </section>
      </div>
    </MotionPage>
  );
}
