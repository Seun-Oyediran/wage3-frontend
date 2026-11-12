"use client";

import { motion } from "motion/react";
import type { ClipboardEvent, InputHTMLAttributes, KeyboardEvent } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DeleteIcon, HashIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { USDC } from "@/lib/config";
import { EASE_DRAWER } from "@/lib/motion";
import { isBlankRow, type EditorMode, type RecipientRow, type RowErrors } from "@/lib/recipients";

/** Checkbox, row number, name, email, wallet, amount, remove. Shared with the header row. */
export const GRID =
  "md:grid-cols-[2.75rem_2rem_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.6fr)_minmax(0,0.9fr)_2.5rem]";

export type Field = keyof RowErrors;

/** Entering rows dissolve in from a light blur; leaving rows only fade (dozens can leave at once). */
const ROW_MOTION = {
  hidden: { opacity: 0, filter: "blur(3px)" },
  shown: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.22 } },
  gone: { opacity: 0, transition: { duration: 0.18 } },
};

/** Column headings, desktop only. The checkbox ticks every filled row. */
export function EditorHeaderRow({
  mode,
  disabled,
  flush,
  selection,
}: {
  mode: EditorMode;
  disabled: boolean;
  flush: boolean;
  selection: { isAll: boolean; isSome: boolean; empty: boolean; setAll: (on: boolean) => void };
}) {
  return (
    <div
      className={cn(
        "hidden gap-px border-b border-border bg-surface-sunken text-xs font-medium text-fg-subtle md:grid",
        GRID,
        flush && "md:pl-1.5",
      )}
    >
      <span className="flex items-center justify-center py-2.5">
        {!disabled && (
          <Checkbox
            checked={selection.isAll}
            indeterminate={selection.isSome}
            disabled={selection.empty}
            onCheckedChange={(on) => selection.setAll(on)}
            aria-label="Select everyone"
          />
        )}
      </span>
      <span className="flex justify-end py-2.5 pr-2">
        <HashIcon className="size-3.5" aria-hidden={false} role="img" aria-label="Row" />
      </span>
      <span className="px-3 py-2.5">Name</span>
      <span className="px-3 py-2.5 whitespace-nowrap">
        Email <span className="text-fg-subtle/70">(optional)</span>
      </span>
      <span className="px-3 py-2.5">Wallet address</span>
      <span className="px-3 py-2.5 text-right whitespace-nowrap">
        {mode === "list" ? "Default amount" : "Amount"} <span className="text-fg-subtle/70">({USDC.symbol})</span>
      </span>
      <span />
    </div>
  );
}

/**
 * One person in the editor. On desktop a table row of borderless cells; on phones a small stack
 * of ordinary fields with the remove button on the right.
 */
