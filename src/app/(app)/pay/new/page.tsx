"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { BlockedRowsBanner } from "@/components/pay/new/blocked-rows-banner";
import { PaymentSummary } from "@/components/pay/new/payment-summary";
import { startingPoint, type StartingPoint } from "@/components/pay/new/starting-point";
import { useBlockedRows } from "@/components/pay/new/use-blocked-rows";
import { RecipientsEditor } from "@/components/recipients/recipients-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { useCreatePayout, useList, usePayout } from "@/lib/api/queries";
import { chain, LIMITS, USDC } from "@/lib/config";
import { formatDate, pluralize } from "@/lib/utils/format";
import { rowsToPayoutItems, validateRows } from "@/lib/recipients";

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<ComposerSkeleton />}>
      <Source />
    </Suspense>
  );
}

/** `?list=<id>` starts from a list; `?from=<payoutId>` pays a past payment again (`&only=unpaid` for who wasn't paid). */
function Source() {
  const params = useSearchParams();
  const listId = params.get("list") ?? undefined;
  const fromId = params.get("from") ?? undefined;
  const unpaidOnly = params.get("only") === "unpaid";
  const list = useList(listId);
  const payout = usePayout(fromId);
  const source = listId ? list : fromId ? payout : null;

  if (source?.isPending) return <ComposerSkeleton />;
  if (source?.isError) {
    const notFound = source.error.isNotFound;
    return (
      <Card>
        <ErrorState
          error={source.error}
          title={notFound ? (listId ? "List not found" : "Payment not found") : undefined}
          onRetry={notFound ? undefined : () => source.refetch()}
          retrying={source.isFetching}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/pay/new">Start from scratch</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const start = startingPoint({
    list: listId ? list.data : undefined,
    payout: !listId && fromId ? payout.data : undefined,
    unpaidOnly,
  });
  // Keyed so switching source remounts with fresh state.
  return <Composer key={`${listId ?? fromId ?? "new"}-${unpaidOnly}`} start={start} />;
}

/**
 * "Review payment" holds for at least this long even when the server is faster, so the step reads
 * as checked rather than skipped. Errors still show at once.
 */
const MIN_REVIEW_MS = 1000;

function Composer({ start }: { start: StartingPoint }) {
  const router = useRouter();
  const [rows, setRows] = useState(start.rows);
  const [name, setName] = useState(start.name);
  const [attempted, setAttempted] = useState(false);
  const [holding, setHolding] = useState(false);
  const create = useCreatePayout({ meta: { errorToast: false } });

  // Leaving during the hold cancels the redirect, so it can't pull you back here.
  const redirect = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(redirect.current), []);

  const validation = useMemo(() => validateRows(rows, "payout"), [rows]);
  const blocked = useBlockedRows({ rows, setRows, validation, attempted });
  const nameError = name.trim().length > LIMITS.nameLength ? `At most ${LIMITS.nameLength} characters` : null;

  const submit = () => {
    setAttempted(true);
    if (!validation.filledCount) return toast.error("Add at least one person to pay.");
    if (!validation.isValid) return toast.error(`Fix ${pluralize(validation.invalidCount, "row")} before continuing.`);
    if (nameError) return toast.error(`Shorten the name to ${LIMITS.nameLength} characters or fewer.`);

    const started = performance.now();
    setHolding(true);
    create.mutate(
      {
        name: name.trim() || null,
        list_id: start.listId,
        chain_id: chain.id,
        token_address: USDC.address,
        items: rowsToPayoutItems(rows),
      },
      {
        onSuccess: (payout) => {
          const wait = Math.max(0, MIN_REVIEW_MS - (performance.now() - started));
          redirect.current = setTimeout(() => router.push(`/pay/${payout.id}`), wait);
        },
        onError: () => setHolding(false),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="New payment"
        description={start.origin ?? "Add who you're paying and how much. You'll review it all before anything is sent."}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <Card className="p-5">
          {blocked.count > 0 && (
            <BlockedRowsBanner
              count={blocked.count}
              showingOnly={!!blocked.showOnly}
              onToggleShow={blocked.toggleShowOnly}
              onRemove={blocked.remove}
            />
          )}
          <RecipientsEditor
            rows={rows}
            onChange={setRows}
            mode="payout"
            // Showing the blocked rows also shows their faults, without waiting for a Review attempt.
            showAllErrors={attempted || !!blocked.showOnly}
            only={blocked.showOnly}
            flush
          />
          <div className="pt-5">
            <Field label="Name (optional)" htmlFor="payout-name" hint="Shown in your history. Leave blank for today's date." error={nameError}>
              <Input
                id="payout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Payment ${formatDate(new Date())}`}
                invalid={!!nameError}
              />
            </Field>
          </div>
        </Card>

        <aside className="lg:sticky lg:top-24">
          <PaymentSummary
            total={blocked.payableTotal}
            heldTotal={blocked.count > 0 ? blocked.heldTotal : undefined}
            people={blocked.payableCount}
            canReview={validation.filledCount > 0}
            reviewing={create.isPending || holding}
            error={create.error?.message}
            onReview={submit}
          />
        </aside>
      </div>
    </>
  );
}

function ComposerSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-5 w-96 max-w-full" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
