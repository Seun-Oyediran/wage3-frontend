"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useMemo, useRef, useState, type ClipboardEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useConnection } from "wagmi";

import { PlusIcon } from "@/components/ui/icons";
import { Kbd, ModKey } from "@/components/ui/kbd";
import { usePageFileDrop } from "@/hooks/use-page-file-drop";
import { useRowSelection } from "@/hooks/use-row-selection";
import { useHydrated } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils/cn";
import { LIMITS } from "@/lib/config";
import {
  isBlankRow,
  isFieldTouched,
  parseRecipientsText,
  readRecipientsFile,
  rowsTotal,
  touchField,
  validateRows,
  withAllTouched,
  walletWarning,
  type EditorMode,
  type ParsedImport,
  type RecipientRow,
} from "@/lib/recipients";

import { BulkAmountBar, type BulkKind } from "./bulk-amount-form";
import { EditorHeaderRow, EditorRow, type Field } from "./editor-row";
import { EditorToolbar } from "./editor-toolbar";
import { ImportDialog } from "./import-dialog";
import { SelectionToast } from "./selection-toast";
import { TableDropTarget } from "./table-drop-target";
import { useRowActions } from "./use-row-actions";

/** Rows rendered at first; long lists reveal more in steps of five pages. */
const PAGE = 100;

/**
 * The editable table of people for a payment or a list: type, paste or import rows, tick rows to
 * set amounts in bulk, and see problems inline. The parent owns `rows`.
 */
