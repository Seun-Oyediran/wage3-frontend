import Link from "next/link";
import type { ReactNode } from "react";

import { Address } from "@/components/ui/address";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PayoutStatusBadge } from "@/components/ui/status-badge";
import type { SentPayout } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatDateTime, formatToken } from "@/lib/utils/format";

const COLS =
  "md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.6fr)_minmax(0,1.1fr)_minmax(0,1.2fr)]";

/** Sent payments as a table on desktop; on phones each row stacks, with labels inline. */
export function HistoryTable({ items }: { items: SentPayout[] }) {
  return (
    <>
      <div className={cn("hidden gap-4 border-b border-border bg-surface-sunken px-5 py-2.5 text-xs font-medium text-fg-subtle md:grid", COLS)}>
        <span>Name</span>
        <span>Status</span>
        <span className="text-right">Recipients</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Batches</span>
        <span>Sent</span>
        <span>Sender</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((p) => (
          <li key={p.id} className="relative transition-colors duration-150 hover:bg-surface-hover">
            {/* The row link sits under the cells, so the sender address's copy/explorer buttons stay clickable. */}
            <Link href={`/pay/${p.id}`} className="absolute inset-0" aria-label={`Open ${p.name}`} />
            <div className={cn("pointer-events-none relative grid grid-cols-2 gap-x-4 gap-y-1.5 px-5 py-4 md:items-center md:gap-y-0", COLS)}>
              <span className="col-span-2 truncate text-sm font-medium md:col-span-1">{p.name}</span>
              <span className="order-last md:order-none">
                <PayoutStatusBadge status={p.status} grouped />
              </span>
              <Cell label="Recipients" className="md:text-right">
                {formatCount(p.recipient_count ?? 0)}
              </Cell>
              <Cell label="Amount" className="font-medium md:text-right">
                {formatToken(p.total_amount, p.token_symbol, p.token_decimals)}
              </Cell>
              <Cell label="Batches" className="md:text-right">
                {p.confirmed_batch_count}/{p.batch_count}
              </Cell>
              <Cell label="Sent">{formatDateTime(p.sent_at)}</Cell>
              <span className="pointer-events-auto hidden md:block">
                {p.sender_address ? <Address value={p.sender_address} /> : <span className="text-fg-subtle">—</span>}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** A value with its column name in front on phones, where there's no header row. */
function Cell({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <span className={cn("text-13 text-fg-muted tabular md:text-sm md:text-fg", className)}>
      <span className="text-fg-subtle md:hidden">{label}: </span>
      {children}
    </span>
  );
}

export function HistoryTableSkeleton() {
  return (
    <Card className="overflow-hidden" aria-busy>
      <div className="border-b border-border bg-surface-sunken px-5 py-2.5">
        <Skeleton className="h-3 w-48" />
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="ml-auto h-4 w-24" />
          <Skeleton className="hidden h-4 w-28 md:block" />
        </div>
      ))}
    </Card>
  );
}
