import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 text-13 font-medium text-fg-subtle">
            {eyebrow}
          </div>
        )}
        {/* 32px line box, so a long payment or list name that wraps keeps its lines apart. */}
        <h1 className="headline text-26 leading-8 font-normal text-balance">
          {title}
        </h1>
        {/* Title and description read as one item: the same ink gap as before (the taller line box
            already adds 2px below the title, so the margin drops from 6px to 4px). */}
        {description && (
          <p className="mt-1 max-w-xl text-14 leading-5 font-normal tracking-[-0.0046em] text-fg-muted text-pretty">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

/** PageHeader's footprint while a page can't render yet: the title's 32px line and one line of description. */
export function PageHeaderSkeleton() {
  return (
    <div aria-hidden className="pb-8">
      <div className="flex h-8 items-center">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="mt-1 flex h-5 items-center">
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>
    </div>
  );
}
