"use client";

import { AnimatePresence, motion } from "motion/react";

/** A thin sliding bar along the top of its (relative) container while `active`. */
export function LoadingBar({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div
            className="h-full w-1/3 bg-primary"
            initial={{ transform: "translateX(-100%)" }}
            animate={{ transform: "translateX(300%)" }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
