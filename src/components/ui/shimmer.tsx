"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Text with a band of light sweeping across it every 2s (a gradient clipped to the text). Still
 * under reduced motion. `dark` is muted ink with a dark band; `light` is for coloured grounds.
 */
export function Shimmer({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  const reduce = useReducedMotion();
  const [base, peak] = tone === "light" ? ["oklch(1 0 0 / 0.72)", "oklch(1 0 0)"] : ["var(--fg-muted)", "var(--fg)"];
  return (
    <motion.span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage: `linear-gradient(90deg, ${base} 0%, ${base} 40%, ${peak} 50%, ${base} 60%, ${base} 100%)`,
        backgroundSize: "400% 100%",
        backgroundPosition: "100% 0",
      }}
      animate={reduce ? undefined : { backgroundPosition: ["100% 0", "0% 0"] }}
      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
}
