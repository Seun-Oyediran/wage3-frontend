import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

/** Bar widths (% of the cell) per ghost row, varied so the rows don't look stamped out. */
export const GHOST_WIDTHS = [
  [62, 28, 70, 55],
  [48, 22, 58, 62],
  [70, 34, 66, 50],
  [55, 26, 74, 58],
  [66, 30, 60, 64],
  [44, 24, 68, 52],
  [58, 32, 62, 60],
  [68, 26, 72, 56],
  [50, 30, 64, 62],
  [60, 28, 70, 54],
  [46, 32, 66, 58],
  [64, 24, 60, 50],
  [52, 30, 74, 62],
  [70, 26, 64, 56],
] as const;

/**
 * An empty table: the real header over static ghost rows (not shimmering, so it reads as empty
 * rather than loading), with the message in front on a soft panel. `row` draws one ghost row from
 * its bar widths, in the table's own columns.
 */
export function GhostTable({
  header,
  row,
  children,
}: {
  header: ReactNode;
  row: (widths: readonly number[], index: number) => ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      {header}
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 divide-y divide-border overflow-hidden">
          {GHOST_WIDTHS.map((widths, i) => row(widths, i))}
        </div>
        {/* Tall enough for 12 ghost rows, with the message centred in them on its own panel. */}
        <div className="relative flex min-h-144 flex-col items-center justify-center">
          {/* 80% card colour, with a same-colour shadow spreading out so the panel has no hard edge. */}
          <div className="rounded-3xl bg-surface/80 shadow-[0_0_72px_56px_color-mix(in_oklch,var(--surface)_80%,transparent)]">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
}

/** A grey bar `width`% of its cell. */
export function GhostBar({ width, className }: { width: number; className?: string }) {
  return <span className={cn("h-2.5 rounded-full bg-surface-muted", className)} style={{ width: `${Math.min(width, 100)}%` }} />;
}
