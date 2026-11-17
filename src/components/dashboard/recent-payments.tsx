"use client";

import Link from "next/link";

import { Card, CardBody } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { PayoutStatusBadge } from "@/components/ui/status-badge";
import { useSentHistory } from "@/lib/api/queries";
import type { SentHistoryQuery, SentPayout } from "@/lib/api/types";
import { formatRelative, formatToken, pluralize } from "@/lib/utils/format";
import { DOTTED_UNDERLINE } from "@/lib/type";

/** The dashboard page reads the same query to detect a first run, so both share one request. */
export const RECENT_PAYMENTS_QUERY: SentHistoryQuery = { limit: 5 };

export function RecentPayments() {
  const history = useSentHistory(RECENT_PAYMENTS_QUERY);

  return (
    <Section title="Recent payments">
      {history.isError ? (
        <ErrorState compact error={history.error} onRetry={() => history.refetch()} retrying={history.isFetching} />
      ) : (
        <Card className="flex flex-col overflow-hidden">
          {history.isLoading ? (
            <RowsSkeleton />
          ) : (
            <ul className="divide-y divide-border">
              {history.data?.items.map((p) => (
                <li key={p.id}>
                  <PaymentRow payment={p} />
                </li>
              ))}
              <li>
                <Link
                  href="/history"
                  className="flex items-center justify-center py-3 text-13 font-medium text-fg-muted transition-colors duration-150 hover:bg-surface-hover hover:text-fg"
                >
                  <span className={DOTTED_UNDERLINE}>View all payments</span>
                </Link>
              </li>
            </ul>
          )}
        </Card>
      )}
    </Section>
  );
}

function PaymentRow({ payment: p }: { payment: SentPayout }) {
  return (
    <Link href={`/pay/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-surface-hover">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{p.name}</span>
        <span className="block text-xs text-fg-subtle">
          {pluralize(p.recipient_count ?? 0, "recipient")} · {formatRelative(p.sent_at ?? p.created_at)}
        </span>
      </span>
      <span className="flex flex-col items-end gap-1">
        <span className="text-sm font-medium tabular">{formatToken(p.total_amount, p.token_symbol, p.token_decimals)}</span>
        <PayoutStatusBadge status={p.status} grouped />
      </span>
    </Link>
  );
}

function RowsSkeleton() {
  return (
    <CardBody className="flex flex-col gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-1.5 h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </CardBody>
  );
}
