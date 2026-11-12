"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

/**
 * Route change: a quick fade so content doesn't teleport. Opacity only: the sidebar pill is
 * already moving, and a rising page on every click makes fast navigation bob.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
}
