import Link from "next/link";
import type { ReactNode } from "react";

import { Address } from "@/components/ui/address";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PayoutStatusBadge } from "@/components/ui/status-badge";
import type { SentPayout } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { formatAmount, formatCount, formatDateTime, formatDateTimeShort } from "@/lib/utils/format";
import { USDC } from "@/lib/config";

const COLS =
  "md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.6fr)_minmax(0,1.1fr)_minmax(0,1.2fr)]";

/**
 * Sent payments as a table on desktop; on phones each row stacks, with labels inline. One size
 * (13px) with two dark anchors, the name and the amount; everything else is grey.
 */
export function HistoryTable({ items }: { items: SentPayout[] }) {
  return (
    <>
      <TableHeader />
      <ul className="divide-y divide-border">
        {items.map((p) => (
          <li key={p.id} className="relative transition-colors duration-150 hover:bg-surface-hover">
            {/* The row link sits under the cells, so the sender address's copy/explorer buttons stay clickable. */}
            <Link href={`/pay/${p.id}`} className="absolute inset-0" aria-label={`Open ${p.name}`} />
            <div className={cn("pointer-events-none relative grid grid-cols-2 gap-x-4 gap-y-1.5 px-5 py-4 md:items-center md:gap-y-0 md:py-3", COLS)}>
              <span className="col-span-2 truncate text-13 font-medium md:col-span-1">{p.name}</span>
              <span className="order-last md:order-none">
                <PayoutStatusBadge status={p.status} grouped />
              </span>
              <Cell label="Recipients" className="md:text-right">
                {formatCount(p.recipient_count ?? 0)}
              </Cell>
              <Cell label="Amount" className="font-medium md:text-right md:text-fg">
                {formatAmount(p.total_amount, p.token_decimals ?? USDC.decimals)}{" "}
                <span className="font-normal text-fg-muted">{p.token_symbol ?? USDC.symbol}</span>
              </Cell>
              <Cell label="Batches" className="md:text-right">
                {p.confirmed_batch_count}/{p.batch_count}
              </Cell>
              <Cell label="Sent">
                <time dateTime={p.sent_at ?? undefined} title={formatDateTime(p.sent_at)}>
                  {formatDateTimeShort(p.sent_at)}
                </time>
              </Cell>
              <span className="pointer-events-auto hidden md:block">
                {p.sender_address ? (
                  <Address value={p.sender_address} textClassName="text-12 text-fg-muted" />
                ) : (
                  <span className="text-fg-subtle">—</span>
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function TableHeader() {
  return (
    <div className={cn("hidden gap-4 bg-surface-sunken px-5 py-3 text-12 font-medium text-fg-subtle md:grid", COLS)}>
      <span>Name</span>
      <span>Status</span>
      <span className="text-right">Recipients</span>
      <span className="text-right">Amount</span>
      <span className="text-right">Batches</span>
      <span>Sent</span>
      <span>Sender</span>
    </div>
  );
}

// Varied bar widths (% of the cell) so the ghost rows don't look stamped out.
const GHOST_ROWS = [
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
];

/**
 * The table with nothing in it: the real header over static ghost rows (not shimmering, so it
 * reads as empty rather than loading), under a 60% veil of the card's colour so they show
 * through without competing with the message in front.
 */
export function HistoryTableEmpty({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <TableHeader />
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 divide-y divide-border overflow-hidden">
          {GHOST_ROWS.map(([name, amount, sent, sender], i) => (
            <div key={i} className={cn("grid h-12 grid-cols-2 items-center gap-4 px-5", COLS)}>
              <GhostBar width={name} />
              <span className="h-5 w-16 justify-self-end rounded-full bg-surface-muted md:justify-self-start" />
              <GhostBar width={30} className="hidden justify-self-end md:block" />
              <GhostBar width={amount * 2} className="hidden justify-self-end md:block" />
              <GhostBar width={25} className="hidden justify-self-end md:block" />
              <GhostBar width={sent} className="hidden md:block" />
              <GhostBar width={sender} className="hidden md:block" />
            </div>
          ))}
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

function GhostBar({ width, className }: { width: number; className?: string }) {
  return <span className={cn("h-2.5 rounded-full bg-surface-muted", className)} style={{ width: `${Math.min(width, 100)}%` }} />;
}

/** A value with its column name in front on phones, where there's no header row. */
function Cell({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <span className={cn("text-13 text-fg-muted tabular", className)}>
      <span className="text-fg-subtle md:hidden">{label}: </span>
      {children}
    </span>
  );
}

export function HistoryTableSkeleton() {
  return (
    <Card className="overflow-hidden" aria-busy>
      <div className="bg-surface-sunken px-5 py-3">
        <Skeleton className="h-3 w-48" />
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0 md:py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="ml-auto h-4 w-24" />
          <Skeleton className="hidden h-4 w-28 md:block" />
        </div>
      ))}
    </Card>
  );
}
