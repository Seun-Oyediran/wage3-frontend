"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useRef, useState, type ClipboardEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useConnection } from "wagmi";

import { ImportIcon, PlusIcon } from "@/components/ui/icons";
import { Kbd, ModKey } from "@/components/ui/kbd";
import { usePageFileDrop } from "@/hooks/use-page-file-drop";
import { useRowSelection } from "@/hooks/use-row-selection";
import { useHydrated } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils/cn";
import { LIMITS } from "@/lib/config";
import {
  emailWarning,
  isBlankRow,
  parseRecipientsText,
  readRecipientsFile,
  rowsTotal,
  validateRows,
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
  const [touched, setTouched] = useState<Set<string>>(new Set());
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

  const touch = (key: string, field: Field) =>
    setTouched((t) => (t.has(`${key}.${field}`) ? t : new Set(t).add(`${key}.${field}`)));
  const isTouched = (key: string, field: Field) => showAllErrors || touched.has(`${key}.${field}`);
  const shownError = (key: string, field: Field) => (isTouched(key, field) ? errors[key]?.[field] : undefined);

  const rowEl = (key: string, selector = "") => containerRef.current?.querySelector<HTMLElement>(`[data-row="${key}"]${selector}`);

  const addRow = () => {
    const row = actions.addRow();
    if (!row) return;
    setVisible((v) => Math.max(v, rows.length + 1));
    requestAnimationFrame(() => rowEl(row.key, " input:not([type=checkbox])")?.focus());
  };

  const addRows = (incoming: RecipientRow[], opts?: { replace?: boolean; verb?: string }) => {
    const { count, firstAdded } = actions.addRows(incoming, opts);
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

      {/* Nobody yet: one quiet line for the CSV route. Desktop only: phones can't drag files in. */}
      <AnimatePresence initial={false}>
        {filledCount === 0 && !disabled && (
          <motion.button
            type="button"
            onClick={() => setImportOpen(true)}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
            className="group hidden overflow-hidden text-left md:block"
          >
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-3 text-13 text-fg-muted transition-colors duration-150 group-hover:bg-surface-hover">
              <ImportIcon className="size-4 shrink-0" />
              <span>
                Drop a CSV anywhere on this page, or <span className="font-medium text-fg">choose a file</span>. You&apos;ll
                pick who to add before anything changes.
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative",
          flush === "end"
            ? "-mx-5 -mb-5 border-t border-border"
            : flush
              ? "-mx-5 border-y border-border"
              : "overflow-hidden rounded-2xl border border-border",
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
                errors={{ name: shownError(r.key, "name"), wallet: shownError(r.key, "wallet"), amount: shownError(r.key, "amount") }}
                emailWarning={isTouched(r.key, "email") ? emailWarning(r) : undefined}
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
            className="w-full border-t border-border bg-surface-sunken py-3 text-sm font-medium text-fg-muted hover:text-fg"
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
              "flex w-full items-center gap-2 border-t border-border py-3 text-sm font-medium text-fg-muted transition-colors duration-150 hover:bg-surface-hover hover:text-fg disabled:opacity-45",
              flush ? "px-5" : "px-4",
            )}
          >
            <PlusIcon className="size-4" /> Add person
            <span className="ml-auto hidden items-center gap-1 text-xs font-normal text-fg-subtle sm:inline-flex">
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
