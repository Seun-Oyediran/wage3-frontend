"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EditableTitle } from "@/components/ui/editable-title";
import { RepeatIcon } from "@/components/ui/icons";
import { PayoutStatusBadge } from "@/components/ui/status-badge";
import { useRenamePayout } from "@/lib/api/queries";
import type { Payout } from "@/lib/api/types";
import { formatDateTime, formatRelative, pluralize } from "@/lib/utils/format";
import { useSendPayout } from "@/lib/send-payout";

import { DraftView } from "./draft-view";
import { PayoutMenu } from "./payout-menu";
import { BatchList, ItemsTable, PayoutProgress } from "./payout-receipt";
import { SaveAsListDialog } from "./save-as-list-dialog";
import { SendCard } from "./send-card";
import { SentView } from "./sent-view";

/**
 * One payment, in whichever state it's in: a draft (rows still editable), mid-send (batches left
 * to send), or sent (the receipt).
 */
export function PayoutView({ payout }: { payout: Payout }) {
  const { state, start, reset } = useSendPayout(payout.id);
  const [saveOpen, setSaveOpen] = useState(false);
  const isDraft = payout.status === "draft";
  const hasReady = payout.batches.some((b) => b.status === "ready");
  const sendActive = state.step !== "idle" && state.step !== "done";
  // Fully sent: Pay again is the main follow-up, so it's a button; otherwise it waits in the menu.
  const payAgainButton = !isDraft && !hasReady;

  return (
    <>
      <header className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <PayoutName payout={payout} />
          {/* Relative time, since the default name already carries the date; the exact time is on hover. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-13 text-fg-muted">
            <PayoutStatusBadge status={payout.status} />
            <span>{pluralize(payout.recipient_count ?? payout.items.length, "person", "people")}</span>
            <span aria-hidden>·</span>
            <time dateTime={payout.created_at} title={formatDateTime(payout.created_at)}>
              Created {formatRelative(payout.created_at)}
            </time>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {payAgainButton && (
            <Button asChild variant="outline">
              <Link href={`/pay/new?from=${payout.id}`}>
                <RepeatIcon className="size-4" /> Pay again
              </Link>
            </Button>
          )}
          <PayoutMenu payout={payout} payAgainInMenu={!payAgainButton} onSaveAsList={() => setSaveOpen(true)} />
        </div>
      </header>

      {payout.status === "cancelled" && (
        <p className="mb-6 rounded-2xl bg-surface-muted px-4 py-3 text-sm text-fg-muted">This payment was cancelled.</p>
      )}

      {isDraft ? (
        <DraftView payout={payout} onSend={start} onRetry={start} state={state} />
      ) : hasReady || sendActive ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            {payout.batches.some((b) => b.status !== "ready") && <PayoutProgress payout={payout} />}
            <BatchList payout={payout} />
            <ItemsTable payout={payout} />
          </div>
          <aside className="lg:sticky lg:top-24">
            <SendCard
              payout={payout}
              total={BigInt(payout.total_amount ?? 0)}
              count={payout.recipient_count ?? payout.items.length}
              state={state}
              onSend={start}
              onRetry={start}
            />
          </aside>
        </div>
      ) : (
        <SentView payout={payout} justFinished={state.step === "done"} onDismiss={reset} onSave={() => setSaveOpen(true)} />
      )}

      <SaveAsListDialog key={String(saveOpen)} payout={payout} open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  );
}

function PayoutName({ payout }: { payout: Payout }) {
  const rename = useRenamePayout(payout.id);
  return (
    <EditableTitle
      // Optimistic: the new name shows while the request is in flight.
      value={rename.isPending && rename.variables ? rename.variables : payout.name}
      label="Payment name"
      onRename={(name) => rename.mutate(name, { onSuccess: () => toast.success("Payment renamed") })}
    />
  );
}
