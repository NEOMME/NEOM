"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  onClick,
  type = "button",
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:from-cyan-400 hover:to-violet-500 glow-cyan",
    secondary:
      "glass text-cyan-400 border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10",
    ghost: "text-slate-400 hover:text-cyan-400 hover:bg-white/5",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-8 py-3.5 text-base rounded-xl",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
