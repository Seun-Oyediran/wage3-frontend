"use client";

import { motion } from "motion/react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, CloseIcon } from "@/components/ui/icons";
import { toastTone } from "@/components/ui/toast-tone";
import { cn } from "@/lib/utils/cn";
import { USDC } from "@/lib/config";
import { formatAmount, parseAmount, pluralize } from "@/lib/utils/format";
import { splitEvenly } from "@/lib/recipients";

/** "same": everyone gets the typed amount. "split": the typed total is divided between them. */
export type BulkKind = "same" | "split";

type FormProps = {
  kind: BulkKind;
  /** How many rows it applies to. */
  count: number;
  /** Applies the amount; returns an error to show, or null when done. */
  onApply: (value: string) => string | null;
  onClose: () => void;
};

/** The typed amount, its live preview ("3 × 50.00 = 150.00 USDC"), and submit. */
function useBulkAmount({ kind, count, onApply }: Pick<FormProps, "kind" | "count" | "onApply">) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const preview = (() => {
    const p = parseAmount(value);
    if (!p.ok || !count) return null;
    if (kind === "same") {
      return `${count} × ${formatAmount(p.value)} = ${formatAmount(BigInt(p.value) * BigInt(count))} ${USDC.symbol}`;
    }
    const { each, leftover } = splitEvenly(BigInt(p.value), count);
    const rest = leftover > BigInt(0) ? ` · ${formatAmount(leftover)} not sent (rounding)` : "";
    return `${formatAmount(each)} ${USDC.symbol} each${rest}`;
  })();

  return {
    error,
    hint: error ?? preview ?? (kind === "split" ? "Divided evenly" : "Replaces their amounts"),
    submit: (e: FormEvent) => {
      e.preventDefault();
      setError(onApply(value));
    },
    input: {
      value,
      onChange: (v: string) => {
        setValue(v.replace(/[^\d.,]/g, ""));
        setError(null);
      },
      invalid: !!error,
      label: kind === "same" ? "Amount each" : "Total to split",
    },
  };
}

function AmountInput({
  value,
  onChange,
  invalid,
  label,
  className,
  unitClassName,
}: ReturnType<typeof useBulkAmount>["input"] & { className: string; unitClassName: string }) {
  return (
    <div className="relative">
      <input
        autoFocus
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        aria-invalid={invalid || undefined}
        aria-label={label}
        className={cn(
          "h-9 w-36 border pr-14 pl-4 font-mono text-sm tabular outline-none transition-[border-color,box-shadow,background-color] duration-150",
          className,
        )}
      />
      <span className={cn("pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs", unitClassName)}>
        {USDC.symbol}
      </span>
    </div>
  );
}

/** Above the table, when nothing is ticked: applies to everyone in view. */
export function BulkAmountBar({ kind, count, onApply, onClose }: FormProps) {
  const form = useBulkAmount({ kind, count, onApply });
  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.12 } }}
      className="overflow-hidden"
      onSubmit={form.submit}
    >
      {/* Close leads, so it reads dismiss → task → apply. */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-surface-muted p-3">
        <button
          type="button"
          onClick={onClose}
          className="pressable -mr-1 grid size-8 place-items-center rounded-full text-fg-subtle hover:bg-surface hover:text-fg"
          aria-label="Close"
        >
          <CloseIcon className="size-4" />
        </button>
        <span className="text-sm font-medium">{kind === "same" ? "Pay everyone" : "Split between everyone"}</span>
        <AmountInput
          {...form.input}
          className="rounded-full border-border bg-surface hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)] aria-invalid:border-danger aria-invalid:focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--danger)_18%,transparent)]"
          unitClassName="text-fg-subtle"
        />
        <span className={cn("text-13", form.error ? "text-danger-fg" : "text-fg-muted")}>{form.hint}</span>
        <Button type="submit" size="sm" variant="inverse" className="ml-auto">
          Apply to {pluralize(count, "person", "people")}
        </Button>
      </div>
    </motion.form>
  );
}

/** Inside the selection toast: applies to the ticked rows. The hint gets its own line so the row fits. */
export function BulkAmountToastForm({ kind, count, onApply, onClose }: FormProps) {
  const form = useBulkAmount({ kind, count, onApply });
  return (
    <form onSubmit={form.submit} className="flex flex-col gap-1.5 py-0.5">
      <div className="flex items-center gap-2">
        {/* Back to the selection summary, not a dismiss: a chevron, not a cross. */}
        <button
          type="button"
          onClick={onClose}
          className={cn("pressable -ml-2 grid size-9 place-items-center rounded-[10px]", toastTone.muted, toastTone.action)}
          aria-label="Back"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <span className="text-15 font-medium whitespace-nowrap">
          {kind === "same" ? `Amount for ${pluralize(count, "person", "people")}` : `Split between ${pluralize(count, "person", "people")}`}
        </span>
        <AmountInput {...form.input} className={cn("rounded-[10px]", toastTone.input)} unitClassName={toastTone.muted} />
        <button
          type="submit"
          className={cn("pressable ml-auto h-9 shrink-0 rounded-[10px] px-3.5 text-14 font-semibold whitespace-nowrap", toastTone.primary)}
        >
          Apply
        </button>
      </div>
      <p className={cn("pl-9 text-12", form.error ? cn("font-medium", toastTone.error) : toastTone.muted)}>{form.hint}</p>
    </form>
  );
}
