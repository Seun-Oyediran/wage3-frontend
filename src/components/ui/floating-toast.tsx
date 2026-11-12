"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils/cn";
import { EASE_OUT } from "@/lib/motion";

import { toastTone } from "./toast-tone";

/**
 * A toast that floats at the bottom of the content panel while `show`, for actions that belong
 * to the page (the editor's selection, unsaved changes). It scales up out of a blur and back into
 * one. `className` sizes the card; `containerClassName` sets its layer.
 */
export function FloatingToast({
  show,
  containerClassName,
  className,
  children,
  ...props
}: { show: boolean; containerClassName?: string } & HTMLMotionProps<"div">) {
  return (
    // Centred on the page, past the desktop sidebar.
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pl-(--sidebar-w)",
        containerClassName,
      )}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            role="status"
            style={{ transformOrigin: "50% 100%" }}
            initial={{ opacity: 0, transform: "scale(0.92)", filter: "blur(8px)" }}
            animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
            exit={{ opacity: 0, transform: "scale(0.95)", filter: "blur(6px)", transition: { duration: 0.14, ease: EASE_OUT } }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className={cn(
              "pointer-events-auto flex w-full max-w-[560px] items-center gap-1 [corner-shape:superellipse(1.5)]",
              toastTone.surface,
              className,
            )}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
