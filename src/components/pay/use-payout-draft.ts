"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useLeaveWarning } from "@/hooks/use-leave-warning";
import { useList, useReplaceRecipients, useUpdatePayoutItems } from "@/lib/api/queries";
import type { Payout } from "@/lib/api/types";
import { pluralize } from "@/lib/utils/format";
import { rowsFromPayoutItems, rowsToPayoutItems, rowsToRecipientInputs, rowsTotal, validateRows } from "@/lib/recipients";

type Comparable = { name?: string | null; email?: string | null; wallet_address: string; amount: string };

/** Items reduced to what counts as a change, normalised the way the backend stores them. */
const serialize = (items: Comparable[]) =>
  JSON.stringify(items.map((i) => [i.name ?? null, i.email?.toLowerCase() ?? null, i.wallet_address.toLowerCase(), i.amount]));

/**
 * A draft payment's rows as you edit them, against the saved draft. Edits are saved when you send
 * (or with Save draft), and leaving with unsaved edits asks first. A draft started from a list
 * can also push its edits back to that list, if the sender asks.
 */
export function usePayoutDraft(payout: Payout) {
  const [rows, setRows] = useState(() => rowsFromPayoutItems(payout.items));
  const [attempted, setAttempted] = useState(false);
  const [updateList, setUpdateList] = useState(false);
  const save = useUpdatePayoutItems(payout.id, { meta: { errorToast: false } });

  const validation = useMemo(() => validateRows(rows, "payout"), [rows]);
  const total = useMemo(() => rowsTotal(rows), [rows]);
  // Invalid rows can't be saved as they are, so they always count as unsaved.
  const dirty = useMemo(
    () => !validation.isValid || serialize(rowsToPayoutItems(rows)) !== serialize(payout.items),
    [rows, validation.isValid, payout.items],
  );
  useLeaveWarning(dirty);

  const list = useList(payout.list_id ?? undefined);
  const replaceList = useReplaceRecipients(payout.list_id ?? "", { meta: { errorToast: false } });
  const listChanged = useMemo(() => {
    if (!list.data) return false;
    const listed = list.data.recipients.map((r) => ({ ...r, amount: r.default_amount ?? "0" }));
    return serialize(rowsToPayoutItems(rows)) !== serialize(listed);
  }, [list.data, rows]);

  /** What has to change before sending, if anything: "Add at least one person" or "Fix 2 rows". */
  const problem = !validation.filledCount
    ? "Add at least one person"
    : validation.invalidCount
      ? `Fix ${pluralize(validation.invalidCount, "row")}`
      : null;

  return {
    rows,
    setRows,
    attempted,
    total,
    filledCount: validation.filledCount,
    isValid: validation.isValid,
    dirty,
    saving: save.isPending,
    saveError: save.error,
    /** The list this draft came from, when the edits differ from it. */
    changedList: listChanged ? (list.data ?? null) : null,
    updateList,
    setUpdateList,
    /** Why the send button is off: the rows' problem once a send has been tried, or a save in flight. */
    blockedReason: attempted && problem ? `${problem} first` : save.isPending ? "Saving changes…" : null,

    saveDraft: () => save.mutate(rowsToPayoutItems(rows), { onSuccess: () => toast.success("Draft saved") }),

    /** Saves any edits (and the list, if asked), then hands over to `start` to send. */
    send: async (start: () => void) => {
      setAttempted(true);
      if (problem) return toast.error(`${problem} before sending.`);
      if (dirty) {
        try {
          await save.mutateAsync(rowsToPayoutItems(rows));
        } catch {
          return; // shown inline
        }
      }
      if (updateList && listChanged && list.data) {
        const name = list.data.name;
        replaceList.mutate(rowsToRecipientInputs(rows), {
          onSuccess: () => toast.success(`Updated “${name}”`),
          onError: (e) => toast.error(`Couldn't update the list: ${e.message}`),
        });
      }
      start();
    },
  };
}
