"use client";

import { useRef, type KeyboardEvent } from "react";

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Keyboard for a row of options where one is chosen (segmented controls, tabs, radio groups):
 * Tab lands on the chosen option only; arrow keys (and Home/End) move to another and choose it.
 * Spread `onKeyDown` on the container and `itemProps(i)` on each option.
 */
export function useRovingFocus({ count, selected, onSelect }: { count: number; selected: number; onSelect: (index: number) => void }) {
  const items = useRef<(HTMLElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent) => {
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? count - 1 : e.key in STEP ? (selected + STEP[e.key] + count) % count : null;
    if (next === null) return;
    e.preventDefault();
    items.current[next]?.focus();
    onSelect(next);
  };

  const itemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      items.current[index] = el;
    },
    tabIndex: index === selected ? 0 : -1,
  });

  return { onKeyDown, itemProps };
}
