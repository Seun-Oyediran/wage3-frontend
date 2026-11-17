"use client";

import { useState } from "react";

import { ChevronRightIcon, WarningIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { pluralize } from "@/lib/utils/format";
import type { FlagKind, RowFlag } from "@/lib/review-checks";

// One line per kind of problem, so 40 warnings read as their two or three causes.
const FLAG_GROUPS: { kind: FlagKind; title: (n: number) => string }[] = [
  { kind: "wallet-changed", title: (n) => `${pluralize(n, "wallet", "wallets")} changed since the last payment` },
  { kind: "new-address", title: (n) => `${pluralize(n, "new address", "new addresses")}, not in the last payment from this list` },
  { kind: "above-last", title: (n) => `${pluralize(n, "amount", "amounts")} more than double last time` },
  { kind: "outlier", title: (n) => `${pluralize(n, "amount", "amounts")} far above the others` },
];

/** Names shown per group before "Show all". */
const SHOWN = 20;

/**
 * "Check before you send": things worth a second look, since sent USDC can't be pulled back.
 * Flags are grouped by reason, each group opening to its names; small sets start open. When one
 * reason covers most of the payment it names the likely cause (the wrong file) instead.
 */
export function ReviewFlags({ flags, checked, recentDuplicate }: { flags: RowFlag[]; checked: number; recentDuplicate: string | null }) {
  const startOpen = flags.length <= 5;
  const [open, setOpen] = useState<Partial<Record<FlagKind, boolean>>>({});
  const [all, setAll] = useState<Partial<Record<FlagKind, boolean>>>({});
  if (!flags.length && !recentDuplicate) return null;

  const groups = FLAG_GROUPS.map((g) => ({ ...g, items: flags.filter((f) => f.kind === g.kind) })).filter((g) => g.items.length);
  const changed = flags.filter((f) => f.kind === "wallet-changed" || f.kind === "new-address").length;
  const systematic = checked >= 10 && changed >= 10 && changed / checked >= 0.5;

  return (
    <section className="rounded-2xl bg-warning-soft p-5">
      <h2 className="flex items-center gap-2 text-sm font-medium text-(--amber-12)">
        <WarningIcon className="size-4 shrink-0 text-warning-fg" /> Check before you send
        {flags.length > 0 && <span className="font-normal text-warning-fg tabular">· {flags.length}</span>}
      </h2>
      {/* Indented to the title's text, not the icon. */}
      <div className="flex flex-col gap-2 pt-2.5 pl-6 text-13">
        {recentDuplicate && <p className="text-warning-fg">{recentDuplicate}</p>}
        {systematic && (
          <p className="font-medium text-(--amber-12) text-pretty">
            Most of this payment&apos;s wallets differ from last time. Check you imported the right file before going through them one by one.
          </p>
        )}
        {groups.map((g) => {
          const isOpen = open[g.kind] ?? startOpen;
          const visible = all[g.kind] ? g.items : g.items.slice(0, SHOWN);
          return (
            <div key={g.kind}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen((o) => ({ ...o, [g.kind]: !isOpen }))}
                className="flex w-full items-center gap-1.5 text-left font-medium text-(--amber-12)"
              >
                <ChevronRightIcon className={cn("size-3.5 shrink-0 transition-transform duration-150", isOpen && "rotate-90")} />
                {g.title(g.items.length)}
              </button>
              {isOpen && (
                // Two columns so the details line up; each row gives only its own detail, since the
                // group title already says what's wrong.
                <ul className="mt-1.5 grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-1 pl-5">
                  {visible.map((f) => (
                    <li key={f.key} className="col-span-2 grid grid-cols-subgrid">
                      <span className="truncate font-medium text-(--amber-12)">{f.who}</span>
                      <span className="truncate text-warning-fg tabular">{f.reason}</span>
                    </li>
                  ))}
                  {g.items.length > visible.length && (
                    <li className="col-span-2">
                      <button
                        type="button"
                        onClick={() => setAll((a) => ({ ...a, [g.kind]: true }))}
                        className="font-medium text-(--amber-12) underline decoration-dotted underline-offset-4"
                      >
                        Show all {g.items.length}
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
