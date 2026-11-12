import type { ReactNode } from "react";

import { InfoTip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { LIMITS, USDC } from "@/lib/config";
import { formatAmount, formatFigure } from "@/lib/utils/format";
import { DISPLAY_FIGURE } from "@/lib/type";

/*
 * The pieces of a payment's summary card, shared by New payment and the send card on a payment:
 * the big total, then label/value rows.
 */

export function SummaryTotal({ label, amount }: { label: string; amount: bigint }) {
  return (
    <>
      <div className="text-13 font-medium text-fg-muted">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        {/* Large figures are shortened; the exact amount is in the title. */}
        <span className={cn(DISPLAY_FIGURE, "text-24")} title={`${formatAmount(amount)} ${USDC.symbol}`}>
          {formatFigure(amount)}
        </span>
        <span className="text-sm text-fg-muted">{USDC.symbol}</span>
      </div>
    </>
  );
}

export function SummaryList({ children }: { children: ReactNode }) {
  return <dl className="mt-5 flex flex-col gap-2.5 text-13">{children}</dl>;
}

export function SummaryRow({ label, info, children }: { label: string; info?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1 text-fg-subtle">
        {label}
        {info && (
          <InfoTip label={label} align="start">
            {info}
          </InfoTip>
        )}
      </dt>
      <dd className="font-medium tabular">{children}</dd>
    </div>
  );
}

/** How many times the wallet will ask: one approval for the total, then one per batch. */
export function PermissionsRow({ prompts }: { prompts: number | null }) {
  return (
    <SummaryRow
      label="Permissions required"
      info={
        <>
          One to confirm the exact {USDC.symbol} total, then one per transaction of up to {LIMITS.batchSize} people. Your
          wallet asks you to approve each.
        </>
      }
    >
      {prompts ? `Up to ${prompts}` : "—"}
    </SummaryRow>
  );
}
