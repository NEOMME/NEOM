import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/30",
        glow && "glow-cyan",
        className
      )}
    >
      {children}
    </div>
  );
}
