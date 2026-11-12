"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { pluralize } from "@/lib/utils/format";
import { emptyRow, rowsTotal, type RecipientRow, type validateRows } from "@/lib/recipients";

/**
 * Rows that can't be paid, and what's left once they're set aside. A bad wallet counts as soon
 * as it's typed; other problems (a half-typed row) only after Review has been tried. Nothing is
 * sent until blocked rows are fixed or removed, so the summary counts only the payable ones.
 */
export function useBlockedRows({
  rows,
  setRows,
  validation,
  attempted,
}: {
  rows: RecipientRow[];
  setRows: (rows: RecipientRow[]) => void;
  validation: ReturnType<typeof validateRows>;
  attempted: boolean;
}) {
  const byKey = useMemo(() => new Map(rows.map((r) => [r.key, r])), [rows]);
  const blockedKeys = Object.keys(validation.errors).filter(
    (k) => attempted || (validation.errors[k].wallet && byKey.get(k)?.wallet.trim()),
  );
  const blocked = new Set(blockedKeys);
  const payable = rows.filter((r) => !blocked.has(r.key));

  // "Show them" narrows the table to the blocked rows as they were when clicked, so a row being
  // fixed doesn't vanish mid-edit. It lifts by itself once nothing is blocked.
  const [showOnly, setShowOnly] = useState<Set<string> | null>(null);
  if (showOnly && blockedKeys.length === 0) setShowOnly(null);

  return {
    count: blockedKeys.length,
    payableTotal: rowsTotal(payable),
    heldTotal: rowsTotal(rows.filter((r) => blocked.has(r.key))),
    payableCount: validation.filledCount - blockedKeys.length,
    showOnly,
    toggleShowOnly: () => setShowOnly(showOnly ? null : new Set(blockedKeys)),
    remove: () => {
      const kept = rows.filter((r) => !blocked.has(r.key));
      setRows(kept.length ? kept : [emptyRow()]);
      toast(`Removed ${pluralize(blocked.size, "row")}`, { action: { label: "Undo", onClick: () => setRows(rows) } });
    },
  };
}
