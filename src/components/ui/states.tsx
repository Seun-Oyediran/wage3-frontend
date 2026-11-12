"use client";

import { motion } from "motion/react";
import { RotateCw, WifiOff } from "lucide-react";
import type { ReactNode } from "react";

import { WarningIcon } from "@/components/ui/icons";
import { toApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { riseIn } from "@/lib/motion";

import { Button } from "./button";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div {...riseIn()} className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      {icon && (
        <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-surface-muted text-fg-muted [&_svg]:size-5">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold tracking-[-0.01em] text-balance">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-fg-muted text-pretty">{description}</p>
      )}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </motion.div>
  );
}

/** Inline error for a failed query, with a retry. */
export function ErrorState({
  error,
  onRetry,
  retrying,
  title,
  action,
  className,
  compact,
}: {
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  title?: string;
  /** A way out beside Try again (e.g. "Start from scratch"). Full size only. */
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const e = toApiError(error);
  const Icon = e.isNetwork ? WifiOff : WarningIcon;

  if (compact) {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-center gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-fg",
          className,
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1">{e.message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="pressable inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
          >
            <RotateCw className={cn("size-3.5", retrying && "animate-spin")} /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-danger-soft text-danger-fg">
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-semibold tracking-[-0.01em]">
        {title ?? (e.isNetwork ? "You're offline" : e.isNotFound ? "Not found" : "Couldn't load this")}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-fg-muted text-pretty">{e.message}</p>
      {(onRetry || action) && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} loading={retrying}>
              <RotateCw className="size-3.5" /> Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * Empty state for a page's first use: an illustration (a placeholder square until one is passed),
 * a heading, one line on why, then the main action and a quiet secondary one, in a narrow column.
 */
export function IllustratedEmpty({
  illustration,
  title,
  description,
  actions,
  align = "start",
}: {
  illustration?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions: ReactNode;
  /** "center" when it sits over something, like an empty table's ghost rows: centred and compact. */
  align?: "start" | "center";
}) {
  const placeholder = <div aria-hidden className="size-40 rounded-2xl bg-surface-muted" />;

  if (align === "center") {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        {illustration ?? placeholder}
        <p className="mt-4 max-w-xs text-14 font-medium text-pretty">{title}</p>
        {description && <p className="mt-1 max-w-xs text-13 text-fg-muted text-pretty">{description}</p>}
        <div className="mt-4 flex items-center gap-5">{actions}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-start">
        {illustration ?? placeholder}
        <h2 className="headline mt-8 text-24 font-normal">{title}</h2>
        {description && <p className="mt-2 text-14 leading-5 text-fg-muted text-pretty">{description}</p>}
        <div className="mt-6 flex items-center gap-5">{actions}</div>
      </div>
    </div>
  );
}
