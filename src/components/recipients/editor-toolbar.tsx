import { Button } from "@/components/ui/button";
import { EqualIcon, ImportIcon, SplitIcon } from "@/components/ui/icons";
import { USDC } from "@/lib/config";
import { formatAmount, pluralize } from "@/lib/utils/format";

import type { BulkKind } from "./bulk-amount-form";

/**
 * Above the table: who's in it and their total, then the tools. While filtered it says so
 * ("2 of 3 people") with the total of the rows in view. Selection actions live in the toast.
 */
export function EditorToolbar({
  people,
  inView,
  total,
  disabled,
  bulk,
  onBulk,
  onImport,
}: {
  people: number;
  /** Rows in view when the table is filtered; undefined when it isn't. */
  inView?: number;
  /** Total of the rows in view. */
  total: bigint;
  disabled: boolean;
  bulk: BulkKind | null;
  onBulk: (b: BulkKind | null) => void;
  onImport: () => void;
}) {
  const filtered = inView !== undefined;
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-2 pb-4">
      <div className="mr-auto flex items-baseline gap-3">
        <span className="text-sm font-medium">
          {filtered ? `${inView} of ${pluralize(people, "person", "people")}` : pluralize(people, "person", "people")}
        </span>
        {(filtered || total > BigInt(0)) && (
          <span className="text-sm text-fg-muted tabular">
            {formatAmount(total)} {USDC.symbol}
          </span>
        )}
      </div>
      {!disabled && (
        <>
          {people > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onBulk(bulk === "same" ? null : "same")}>
                <EqualIcon className="size-4" /> Same amount
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onBulk(bulk === "split" ? null : "split")}>
                <SplitIcon className="size-4" /> Split total
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={onImport}>
            <ImportIcon className="size-4" /> Import CSV
          </Button>
        </>
      )}
    </div>
  );
}
