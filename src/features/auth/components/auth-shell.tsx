import type { ReactNode } from "react";

import { CherryLogo } from "@/components/auth/cherry-logo";
import { MotionPage } from "@/components/ui/motion-page";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <MotionPage className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-12 transition-colors">
      <div className="mb-8">
        <CherryLogo href="/" size="lg" />
      </div>

      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-8 shadow-xl shadow-black/5 dark:shadow-black/30">
        <div className="mb-8 space-y-1 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-muted text-sm">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </MotionPage>
  );
}
