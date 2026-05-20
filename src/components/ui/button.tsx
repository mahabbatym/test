"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils/cn";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary:
    "bg-cherry text-white hover:bg-cherry-dark disabled:opacity-50",
  secondary:
    "border border-border bg-transparent hover:bg-foreground/5 disabled:opacity-50",
  ghost: "hover:bg-foreground/5 disabled:opacity-50",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={
        props.disabled
          ? undefined
          : {
              scale: 1.02,
              backgroundColor: variant === "primary" ? "#b91c1c" : undefined,
            }
      }
      whileTap={props.disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherry disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
