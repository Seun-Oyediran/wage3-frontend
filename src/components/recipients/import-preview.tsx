"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";

import { ActionBanner } from "@/components/ui/action-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileIcon } from "@/components/ui/icons";
import { useRowSelection } from "@/hooks/use-row-selection";
import { cn } from "@/lib/utils/cn";
import { USDC } from "@/lib/config";
import { formatCount, formatAmount, parseAmount, pluralize, shortAddress, validateWallet } from "@/lib/utils/format";
import { importIssues, rowsTotal, type EditorMode, type ParsedImport, type RecipientRow } from "@/lib/recipients";

/**
 * Step two of Import: every row found, ticked unless it would be rejected, with problems flagged.
 * Nothing changes in the editor until Add (or Replace everyone).
 */
export function ImportPreview({
  result,
  mode,
  existingWallets,
  room,
  hasRows,
  onBack,
  onConfirm,
}: {
  result: ParsedImport;
  mode: EditorMode;
  existingWallets: Set<string>;
  /** How many more people fit in the editor. */
  room: number;
  hasRows: boolean;
  onBack: () => void;
  onConfirm: (rows: RecipientRow[], replace: boolean) => void;
}) {
  const { rows } = result;
  const fromFile = !!result.fileName;
  const issues = useMemo(() => importIssues(rows, mode, existingWallets), [rows, mode, existingWallets]);

  const keys = useMemo(() => rows.map((r) => r.key), [rows]);
  const sel = useRowSelection(keys, () => keys.filter((k) => !issues.get(k)?.block));
  const chosen = rows.filter((r) => sel.selected.has(r.key));
  const total = rowsTotal(chosen);
  const problemKeys = keys.filter((k) => issues.has(k) && sel.selected.has(k));
  const overBy = chosen.length - room;
  // Every wallet bad means the wrong file or column, not that many typos: send them back.
  const wrongSource = rows.every((r) => issues.get(r.key)?.wallet);
  const backLabel = fromFile ? "Choose another file" : "Edit pasted text";

  return (
    <motion.div
      initial={{ opacity: 0, transform: "translateY(4px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      <div className="flex flex-wrap items-center gap-3">
        <FileIcon className="size-5 shrink-0 text-fg-muted" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{result.fileName ?? "Pasted text"}</div>
          <div className="text-13 text-fg-muted">
            {pluralize(rows.length, "row")} found
            {result.skipped > 0 && ` · ${result.skipped} empty skipped`}
          </div>
        </div>
      </div>

      {problemKeys.length > 0 && (
        <ActionBanner
          tone="warning"
          className="mt-3"
          title={
            wrongSource
              ? `None of the wallets ${fromFile ? "in this file" : "you pasted"} are valid.`
              : `${problemKeys.length} of ${rows.length} ${rows.length === 1 ? "row has" : "rows have"} problems.`
          }
          actions={
            <Button
              size="sm"
              className="bg-(--amber-12) text-white hover:bg-(--amber-11)"
              onClick={wrongSource ? onBack : () => sel.replace([...sel.selected].filter((k) => !issues.has(k)))}
            >
              {wrongSource ? backLabel : `Untick ${problemKeys.length === 1 ? "it" : "them"}`}
            </Button>
          }
        >
          {wrongSource
            ? fromFile
              ? "Check it's the right file and its wallet column has 0x addresses."
              : "Check each line has a 0x wallet address."
            : "They're flagged in the table below."}
        </ActionBanner>
      )}

      <div className="mt-4 max-h-[min(24rem,50dvh)] overflow-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-13">
          <thead className="sticky top-0 z-10 bg-surface-sunken text-left text-xs text-fg-subtle">
            <tr>
              <th className="w-10 py-2.5 pl-3.5">
                <Checkbox checked={sel.isAll} indeterminate={sel.isSome} onCheckedChange={(on) => sel.setAll(on)} aria-label="Select all rows" />
              </th>
              <th className="px-2 py-2.5 font-medium">Name</th>
              <th className="px-2 py-2.5 font-medium">Wallet</th>
              <th className="px-2 py-2.5 text-right font-medium">Amount</th>
              <th className="py-2.5 pr-3.5 pl-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const issue = issues.get(r.key);
              const warn = !!issue && !issue.block;
              const on = sel.selected.has(r.key);
              const amount = r.amount ? parseAmount(r.amount) : null;
              return (
                <tr
                  key={r.key}
                  data-issue={warn ? "" : undefined}
                  onClick={(e) => sel.toggle(r.key, !on, e.shiftKey)}
                  className={cn(
                    "cursor-pointer transition-colors duration-100 select-none",
                    // Unticked rows go grey; ticked ones read in the selection blue, or amber on a problem row.
                    on ? (warn ? "text-(--amber-11)" : "text-(--blue-11)") : "text-fg-subtle",
                    warn ? "bg-warning-soft hover:bg-(--amber-4)" : "hover:bg-surface-hover",
                    // Dividers are the cells' bottom borders (Chrome paints collapsed row borders unevenly).
                    // A problem row is ruled in amber above and below; the line above is the previous
                    // row's, coloured through :has().
                    "[&>td]:border-b [&>td]:border-border last:[&>td]:border-b-0",
                    warn ? "[&>td]:border-(--amber-7)" : "[&:has(+[data-issue])>td]:border-(--amber-7)",
                  )}
                >
                  <td className="py-2.5 pl-3.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={on}
                      // With everything ticked (the default) the boxes stay plain; the warning symbol
                      // marks a problem row once the selection is the user's own.
                      warning={warn && !sel.isAll}
                      onCheckedChange={(v, e) => sel.toggle(r.key, v, e?.shiftKey)}
                      aria-label={`Include ${r.name || r.wallet || "row"}`}
                    />
                  </td>
                  <td className="max-w-44 truncate px-2 py-2.5">
                    {r.name || <span className="text-fg-subtle">No name</span>}
                    {r.email && <div className="truncate text-xs text-fg-subtle">{r.email}</div>}
                  </td>
                  {/* A bad wallet shows as typed: shortened, a broken address can look fine. */}
                  <td className="max-w-40 truncate px-2 py-2.5 font-mono" title={r.wallet}>
                    {!r.wallet ? "—" : validateWallet(r.wallet) ? r.wallet : shortAddress(r.wallet, 5)}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono tabular">{amount?.ok ? formatAmount(amount.value) : r.amount || "—"}</td>
                  <td className="py-2.5 pr-3.5 pl-2 text-right">
                    {issue && (
                      // A step darker on the amber row, so the badge doesn't dissolve into it.
                      <Badge tone={issue.block ? "neutral" : "warning"} className={cn("max-w-48 truncate", warn && "bg-(--amber-5)")}>
                        {issue.label}
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence initial={false}>
        {overBy > 0 && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <span className="mt-3 block rounded-xl bg-warning-soft px-3.5 py-2.5 text-13 text-warning-fg">
              Only {formatCount(room)} more fit. Untick {pluralize(overBy, "person", "people")}, or replace everyone instead.
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {/* Pulled out by its padding so the text lines up with the content's left edge. */}
        <Button variant="ghost" onClick={onBack} className="sm:-ml-4">
          {backLabel}
        </Button>
        <span className="text-13 text-fg-muted tabular sm:ml-auto">
          {chosen.length} of {rows.length} selected
          {total > BigInt(0) && ` · ${formatAmount(total)} ${USDC.symbol}`}
        </span>
        {hasRows && (
          <Button variant="outline" disabled={!chosen.length} onClick={() => onConfirm(chosen, true)}>
            Replace everyone
          </Button>
        )}
        <Button variant="inverse" disabled={!chosen.length || overBy > 0} onClick={() => onConfirm(chosen, false)}>
          Add {pluralize(chosen.length, "person", "people")}
        </Button>
      </div>
    </motion.div>
  );
}
