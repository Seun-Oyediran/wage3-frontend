import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { pluralize } from "@/lib/utils/format";

/** "120 payments … Page 2 of 6 ‹ ›" under a paged table. */
export function Pagination({
  page,
  totalPages,
  totalItems,
  noun,
  hasPrev,
  hasNext,
  disabled,
  onPage,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  /** What's being counted, singular ("payment"). */
  noun: string;
  hasPrev: boolean;
  hasNext: boolean;
  disabled?: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <span className="text-13 text-fg-muted tabular">{pluralize(totalItems, noun)}</span>
      <div className="flex items-center gap-2">
        <span className="text-13 text-fg-muted tabular">
          Page {page} of {totalPages}
        </span>
        <Button variant="filled" size="icon-sm" aria-label="Previous page" disabled={!hasPrev || disabled} onClick={() => onPage(page - 1)}>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button variant="filled" size="icon-sm" aria-label="Next page" disabled={!hasNext || disabled} onClick={() => onPage(page + 1)}>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