export function RecipientsEditor({
  rows,
  onChange,
  mode,
  showAllErrors = false,
  disabled = false,
  flush = false,
  only = null,
  max = mode === "list" ? LIMITS.listRecipients : LIMITS.payoutItems,
}: {
  rows: RecipientRow[];
  onChange: (rows: RecipientRow[]) => void;
  mode: EditorMode;
  /** Set after a failed submit, so untouched fields show their errors too. */
  showAllErrors?: boolean;
  disabled?: boolean;
  /**
   * Inside a card with 20px padding: the table runs to the card's edges instead of a nested box.
   * `true` rules it top and bottom (more content follows); "end" also runs it off the card's bottom.
   */
  flush?: boolean | "end";
  /** Show just these rows (keeping their row numbers), e.g. the ones that can't be paid. */
  only?: Set<string> | null;
  max?: number;
}) {
  const [visible, setVisible] = useState(PAGE);
  const [importOpen, setImportOpen] = useState(false);
  const [dropped, setDropped] = useState<ParsedImport | null>(null);
  const [bulk, setBulk] = useState<BulkKind | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const ownWallet = useConnection().address?.toLowerCase();

  const { errors, duplicates, filledCount } = useMemo(() => validateRows(rows, mode), [rows, mode]);
  const actions = useRowActions({ rows, onChange, max, filledCount });

  // Only filled rows can be ticked: ticking an empty row means nothing.
  const filledKeys = useMemo(() => rows.filter((r) => !isBlankRow(r)).map((r) => r.key), [rows]);
  const sel = useRowSelection(filledKeys);
  const selecting = sel.count > 0;
  const existingWallets = useMemo(() => new Set(rows.map((r) => r.wallet.trim().toLowerCase()).filter(Boolean)), [rows]);

  // Ticking the first row or clearing the last changes who a bulk amount applies to: close the form.
  const [wasSelecting, setWasSelecting] = useState(selecting);
  if (wasSelecting !== selecting) {
    setWasSelecting(selecting);
    setBulk(null);
  }

  // Rows in view (all, or the `only` ones), each keeping its number in the full list.
  const inView = useMemo(
    () => rows.map((r, i) => ({ r, number: i + 1 })).filter(({ r }) => !only || only.has(r.key)),
    [rows, only],
  );
  const shown = inView.slice(0, visible);
  const inViewRows = inView.map(({ r }) => r);
  // Bulk amounts apply to the ticked rows, else to every filled row in view.
  const bulkTargets = selecting ? rows.filter((r) => sel.selected.has(r.key)) : inViewRows.filter((r) => !isBlankRow(r));

  const clearDropped = useCallback(() => setDropped(null), []);
  const pageDragging = usePageFileDrop({
    enabled: !disabled && !importOpen,
    onDrop: (file) =>
      readRecipientsFile(file).then((parsed) => {
        setDropped(parsed);
        setImportOpen(true);
      }),
  });

  // Touched state lives on the rows (see RecipientRow.touched), so the page's blocked count and
  // the red cells here follow the same rule.
  const touch = (key: string, field: Field) => {
    const next = rows.map((x) => (x.key === key ? touchField(x, field) : x));
    if (next.some((x, i) => x !== rows[i])) onChange(next);
  };
  const shownError = (r: RecipientRow, field: Field) =>
    showAllErrors || isFieldTouched(r, field) ? errors[r.key]?.[field] : undefined;

  const rowEl = (key: string, selector = "") => containerRef.current?.querySelector<HTMLElement>(`[data-row="${key}"]${selector}`);

  const addRow = () => {
    const row = actions.addRow();
    if (!row) return;
    setVisible((v) => Math.max(v, rows.length + 1));
    requestAnimationFrame(() => rowEl(row.key, " input:not([type=checkbox])")?.focus());
  };

  const addRows = (incoming: RecipientRow[], opts?: { replace?: boolean; verb?: string }) => {
    // Imported or pasted rows are meant to be final: every problem in them flags now, not after Review.
    const { count, firstAdded } = actions.addRows(incoming.map(withAllTouched), opts);
    setVisible((v) => Math.max(v, count));
    // Show where they went.
    if (firstAdded) requestAnimationFrame(() => rowEl(firstAdded)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  // Several lines pasted from a spreadsheet into any cell become rows.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/[\n\t]/.test(text.trim())) return;
    e.preventDefault();
    const result = parseRecipientsText(text);
    if (result.error) return toast.error(result.error);
    addRows(result.rows, { verb: "Pasted" });
  };

  const applyBulk = (value: string) => {
    if (!bulk) return null;
    const error = actions.setAmounts(bulkTargets, bulk, value);
    if (!error) setBulk(null);
    return error;
  };

  const removeSelected = () => {
    actions.removeRows(new Set(sel.selected));
    sel.clear();
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col"
      onKeyDown={(e) => {
        if (e.key === "Escape" && selecting) sel.clear();
      }}
    >
      <EditorToolbar
        people={filledCount}
        inView={only ? inView.length : undefined}
        total={rowsTotal(inViewRows)}
        disabled={disabled}
        bulk={bulk}
        onBulk={setBulk}
        onImport={() => setImportOpen(true)}
      />

      {hydrated &&
        createPortal(
          <SelectionToast
            show={selecting && !disabled}
            count={sel.count}
            total={rowsTotal(bulkTargets)}
            bulk={bulk}
            onBulk={setBulk}
            onApply={applyBulk}
            onRemove={removeSelected}
            onClear={() => sel.clear()}
          />,
          document.body,
        )}

      <AnimatePresence initial={false}>
        {bulk && !selecting && (
          <BulkAmountBar key={bulk} kind={bulk} count={bulkTargets.length} onApply={applyBulk} onClose={() => setBulk(null)} />
        )}
      </AnimatePresence>

      {/* Flush in a card: no rules around the table; the header's fill and the row lines are the
          only separation, so the sections either side breathe on spacing alone. */}
      <div
        className={cn(
          "relative",
          flush === "end" ? "-mx-5 -mb-5" : flush ? "-mx-5" : "overflow-hidden rounded-2xl bg-surface shadow-(--shadow-xs)",
        )}
      >
        <EditorHeaderRow
          mode={mode}
          disabled={disabled}
          flush={!!flush}
          selection={{ isAll: sel.isAll, isSome: sel.isSome, empty: !filledKeys.length, setAll: sel.setAll }}
        />

        <ul className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {shown.map(({ r, number }) => (
              <EditorRow
                key={r.key}
                row={r}
                number={number}
                mode={mode}
                checked={sel.selected.has(r.key)}
                disabled={disabled}
                flush={!!flush}
                onlyRow={rows.length === 1}
                errors={{ name: shownError(r, "name"), wallet: shownError(r, "wallet"), amount: shownError(r, "amount") }}
                walletWarning={mode === "payout" ? walletWarning(r, { duplicate: duplicates.has(r.key), ownWallet }) : undefined}
                onField={(field, value) => onChange(rows.map((x) => (x.key === r.key ? { ...x, [field]: value } : x)))}
                onTouch={(field) => touch(r.key, field)}
                onPaste={onPaste}
                onToggle={(on, shift) => sel.toggle(r.key, on, shift)}
                onRemove={() => actions.removeRow(r.key)}
                onAmountKeyDown={(e) => {
                  // Enter in the last row's amount adds the next row.
                  if (e.key === "Enter" && number === rows.length) {
                    e.preventDefault();
                    addRow();
                  }
                }}
              />
            ))}
          </AnimatePresence>
        </ul>

        {inView.length > visible && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE * 5)}
            className="w-full bg-surface-sunken py-3 text-13 font-medium text-fg-muted hover:text-fg"
          >
            Show {Math.min(inView.length - visible, PAGE * 5)} more of {inView.length - visible}
          </button>
        )}

        {/* Hidden while filtered: a new row wouldn't match the filter, so it would seem to do nothing. */}
        {!disabled && !only && (
          <button
            type="button"
            onClick={addRow}
            disabled={filledCount >= max}
            className={cn(
              // The table's footer: filled like the header, so the table reads as one box with a top and a bottom.
              "flex w-full items-center gap-2 bg-surface-sunken py-3 text-13 font-medium text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg disabled:opacity-45",
              flush ? "px-5" : "px-4",
            )}
          >
            <PlusIcon className="size-4" /> Add person
            <span className="ml-auto hidden items-center gap-1 text-12 font-normal text-fg-subtle sm:inline-flex">
              <ModKey />
              <Kbd>V</Kbd> to paste
            </span>
          </button>
        )}
        <TableDropTarget active={pageDragging} mode={mode} />
      </div>

      <ImportDialog
        open={importOpen}
        onOpenChange={(o) => {
          setImportOpen(o);
          if (!o) setDropped(null);
        }}
        onImport={(incoming, replace) => addRows(incoming, { replace })}
        hasRows={filledCount > 0}
        mode={mode}
        existingWallets={existingWallets}
        room={max - filledCount}
        dropped={dropped}
        onClearDropped={clearDropped}
      />
    </div>
  );
}