export function EditorRow({
  row: r,
  number,
  mode,
  checked,
  disabled,
  flush,
  errors,
  emailWarning,
  walletWarning,
  onField,
  onTouch,
  onPaste,
  onToggle,
  onRemove,
  onAmountKeyDown,
}: {
  row: RecipientRow;
  /** 1-based position in the full list, kept when the table is filtered. */
  number: number;
  mode: EditorMode;
  checked: boolean;
  disabled: boolean;
  flush: boolean;
  /** Errors to show now (already filtered to touched fields). */
  errors: Pick<RowErrors, "name" | "wallet" | "amount">;
  emailWarning?: string;
  walletWarning?: string;
  onField: (field: Field, value: string) => void;
  onTouch: (field: Field) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
  onToggle: (on: boolean, shiftKey?: boolean) => void;
  onRemove: () => void;
  onAmountKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const cell = (field: Field) => ({
    selected: checked,
    disabled,
    onChange: (v: string) => onField(field, v),
    onBlur: () => onTouch(field),
    onPaste,
    autoComplete: "off",
  });

  return (
    <motion.li
      data-row={r.key}
      // Rows leaving (Show them, Remove) dissolve; once they're gone the rest glide together.
      layout="position"
      variants={ROW_MOTION}
      initial="hidden"
      animate="shown"
      exit="gone"
      transition={{ layout: { duration: 0.28, ease: EASE_DRAWER } }}
      className={cn(
        "group grid grid-cols-[minmax(0,1fr)_2.5rem] gap-x-2 gap-y-1 p-3 transition-colors duration-100 md:items-start md:gap-0 md:p-0",
        GRID,
        flush && "px-5 md:pl-1.5",
      )}
    >
      {/* Selection is desktop only: on phones the bulk tools apply to everyone. */}
      <span className="hidden justify-center md:flex md:pt-3.5">
        {!disabled && !isBlankRow(r) && (
          <Checkbox
            checked={checked}
            onCheckedChange={(on, e) => onToggle(on, e?.shiftKey)}
            aria-label={`Select ${r.name || `row ${number}`}`}
          />
        )}
      </span>
      <span className={cn("hidden pt-3 pr-2 text-right text-xs tabular md:block", checked ? "text-(--blue-11)" : "text-fg-subtle")}>
        {number}
      </span>
      <div className="grid grid-cols-2 gap-2 md:contents">
        <Cell {...cell("name")} value={r.name} placeholder="Name" error={errors.name} />
        {/* Optional: a bad email is flagged amber once left, but never blocks the row. */}
        <Cell {...cell("email")} value={r.email} placeholder="Email" type="email" warning={emailWarning} />
      </div>
      <div className="col-start-1 md:contents">
        <Cell
          {...cell("wallet")}
          value={r.wallet}
          placeholder="0x…"
          mono
          error={errors.wallet}
          warning={walletWarning}
          spellCheck={false}
        />
      </div>
      <div className="col-start-1 md:contents">
        <Cell
          {...cell("amount")}
          onChange={(v) => onField("amount", v.replace(/[^\d.,]/g, ""))}
          value={r.amount}
          placeholder={mode === "list" ? "Optional" : "0.00"}
          inputMode="decimal"
          align="right"
          mono
          error={errors.amount}
          onKeyDown={onAmountKeyDown}
        />
      </div>
      {disabled ? (
        <span />
      ) : (
        <div className="col-start-2 row-span-3 row-start-1 flex justify-end pt-1 md:col-auto md:row-auto md:row-span-1 md:justify-center md:pt-1.5">
          <Tooltip content="Remove">
            <button
              type="button"
              onClick={onRemove}
              className="pressable grid size-8 place-items-center rounded-lg text-fg-subtle opacity-100 hover:bg-danger-soft hover:text-danger-fg md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              aria-label={`Remove row ${number}`}
            >
              <DeleteIcon className="size-4" />
            </button>
          </Tooltip>
        </div>
      )}
    </motion.li>
  );
}

function Cell({
  value,
  onChange,
  error,
  warning,
  mono,
  align,
  selected,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  warning?: string;
  mono?: boolean;
  align?: "right";
  /** Row is ticked: the text turns the selection blue (no row fill). */
  selected?: boolean;
}) {
  return (
    <div className="min-w-0">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error || undefined}
        title={error ?? warning}
        className={cn(
          // Phones: a field like the app's other inputs. Desktop: a borderless table cell with an inset focus line.
          "h-10 w-full min-w-0 rounded-xl border border-border-subtle bg-surface px-3 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-150",
          "hover:border-border focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]",
          "md:h-11 md:rounded-[6px] md:border-transparent md:bg-transparent md:hover:border-transparent md:hover:bg-surface-hover",
          "md:focus:border-transparent md:focus:bg-surface md:focus:shadow-[inset_0_0_0_1px_var(--primary)]",
          "placeholder:text-fg-subtle/80 disabled:cursor-default disabled:hover:bg-transparent",
          mono && "font-mono text-13 tabular",
          align === "right" && "md:text-right",
          selected && "text-(--blue-11)",
          // Problems get a fill and a border, on desktop too where cells are otherwise borderless:
          // red for an error, amber for a warning (an email typo, a wallet paid twice).
          error && "border-(--red-7) bg-danger-soft/60 text-danger-fg md:border-(--red-7) md:bg-danger-soft/50",
          !error && warning && "border-(--amber-7) bg-warning-soft/60 text-warning-fg md:border-(--amber-7) md:bg-warning-soft/50",
          className,
        )}
        {...props}
      />
    </div>
  );
}
