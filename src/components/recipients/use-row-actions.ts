"use client";

import { toast } from "sonner";

import { USDC } from "@/lib/config";
import { formatCount, formatAmount, parseAmount, pluralize, toInputAmount } from "@/lib/utils/format";
import { emptyRow, isBlankRow, splitEvenly, type RecipientRow } from "@/lib/recipients";

import type { BulkKind } from "./bulk-amount-form";

const people = (n: number) => pluralize(n, "person", "people");

/**
 * Everything that changes the editor's rows, with its toasts. The table is never left empty:
 * removing the last person leaves one blank row to type into.
 */
export function useRowActions({
  rows,
  onChange,
  max,
  filledCount,
}: {
  rows: RecipientRow[];
  onChange: (rows: RecipientRow[]) => void;
  max: number;
  filledCount: number;
}) {
  const orBlank = (next: RecipientRow[]) => (next.length ? next : [emptyRow()]);

  return {
    /** Adds a blank row at the bottom; returns it, or null at the limit. */
    addRow: (): RecipientRow | null => {
      if (filledCount >= max) {
        toast.error(`You can add up to ${formatCount(max)} people.`);
        return null;
      }
      const row = emptyRow();
      onChange([...rows, row]);
      return row;
    },

    removeRow: (key: string) => onChange(orBlank(rows.filter((r) => r.key !== key))),

    /** Removes several rows at once, with Undo. */
    removeRows: (keys: Set<string>) => {
      const before = rows;
      onChange(orBlank(rows.filter((r) => !keys.has(r.key))));
      toast(`Removed ${people(keys.size)}`, { action: { label: "Undo", onClick: () => onChange(before) } });
    },

    /**
     * New people go to the bottom (blank rows are dropped), up to the limit. Used by Import, a
     * dropped file and a multi-line paste. Returns the new row count and, when people were added
     * below existing ones, the first new row, so the editor can scroll to it.
     */
    addRows: (incoming: RecipientRow[], { replace = false, verb = "Added" }: { replace?: boolean; verb?: string } = {}) => {
      const kept = replace ? [] : rows.filter((r) => !isBlankRow(r));
      const added = incoming.slice(0, Math.max(0, max - kept.length));
      const next = orBlank([...kept, ...added]);
      onChange(next);
      if (incoming.length > added.length) {
        toast.warning(`Only ${added.length} of ${incoming.length} people were added. The limit is ${formatCount(max)}.`);
      } else {
        toast.success(`${replace ? "Replaced with" : verb} ${people(added.length)}`);
      }
      return { count: next.length, firstAdded: !replace && kept.length ? added[0]?.key : undefined };
    },

    /** Sets the amount on `targets`: the same for each, or a total split evenly. Returns an error, or null. */
    setAmounts: (targets: RecipientRow[], kind: BulkKind, value: string): string | null => {
      const parsed = parseAmount(value);
      if (!parsed.ok) return parsed.error;
      if (!targets.length) return "Add people first";

      let each = BigInt(parsed.value);
      if (kind === "split") {
        const split = splitEvenly(each, targets.length);
        if (split.each === BigInt(0)) return "That total is too small to split";
        each = split.each;
        if (split.leftover > BigInt(0)) {
          toast(`${formatAmount(split.leftover)} ${USDC.symbol} wasn't assigned (rounding to the cent).`);
        }
      }
      const amount = toInputAmount(each.toString());
      const keys = new Set(targets.map((r) => r.key));
      onChange(rows.map((r) => (keys.has(r.key) ? { ...r, amount } : r)));
      return null;
    },
  };
}
