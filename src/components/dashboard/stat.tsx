import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { DISPLAY_FIGURE } from "@/lib/type";

/** One figure in the overview strip: a label with an explainer, the value, and an optional line under it. */
export function Stat({
  label,
  info,
  sub,
  loading,
  empty,
  children,
}: {
  label: string;
  info: string;
  sub?: ReactNode;
  loading?: boolean;
  /** Nothing to show yet: a grey dash, so it doesn't read as a value. */
  empty?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 lg:shrink-0 lg:border-l lg:border-hairline lg:px-8 lg:first:border-l-0 lg:first:pl-0">
      <div className="flex items-center gap-1.5 text-13 text-fg-muted">
        {label}
        <InfoTip label={label}>{info}</InfoTip>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <div className={cn(DISPLAY_FIGURE, "text-28 whitespace-nowrap", empty && "text-fg-subtle")}>
          {empty ? "-" : children}
        </div>
      )}
      {sub && <div className="truncate text-13 text-fg-subtle tabular">{sub}</div>}
    </div>
  );
}

/** The token symbol after a figure, in body type. */
export function StatUnit({ children }: { children: ReactNode }) {
  return <span className="ml-1.5 font-sans text-sm font-normal tracking-normal text-fg-muted">{children}</span>;
}
