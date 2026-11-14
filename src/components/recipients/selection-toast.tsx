"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { FloatingToast } from "@/components/ui/floating-toast";
import { toastTone } from "@/components/ui/toast-tone";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { USDC } from "@/lib/config";
import { formatAmount, formatCount, formatFigure } from "@/lib/utils/format";
import { EASE_OUT } from "@/lib/motion";

import { BulkAmountToastForm, type BulkKind } from "./bulk-amount-form";

/**
 * The ticked rows as a floating toast: what's selected and what to do with it. It updates in place
 * as rows are ticked, and Set amount / Split turn it into the amount form, so the action stays in
 * view on a long table.
 */
export function SelectionToast({
  show,
  count,
  total,
  bulk,
  onBulk,
  onApply,
  onRemove,
  onClear,
}: {
  show: boolean;
  count: number;
  total: bigint;
  bulk: BulkKind | null;
  onBulk: (b: BulkKind | null) => void;
  onApply: (value: string) => string | null;
  onRemove: () => void;
  onClear: () => void;
}) {
  return (
    <FloatingToast
      show={show}
      // Marks the page while it's up, so the unsaved-changes toast can move above it.
      data-selection-toast
      layout
      containerClassName="z-40"
      // 8px around the 10px-radius buttons, so an 18px corner keeps them concentric.
      className="min-h-13 rounded-[18px] py-2 pr-2 pl-4"
    >
        {bulk ? (
          <motion.div layout="position" key="form" className="flex-1">
            <BulkAmountToastForm kind={bulk} count={count} onApply={onApply} onClose={() => onBulk(null)} />
          </motion.div>
        ) : (
          <motion.div layout="position" key="summary" className="flex min-w-0 flex-1 items-center gap-1">
            <p className="mr-auto flex min-w-0 items-baseline gap-1 text-15 font-medium tabular">
              {/* The count rolls rather than swapping, so it reads as one toast updating. An invisible
                  copy of the current count sizes the box, so 9 → 10 widens it instead of clipping. */}
              <span className="relative inline-flex shrink-0 overflow-hidden">
                <span className="invisible" aria-hidden>
                  {formatCount(count)}
                </span>
                <AnimatePresence initial={false}>
                  <motion.span
                    key={count}
                    className="absolute inset-y-0 left-0"
                    initial={{ opacity: 0, transform: "translateY(60%)" }}
                    animate={{ opacity: 1, transform: "translateY(0%)" }}
                    exit={{ opacity: 0, transform: "translateY(-60%)" }}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                  >
                    {formatCount(count)}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="shrink-0">selected</span>
              {/* Shortened like the summary card's total ("100B"); the exact amount is in the title. */}
              <span
                className={cn("ml-1 truncate text-13 font-normal", toastTone.muted)}
                title={`${formatAmount(total)} ${USDC.symbol}`}
              >
                {formatFigure(total)} {USDC.symbol}
              </span>
            </p>
            <ToastAction onClick={() => onBulk("same")}>Set amount</ToastAction>
            <ToastAction onClick={() => onBulk("split")}>Split</ToastAction>
            <ToastAction onClick={onRemove}>Remove</ToastAction>
            {/* The one way out: finishes and clears the selection, and the toast leaves with it. */}
            <Tooltip content="Finish and clear the selection (Esc)">
              <button
                type="button"
                onClick={onClear}
                className={cn("pressable ml-1 h-9 shrink-0 rounded-[10px] px-3.5 text-14 font-semibold whitespace-nowrap", toastTone.primary)}
              >
                Done
              </button>
            </Tooltip>
          </motion.div>
        )}
    </FloatingToast>
  );
}

function ToastAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("pressable h-9 shrink-0 rounded-[10px] px-2.5 text-14 font-semibold whitespace-nowrap", toastTone.action)}
    >
      {children}
    </button>
  );
}
