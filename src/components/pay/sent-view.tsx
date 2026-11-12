"use client";

import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

import { ActionBanner } from "@/components/ui/action-banner";
import { Button } from "@/components/ui/button";
import type { Payout } from "@/lib/api/types";
import { formatCount, pluralize } from "@/lib/utils/format";

import { BatchList, ItemsTable, PayoutProgress } from "./payout-receipt";

/** A sent payment: its progress, batches and people, with a way to retry anyone who wasn't paid. */
export function SentView({
  payout,
  justFinished,
  onDismiss,
  onSave,
}: {
  payout: Payout;
  justFinished: boolean;
  onDismiss: () => void;
  onSave: () => void;
}) {
  const fromList = !!payout.list_id;
  // Sending just finished: say so once in a toast (the progress card shows the status), with
  // Save as list as its follow-up. Resetting clears justFinished.
  useEffect(() => {
    if (!justFinished) return;
    toast(payout.status === "paid" ? "Sent and confirmed on Base" : "Sent. Base is confirming it now", {
      id: `sent-${payout.id}`, // one toast even if the effect runs twice (dev StrictMode)
      duration: fromList ? 4000 : 8000,
      action: fromList ? undefined : { label: "Save as list", onClick: onSave },
    });
    onDismiss();
  }, [justFinished, payout.id, payout.status, fromList, onSave, onDismiss]);

  return (
    <div className="flex flex-col gap-6">
      <RemainingBanner payout={payout} />
      <PayoutProgress payout={payout} />
      <BatchList payout={payout} />
      <ItemsTable payout={payout} />
    </div>
  );
}

/**
 * Partly paid: one action to pay only the people who weren't. Held back while any batch is still
 * confirming, because a slow batch can still land and retrying it would pay twice.
 */
function RemainingBanner({ payout }: { payout: Payout }) {
  const unpaid = payout.items.filter((i) => i.status !== "paid");
  const settling = payout.batches.some((b) => b.status === "submitted");
  if (payout.status !== "partially_paid" || !unpaid.length) return null;

  return (
    <ActionBanner
      tone="warning"
      title={
        settling
          ? `${pluralize(unpaid.length, "person hasn't", "people haven't")} been paid yet.`
          : `${pluralize(unpaid.length, "person wasn't", "people weren't")} paid.`
      }
      actions={
        !settling && (
          <Button asChild size="sm">
            <Link href={`/pay/new?from=${payout.id}&only=unpaid`}>Pay the {formatCount(unpaid.length)} remaining</Link>
          </Button>
        )
      }
    >
      {settling ? "Some batches are still confirming on Base, so wait before retrying." : "Everyone else was."}
    </ActionBanner>
  );
}
