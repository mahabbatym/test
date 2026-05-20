"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type CherryLogoProps = {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "stacked" | "inline";
};

const sizes = {
  sm: { mark: "size-5", title: "text-base", sub: "text-xs" },
  md: { mark: "size-6", title: "text-xl", sub: "text-xs" },
  lg: { mark: "size-8", title: "text-3xl", sub: "text-sm" },
};

function CherryMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex items-center justify-center align-[-0.18em]",
        className,
      )}
    >
      <span className="absolute top-[4%] left-[50%] h-[42%] w-[34%] -rotate-[35deg] rounded-full border-t-2 border-l-2 border-emerald-700/80 dark:border-emerald-300/80" />
      <span className="absolute top-[4%] left-[60%] h-[28%] w-[34%] rotate-12 rounded-[999px_0_999px_0] bg-emerald-600/90 dark:bg-emerald-400/90" />
      <span className="absolute bottom-[8%] left-[12%] size-[55%] rounded-full bg-cherry shadow-[inset_0_8px_12px_rgba(255,255,255,0.22),0_8px_20px_rgba(185,28,28,0.24)]" />
      <span className="absolute right-[10%] bottom-[6%] size-[52%] rounded-full bg-cherry-dark shadow-[inset_0_7px_10px_rgba(255,255,255,0.16)]" />
      <span className="absolute bottom-[32%] left-[28%] size-[13%] rounded-full bg-white/70" />
    </span>
  );
}

export function CherryLogo({
  className,
  href = "/",
  size = "md",
  variant = "stacked",
}: CherryLogoProps) {
  const s = sizes[size];

  const text = (
    <div
      className={cn(
        "leading-none",
        variant === "inline" ? "text-left" : "text-center",
      )}
      aria-label="Cherry Chess"
    >
      <p
        className={cn(
          "text-foreground font-semibold tracking-tight",
          s.title,
        )}
      >
        <span>Ch</span>
        <CherryMark className={s.mark} />
        <span>rry</span>
      </p>
      {variant === "stacked" ? (
        <p
          className={cn(
            "text-muted mt-1 font-medium tracking-[0.24em] uppercase",
            s.sub,
          )}
        >
          Chess
        </p>
      ) : (
        <p className={cn("text-muted mt-0.5", s.sub)}>Chess</p>
      )}
    </div>
  );

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "inline-flex items-center gap-2.5",
        variant === "stacked" && "flex-col gap-1.5",
        className,
      )}
    >
      {text}
    </motion.div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cherry"
      >
        {content}
      </Link>
    );
  }

  return content;
}
