"use client";

import { AnimatePresence, motion } from "motion/react";

import { RecipientsEditor } from "@/components/recipients/recipients-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Payout } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { useReviewChecks } from "@/lib/review-checks";
import type { useSendPayout } from "@/lib/send-payout";

import { ReviewFlags } from "./review-flags";
import { SendCard } from "./send-card";
import { usePayoutDraft } from "./use-payout-draft";

/** A draft: its rows are still editable, with anything worth a second look above them. */
export function DraftView({
  payout,
  state,
  onSend,
  onRetry,
}: {
  payout: Payout;
  state: ReturnType<typeof useSendPayout>["state"];
  onSend: () => void;
  onRetry: () => void;
}) {
  const draft = usePayoutDraft(payout);
  const checks = useReviewChecks(payout, draft.rows, draft.total);
  const send = () => draft.send(onSend);
  const list = draft.changedList;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <ReviewFlags flags={checks.flags} checked={checks.checked} recentDuplicate={checks.recentDuplicate} />
        {/* The table runs to the card's bottom edge, so the save notice and list option sit below it. */}
        <Card className="min-w-0 overflow-hidden bg-(--color-25) p-5">
          <RecipientsEditor
            rows={draft.rows}
            onChange={draft.setRows}
            mode="payout"
            flush="end"
            showAllErrors={draft.attempted}
            disabled={state.step !== "idle" && state.step !== "error"}
          />
        </Card>

        <AnimatePresence initial={false}>
          {(draft.dirty || draft.saveError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-13",
                  draft.saveError ? "bg-danger-soft text-danger-fg" : "bg-surface-muted text-fg-muted",
                )}
              >
                <span className="flex-1">{draft.saveError ? draft.saveError.message : "Changes are saved when you send, or now."}</span>
                <Button size="sm" variant="outline" loading={draft.saving} disabled={!draft.isValid} onClick={draft.saveDraft}>
                  Save draft
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {list && (
          <label className="flex items-center gap-2.5 px-1 text-13 text-fg-muted">
            <Checkbox checked={draft.updateList} onCheckedChange={(on) => draft.setUpdateList(on)} />
            Update “{list.name}” with these changes
          </label>
        )}
      </div>

      <aside className="lg:sticky lg:top-24">
        <SendCard
          payout={payout}
          total={draft.total}
          count={draft.filledCount}
          state={state}
          onSend={send}
          requireTypedTotal={checks.requireTypedTotal}
          // Edits since the failure are saved before retrying.
          onRetry={draft.dirty ? send : onRetry}
          disabledReason={draft.blockedReason}
        />
      </aside>
    </div>
  );
}
