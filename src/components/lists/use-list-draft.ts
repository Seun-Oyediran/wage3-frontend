"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useLeaveWarning } from "@/hooks/use-leave-warning";
import { useReplaceRecipients } from "@/lib/api/queries";
import type { ListDetail } from "@/lib/api/types";
import { LIMITS } from "@/lib/config";
import { formatCount } from "@/lib/utils/format";
import { emptyRow, isBlankRow, rowsFromRecipients, rowsToRecipientInputs, validateRows, type RecipientRow } from "@/lib/recipients";

/** What "changed" means: the filled rows, normalised the way the backend stores them. */
function signature(rows: RecipientRow[]) {
  return JSON.stringify(
    rows
      .filter((r) => !isBlankRow(r))
      .map((r) => [r.name.trim(), r.email.trim().toLowerCase(), r.wallet.trim().toLowerCase(), r.amount.trim()]),
  );
}

/** The saved people as editor rows; an empty list gets one blank row to type into. */
function savedRows(list: ListDetail) {
  return list.recipients.length ? rowsFromRecipients(list.recipients) : [emptyRow()];
}

/**
 * A list's people as you edit them, against the saved copy: whether anything changed, Save and
 * Discard. A newer server copy (a refetch, another tab) replaces the rows only while nothing is
 * edited. Leaving the page with unsaved edits asks first.
 */
export function useListDraft(list: ListDetail) {
  const [rows, setRows] = useState(() => savedRows(list));
  const [baseline, setBaseline] = useState(() => signature(rows));
  const [syncedFrom, setSyncedFrom] = useState(list.updated_at);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const replace = useReplaceRecipients(list.id, { meta: { errorToast: false } });

  const dirty = signature(rows) !== baseline;
  useLeaveWarning(dirty);

  const resetTo = (saved: ListDetail) => {
    const next = savedRows(saved);
    setRows(next);
    setBaseline(signature(next));
    setSyncedFrom(saved.updated_at);
    setShowAllErrors(false);
  };

  if (list.updated_at !== syncedFrom && !dirty) resetTo(list);

  return {
    rows,
    setRows,
    dirty,
    showAllErrors,
    saveError,
    saving: replace.isPending,
    discard: () => {
      resetTo(list);
      setSaveError(null);
    },
    save: () => {
      const v = validateRows(rows, "list");
      if (v.invalidCount > 0) {
        setShowAllErrors(true);
        setSaveError(null);
        toast.error("Fix the highlighted rows");
        return;
      }
      if (v.filledCount > LIMITS.listRecipients) {
        setSaveError(`A list can have at most ${formatCount(LIMITS.listRecipients)} people`);
        return;
      }
      setSaveError(null);
      replace.mutate(rowsToRecipientInputs(rows), {
        onSuccess: (saved) => {
          resetTo(saved);
          toast.success("List saved");
        },
        onError: (err) => setSaveError(err.message),
      });
    },
  };
}
