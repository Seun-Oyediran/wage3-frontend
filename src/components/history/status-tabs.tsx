"use client";

import { motion } from "motion/react";

import { useRovingFocus } from "@/hooks/use-roving-focus";
import type { SentStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { SLIDE } from "@/lib/motion";
import { DISPLAY_TEXT } from "@/lib/type";

import { STATUSES } from "./use-history";

/**
 * Status filter drawn as underlined tabs. It filters one table rather than switching panels,
 * so it's a radio group.
 */
export function StatusTabs({ value, onChange }: { value: SentStatus | undefined; onChange: (v: SentStatus | undefined) => void }) {
  const selected = Math.max(0, STATUSES.findIndex((s) => s.value === value));
  const roving = useRovingFocus({ count: STATUSES.length, selected, onSelect: (i) => onChange(STATUSES[i].value) });

  return (
    <div
      role="radiogroup"
      aria-label="Status"
      onKeyDown={roving.onKeyDown}
      className="flex w-fit max-w-full gap-6 self-start overflow-x-auto"
    >
      {STATUSES.map((s, i) => {
        const on = i === selected;
        return (
          <button
            key={s.label}
            {...roving.itemProps(i)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s.value)}
            className={cn(
              // One weight for every tab, so the sliding underline never changes width mid-slide.
              DISPLAY_TEXT,
              "relative pb-1.5 text-15 font-medium whitespace-nowrap transition-colors duration-150",
              on ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {s.label}
            {on && (
              <motion.span layoutId="history-tab" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-fg" transition={SLIDE} />
            )}
          </button>
        );
      })}
    </div>
  );
}
