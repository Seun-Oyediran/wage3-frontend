import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { EqualIcon, ImportIcon, SplitIcon } from "@/components/ui/icons";
import { USDC } from "@/lib/config";
import { cn } from "@/lib/utils/cn";
import { formatAmount, pluralize } from "@/lib/utils/format";

import type { BulkKind } from "./bulk-amount-form";

/**
 * Above the table, one fixed 48px slot: while nobody's added (desktop), the CSV drop hint fills
 * it; once someone is, the tools fade in in the same place, so nothing below moves. Who's in it
 * and the total live in the page around it (summary card, list header); it only names a count
 * while filtered ("2 of 3 people"). Selection actions live in the toast.
 */
export function EditorToolbar({
  people,
  inView,
  total,
  disabled,
  bulk,
  onBulk,
  onImport,
}: {
  people: number;
  /** Rows in view when the table is filtered; undefined when it isn't. */
  inView?: number;
  /** Total of the rows in view. */
  total: bigint;
  disabled: boolean;
  bulk: BulkKind | null;
  onBulk: (b: BulkKind | null) => void;
  onImport: () => void;
}) {
  const filtered = inView !== undefined;
  const showHint = people === 0 && !filtered && !disabled;
  if (disabled && !filtered) return null;
  return (
    <div className="relative mb-4 flex min-h-12 flex-wrap items-center gap-2">
      {/* Desktop only: phones can't drag files in, so they keep the Import button. */}
      <AnimatePresence initial={false}>
        {showHint && (
          <motion.button
            key="hint"
            type="button"
            onClick={onImport}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 hidden cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-border px-4 text-left text-13 text-fg-muted transition-colors duration-150 hover:bg-surface-hover md:flex"
          >
            <ImportIcon className="size-4 shrink-0" />
            <span className="truncate">
              Drop a CSV anywhere on this page, or <span className="font-medium text-fg">choose a file</span>. You&apos;ll pick
              who to add before anything changes.
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {filtered && (
        <div className="flex items-baseline gap-3">
          <span className="text-13 font-medium">
            {inView} of {pluralize(people, "person", "people")}
          </span>
          <span className="text-13 text-fg-muted tabular">
            {formatAmount(total)} {USDC.symbol}
          </span>
        </div>
      )}
      {!disabled && (
        <div
          aria-hidden={showHint || undefined}
          className={cn(
            "ml-auto flex flex-wrap items-center gap-2 transition-opacity duration-150",
            // Under the hint on desktop: hidden but still holding the slot's height.
            showHint && "md:pointer-events-none md:opacity-0",
          )}
        >
          {people > 0 && (
            <>
              <Tooltip content="Give everyone the same amount">
                <Button variant="ghost" size="sm" onClick={() => onBulk(bulk === "same" ? null : "same")}>
                  <EqualIcon className="size-4" /> Same amount
                </Button>
              </Tooltip>
              <Tooltip content="Divide one total evenly between everyone">
                <Button variant="ghost" size="sm" onClick={() => onBulk(bulk === "split" ? null : "split")}>
                  <SplitIcon className="size-4" /> Split total
                </Button>
              </Tooltip>
            </>
          )}
          <Button variant="outline" size="sm" onClick={onImport} tabIndex={showHint ? -1 : undefined} className={cn(showHint && "md:invisible")}>
            <ImportIcon className="size-4" /> Import CSV
          </Button>
        </div>
      )}
    </div>
  );
}
