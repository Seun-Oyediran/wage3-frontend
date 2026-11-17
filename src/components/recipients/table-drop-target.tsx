"use client";

import { AnimatePresence, motion } from "motion/react";

import { ImportIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { EASE_OUT } from "@/lib/motion";
import type { EditorMode } from "@/lib/recipients";
import { DISPLAY_TEXT } from "@/lib/type";

/**
 * While a file is dragged over the page, the table it will land in lights up in the selection
 * blues. The message sticks in view on a long table.
 */
export function TableDropTarget({ active, mode }: { active: boolean; mode: EditorMode }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-(--blue-3) ring-2 ring-(--blue-9) ring-inset"
        >
          <div className="sticky top-0 grid h-[min(100%,100dvh)] place-items-center p-6">
            <motion.div
              initial={{ opacity: 0, transform: "scale(0.96)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              // Icon beside the words, so the message fits a one-row table.
              className="flex items-center gap-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-(--blue-9) text-white">
                <ImportIcon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className={cn(DISPLAY_TEXT, "text-17 leading-6 font-semibold tracking-[-0.02em] text-(--blue-12)")}>
                  Drop to add to this {mode === "list" ? "list" : "payment"}
                </span>
                <span className="text-13 leading-5 text-(--blue-11)">Name, email, wallet and amount. Only wallet is required.</span>
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
