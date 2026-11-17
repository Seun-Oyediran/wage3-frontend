import type { ReactNode } from "react";

import { WarningIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

const TONES = {
  danger: { box: "bg-danger-soft text-danger-fg", title: "text-(--red-12)" },
  warning: { box: "bg-warning-soft text-warning-fg", title: "text-(--amber-12)" },
} as const;

/**
 * A problem with its fix, above the thing it's about: a bold first sentence, the detail, and
 * buttons. One pill-shaped line on desktop (12px around the buttons, so a 28px corner); on
 * phones the buttons drop under the text.
 */
export function ActionBanner({
  tone,
  title,
  children,
  actions,
  className,
}: {
  tone: keyof typeof TONES;
  title: ReactNode;
  children?: ReactNode;
  /** Omit when there's nothing to do yet; the banner is then just the message. */
  actions?: ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl p-4 [corner-shape:superellipse(1.5)] sm:flex-row sm:items-center sm:rounded-[28px] sm:py-3",
        actions ? "sm:pr-3" : "sm:pr-4",
        t.box,
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <WarningIcon className="mt-0.5 size-4 shrink-0" />
        <p className="text-13 leading-5 text-pretty">
          <span className={cn("font-medium", t.title)}>{title}</span>
          {children && <> {children}</>}
        </p>
      </div>
      {/* Lined up with the text (past the icon) when stacked. */}
      {actions && <div className="ml-7 flex gap-1 sm:ml-0">{actions}</div>}
    </div>
  );
}
