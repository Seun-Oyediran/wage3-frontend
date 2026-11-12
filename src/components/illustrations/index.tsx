"use client";

import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";

import { cn } from "@/lib/utils/cn";

import { HISTORY_DURATION, HistoryScene } from "./history-scene";
import { LISTS_DURATION, ListsScene } from "./lists-scene";
import { NO_MATCHES_DURATION, NoMatchesScene } from "./no-matches-scene";
import { ROWS_DURATION, RowsScene } from "./rows-scene";
import { VIEW_BOX } from "./shared";

export type IllustrationId = "lists" | "history" | "rows" | "no-matches";

/** Each scene, and how long its entrance runs in seconds. */
const SCENES: Record<IllustrationId, { Scene: () => React.JSX.Element; duration: number }> = {
  lists: { Scene: ListsScene, duration: LISTS_DURATION },
  history: { Scene: HistoryScene, duration: HISTORY_DURATION },
  rows: { Scene: RowsScene, duration: ROWS_DURATION },
  "no-matches": { Scene: NoMatchesScene, duration: NO_MATCHES_DURATION },
};

/**
 * The slot's colours. --illo-plate is the card behind it: solids filled with
 * it hide what's behind them. Grey hairlines; the hero is brand blue mixed
 * halfway into the card, so it marks the scene without shouting.
 */
const COLORS =
  "[--illo-plate:var(--surface)] [--illo-line:var(--gray-15)] [--illo-muted:var(--gray-30)] [--illo-ink:color-mix(in_oklch,var(--base-blue)_50%,var(--surface))] [--illo-ok:var(--success-fg)] [--illo-ok-soft:var(--success-soft)]";

/**
 * An empty state's illustration. It plays its entrance once on mount and
 * again on hover, but only once the last run has settled, so hovering
 * mid-entrance doesn't restart it. Remounting the scene by key is the replay.
 */
export function EmptyIllustration({ id, className }: { id: IllustrationId; className?: string }) {
  const { Scene, duration } = SCENES[id];
  const [run, setRun] = useState(0);
  const startedAt = useRef(0);

  // The first run starts on mount.
  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  function replay() {
    const now = performance.now();
    if (now - startedAt.current < duration * 1000) return;
    startedAt.current = now;
    setRun((n) => n + 1);
  }

  return (
    <MotionConfig reducedMotion="user">
      <svg
        viewBox={VIEW_BOX}
        aria-hidden="true"
        onPointerEnter={replay}
        className={cn("size-40 shrink-0", COLORS, className)}
      >
        <g key={run}>
          <Scene />
        </g>
      </svg>
    </MotionConfig>
  );
}
